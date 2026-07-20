export type LiveStreamStatus = 'draft' | 'scheduled' | 'live' | 'paused' | 'stopped' | 'cancelled'
export type LiveDisplayStatus = 'draft' | 'upcoming' | 'scheduled' | 'live' | 'paused' | 'ended' | 'cancelled'
export type LiveStreamMode = 'instant' | 'scheduled'
export type LiveVisibility = 'public' | 'parents_only'
export type StreamType = 'hls' | 'youtube' | 'vimeo' | 'embed' | 'facebook' | 'rtmp'
export type StreamSource =
  | 'mobile_camera'
  | 'external_camera'
  | 'obs'
  | 'youtube'
  | 'facebook'
  | 'vimeo'
  | 'rtmp'
  | 'hls'
  | 'custom_embed'

export type CameraConnectionStatus =
  | 'available'
  | 'connecting'
  | 'connected'
  | 'ready'
  | 'live'
  | 'disconnected'
  | 'offline'

export interface LiveStreamCameraStaff {
  id: number
  name: string
  location?: string | null
  stream_type: StreamType
  stream_url: string
  display_order: number
  is_enabled: boolean
  is_active: boolean
  publisher_user_id?: number | null
  publisher_name?: string | null
  publisher_role?: string | null
  publisher_photo_url?: string | null
  connection_status?: CameraConnectionStatus
  connection_status_label?: string
  device_name?: string | null
  battery_level?: number | null
  signal_strength?: number | null
  audio_muted?: boolean
  joined_at?: string | null
  last_seen_at?: string | null
  is_mobile_publisher?: boolean
}

export interface PublisherEvent {
  id: number
  title: string
  description?: string | null
  status: LiveStreamStatus
  display_status: LiveDisplayStatus
  status_label: string
  scheduled_start_at?: string | null
  can_join: boolean
}

export interface PublisherCamera {
  id: number
  name: string
  location?: string | null
  stream_type: StreamType
  connection_status: CameraConnectionStatus
  connection_status_label: string
  device_name?: string | null
  audio_muted: boolean
  joined_at?: string | null
}

export interface PublisherJoinPayload {
  stream: {
    id: number
    title: string
    status: LiveStreamStatus
    display_status: LiveDisplayStatus
    status_label: string
  }
  camera: PublisherCamera
}

export interface LiveStreamStaff {
  id: number
  title: string
  description?: string | null
  banner?: string | null
  cms_item_id?: number | null
  mode: LiveStreamMode
  event_date?: string | null
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  stream_source?: StreamSource | null
  enable_countdown: boolean
  enable_reminder: boolean
  notify_before_minutes: number[]
  visibility: LiveVisibility
  auto_start: boolean
  auto_end: boolean
  viewer_count: number
  audio_enabled: boolean
  status: LiveStreamStatus
  display_status: LiveDisplayStatus
  status_label: string
  active_camera_id?: number | null
  started_at?: string | null
  paused_at?: string | null
  stopped_at?: string | null
  cancelled_at?: string | null
  countdown_seconds?: number | null
  cameras: LiveStreamCameraStaff[]
  active_camera?: LiveStreamCameraStaff | null
}

export interface LiveStreamViewer {
  id: number
  title: string
  description?: string | null
  banner?: string | null
  status: LiveStreamStatus
  display_status: LiveDisplayStatus
  status_label: string
  is_watchable: boolean
  is_upcoming?: boolean
  is_scheduled?: boolean
  enable_countdown?: boolean
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  countdown_seconds?: number | null
  viewer_count?: number
  audio_enabled?: boolean
  visibility?: LiveVisibility
  active_camera?: {
    id: number
    name: string
    location?: string | null
    stream_type: StreamType
  } | null
}

export interface LivePlayback {
  mode: 'youtube' | 'vimeo' | 'signed_redirect'
  video_id?: string
  src?: string
}

export interface LiveStreamWatch extends LiveStreamViewer {
  playback?: LivePlayback
}

export interface LiveStreamRealtimePayload {
  action: string
  stream_id: number
  camera_id?: number | null
  viewer: LiveStreamViewer
  watch?: LiveStreamWatch
  staff?: LiveStreamStaff
  timestamp: string
}

export const STREAM_SOURCES: { id: StreamSource; label: string; needsUrl: boolean }[] = [
  { id: 'mobile_camera', label: 'Mobile Camera', needsUrl: true },
  { id: 'external_camera', label: 'External Camera', needsUrl: true },
  { id: 'obs', label: 'OBS Studio', needsUrl: true },
  { id: 'youtube', label: 'YouTube Live', needsUrl: true },
  { id: 'facebook', label: 'Facebook Live', needsUrl: true },
  { id: 'vimeo', label: 'Vimeo Live', needsUrl: true },
  { id: 'rtmp', label: 'RTMP', needsUrl: true },
  { id: 'hls', label: 'HLS (.m3u8)', needsUrl: true },
  { id: 'custom_embed', label: 'Custom Embed URL', needsUrl: true },
]
