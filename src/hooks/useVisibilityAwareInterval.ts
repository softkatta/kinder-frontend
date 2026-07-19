import { useEffect, useRef } from 'react'

/**
 * Runs `callback` on an interval only while the document tab is visible.
 * Pauses in background tabs (avoids Chrome request-throttling warnings).
 * Runs once immediately when the tab becomes visible again.
 */
export function useVisibilityAwareInterval(
  callback: () => void,
  delayMs: number | null,
  enabled = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled || delayMs === null || delayMs <= 0) return

    let intervalId: ReturnType<typeof setInterval> | undefined

    const runIfVisible = () => {
      if (document.visibilityState === 'visible') {
        callbackRef.current()
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        callbackRef.current()
      }
    }

    intervalId = setInterval(runIfVisible, delayMs)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (intervalId !== undefined) clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [delayMs, enabled])
}
