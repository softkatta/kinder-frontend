<?php

/**
 * Same-origin API proxy for Hostinger SPA hosting.
 * Browser → https://kinder.softkatta.in/api/... → this script → kinder-api.softkatta.in
 * Eliminates cross-origin CORS failures when the API host returns bare 403s (WAF/ModSecurity).
 */

declare(strict_types=1);

$apiOrigin = getenv('KINDER_API_ORIGIN') ?: 'https://kinder-api.softkatta.in';
$apiOrigin = rtrim($apiOrigin, '/');

$path = isset($_GET['path']) ? (string) $_GET['path'] : '';
$path = ltrim(str_replace(['..', "\0"], '', $path), '/');
if ($path === '' || ! str_starts_with($path, 'v1/')) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Invalid API path.']);
    exit;
}

$target = $apiOrigin.'/api/'.$path;
if (! empty($_SERVER['QUERY_STRING'])) {
    // Strip our internal path= param if present; forward the rest.
    parse_str($_SERVER['QUERY_STRING'], $qs);
    unset($qs['path']);
    if ($qs !== []) {
        $target .= '?'.http_build_query($qs);
    }
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$body = file_get_contents('php://input');
if ($body === false) {
    $body = '';
}

$headers = [];
$forward = [
    'Accept',
    'Authorization',
    'Content-Type',
    'X-Tenant-ID',
    'X-Requested-With',
    'X-XSRF-TOKEN',
];

foreach ($forward as $name) {
    $key = 'HTTP_'.strtoupper(str_replace('-', '_', $name));
    if ($name === 'Content-Type' && isset($_SERVER['CONTENT_TYPE'])) {
        $headers[] = 'Content-Type: '.$_SERVER['CONTENT_TYPE'];
        continue;
    }
    if (! empty($_SERVER[$key])) {
        $headers[] = $name.': '.$_SERVER[$key];
    }
}

// Also pick Authorization from REDIRECT_ / CGI variants Hostinger sometimes uses.
if (! preg_grep('/^Authorization:/i', $headers)) {
    foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION'] as $authKey) {
        if (! empty($_SERVER[$authKey])) {
            $headers[] = 'Authorization: '.$_SERVER[$authKey];
            break;
        }
    }
}

$headers[] = 'Origin: '.$apiOrigin;
$headers[] = 'X-Forwarded-For: '.($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$headers[] = 'X-Forwarded-Host: '.($_SERVER['HTTP_HOST'] ?? 'kinder.softkatta.in');
$headers[] = 'X-Forwarded-Proto: https';

$ch = curl_init($target);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 120,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => true,
]);

if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true) && $body !== '') {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

$raw = curl_exec($ch);
if ($raw === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'API proxy failed: '.curl_error($ch)]);
    curl_close($ch);
    exit;
}

$status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$respHeaders = substr($raw, 0, $headerSize);
$respBody = substr($raw, $headerSize);

http_response_code($status > 0 ? $status : 502);

$skip = ['transfer-encoding', 'connection', 'keep-alive', 'content-encoding', 'access-control-allow-origin', 'access-control-allow-credentials', 'access-control-allow-methods', 'access-control-allow-headers'];
foreach (explode("\r\n", $respHeaders) as $line) {
    if (! str_contains($line, ':')) {
        continue;
    }
    [$hName, $hVal] = explode(':', $line, 2);
    $hNameTrim = trim($hName);
    if (in_array(strtolower($hNameTrim), $skip, true)) {
        continue;
    }
    header($hNameTrim.': '.trim($hVal), false);
}

header('Content-Type: application/json', true);
echo $respBody;
