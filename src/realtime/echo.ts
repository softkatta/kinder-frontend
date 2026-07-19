import type Echo from 'laravel-echo'
import type Pusher from 'pusher-js'
import { settingsApi } from '@/api/services'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo?: Echo<'pusher'>
  }
}

let echoInstance: Echo<'pusher'> | null = null
let echoPromise: Promise<Echo<'pusher'> | null> | null = null
let echoUnavailable = false
let cachedBroadcast: {
  key: string
  host: string
  port: number
  scheme: string
  cluster: string
} | null = null

function clientRealtimeEnabled(): boolean {
  return import.meta.env.VITE_REVERB_ENABLED !== 'false'
}

function markEchoUnavailable() {
  if (echoUnavailable) return
  echoUnavailable = true
  disconnectEcho()
}

async function resolveBroadcastConfig() {
  if (cachedBroadcast) return cachedBroadcast
  if (!clientRealtimeEnabled()) return null

  try {
    const res = await settingsApi.broadcastConfig()
    const cfg = res.data.data
    if (cfg?.enabled && cfg.key) {
      cachedBroadcast = {
        key: cfg.key,
        host: cfg.host || 'localhost',
        port: Number(cfg.port || 8080),
        scheme: cfg.scheme || 'http',
        cluster: cfg.cluster || 'mt1',
      }
      return cachedBroadcast
    }
  } catch {
    // API unavailable — optional env override for local dev
  }

  const envEnabled = import.meta.env.VITE_REVERB_ENABLED === 'true'
  const envKey = import.meta.env.VITE_REVERB_APP_KEY || import.meta.env.VITE_PUSHER_APP_KEY || ''
  if (!envEnabled || !envKey) return null

  cachedBroadcast = {
    key: envKey,
    host: import.meta.env.VITE_REVERB_HOST || 'localhost',
    port: Number(import.meta.env.VITE_REVERB_PORT || 8080),
    scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
  }

  return cachedBroadcast
}

function echoRuntime() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'
  const token = localStorage.getItem('auth_token')
  const cfg = cachedBroadcast
  if (!cfg) return null

  const useTls = cfg.scheme === 'https'

  return { apiBase, token, useTls, ...cfg }
}

function attachConnectionGuards(PusherCtor: typeof Pusher, echo: Echo<'pusher'>) {
  PusherCtor.logToConsole = false

  const connector = echo.connector as { pusher?: { connection: { bind: (e: string, cb: () => void) => void; disconnect: () => void } } }
  const connection = connector?.pusher?.connection
  if (!connection) return

  const stop = () => {
    try {
      connection.disconnect()
    } catch {
      // ignore
    }
    markEchoUnavailable()
  }

  connection.bind('unavailable', stop)
  connection.bind('failed', stop)
  connection.bind('error', stop)
}

/** Returns Echo only if already connected — does not load pusher-js. */
export function getEcho(): Echo<'pusher'> | null {
  return echoInstance
}

/** Lazy-load laravel-echo + pusher-js (live/admin pages only). */
export async function ensureEcho(): Promise<Echo<'pusher'> | null> {
  if (echoUnavailable) return null
  if (echoInstance) return echoInstance

  const broadcast = await resolveBroadcastConfig()
  if (!broadcast) return null

  if (!echoPromise) {
    echoPromise = (async () => {
      const [{ default: EchoCtor }, { default: PusherCtor }] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ])

      window.Pusher = PusherCtor

      const runtime = echoRuntime()
      if (!runtime) return null

      echoInstance = new EchoCtor({
        broadcaster: 'pusher',
        key: runtime.key,
        wsHost: runtime.host,
        wsPort: runtime.port,
        wssPort: runtime.port,
        forceTLS: runtime.useTls,
        enabledTransports: runtime.useTls ? ['wss'] : ['ws'],
        disableStats: true,
        cluster: runtime.cluster,
        authEndpoint: `${runtime.apiBase}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: runtime.token ? `Bearer ${runtime.token}` : '',
            Accept: 'application/json',
          },
        },
      })

      attachConnectionGuards(PusherCtor, echoInstance)

      return echoInstance
    })().catch(() => {
      markEchoUnavailable()
      return null
    })
  }

  return echoPromise
}

/** Refresh bearer token on Echo connector after login / page load. */
export function refreshEchoAuth() {
  if (!echoInstance) return
  const token = localStorage.getItem('auth_token')
  const connector = echoInstance.connector as {
    options?: { auth?: { headers?: Record<string, string> } }
    pusher?: { config?: { auth?: { headers?: Record<string, string> } } }
  }
  if (connector?.options?.auth?.headers) {
    connector.options.auth.headers.Authorization = token ? `Bearer ${token}` : ''
  }
  if (connector?.pusher?.config?.auth?.headers) {
    connector.pusher.config.auth.headers.Authorization = token ? `Bearer ${token}` : ''
  }
}

export function disconnectEcho() {
  echoInstance?.disconnect()
  echoInstance = null
  echoPromise = null
  cachedBroadcast = null
}

/** Call after integration settings change so the next ensureEcho() re-reads config. */
export function resetEchoConfig() {
  echoUnavailable = false
  cachedBroadcast = null
}
