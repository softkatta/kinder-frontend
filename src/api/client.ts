import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store'
import { logout } from '@/store/slices/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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
