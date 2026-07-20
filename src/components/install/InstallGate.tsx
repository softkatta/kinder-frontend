import { useEffect, useState, type ReactNode } from 'react'
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
} from '@/api/licenseRedirectGate'
import {
  isWrongProductionApiBuild,
  WrongProductionApiBuildScreen,
} from '@/components/install/WrongProductionApiBuild'

const EXEMPT_PREFIXES = ['/install', '/license/']

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

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const status = await installApi.status()
      if (status.database_unavailable || status.last_error_code === 'DATABASE_UNAVAILABLE') {
        last = { kind: 'database' }
        if (attempt < 5) {
          await sleep(300 + attempt * 200)
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
      // Network / transient DB — retry before treating as hard database outage
      last = { kind: 'database' }
      if (attempt < 5) {
        await sleep(300 + attempt * 200)
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

  const [ready, setReady] = useState(() => exempt || getInstallVerified() === true)
  const [blockingMessage, setBlockingMessage] = useState('Checking installation…')

  useEffect(() => {
    if (exempt || wrongApiBuild) {
      setReady(true)
      return
    }

    if (getInstallVerified() === true && !isLicenseGateLocked()) {
      setReady(true)
      return
    }

    let cancelled = false

    setReady(false)
    setBlockingMessage('Checking installation…')

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
  }, [exempt, wrongApiBuild, location.pathname, navigate])

  useEffect(() => {
    if (exempt || wrongApiBuild || !ready) {
      return
    }
    const timer = window.setInterval(() => {
      licenseApi.verify(true).catch(() => {
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
        <p className="text-xs text-stone-400">Kindergarten is locked until SoftKatta installation and license are valid.</p>
      </div>
    )
  }

  return <>{children}</>
}
