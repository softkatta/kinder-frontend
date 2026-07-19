import type { LucideIcon } from 'lucide-react'
import {
  Smartphone, Wifi, Mic, Camera, Laptop, Radio, AlertTriangle, Lightbulb, CheckCircle2,
} from 'lucide-react'

export interface GuideSection {
  id: string
  title: string
  icon?: LucideIcon
}

export interface EquipmentTier {
  id: string
  title: string
  subtitle: string
  tone: 'sky' | 'violet' | 'amber'
  items: string[]
}

export interface StreamingMethod {
  id: string
  title: string
  flow: string
  tip?: string
}

export interface SetupStep {
  step: number
  title: string
  detail: string
  erp?: boolean
}

export interface ChecklistItem {
  id: string
  label: string
}

export interface TroubleshootingItem {
  issue: string
  solutions: string[]
}

export const GUIDE_SECTIONS: GuideSection[] = [
  { id: 'equipment', title: 'Equipment Required', icon: Camera },
  { id: 'methods', title: 'Streaming Methods', icon: Radio },
  { id: 'steps', title: 'Step-by-Step Setup', icon: CheckCircle2 },
  { id: 'checklist', title: 'Pre-Stream Checklist', icon: CheckCircle2 },
  { id: 'troubleshooting', title: 'Troubleshooting', icon: AlertTriangle },
  { id: 'best-practices', title: 'Best Practices', icon: Lightbulb },
]

export const EQUIPMENT_TIERS: EquipmentTier[] = [
  {
    id: 'basic',
    title: 'Basic Setup',
    subtitle: 'Mobile Streaming',
    tone: 'sky',
    items: [
      'Android Phone / iPhone',
      'Stable Internet Connection (Minimum 10 Mbps Upload)',
      'Mobile Tripod',
      'Mobile Charger / Power Bank',
      'YouTube App or Streaming App',
    ],
  },
  {
    id: 'standard',
    title: 'Standard Setup',
    subtitle: 'Improved audio & stability',
    tone: 'violet',
    items: [
      'Mobile + External Microphone',
      'Mobile Stand',
      'Wi-Fi or 4G/5G Internet',
    ],
  },
  {
    id: 'professional',
    title: 'Professional Setup',
    subtitle: 'Multi-camera / OBS production',
    tone: 'amber',
    items: [
      'DSLR / Mirrorless Camera',
      'HDMI Cable',
      'Capture Card',
      'Laptop/Desktop',
      'OBS Studio',
      'External Microphone',
      'Tripod',
      'Speaker (Optional)',
      'High-Speed Internet (Minimum 20 Mbps Upload)',
    ],
  },
]

export const STREAMING_METHODS: StreamingMethod[] = [
  {
    id: 'm1',
    title: 'Method 1',
    flow: 'Mobile Camera → YouTube Live',
    tip: 'Fastest for school events. Use the YouTube mobile app’s “Go Live” feature.',
  },
  {
    id: 'm2',
    title: 'Method 2',
    flow: 'Mobile Camera → RTMP App → RTMP Server',
    tip: 'Use when you need a custom RTMP endpoint or third-party ingest.',
  },
  {
    id: 'm3',
    title: 'Method 3',
    flow: 'DSLR → Capture Card → OBS Studio → YouTube Live',
    tip: 'Best quality. Connect HDMI out from camera to capture card, then add as video source in OBS.',
  },
  {
    id: 'm4',
    title: 'Method 4',
    flow: 'External Camera → OBS Studio → Custom RTMP',
    tip: 'For advanced setups with multiple scenes and overlays.',
  },
]

export const SETUP_STEPS: SetupStep[] = [
  { step: 1, title: 'Prepare equipment', detail: 'Gather phone or camera, tripod, charger, and microphone based on your chosen setup tier.' },
  { step: 2, title: 'Connect & test internet', detail: 'Connect Wi-Fi or mobile data. Run a speed test — upload should be at least 10 Mbps (20 Mbps for professional).' },
  { step: 3, title: 'Mount the device', detail: 'Secure the mobile or camera on a tripod at the desired angle. Use landscape orientation.' },
  { step: 4, title: 'Connect DSLR (if applicable)', detail: 'Camera → HDMI cable → Capture Card → Laptop USB port. Wait for the device to be recognized.' },
  { step: 5, title: 'Open OBS Studio', detail: 'Add Video Capture Device source. Select your camera or capture card. Add Audio Input Capture for the microphone.', erp: false },
  { step: 6, title: 'Start the platform stream', detail: 'In YouTube (or your RTMP platform), create a live stream and start broadcasting. Keep the stream running.' },
  { step: 7, title: 'Copy the stream URL', detail: 'Copy the Live Stream URL, Watch URL, or Embed URL from YouTube/Vimeo/RTMP output.', erp: true },
  { step: 8, title: 'Open the ERP event', detail: 'In the ERP, go to Live Stream Management and select your event.', erp: true },
  { step: 9, title: 'Go to Live Stream Management', detail: 'Admin: Live Streams · Teacher: Live Control. Select the event you created.', erp: true },
  { step: 10, title: 'Paste the Stream URL', detail: 'Add or edit a camera, choose stream type (YouTube, HLS, etc.), and paste the URL.', erp: true },
  { step: 11, title: 'Preview stream', detail: 'Click the eye icon to preview. Confirm video and audio before going live to parents.', erp: true },
  { step: 12, title: 'Start Live', detail: 'Click Start Live on the event. Parents and the public page will see the feed automatically.', erp: true },
  { step: 13, title: 'Verify before parents watch', detail: 'Watch the preview on another device. Switch active cameras if needed. Confirm notifications are ready.', erp: true },
]

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'internet', label: 'Internet Connected' },
  { id: 'speed', label: 'Upload Speed OK' },
  { id: 'camera', label: 'Camera Connected' },
  { id: 'audio', label: 'Audio Working' },
  { id: 'battery', label: 'Battery Charged' },
  { id: 'power', label: 'Power Backup Available' },
  { id: 'url', label: 'Stream URL Added' },
  { id: 'preview', label: 'Preview Successful' },
  { id: 'active', label: 'Active Camera Selected' },
  { id: 'notify', label: 'Notifications Ready' },
]

export const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Camera Not Detected',
    solutions: [
      'Reconnect HDMI and USB cables firmly.',
      'In OBS, remove and re-add the Video Capture Device source.',
      'Restart OBS and the camera; check capture card drivers on Windows.',
    ],
  },
  {
    issue: 'Internet Too Slow',
    solutions: [
      'Move closer to the Wi-Fi router or switch to 4G/5G hotspot.',
      'Lower stream resolution/bitrate in YouTube or OBS settings.',
      'Pause other downloads and close background apps on the streaming device.',
    ],
  },
  {
    issue: 'Stream Not Loading',
    solutions: [
      'Confirm the stream is actually live on YouTube/Vimeo.',
      'Re-copy the URL and paste again in ERP camera settings.',
      'Use Preview in ERP before Start Live.',
    ],
  },
  {
    issue: 'Audio Not Working',
    solutions: [
      'Check microphone permissions in the OS and streaming app.',
      'Select the correct audio input in OBS (Audio Input Capture).',
      'Test with headphones to rule out speaker feedback.',
    ],
  },
  {
    issue: 'Black Screen',
    solutions: [
      'Ensure the camera lens cap is off and the source is not disabled in OBS.',
      'For YouTube, wait until the stream status shows “Live”.',
      'Try a different browser for ERP preview.',
    ],
  },
  {
    issue: 'OBS Not Detecting Camera',
    solutions: [
      'Close other apps using the camera (Zoom, Teams).',
      'Update capture card drivers and OBS to the latest version.',
      'Try a different USB port (USB 3.0 recommended).',
    ],
  },
  {
    issue: 'Invalid Stream URL',
    solutions: [
      'Use the full watch or live URL from YouTube/Vimeo.',
      'Match stream type in ERP (YouTube URL → YouTube type).',
      'For HLS, use the direct .m3u8 playlist URL.',
    ],
  },
]

export const BEST_PRACTICES: string[] = [
  'Use Landscape Mode',
  'Keep Camera Stable',
  'Test Audio Before Going Live',
  'Use Good Lighting',
  'Use External Microphone',
  'Keep Backup Internet Ready',
  'Keep Device Charging',
  'Start Streaming 5–10 Minutes Early',
]

export const GUIDE_WARNINGS = [
  {
    title: 'Staff only',
    body: 'This guide is for Admin, Teacher, and staff. Parents must never access setup instructions or stream URLs.',
  },
  {
    title: 'Secure URLs',
    body: 'Never share raw stream URLs publicly. Parents receive a secure playback feed only after you go live.',
  },
]

export const EQUIPMENT_ICONS = [Smartphone, Wifi, Mic, Camera, Laptop] as const
