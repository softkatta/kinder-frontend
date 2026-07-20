import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { installApi, licenseApi } from '@/api/installApi'
import {
  clearLicenseGateLock,
  getInstallVerified,
  isLicenseGateLocked,
  lockLicenseGate,
  lockedLicensePath,
  setInstallVerified,
  suppressLicenseRedirect,
  touchInstallVerified,
} from '@/api/licenseRedirectGate'
import {
  isWrongProductionApiBuild,
  WrongProductionApiBuildScreen,
} from '@/components/install/WrongProductionApiBuild'

const EXEMPT_PREFIXES = ['/install', '/license/']
const GATE_ATTEMPTS = 12

export function resetInstallVerificationCache(): void {
  setInstallVerified(null)
}

export function markInstallVerified(): void {
  setInstallVerified(true)
  clearLicenseGateLock()
  suppressLicenseRedirect(90000)
}

function isExemptPath(pathname: string): boolean {
  return EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function licenseRestorePath(lastErrorCode?: string | null): string {
  const map: Record<string, string> = {
    INVALID_LICENSE: '/license/invalid',
    SUSPENDED_LICENSE: '/license/suspended',
    EXPIRED_SUBSCRIPTION: '/license/expired',
    PRODUCT_DISABLED: '/license/product-disabled',
    INVALID_INSTALL_TOKEN: '/license/invalid-install-token',
    DOMAIN_NOT_AUTHORIZED: '/license/domain-not-authorized',
    TENANT_DOMAINS_REQUIRED: '/license/domain-not-authorized',
    GRACE_EXPIRED: '/license/grace-expired',
    COMPANY_API_UNAVAILABLE: '/license/company-api-unavailable',
    COMPANY_API_NOT_CONFIGURED: '/license/company-api-unavailable',
    INVALID_SIGNATURE: '/license/company-api-unavailable',
    INVALID_API_KEY: '/license/company-api-unavailable',
    DATABASE_UNAVAILABLE: '/license/database-unavailable',
  }
  return map[lastErrorCode ?? ''] ?? '/license/invalid-install-token'
}

type GateResult =
  | { kind: 'ok' }
  | { kind: 'install' }
  | { kind: 'license'; path: string }
  | { kind: 'database' }

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function resolveGate(): Promise<GateResult> {
  if (isLicenseGateLocked()) {
    try {
      const status = await installApi.status()
      if (
        status.installed &&
        status.has_license &&
        status.company_api_configured !== false &&
        !status.needs_reactivation &&
        !status.last_error_code
      ) {
        clearLicenseGateLock()
        setInstallVerified(true)
        return { kind: 'ok' }
      }
    } catch {
      /* keep lock */
    }
    return { kind: 'license', path: lockedLicensePath() }
  }

  if (getInstallVerified() === true) {
    return { kind: 'ok' }
  }

  let last: GateResult = { kind: 'database' }

  for (let attempt = 0; attempt < GATE_ATTEMPTS; attempt += 1) {
    try {
      const status = await installApi.status()
      if (status.database_unavailable || status.last_error_code === 'DATABASE_UNAVAILABLE') {
        last = { kind: 'database' }
        if (attempt < GATE_ATTEMPTS - 1) {
          await sleep(500 + attempt * 350)
          continue
        }
        return last
      }

      if (status.installed && status.last_error_code) {
        if (status.company_api_configured === false) {
          return { kind: 'license', path: '/license/company-api-unavailable' }
        }
        try {
          await licenseApi.verify(true)
          clearLicenseGateLock()
          setInstallVerified(true)
          return { kind: 'ok' }
        } catch {
          return { kind: 'license', path: licenseRestorePath(status.last_error_code) }
        }
      }

      if (
        status.installed &&
        status.has_license &&
        status.company_api_configured !== false &&
        !status.needs_reactivation &&
        !status.last_error_code
      ) {
        setInstallVerified(true)
        return { kind: 'ok' }
      }

      if (status.installed) {
        if (status.company_api_configured === false) {
          return { kind: 'license', path: '/license/company-api-unavailable' }
        }
        try {
          await licenseApi.verify(true)
          setInstallVerified(true)
          return { kind: 'ok' }
        } catch {
          const path = licenseRestorePath(status.last_error_code)
          lockLicenseGate(path)
          return { kind: 'license', path }
        }
      }
      return { kind: 'install' }
    } catch (err) {
      const code = (err as { error_code?: string })?.error_code
      if (code === 'NOT_INSTALLED') {
        return { kind: 'install' }
      }
      last = { kind: 'database' }
      if (attempt < GATE_ATTEMPTS - 1) {
        await sleep(500 + attempt * 350)
        continue
      }
      return last
    }
  }

  return last
}

export function InstallGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const exempt = isExemptPath(location.pathname)
  const wrongApiBuild = isWrongProductionApiBuild()
  const bootChecked = useRef(false)

  const [ready, setReady] = useState(() => exempt || getInstallVerified() === true)
  const [blockingMessage, setBlockingMessage] = useState('Checking installation…')

  // Boot / hard-refresh only — do NOT re-gate on every SPA route change (that remounts live players).
  useEffect(() => {
    if (exempt || wrongApiBuild) {
      setReady(true)
      return
    }

    if (getInstallVerified() === true && !isLicenseGateLocked()) {
      setReady(true)
      // Soft re-check in background; never block UI or remount the tree.
      if (!bootChecked.current) {
        bootChecked.current = true
        void resolveGate().then((result) => {
          if (result.kind === 'ok') {
            touchInstallVerified()
            return
          }
          if (result.kind === 'license') {
            lockLicenseGate(result.path)
            navigate(result.path, { replace: true })
            return
          }
          if (result.kind === 'database') {
            // Recent soft-OK exists — ignore a single flake; only hard-fail if cache already cleared.
            if (getInstallVerified() !== true) {
              navigate('/license/database-unavailable', { replace: true })
            }
            return
          }
          if (result.kind === 'install') {
            setInstallVerified(null)
            navigate('/install', { replace: true })
          }
        })
      }
      return
    }

    let cancelled = false
    bootChecked.current = true
    setReady(false)
    setBlockingMessage('Connecting to school database…')

    resolveGate().then((result) => {
      if (cancelled) return
      if (result.kind === 'ok') {
        setReady(true)
        return
      }
      if (result.kind === 'license') {
        lockLicenseGate(result.path)
        setBlockingMessage('License restore required. Redirecting…')
        navigate(result.path, { replace: true })
        return
      }
      if (result.kind === 'database') {
        setBlockingMessage('Database unavailable. Redirecting…')
        navigate('/license/database-unavailable', { replace: true })
        return
      }
      setBlockingMessage('Installation required. Redirecting…')
      navigate('/install', { replace: true })
    })

    return () => {
      cancelled = true
    }
    // Intentionally omit location.pathname — route changes must not remount the app shell.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exempt, wrongApiBuild, navigate])

  useEffect(() => {
    if (exempt || wrongApiBuild || !ready) {
      return
    }
    const timer = window.setInterval(() => {
      licenseApi.verify(true)
        .then(() => touchInstallVerified())
        .catch(() => {
          /* axios interceptor redirects on SoftKatta Suspend / Disable */
        })
    }, 12000)
    return () => window.clearInterval(timer)
  }, [exempt, wrongApiBuild, ready])

  if (wrongApiBuild) {
    return <WrongProductionApiBuildScreen />
  }

  if (exempt) {
    return <>{children}</>
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-stone-50 px-6 text-center text-sm text-stone-500">
        <p>{blockingMessage}</p>
        <p className="text-xs text-stone-400">Shared hosting MySQL can wake slowly — waiting before showing an error.</p>
      </div>
    )
  }

  return <>{children}</>
}
