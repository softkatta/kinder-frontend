import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'

const LiveRouteVisibleContext = createContext(true)

/** True when the live viewer route is the active page (not merely kept mounted). */
export function useLiveRouteVisible(): boolean {
  return useContext(LiveRouteVisibleContext)
}

/**
 * Keep the live page mounted across in-app navigation.
 * Hiding with display:none / off-screen translate remounts or reloads YouTube/Vimeo embeds.
 * Instead we shrink the kept page to a 2×2px corner of the viewport (still "visible") and mute.
 */
export function LiveRouteKeepAlive({
  path,
  page,
  children,
}: {
  path: string
  page: ReactNode
  children: ReactNode
}) {
  const location = useLocation()
  const active = location.pathname === path
  const mountedRef = useRef(active)
  if (active) mountedRef.current = true

  return (
    <LiveRouteVisibleContext.Provider value={active}>
      {mountedRef.current ? (
        <div
          className={active ? 'live-route-keep live-route-keep--active' : 'live-route-keep'}
          aria-hidden={!active}
        >
          {page}
        </div>
      ) : null}
      <div className={active ? 'live-route-outlet-suppressed' : undefined} hidden={active}>
        {children}
      </div>
    </LiveRouteVisibleContext.Provider>
  )
}
