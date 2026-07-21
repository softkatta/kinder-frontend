const LIVE_SOUND_UNLOCK_KEY = 'kinder-live-sound-unlocked'

/** True after a viewer gesture on this tab (click Live, tap page, etc.). */
export function readLiveSoundUnlocked(): boolean {
  try {
    return sessionStorage.getItem(LIVE_SOUND_UNLOCK_KEY) === '1'
  } catch {
    return false
  }
}

/** Call from any user gesture so /live can unmute without a Tap for sound button. */
export function unlockLiveSound(): void {
  try {
    sessionStorage.setItem(LIVE_SOUND_UNLOCK_KEY, '1')
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent('kinder-live-sound-unlock'))
  } catch {
    /* ignore */
  }
}
