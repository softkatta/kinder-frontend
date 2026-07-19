const LOCK_KEY = 'sk_license_gate_lock'
const LOCK_PATH_KEY = 'sk_license_gate_path'
const LOCK_AT_KEY = 'sk_license_gate_locked_at'
const SUPPRESS_UNTIL_KEY = 'sk_license_suppress_until'

/** In-memory + session suppress so Restore → reload does not bounce to Invalid. */
let suppressLicenseRedirectUntil = 0

/** InstallGate OK cache — must live here so axios 403 can clear it without importing React. */
let installVerified: boolean | null = null

export function getInstallVerified(): boolean | null {
  return installVerified
}

export function setInstallVerified(value: boolean | null): void {
  installVerified = value
}

export function suppressLicenseRedirect(ms = 60000): void {
  const until = Date.now() + ms
  suppressLicenseRedirectUntil = until
  try {
    sessionStorage.setItem(SUPPRESS_UNTIL_KEY, String(until))
  } catch {
    /* private mode */
  }
}

export function clearLicenseRedirectSuppress(): void {
  suppressLicenseRedirectUntil = 0
  try {
    sessionStorage.removeItem(SUPPRESS_UNTIL_KEY)
  } catch {
    /* private mode */
  }
}

export function shouldSuppressLicenseRedirect(): boolean {
  if (suppressLicenseRedirectUntil > Date.now()) {
    return true
  }
  try {
    const until = Number(sessionStorage.getItem(SUPPRESS_UNTIL_KEY) || '0')
    if (until > Date.now()) {
      suppressLicenseRedirectUntil = until
      return true
    }
    if (until > 0) {
      sessionStorage.removeItem(SUPPRESS_UNTIL_KEY)
    }
  } catch {
    /* private mode */
  }
  return false
}

/** Stay on the license restore page until SoftKatta is proven healthy again. */
export function lockLicenseGate(path: string): void {
  if (shouldSuppressLicenseRedirect()) {
    return
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  try {
    sessionStorage.setItem(LOCK_KEY, '1')
    sessionStorage.setItem(LOCK_PATH_KEY, normalized)
    sessionStorage.setItem(LOCK_AT_KEY, String(Date.now()))
  } catch {
    /* private mode */
  }
  installVerified = null
}

export function clearLicenseGateLock(): void {
  try {
    sessionStorage.removeItem(LOCK_KEY)
    sessionStorage.removeItem(LOCK_PATH_KEY)
    sessionStorage.removeItem(LOCK_AT_KEY)
  } catch {
    /* private mode */
  }
}

export function isLicenseGateLocked(): boolean {
  if (shouldSuppressLicenseRedirect()) {
    return false
  }
  try {
    if (sessionStorage.getItem(LOCK_KEY) !== '1') {
      return false
    }
    const lockedAt = Number(sessionStorage.getItem(LOCK_AT_KEY) || '0')
    if (lockedAt > 0 && Date.now() - lockedAt > 10 * 60 * 1000) {
      clearLicenseGateLock()
      return false
    }
    return true
  } catch {
    return false
  }
}

export function lockedLicensePath(): string {
  try {
    return sessionStorage.getItem(LOCK_PATH_KEY) || '/license/invalid'
  } catch {
    return '/license/invalid'
  }
}
