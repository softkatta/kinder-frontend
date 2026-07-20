<?php

/**
 * Same-origin API proxy for Hostinger SPA hosting.
 * Browser → https://kinder.softkatta.in/api/... → this script → kinder-api.softkatta.in
 *
 * Supports JSON and multipart file uploads (FormData).
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
    parse_str($_SERVER['QUERY_STRING'], $qs);
    unset($qs['path']);
    if ($qs !== []) {
        $target .= '?'.http_build_query($qs);
    }
}

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
// Hostinger hcdn often returns bare text/plain 403 for PUT before PHP runs.
// Convert settings-save PUTs to POST when forwarding so older SPA builds still work if they reach PHP.
$putToPostPaths = [
    'v1/erp/school',
    'v1/settings',
    'v1/school-config',
    'v1/org-preferences',
    'v1/org_preferences',
    'v1/tenant/profile',
];
if ($method === 'PUT' && in_array($path, $putToPostPaths, true)) {
    $method = 'POST';
}

$contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '');
$isMultipart = str_contains(strtolower($contentType), 'multipart/form-data');

$headers = [];
$forwardHeaderNames = [
    'Accept',
    'Authorization',
    'X-Tenant-ID',
    'X-Requested-With',
    'X-XSRF-TOKEN',
];

foreach ($forwardHeaderNames as $name) {
    $key = 'HTTP_'.strtoupper(str_replace('-', '_', $name));
    if (! empty($_SERVER[$key])) {
        $headers[] = $name.': '.$_SERVER[$key];
    }
}

if (! preg_grep('/^Authorization:/i', $headers)) {
    foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION'] as $authKey) {
        if (! empty($_SERVER[$authKey])) {
            $headers[] = 'Authorization: '.$_SERVER[$authKey];
            break;
        }
    }
}

$headers[] = 'X-Forwarded-For: '.($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$headers[] = 'X-Forwarded-Host: '.($_SERVER['HTTP_HOST'] ?? 'kinder.softkatta.in');
$headers[] = 'X-Forwarded-Proto: https';

$ch = curl_init($target);
$curlOpts = [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_TIMEOUT => 180,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => true,
];

if (in_array($method, ['POST', 'PUT', 'PATCH'], true) && $isMultipart) {
    // PHP already parsed multipart into $_POST/$_FILES — rebuild for curl.
    $postFields = $_POST;
    foreach ($_FILES as $field => $fileInfo) {
        if (is_array($fileInfo['name'])) {
            // Multi-file fields not used by this app; skip nested for now.
            continue;
        }
        if (($fileInfo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            continue;
        }
        $postFields[$field] = new CURLFile(
            $fileInfo['tmp_name'],
            $fileInfo['type'] ?: 'application/octet-stream',
            $fileInfo['name'] ?: 'upload.bin',
        );
    }
    // Let cURL set multipart Content-Type + boundary.
    $curlOpts[CURLOPT_POSTFIELDS] = $postFields;
} elseif (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    $body = file_get_contents('php://input');
    if ($body === false) {
        $body = '';
    }
    if ($contentType !== '') {
        $headers[] = 'Content-Type: '.$contentType;
    }
    $curlOpts[CURLOPT_POSTFIELDS] = $body;
}

$curlOpts[CURLOPT_HTTPHEADER] = $headers;
curl_setopt_array($ch, $curlOpts);

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

$skip = [
    'transfer-encoding',
    'connection',
    'keep-alive',
    'content-encoding',
    'access-control-allow-origin',
    'access-control-allow-credentials',
    'access-control-allow-methods',
    'access-control-allow-headers',
];
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

if (! headers_sent()) {
    // Prefer upstream JSON content-type when present; otherwise default.
    if (! preg_match('/^Content-Type:/mi', $respHeaders)) {
        header('Content-Type: application/json', true);
    }
}

echo $respBody;
