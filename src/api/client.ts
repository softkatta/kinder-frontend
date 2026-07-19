import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store'
import { logout } from '@/store/slices/authSlice'

const API_HOST = 'kinder-api.softkatta.in'
const SPA_HOSTS = new Set(['kinder.softkatta.in', 'www.kinder.softkatta.in'])

/**
 * Production SPA must call same-origin /api/v1 (api-proxy.php).
 * Cross-origin POSTs to kinder-api often get bare Hostinger 403s without CORS bodies.
 */
function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase()
    if (SPA_HOSTS.has(host)) {
      return `${window.location.origin}/api/v1`
    }
  }
  const fromEnv = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (fromEnv.includes(API_HOST)) {
    return typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : '/api/v1'
  }
  return fromEnv || '/api/v1'
}

function rewriteAwayFromApiHost(config: InternalAxiosRequestConfig): void {
  if (typeof window === 'undefined') return
  const host = window.location.hostname.toLowerCase()
  if (!SPA_HOSTS.has(host)) return

  const sameOrigin = `${window.location.origin}/api/v1`
  config.baseURL = sameOrigin

  const raw = config.url || ''
  if (raw.includes(API_HOST)) {
    config.url = raw.replace(/^https?:\/\/kinder-api\.softkatta\.in\/api\/v1/i, '')
  }
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  rewriteAwayFromApiHost(config)

  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const tenantId = localStorage.getItem('tenant_id') || '1'
  config.headers['X-Tenant-ID'] = tenantId
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

const LICENSE_PATHS: Record<string, string> = {
  INVALID_LICENSE: 'license/invalid',
  EXPIRED_SUBSCRIPTION: 'license/expired',
  SUSPENDED_LICENSE: 'license/suspended',
  DOMAIN_NOT_AUTHORIZED: 'license/domain-not-authorized',
  PRODUCT_DISABLED: 'license/product-disabled',
  UNSUPPORTED_VERSION: 'license/unsupported-version',
  SERVER_VERIFICATION_FAILED: 'license/server-verification-failed',
  GRACE_EXPIRED: 'license/grace-expired',
  COMPANY_API_UNAVAILABLE: 'license/company-api-unavailable',
  INVALID_INSTALL_TOKEN: 'license/invalid-install-token',
  DATABASE_UNAVAILABLE: 'license/database-unavailable',
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error_code?: string }>) => {
    const status = error.response?.status
    const errorCode = error.response?.data?.error_code
    const path = window.location.pathname

    if (status === 503 && errorCode === 'DATABASE_UNAVAILABLE') {
      const dest = `${import.meta.env.BASE_URL}license/database-unavailable`.replace(/\/{2,}/g, '/')
      if (!path.includes('/license/database-unavailable')) {
        window.location.replace(dest)
      }
    }

    if (status === 503 && errorCode === 'NOT_INSTALLED') {
      const installPath = `${import.meta.env.BASE_URL}install`.replace(/\/{2,}/g, '/')
      if (!path.includes('/install') && !path.includes('/license/')) {
        window.location.replace(installPath)
      }
    }

    if (status === 403 && errorCode && LICENSE_PATHS[errorCode]) {
      const dest = `${import.meta.env.BASE_URL}${LICENSE_PATHS[errorCode]}`.replace(/\/{2,}/g, '/')
      if (!path.includes('/license/')) {
        window.location.replace(dest)
      }
    }

    if (status === 401) {
      store.dispatch(logout())
    }
    return Promise.reject(error)
  },
)

export default api

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error_code?: string
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

/** Best-effort message from axios / WAF / Laravel error shapes. */
export function apiErrorMessage(err: unknown, fallback = 'Request failed'): string {
  const ax = err as {
    response?: { status?: number; data?: unknown; headers?: Record<string, string> }
    message?: string
  }
  const data = ax.response?.data
  const status = ax.response?.status
  const contentType = String(ax.response?.headers?.['content-type'] ?? ax.response?.headers?.['Content-Type'] ?? '')

  if (data && typeof data === 'object' && data !== null && 'message' in data) {
    const msg = (data as { message?: unknown }).message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  if (typeof data === 'string' && data.trim()) {
    const plain = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (plain) {
      if (status === 403 || /forbidden/i.test(plain)) {
        return 'Save blocked by host firewall (ModSecurity 403). In Hostinger hPanel → Security → ModSecurity, disable for kinder.softkatta.in and kinder-api.softkatta.in, then retry.'
      }
      return plain.slice(0, 160)
    }
  }
  if (status === 403) {
    if (contentType.includes('text/html') || data == null || data === '') {
      return 'Save blocked by host firewall (ModSecurity 403). Disable ModSecurity for kinder + kinder-api, then retry.'
    }
    return 'Forbidden (403). Re-login as Super Admin, or check Network → Response for details.'
  }
  if (status) return `${fallback} (${status})`
  return ax.message || fallback
}
