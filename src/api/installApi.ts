import api, { type ApiResponse } from './client'
import { AxiosError } from 'axios'

export type InstallStatus = {
  installed: boolean
  product_slug: string
  product_version: string
  domain: string
  fingerprint: string
  has_license: boolean
  needs_reactivation?: boolean
  last_error_code?: string | null
  database_unavailable?: boolean
  bound_domain: string | null
  company_api_configured?: boolean
  company_api?: {
    company_api_url?: string
    public_api_key?: string
    api_secret_set?: boolean
    product_slug?: string
    product_version?: string
    app_url?: string
    require_https?: boolean
    offline_grace_days?: number
    verify_interval_hours?: number
  }
  database?: {
    host?: string
    port?: string
    database?: string
    username?: string
    password_set?: boolean
  }
}

export type RequirementCheck = {
  label: string
  ok: boolean
  value: string
}

export type CompanyApiPayload = {
  company_api_url: string
  public_api_key: string
  api_secret: string
  product_slug: string
  product_version?: string
  app_url: string
  require_https?: boolean
  offline_grace_days?: number
  verify_interval_hours?: number
}

class ApiError extends Error {
  error_code?: string
  status?: number

  constructor(message: string, error_code?: string, status?: number) {
    super(message)
    this.error_code = error_code
    this.status = status
  }
}

function unwrapError(e: unknown): ApiError {
  if (e instanceof AxiosError) {
    const data = e.response?.data as { message?: string; error_code?: string } | undefined
    return new ApiError(
      data?.message ?? e.message ?? 'Request failed',
      data?.error_code,
      e.response?.status,
    )
  }
  if (e instanceof Error) return new ApiError(e.message)
  return new ApiError('Request failed')
}

async function getData<T>(url: string): Promise<T> {
  try {
    const res = await api.get<ApiResponse<T>>(url)
    return res.data.data
  } catch (e) {
    throw unwrapError(e)
  }
}

async function postData<T>(url: string, body?: unknown): Promise<T> {
  try {
    const res = await api.post<ApiResponse<T>>(url, body)
    return res.data.data
  } catch (e) {
    throw unwrapError(e)
  }
}

export const installApi = {
  status: () => getData<InstallStatus>('/install/status'),
  requirements: () =>
    getData<{ checks: Record<string, RequirementCheck>; passed: boolean }>('/install/requirements'),
  database: (payload: {
    host: string
    port?: string
    database: string
    username: string
    password?: string
  }) => postData('/install/database', payload),
  companyApi: (payload: CompanyApiPayload) => postData('/install/company-api', payload),
  admin: (payload: { name: string; email: string; password: string }) =>
    postData('/install/admin', payload),
  activate: (license_key: string) =>
    postData<{
      installation_id?: string
      bound_domain?: string
      configuration_profile?: unknown
    }>('/install/activate', { license_key }),
  configuration: () =>
    getData<{
      installation_id?: string
      bound_domain?: string | null
      plan?: string | null
      modules?: Record<string, boolean>
      limits?: Record<string, number>
      product_slug?: string
      product_version?: string
    }>('/install/configuration'),
  migrate: () => postData('/install/migrate'),
  complete: () => postData('/install/complete'),
}

export const licenseApi = {
  entitlements: () => getData('/license/entitlements'),
  verify: (force = false) => postData('/license/verify', { force }),
  activate: (license_key: string) => postData('/license/activate', { license_key }),
  companyApi: (payload: CompanyApiPayload) => postData('/license/company-api', payload),
}
