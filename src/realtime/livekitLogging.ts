import { LogLevel, setLogLevel } from 'livekit-client'

/** Suppress LiveKit SDK logs (including WebSocket URLs with access tokens) in the browser console. */
setLogLevel(LogLevel.silent)
