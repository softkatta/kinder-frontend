function isPublicSoftKattaHost(hostname: string): boolean {
  return /(^|\.)softkatta\.in$/i.test(hostname)
}

function apiLooksLocal(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url)
}

/** Baked at build time — runtime may rewrite SPA hosts to same-origin /api/v1. */
const BAKED_API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim()

/**
 * Catches accidental `npm run build` (development) uploads to Hostinger —
 * those bake VITE_API_* = http://localhost and break license/media URLs.
 */
export function isWrongProductionApiBuild(): boolean {
  if (typeof window === 'undefined') return false
  return isPublicSoftKattaHost(window.location.hostname) && apiLooksLocal(BAKED_API_BASE)
}

export function WrongProductionApiBuildScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-100 px-6 text-center">
      <h1 className="text-xl font-semibold text-stone-900">Wrong frontend build deployed</h1>
      <p className="max-w-lg text-sm text-stone-600">
        This site is on <strong>{window.location.hostname}</strong> but the JavaScript bundle points the API at{' '}
        <code className="rounded bg-stone-200 px-1">{BAKED_API_BASE || '(empty)'}</code>. SoftKatta license
        checks and media URLs cannot work reliably.
      </p>
      <p className="max-w-lg text-sm text-stone-600">
        On your PC run <code className="rounded bg-stone-200 px-1">npm run build:production</code> in{' '}
        <code className="rounded bg-stone-200 px-1">kindergarten/frontend</code>, then upload the whole{' '}
        <code className="rounded bg-stone-200 px-1">dist/</code> folder to Hostinger (overwrite{' '}
        <code className="rounded bg-stone-200 px-1">index.html</code> +{' '}
        <code className="rounded bg-stone-200 px-1">assets/</code> + keep{' '}
        <code className="rounded bg-stone-200 px-1">api-proxy.php</code>).
      </p>
      <p className="text-xs text-stone-400">
        After upload, hard-refresh and confirm View Source shows a new index-*.js file.
      </p>
    </div>
  )
}
