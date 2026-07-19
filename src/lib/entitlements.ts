import { licenseApi } from '@/api/installApi'

export type Entitlements = {
  installed: boolean
  product_slug?: string
  bound_domain?: string | null
  plan?: string | null
  modules?: Record<string, boolean>
  limits?: Record<string, number>
  last_verified_at?: string | null
  last_error_code?: string | null
}

let cache: Entitlements | null = null

export async function loadEntitlements(force = false): Promise<Entitlements> {
  if (cache && !force) return cache
  cache = (await licenseApi.entitlements()) as Entitlements
  return cache
}

export function isModuleEnabled(module: string, entitlements?: Entitlements | null): boolean {
  const modules = entitlements?.modules ?? cache?.modules
  if (!modules || Object.keys(modules).length === 0) return true
  return Boolean(modules[module])
}

export function clearEntitlementsCache() {
  cache = null
}
