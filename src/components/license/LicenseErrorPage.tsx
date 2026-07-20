import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { installApi, licenseApi, type CompanyApiPayload } from '@/api/installApi'
import { clearLicenseGateLock } from '@/api/licenseRedirectGate'
import { publicApi } from '@/api/services'
import { markInstallVerified, resetInstallVerificationCache } from '@/components/install/InstallGate'

const COPY: Record<string, { title: string; body: string }> = {
  invalid: {
    title: 'Invalid License',
    body: 'Enter your SoftKatta license key below to restore access on this server. SoftKatta Admin must show this key as Active with the correct domains.',
  },
  expired: {
    title: 'Expired Subscription',
    body: 'Your SoftKatta subscription has expired. Renew from the SoftKatta Customer Portal, then restore access below if needed.',
  },
  suspended: {
    title: 'Suspended License',
    body: 'SoftKatta Admin has suspended this license. After Admin Activates again, enter the license key below to restore — or wait a moment for automatic recovery.',
  },
  'domain-not-authorized': {
    title: 'Domain Not Authorized',
    body: 'This domain is not authorized. SoftKatta Admin → Tenants must include kinder.softkatta.in and kinder-api.softkatta.in for this subscription.',
  },
  'product-disabled': {
    title: 'Product Disabled',
    body: 'This SoftKatta product has been disabled for licensing. After SoftKatta Admin enables it again, restore access below.',
  },
  'unsupported-version': {
    title: 'Unsupported Version',
    body: 'This product version is not supported by your SoftKatta license. Upgrade or contact support.',
  },
  'server-verification-failed': {
    title: 'Server Verification Failed',
    body: 'The server fingerprint no longer matches the registered installation. Contact SoftKatta support.',
  },
  'grace-expired': {
    title: 'Offline Grace Period Expired',
    body: 'SoftKatta Central could not be reached within the offline grace period. Restore connectivity, then try Restore access.',
  },
  'company-api-unavailable': {
    title: 'SoftKatta Connection Required',
    body: 'Product Integration credentials are missing or SoftKatta Central is unreachable. Create an integration in SoftKatta Admin, then enter the keys below — they are saved to .env automatically (do not edit .env by hand).',
  },
  'invalid-install-token': {
    title: 'License Session Ended',
    body: 'This install session was revoked (usually after SoftKatta Suspend). Do not open the install wizard. After SoftKatta Admin Activates the license, enter the key below to restore.',
  },
  'database-unavailable': {
    title: 'Database Unavailable',
    body: 'Kindergarten is already installed, but the database connection failed (wrong DB password/user in .env). Fix your host MySQL credentials. Do not run the install wizard again.',
  },
}

const CAN_REACTIVATE = new Set([
  'suspended',
  'invalid-install-token',
  'invalid',
  'product-disabled',
  'expired',
  'domain-not-authorized',
  'server-verification-failed',
])
const CAN_CONFIGURE_COMPANY_API = new Set(['company-api-unavailable'])

function activationErrorMessage(errCode: string | undefined, msg: string): string {
  if (errCode === 'SUSPENDED_LICENSE' || /suspend/i.test(msg)) {
    return 'License is still suspended on SoftKatta. Ask SoftKatta Admin to Activate first, then try Restore again.'
  }
  if (errCode === 'INVALID_SIGNATURE' || errCode === 'INVALID_API_KEY') {
    return (
      msg ||
      'SoftKatta Product Integration keys do not match. SoftKatta Admin → Product Integrations → copy Public key + Reveal secret into the form below, then Restore again.'
    )
  }
  if (errCode === 'DOMAIN_NOT_AUTHORIZED' || /domain/i.test(msg)) {
    return (
      msg ||
      'Domain mismatch. SoftKatta Admin → Tenants must include kinder.softkatta.in (frontend) and kinder-api.softkatta.in (backend).'
    )
  }
  if (errCode === 'EXPIRED_SUBSCRIPTION' || /subscription is not active/i.test(msg)) {
    return 'Subscription is not active on SoftKatta. Set subscription status to Active, then try Restore again.'
  }
  if (errCode === 'TENANT_DOMAINS_REQUIRED') {
    return 'Assign frontend + backend domains for this subscription in SoftKatta Admin → Tenants, then try again.'
  }
  if (errCode === 'INVALID_LICENSE') {
    return (
      msg ||
      'License key was rejected. SoftKatta Admin “Active” must match this exact key — paste the current key from SoftKatta → License Keys.'
    )
  }
  return typeof msg === 'string' && msg ? msg : 'Activation failed.'
}

async function finishRestoreSuccess(): Promise<void> {
  await publicApi.schoolProfile()
  resetInstallVerificationCache()
  markInstallVerified()
}

export function LicenseErrorPage({ code }: { code: keyof typeof COPY }) {
  const content = COPY[code] ?? COPY.invalid
  const [licenseKey, setLicenseKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const showReactivate = CAN_REACTIVATE.has(code)
  const showCompanyApi = CAN_CONFIGURE_COMPANY_API.has(code)

  const [softkatta, setSoftkatta] = useState({
    company_api_url: 'https://api.softkatta.in/api/v1/company',
    public_api_key: '',
    api_secret: '',
    product_slug: 'nursery-school-management-software',
    product_version: '1.0.0',
    app_url: typeof window !== 'undefined' ? window.location.origin : '',
  })

  const [checkingHealth, setCheckingHealth] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await installApi.status()
        if (cancelled) return
        setSoftkatta((prev) => ({
          ...prev,
          company_api_url: s?.company_api?.company_api_url || prev.company_api_url,
          public_api_key: (s?.company_api?.public_api_key || '').trim(),
          product_slug: s?.company_api?.product_slug || s?.product_slug || prev.product_slug,
          product_version: s?.company_api?.product_version || s?.product_version || prev.product_version,
          app_url: s?.company_api?.app_url || prev.app_url,
        }))

        const shouldLiveRecover =
          code === 'suspended' ||
          code === 'product-disabled' ||
          code === 'expired' ||
          code === 'invalid' ||
          code === 'invalid-install-token'
        if (shouldLiveRecover) {
          try {
            await licenseApi.verify(true)
            await publicApi.schoolProfile()
            if (cancelled) return
            clearLicenseGateLock()
            resetInstallVerificationCache()
            markInstallVerified()
            window.location.replace('/')
            return
          } catch {
            /* still blocked */
          }
        }

        if (
          s?.installed &&
          s?.has_license &&
          s?.company_api_configured !== false &&
          !s?.needs_reactivation &&
          !s?.last_error_code
        ) {
          try {
            await publicApi.schoolProfile()
            if (cancelled) return
            clearLicenseGateLock()
            resetInstallVerificationCache()
            markInstallVerified()
            window.location.replace('/')
            return
          } catch {
            /* SoftKatta status OK but public API still blocked — stay on restore */
          }
        }
      } catch {
        /* keep page */
      } finally {
        if (!cancelled) setCheckingHealth(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [code])

  async function onReactivate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await licenseApi.activate(licenseKey.trim())
      await finishRestoreSuccess()
      setDone(true)
      window.setTimeout(() => {
        window.location.href = '/'
      }, 800)
    } catch (err) {
      const ax = err as {
        response?: { data?: { message?: string; error_code?: string } }
        message?: string
        error_code?: string
        original?: { response?: { data?: { message?: string; error_code?: string } } }
      }
      const msg =
        ax.message ??
        ax.response?.data?.message ??
        ax.original?.response?.data?.message ??
        'Activation failed.'
      const errCode =
        ax.error_code ?? ax.response?.data?.error_code ?? ax.original?.response?.data?.error_code
      setError(activationErrorMessage(errCode, typeof msg === 'string' ? msg : 'Activation failed.'))
    } finally {
      setBusy(false)
    }
  }

  async function onConfigureCompanyApi(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const publicKey = softkatta.public_api_key.trim()
    const secret = softkatta.api_secret.trim()
    if (publicKey.includes('@') || !/^sk_pub_[a-z0-9]+$/i.test(publicKey)) {
      setError(
        'Public API Key must be sk_pub_... from SoftKatta Admin → Product Integrations. Do not paste your SoftKatta login email.',
      )
      return
    }
    if (secret.includes('@') || !/^sk_sec_[a-z0-9]+$/i.test(secret)) {
      setError(
        'API Secret must be sk_sec_... from SoftKatta Admin → Product Integrations → Reveal. Do not paste your SoftKatta password.',
      )
      return
    }
    setBusy(true)
    try {
      const payload: CompanyApiPayload = {
        company_api_url: softkatta.company_api_url.trim(),
        public_api_key: publicKey,
        api_secret: secret,
        product_slug: softkatta.product_slug.trim(),
        product_version: softkatta.product_version.trim() || '1.0.0',
        app_url: softkatta.app_url.trim() || window.location.origin,
        require_https: softkatta.company_api_url.trim().startsWith('https://'),
      }
      await licenseApi.companyApi(payload)

      if (licenseKey.trim()) {
        await licenseApi.activate(licenseKey.trim())
      } else {
        await licenseApi.verify(true)
      }

      await finishRestoreSuccess()
      setDone(true)
      window.setTimeout(() => {
        window.location.href = '/'
      }, 800)
    } catch (err) {
      const ax = err as {
        response?: { data?: { message?: string; error_code?: string } }
        message?: string
        error_code?: string
      }
      const errCode = ax.response?.data?.error_code ?? ax.error_code
      if (errCode === 'INVALID_INSTALL_TOKEN' || errCode === 'INVALID_LICENSE') {
        setError(
          ax.response?.data?.message ??
            'SoftKatta keys saved. Enter your license key below and save again to finish restore.',
        )
      } else {
        setError(ax.response?.data?.message ?? ax.message ?? 'SoftKatta connection failed.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (checkingHealth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#f3e9e4_0%,_#f8f6f2_50%,_#e8ecea_100%)] px-6">
        <p className="text-sm text-stone-500">Checking SoftKatta license…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#f3e9e4_0%,_#f8f6f2_50%,_#e8ecea_100%)] px-6">
      <div className="w-full max-w-lg text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">SoftKatta License</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">{content.title}</h1>
        <p className="mt-4 text-stone-600">{content.body}</p>

        {showCompanyApi && !done && (
          <form onSubmit={onConfigureCompanyApi} className="mt-8 space-y-3 text-left">
            <label className="block text-sm text-stone-700">
              SoftKatta Company API URL
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                value={softkatta.company_api_url}
                onChange={(e) => setSoftkatta((s) => ({ ...s, company_api_url: e.target.value }))}
                placeholder="https://api.softkatta.in/api/v1/company"
                required
              />
            </label>
            <label className="block text-sm text-stone-700">
              Public API Key
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-mono"
                value={softkatta.public_api_key}
                onChange={(e) => setSoftkatta((s) => ({ ...s, public_api_key: e.target.value }))}
                placeholder="sk_pub_..."
                required
                autoComplete="off"
              />
            </label>
            <label className="block text-sm text-stone-700">
              API Secret
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-mono"
                value={softkatta.api_secret}
                onChange={(e) => setSoftkatta((s) => ({ ...s, api_secret: e.target.value }))}
                placeholder="sk_sec_..."
                required
                autoComplete="off"
              />
            </label>
            <label className="block text-sm text-stone-700">
              Product slug
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                value={softkatta.product_slug}
                onChange={(e) => setSoftkatta((s) => ({ ...s, product_slug: e.target.value }))}
                required
              />
            </label>
            <label className="block text-sm text-stone-700">
              License key (optional if already activated)
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="KG-????????"
                autoComplete="off"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy || !softkatta.public_api_key.trim() || !softkatta.api_secret.trim()}
              className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {busy ? 'Saving SoftKatta connection…' : 'Save SoftKatta connection'}
            </button>
            <p className="text-xs text-stone-500">
              SoftKatta Admin → Product Integrations → copy keys. Values are written to server .env by this form.
            </p>
          </form>
        )}

        {showReactivate && !done && (
          <form onSubmit={onReactivate} className="mt-8 space-y-3 text-left">
            <label className="block text-sm text-stone-700">
              License key
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="KG-????????"
                required
                autoComplete="off"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy || !licenseKey.trim()}
              className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {busy ? 'Restoring...' : 'Restore access'}
            </button>
            <p className="text-xs text-stone-500">
              SoftKatta Admin must Activate the license first. The install wizard never opens after the first successful install.
            </p>
          </form>
        )}

        {done && <p className="mt-6 text-sm text-emerald-700">License restored. Redirecting...</p>}

        <div className="mt-8 flex justify-center">
          <Link to="/login" className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
