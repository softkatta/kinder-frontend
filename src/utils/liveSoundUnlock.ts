const LIVE_SOUND_UNLOCK_KEY = 'kinder-live-sound-unlocked'
const LIVE_PLAY_UNLOCK_KEY = 'kinder-live-play-unlocked'

function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key: string): void {
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    /* ignore */
  }
}

/** True after a viewer gesture on this tab (click Live, tap page, etc.). */
export function readLiveSoundUnlocked(): boolean {
  return readFlag(LIVE_SOUND_UNLOCK_KEY)
}

/**
 * True after the viewer has unlocked playback once (Tap to play / Live CTA / page gesture).
 * New layout panes must not ask for another Tap to play.
 */
export function readLivePlaybackUnlocked(): boolean {
  return readFlag(LIVE_PLAY_UNLOCK_KEY) || readLiveSoundUnlocked()
}

/** Call from any user gesture so /live can unmute without a Tap for sound button. */
export function unlockLiveSound(): void {
  writeFlag(LIVE_SOUND_UNLOCK_KEY)
  writeFlag(LIVE_PLAY_UNLOCK_KEY)
  try {
    window.dispatchEvent(new CustomEvent('kinder-live-sound-unlock'))
  } catch {
    /* ignore */
  }
}

/** Mark muted autoplay as user-approved for this tab (layout changes keep playing). */
export function unlockLivePlayback(): void {
  writeFlag(LIVE_PLAY_UNLOCK_KEY)
  try {
    window.dispatchEvent(new CustomEvent('kinder-live-play-unlock'))
  } catch {
    /* ignore */
  }
}
