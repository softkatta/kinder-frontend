import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Radio, Plus, Play, Pause, Square, ChevronUp, ChevronDown, Eye, Pencil, Trash2,
  Video, BookOpen, Volume2, VolumeX, Calendar, Copy, Share2, ExternalLink,
  LayoutGrid, Monitor, Smartphone, Users, Signal, Link2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AdminPageHeader, AdminPageShell, AdminBadge, AdminBtn, AdminModal,
} from '@/components/admin/AdminUi'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormStack } from '@/components/ui/Form'
import { LiveStreamPlayer } from '@/components/live/LiveStreamPlayer'
import { BuiltinCameraStudio } from '@/components/live/BuiltinCameraStudio'
import { AdminLiveCameraPanel } from '@/components/live/AdminLiveCameraPanel'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { FormGrid } from '@/components/ui/Form'
import { liveStreamApi } from '@/api/services'
import { useLiveStreamRealtime } from '@/hooks/useLiveStreamRealtime'
import type { LivePlayback, LiveStreamCameraStaff, LiveStreamStaff, StreamSource } from '@/types/liveStream'
import {
  LAYOUT_PIP,
  STREAM_SOURCES,
  isPipLayout,
  layoutPaneCount,
  normalizeLayoutMode,
} from '@/types/liveStream'

interface CmsEventOption {
  id: number
  title: string
  summary?: string | null
  image?: string | null
  meta?: { date?: string; time?: string; location?: string } | null
  status: string
  live_stream_id?: number | null
}

const emptyCamera = {
  name: '',
  location: '',
  stream_type: 'builtin_camera',
  stream_url: 'builtin://camera',
  is_enabled: true,
}

function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return ''
  // Staff API returns naive local time for datetime-local inputs
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatScheduleDisplay(value: string | null | undefined): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    const [date, time] = value.split('T')
    const [y, m, d] = date.split('-')
    return `${d}/${m}/${y}, ${time}`
  }
  return new Date(value).toLocaleString()
}

const emptyEditForm = {
  title: '',
  description: '',
  banner: '',
  event_date: '',
  scheduled_start_at: '',
  scheduled_end_at: '',
  stream_source: 'youtube' as StreamSource,
  enable_countdown: true,
  enable_reminder: true,
  notify_before_minutes: '60,30',
  visibility: 'public' as 'public' | 'parents_only',
  auto_start: true,
  auto_end: true,
  publish_status: 'draft' as 'draft' | 'scheduled',
}

export default function AdminLiveStreamsPage() {
  const location = useLocation()
  const isTeacher = location.pathname.startsWith('/teacher')
  const guideBase = isTeacher ? '/teacher/live/setup-guide' : '/admin/live-streams/setup-guide'
  const portalLabel = isTeacher ? 'Teacher' : 'Admin'
  const portalHome = isTeacher ? '/teacher' : '/admin'

  const [streams, setStreams] = useState<LiveStreamStaff[]>([])
  const [cmsEvents, setCmsEvents] = useState<CmsEventOption[]>([])
  const [cmsEventsLoading, setCmsEventsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGuideCta, setShowGuideCta] = useState(false)
  const [guideCtaStreamId, setGuideCtaStreamId] = useState<number | null>(null)
  const [cameraModal, setCameraModal] = useState<{ mode: 'add' | 'edit'; camera?: LiveStreamCameraStaff } | null>(null)
  const [cameraForm, setCameraForm] = useState(emptyCamera)
  const [previewPlayback, setPreviewPlayback] = useState<LivePlayback | null>(null)
  const [previewCameraId, setPreviewCameraId] = useState<number | null>(null)
  const [switchingId, setSwitchingId] = useState<number | null>(null)
  const [mutingId, setMutingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [selectedStreamIds, setSelectedStreamIds] = useState<number[]>([])
  const [layoutDraftIds, setLayoutDraftIds] = useState<number[]>([])

  const selected = streams.find((s) => s.id === selectedId) ?? null
  const linkedStreams = streams.filter((s) => s.cms_item_id)
  const onAirStream = streams.find((s) => ['live', 'paused'].includes(s.status)) ?? null
  const isBroadcasting = selected ? ['live', 'paused'].includes(selected.status) : false
  const enabledCameraCount = selected?.cameras.filter((c) => c.is_enabled).length ?? 0
  const layoutMode = normalizeLayoutMode(selected?.layout_mode)
  const pipActive = isPipLayout(layoutMode)
  const maxScreens = Math.max(1, Math.min(4, enabledCameraCount || 1))
  const paneSlots = pipActive ? Math.min(2, maxScreens) : Math.min(layoutPaneCount(layoutMode), maxScreens)
  const canStartLive = enabledCameraCount > 0
  const canSelectPip = enabledCameraCount >= 2 && maxScreens >= 2
  const previewCamera = previewCameraId
    ? selected?.cameras.find((c) => c.id === previewCameraId) ?? null
    : null
  const trackedStreamId = linkedStreams.some((s) => s.id === selectedId) ? selectedId : null
  const selectedIdRef = useRef<number | null>(null)
  const loadSeqRef = useRef(0)

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    if (!selected) {
      setLayoutDraftIds([])
      return
    }
    const ids = selected.active_camera_ids?.length
      ? selected.active_camera_ids
      : (selected.active_camera_id ? [selected.active_camera_id] : [])
    setLayoutDraftIds(ids.slice(0, layoutPaneCount(selected.layout_mode)))
  }, [selected?.id, selected?.layout_mode, selected?.active_camera_id, selected?.active_camera_ids?.join(',')])

  useEffect(() => {
    if (!selectedId) return
    if (!streams.some((s) => s.id === selectedId && s.cms_item_id)) {
      setSelectedId(linkedStreams[0]?.id ?? null)
    }
  }, [streams, selectedId, linkedStreams])

  const patchStream = useCallback((updated: LiveStreamStaff) => {
    setStreams((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }, [])

  const load = useCallback(async (opts?: { silent?: boolean; selectId?: number }) => {
    const seq = ++loadSeqRef.current
    if (!opts?.silent) setLoading(true)
    try {
      const res = await liveStreamApi.list()
      if (seq !== loadSeqRef.current) return

      const data = (res.data.data ?? []) as LiveStreamStaff[]
      setStreams(data)

      const linked = data.filter((s) => s.cms_item_id)
      const preferredId = opts?.selectId ?? selectedIdRef.current
      const pick = linked.find((s) => s.id === preferredId) ?? linked[0] ?? null
      setSelectedId(pick?.id ?? null)
    } catch {
      if (seq === loadSeqRef.current) toast.error('Failed to load live streams')
    } finally {
      if (seq === loadSeqRef.current && !opts?.silent) setLoading(false)
    }
  }, [])

  const loadCmsEvents = useCallback(async () => {
    setCmsEventsLoading(true)
    try {
      const res = await liveStreamApi.cmsEvents()
      setCmsEvents((res.data.data ?? []) as CmsEventOption[])
    } catch {
      setCmsEvents([])
      toast.error('Failed to load CMS events')
    } finally {
      setCmsEventsLoading(false)
    }
  }, [])

  useEffect(() => { load(); loadCmsEvents() }, [load, loadCmsEvents])

  useLiveStreamRealtime(trackedStreamId, {
    onUpdate: async (_payload, staff) => {
      if (!trackedStreamId || selectedIdRef.current !== trackedStreamId) return
      if (staff) {
        patchStream(staff)
        return
      }
      try {
        const res = await liveStreamApi.get(trackedStreamId)
        if (selectedIdRef.current !== trackedStreamId) return
        patchStream(res.data.data as LiveStreamStaff)
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          selectedIdRef.current = null
          setSelectedId(null)
          await load({ silent: true })
          await loadCmsEvents()
        }
      }
    },
    onNotFound: () => {
      selectedIdRef.current = null
      setSelectedId(null)
      void load({ silent: true })
      void loadCmsEvents()
    },
  })

  const runWithPatch = async (
    fn: () => Promise<{ data: { data: LiveStreamStaff } }>,
    msg?: string,
  ) => {
    setBusy(true)
    try {
      const res = await fn()
      patchStream(res.data.data)
      if (msg) toast.success(msg, { duration: 1200 })
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const bag = data?.errors
      const message = (bag && Object.values(bag).flat()[0]) || data?.message || 'Action failed'
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  const switchCamera = async (camera: LiveStreamCameraStaff) => {
    if (!selected || camera.is_primary || !camera.is_enabled || switchingId) return

    setSwitchingId(camera.id)
    setStreams((prev) => prev.map((s) => {
      if (s.id !== selected.id) return s
      const layout = layoutPaneCount(s.layout_mode)
      let ids = [...(s.active_camera_ids ?? (s.active_camera_id ? [s.active_camera_id] : []))]
      ids = ids.filter((id) => id !== camera.id)
      ids.unshift(camera.id)
      ids = ids.slice(0, layout)
      const cameras = s.cameras.map((c) => ({
        ...c,
        is_active: ids.includes(c.id),
        is_primary: c.id === camera.id,
      }))
      const active = cameras.find((c) => c.id === camera.id) ?? null
      return {
        ...s,
        active_camera_id: camera.id,
        active_camera_ids: ids,
        cameras,
        active_camera: active,
      }
    }))

    try {
      const res = await liveStreamApi.setActiveCamera(selected.id, camera.id)
      patchStream(res.data.data as LiveStreamStaff)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Switch failed')
      await load({ silent: true })
    } finally {
      setSwitchingId(null)
    }
  }

  const setLayoutMode = async (mode: number) => {
    if (!selected || busy) return
    const next = mode === LAYOUT_PIP
      ? LAYOUT_PIP
      : Math.max(1, Math.min(4, mode))
    if (next === layoutMode) return
    if (next === LAYOUT_PIP && !canSelectPip) {
      toast.error('PiP needs at least 2 enabled cameras')
      return
    }
    await runWithPatch(
      () => liveStreamApi.setLayout(selected.id, next) as Promise<{ data: { data: LiveStreamStaff } }>,
      next === LAYOUT_PIP ? 'Layout: PiP' : `Layout: ${next}-up (parents see this)`,
    )
  }

  const toggleLayoutDraft = (cameraId: number) => {
    setLayoutDraftIds((prev) => {
      if (prev.includes(cameraId)) {
        if (prev.length <= 1) return prev
        return prev.filter((id) => id !== cameraId)
      }
      if (prev.length >= paneSlots) {
        toast.error(pipActive
          ? 'PiP uses at most 2 cameras (main + mini)'
          : `Maximum ${paneSlots} cameras can be activated`)
        return prev
      }
      return [...prev, cameraId]
    })
  }

  const applyLayoutCameras = async () => {
    if (!selected || busy) return
    const ids = layoutDraftIds.slice(0, paneSlots)
    if (ids.length === 0) {
      toast.error('Select at least one camera')
      return
    }
    await runWithPatch(
      () => liveStreamApi.setActiveCameras(selected.id, ids) as Promise<{ data: { data: LiveStreamStaff } }>,
      ids.length > 1 ? `Activated ${ids.length} cameras` : 'Camera activated',
    )
  }

  const goLiveWithCamera = async (camera: LiveStreamCameraStaff) => {
    if (!selected || !camera.is_enabled || switchingId) return
    if (camera.is_mobile_publisher && !['ready', 'connected', 'live'].includes(camera.connection_status ?? '')) {
      toast.error('Wait until the teacher\'s camera shows Ready before going live.')
      return
    }
    setSwitchingId(camera.id)
    try {
      if (!camera.is_primary) {
        const res = await liveStreamApi.setActiveCamera(selected.id, camera.id)
        patchStream(res.data.data as LiveStreamStaff)
      }
      if (!isBroadcasting) {
        const startRes = await liveStreamApi.start(selected.id)
        patchStream(startRes.data.data as LiveStreamStaff)
        toast.success('Live started with selected camera')
      } else if (!camera.is_primary) {
        toast.success('Camera switched — parents update automatically')
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const bag = data?.errors
      const message = (bag && Object.values(bag).flat()[0]) || data?.message || 'Could not go live'
      toast.error(message)
      await load({ silent: true })
    } finally {
      setSwitchingId(null)
    }
  }

  const disconnectMobileCamera = async (camera: LiveStreamCameraStaff) => {
    if (!selected || busy) return
    if (!confirm(`Disconnect ${camera.publisher_name || camera.name}'s camera?`)) return
    setBusy(true)
    try {
      const res = await liveStreamApi.disconnectCamera(selected.id, camera.id)
      patchStream(res.data.data as LiveStreamStaff)
      toast.success('Camera disconnected')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Disconnect failed')
    } finally {
      setBusy(false)
    }
  }

  const muteCameraAudio = async (camera: LiveStreamCameraStaff, muted: boolean) => {
    if (!selected || mutingId) return
    setMutingId(camera.id)
    const restoredVolume = !muted && (camera.audio_volume ?? 0) <= 0 ? 100 : (camera.audio_volume ?? 100)
    // Optimistic UI so the Volume icon flips immediately.
    patchStream({
      ...selected,
      cameras: selected.cameras.map((c) => (
        c.id === camera.id
          ? {
              ...c,
              audio_muted: muted,
              audio_volume: muted ? c.audio_volume : restoredVolume,
            }
          : c
      )),
    })
    if (previewCameraId === camera.id) {
      setPreviewPlayback((prev) => (
        prev
          ? {
              ...prev,
              audio_muted: muted,
              audio_volume: muted ? prev.audio_volume : restoredVolume,
            }
          : prev
      ))
    }
    try {
      const res = await liveStreamApi.muteCamera(selected.id, camera.id, muted)
      patchStream(res.data.data as LiveStreamStaff)
      toast.success(muted ? 'Camera muted for parents' : 'Camera unmuted for parents')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Could not update audio')
      await load({ silent: true })
    } finally {
      setMutingId(null)
    }
  }

  const volumeTimersRef = useRef<Record<number, number>>({})

  useEffect(() => () => {
    Object.values(volumeTimersRef.current).forEach((id) => window.clearTimeout(id))
    volumeTimersRef.current = {}
  }, [selected?.id])

  const setCameraVolume = (camera: LiveStreamCameraStaff, volume: number) => {
    if (!selected) return
    const streamId = selected.id
    const next = Math.max(0, Math.min(100, Math.round(volume)))
    patchStream({
      ...selected,
      cameras: selected.cameras.map((c) => (
        c.id === camera.id
          ? { ...c, audio_volume: next, audio_muted: next === 0 }
          : c
      )),
    })
    if (previewCameraId === camera.id) {
      setPreviewPlayback((prev) => (
        prev ? { ...prev, audio_volume: next, audio_muted: next === 0 } : prev
      ))
    }
    const existing = volumeTimersRef.current[camera.id]
    if (existing) window.clearTimeout(existing)
    volumeTimersRef.current[camera.id] = window.setTimeout(() => {
      void (async () => {
        if (selectedIdRef.current !== streamId) return
        try {
          const res = await liveStreamApi.setCameraVolume(streamId, camera.id, next)
          if (selectedIdRef.current !== streamId) return
          patchStream(res.data.data as LiveStreamStaff)
        } catch (err: unknown) {
          if (selectedIdRef.current !== streamId) return
          const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          toast.error(message || 'Could not update volume')
          await load({ silent: true })
        }
      })()
    }, 280)
  }

  const toggleMasterAudio = async () => {
    if (!selected || busy) return
    const next = !selected.audio_enabled
    await runWithPatch(
      () => liveStreamApi.update(selected.id, { audio_enabled: next }) as Promise<{ data: { data: LiveStreamStaff } }>,
      next ? 'Parent sound enabled' : 'Parent sound muted',
    )
  }

  const saveEdit = async () => {
    if (!selected) return
    if (!editForm.title.trim()) return toast.error('Title required')

    const streamId = selected.id
    const wasScheduled = selected.status === 'scheduled'
    const isLive = ['live', 'paused'].includes(selected.status)
    const wantScheduled = editForm.publish_status === 'scheduled'
    setBusy(true)
    try {
      let updated: LiveStreamStaff
      let successMsg = 'Stream and CMS event updated'

      if (isLive) {
        const res = await liveStreamApi.update(streamId, {
          title: editForm.title.trim(),
          description: editForm.description || null,
          banner: editForm.banner || null,
        })
        updated = res.data.data as LiveStreamStaff
      } else if (wantScheduled) {
        if (!editForm.scheduled_start_at) {
          toast.error('Start Date & Time is required to schedule')
          setBusy(false)
          return
        }
        const res = await liveStreamApi.schedule(streamId, buildSchedulePayload(selected))
        updated = res.data.data as LiveStreamStaff
        successMsg = wasScheduled ? 'Schedule updated' : 'Live event scheduled'
      } else {
        const mins = editForm.notify_before_minutes
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !Number.isNaN(n))
        const res = await liveStreamApi.update(streamId, {
          title: editForm.title.trim(),
          description: editForm.description || null,
          banner: editForm.banner || null,
          event_date: editForm.event_date || null,
          scheduled_start_at: editForm.scheduled_start_at || null,
          scheduled_end_at: editForm.scheduled_end_at || null,
          stream_source: editForm.stream_source,
          enable_countdown: editForm.enable_countdown,
          enable_reminder: editForm.enable_reminder,
          notify_before_minutes: mins.length ? mins : [60, 30],
          visibility: editForm.visibility,
          auto_start: editForm.auto_start,
          auto_end: editForm.auto_end,
          status: 'draft',
        })
        updated = res.data.data as LiveStreamStaff
        successMsg = wasScheduled ? 'Moved back to draft' : 'Stream updated'
      }

      patchStream(updated)
      await load({ silent: true, selectId: streamId })
      await loadCmsEvents()
      setEditOpen(false)
      toast.success(successMsg)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  const cancelEvent = async () => {
    if (!selected || !confirm('Cancel this scheduled event?')) return
    await runWithPatch(() => liveStreamApi.cancel(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Cancelled')
  }

  const selectCmsEvent = async (cmsItemId: number) => {
    if (!cmsItemId || busy) return

    setBusy(true)
    try {
      const res = await liveStreamApi.linkFromCms(cmsItemId)
      const linked = res.data.data as LiveStreamStaff
      setSelectedId(linked.id)
      selectedIdRef.current = linked.id
      await load({ silent: true, selectId: linked.id })
      await loadCmsEvents()
      if (res.status === 201) {
        setShowGuideCta(true)
        setGuideCtaStreamId(linked.id)
      }
      toast.success('Event linked — CMS data loaded into stream')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Could not link CMS event')
    } finally {
      setBusy(false)
    }
  }

  const deleteStream = async () => {
    if (!selected || busy) return
    if (['live', 'paused'].includes(selected.status)) {
      if (!confirm(`"${selected.title}" is currently live.\n\nEnd the broadcast and permanently delete this stream, all cameras, and the linked CMS event?`)) {
        return
      }
    } else if (!confirm(`Permanently delete "${selected.title}"?\n\nThis removes the live stream, all cameras, and the linked CMS event from the website. This cannot be undone.`)) {
      return
    }

    const removedId = selected.id
    setBusy(true)
    // Stop realtime polling before delete so GET /live-streams/{id} does not 404
    selectedIdRef.current = null
    setSelectedId(null)
    setPreviewPlayback(null)
    setPreviewCameraId(null)
    setStreams((prev) => prev.filter((s) => s.id !== removedId))
    try {
      await liveStreamApi.remove(removedId)
      if (guideCtaStreamId === removedId) {
        setShowGuideCta(false)
        setGuideCtaStreamId(null)
      }
      await load({ silent: true })
      await loadCmsEvents()
      toast.success('Permanently deleted')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || 'Delete failed')
      await load({ silent: true })
    } finally {
      setBusy(false)
    }
  }

  const toggleStreamSelection = (id: number, checked: boolean) => {
    setSelectedStreamIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
  }

  const bulkDeleteStreams = async () => {
    if (!selectedStreamIds.length || busy) return
    const liveCount = linkedStreams.filter(
      (s) => selectedStreamIds.includes(s.id) && ['live', 'paused'].includes(s.status),
    ).length
    const msg = liveCount > 0
      ? `${liveCount} selected event(s) are live.\n\nEnd broadcasts and permanently delete ${selectedStreamIds.length} event(s)?`
      : `Permanently delete ${selectedStreamIds.length} event(s)?\n\nThis removes live streams, cameras, and linked CMS events.`
    if (!confirm(msg)) return

    const ids = [...selectedStreamIds]
    setBusy(true)
    // Stop realtime polling before deletes
    if (selectedId && ids.includes(selectedId)) {
      selectedIdRef.current = null
      setSelectedId(null)
    }
    setSelectedStreamIds([])
    setPreviewPlayback(null)
    setPreviewCameraId(null)
    setStreams((prev) => prev.filter((s) => !ids.includes(s.id)))
    try {
      const results = await Promise.allSettled(ids.map((id) => liveStreamApi.remove(id)))
      const failed = results.filter((r) => r.status === 'rejected').length
      const ok = ids.length - failed
      if (ok > 0) toast.success(`Deleted ${ok} event(s)`)
      if (failed > 0) toast.error(`${failed} delete(s) failed`)
      await load({ silent: true })
      await loadCmsEvents()
    } finally {
      setBusy(false)
    }
  }

  const openEdit = () => {
    if (!selected) return
    setEditForm({
      title: selected.title,
      description: selected.description || '',
      banner: selected.banner || '',
      event_date: selected.event_date || '',
      scheduled_start_at: toDatetimeLocal(selected.scheduled_start_at),
      scheduled_end_at: toDatetimeLocal(selected.scheduled_end_at),
      stream_source: selected.stream_source || 'youtube',
      enable_countdown: selected.enable_countdown,
      enable_reminder: selected.enable_reminder,
      notify_before_minutes: (selected.notify_before_minutes ?? [60, 30]).join(', '),
      visibility: selected.visibility,
      auto_start: selected.auto_start,
      auto_end: selected.auto_end,
      publish_status: selected.status === 'scheduled' ? 'scheduled' : 'draft',
    })
    setEditOpen(true)
  }

  const buildSchedulePayload = (stream: LiveStreamStaff, form = editForm) => {
    const mins = form.notify_before_minutes
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n))
    return {
      title: form.title.trim() || stream.title,
      description: form.description || stream.description || null,
      banner: form.banner || stream.banner || null,
      event_date: form.event_date || stream.event_date || null,
      scheduled_start_at: form.scheduled_start_at || toDatetimeLocal(stream.scheduled_start_at),
      scheduled_end_at: form.scheduled_end_at || toDatetimeLocal(stream.scheduled_end_at) || null,
      stream_source: form.stream_source || stream.stream_source,
      enable_countdown: form.enable_countdown,
      enable_reminder: form.enable_reminder,
      notify_before_minutes: mins.length ? mins : (stream.notify_before_minutes ?? [60, 30]),
      visibility: form.visibility || stream.visibility,
      auto_start: form.auto_start,
      auto_end: form.auto_end,
    }
  }

  const scheduleEvent = async () => {
    if (!selected) return
    const startAt = toDatetimeLocal(selected.scheduled_start_at)
    if (!startAt) {
      openEdit()
      toast.error('Set Start Date & Time, choose Status = Scheduled, then Save')
      return
    }
    await runWithPatch(
      () => liveStreamApi.schedule(selected.id, buildSchedulePayload(selected, {
        ...editForm,
        title: selected.title,
        description: selected.description || '',
        banner: selected.banner || '',
        event_date: selected.event_date || '',
        scheduled_start_at: startAt,
        scheduled_end_at: toDatetimeLocal(selected.scheduled_end_at),
        stream_source: selected.stream_source || 'youtube',
        enable_countdown: selected.enable_countdown,
        enable_reminder: selected.enable_reminder,
        notify_before_minutes: (selected.notify_before_minutes ?? [60, 30]).join(', '),
        visibility: selected.visibility,
        auto_start: selected.auto_start,
        auto_end: selected.auto_end,
        publish_status: 'scheduled',
      })) as Promise<{ data: { data: LiveStreamStaff } }>,
      'Event scheduled — parents will see the countdown',
    )
  }

  const saveCamera = async () => {
    if (!selected || !cameraForm.name) {
      return toast.error('Camera name is required')
    }
    const isBuiltin = cameraForm.stream_type === 'builtin_camera'
    if (!isBuiltin && !cameraForm.stream_url) {
      return toast.error('Camera name and URL required')
    }
    const payload = {
      ...cameraForm,
      stream_url: isBuiltin ? 'builtin://camera' : cameraForm.stream_url,
    }
    if (cameraModal?.mode === 'edit' && cameraModal.camera) {
      await runWithPatch(
        () => liveStreamApi.updateCamera(selected.id, cameraModal.camera!.id, payload) as Promise<{ data: { data: LiveStreamStaff } }>,
        'Camera updated',
      )
    } else {
      await runWithPatch(
        () => liveStreamApi.addCamera(selected.id, payload) as Promise<{ data: { data: LiveStreamStaff } }>,
        'Camera added',
      )
    }
    setCameraModal(null)
    setCameraForm(emptyCamera)
  }

  const moveCamera = async (camera: LiveStreamCameraStaff, dir: -1 | 1) => {
    if (!selected) return
    const sorted = [...selected.cameras].sort((a, b) => a.display_order - b.display_order)
    const idx = sorted.findIndex((c) => c.id === camera.id)
    const swap = idx + dir
    if (swap < 0 || swap >= sorted.length) return
    ;[sorted[idx], sorted[swap]] = [sorted[swap], sorted[idx]]
    await runWithPatch(
      () => liveStreamApi.reorderCameras(selected.id, sorted.map((c) => c.id)) as Promise<{ data: { data: LiveStreamStaff } }>,
      'Order updated',
    )
  }

  const preview = async (camera: LiveStreamCameraStaff) => {
    if (!selected) return
    if (camera.stream_type === 'builtin_camera') {
      if (!isBroadcasting) {
        toast('Start the live event, then use the built-in camera studio to broadcast.', { icon: '📹' })
        return
      }
    }
    try {
      const res = await liveStreamApi.previewCamera(selected.id, camera.id)
      const payload = res.data.data as { camera_id?: number; preview: LivePlayback }
      setPreviewCameraId(payload.camera_id ?? camera.id)
      setPreviewPlayback({
        ...payload.preview,
        audio_muted: Boolean(camera.audio_muted || payload.preview.audio_muted),
        audio_volume: Math.max(0, Math.min(100, camera.audio_volume ?? payload.preview.audio_volume ?? 100)),
      })
    } catch {
      toast.error('Preview failed')
    }
  }

  const statusTone = (status: string) => {
    if (status === 'live') return 'success' as const
    if (status === 'paused') return 'warning' as const
    if (status === 'stopped' || status === 'cancelled') return 'danger' as const
    if (status === 'scheduled') return 'info' as const
    return 'neutral' as const
  }

  return (
    <AdminPageShell>
      <div className="admin-live-studio">
      <AdminPageHeader
        title="Live Streams"
        subtitle="Broadcast control — pick a CMS event, set cameras, then go live for parents."
        breadcrumbs={[{ label: portalLabel, to: portalHome }, { label: 'Live Streams' }]}
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[220px]">
              <Select
                label="CMS Event"
                value={selected?.cms_item_id?.toString() ?? ''}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  if (id) selectCmsEvent(id)
                }}
                disabled={busy || cmsEventsLoading}
              >
                <option value="">{cmsEventsLoading ? 'Loading events…' : 'Select CMS Event…'}</option>
                {cmsEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}{ev.live_stream_id ? ' ✓' : ''}
                  </option>
                ))}
              </Select>
            </div>
            {!isTeacher && (
              <AdminBtn variant="secondary" to="/admin/cms?type=event">
                Manage CMS Events
              </AdminBtn>
            )}
          </div>
        }
      />

      {onAirStream && onAirStream.id !== selected?.id && (
        <div className="admin-live-studio__banner text-sm text-rose-900">
          <p className="font-semibold">
            “{onAirStream.title}” is live on <code className="text-xs bg-white/70 px-1 rounded">/live</code> right now.
          </p>
          <p className="mt-1 text-rose-800/90">
            Camera changes on “{selected?.title ?? 'this event'}” will not affect the public page until you end that broadcast or start this event.
          </p>
          <button
            type="button"
            className="mt-2 font-semibold text-rose-700 underline hover:text-rose-900"
            onClick={() => setSelectedId(onAirStream.id)}
          >
            Open live event →
          </button>
        </div>
      )}

      {loading && linkedStreams.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-12">Loading…</p>
      ) : (
        <div className="admin-live-studio__grid">
          <aside className="admin-live-studio__rail">
            <div className="admin-live-studio__rail-head">
              <div>
                <p className="admin-live-studio__rail-title">Events</p>
                <p className="admin-live-studio__rail-sub">{linkedStreams.length} linked event(s)</p>
              </div>
              {selectedStreamIds.length > 0 && (
                <AdminBtn variant="secondary" onClick={() => void bulkDeleteStreams()} disabled={busy}>
                  <Trash2 className="h-4 w-4" /> Delete ({selectedStreamIds.length})
                </AdminBtn>
              )}
            </div>
            <div className="admin-live-studio__event-list">
              {linkedStreams.map((s) => (
                <div
                  key={s.id}
                  className={`admin-live-studio__event ${selectedId === s.id ? 'is-selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="admin-data-table-checkbox mt-1 shrink-0"
                    checked={selectedStreamIds.includes(s.id)}
                    onChange={(e) => toggleStreamSelection(s.id, e.target.checked)}
                    aria-label={`Select ${s.title}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="admin-live-studio__event-name">{s.title}</p>
                    <div className="admin-live-studio__event-meta">
                      {['live', 'paused'].includes(s.status) && (
                        <span className="admin-live-studio__onair-pill">On /live</span>
                      )}
                      <AdminBadge tone={statusTone(s.status)}>{s.status_label}</AdminBadge>
                      <span className="text-xs text-slate-400">{(s.cameras ?? []).length} cameras</span>
                    </div>
                  </button>
                </div>
              ))}
              {linkedStreams.length === 0 && (
                <div className="admin-live-studio__empty space-y-2">
                  <p>No CMS event selected yet.</p>
                  <p className="text-xs">Choose an event from the dropdown above. Add events in CMS first if the list is empty.</p>
                </div>
              )}
            </div>
          </aside>

          {selected ? (
            (() => {
              const mobileCount = selected.cameras.filter((c) => c.is_mobile_publisher || c.publisher_user_id).length
              const parentLiveUrl = `${window.location.origin}/live`
              const copyParentLink = () => {
                void navigator.clipboard.writeText(parentLiveUrl).then(
                  () => toast.success('Parent live link copied'),
                  () => toast.error('Could not copy link'),
                )
              }
              const shareParentLink = () => {
                if (typeof navigator.share === 'function') {
                  void navigator.share({ title: selected.title, url: parentLiveUrl }).catch(() => {
                    copyParentLink()
                  })
                } else {
                  copyParentLink()
                }
              }
              return (
            <div className="als-studio">
              {showGuideCta && guideCtaStreamId === selected.id && (
                <div className="admin-live-studio__guide">
                  <div>
                    <p className="font-bold text-ink">Event created successfully!</p>
                    <p className="text-sm text-slate-600 mt-0.5">Follow the setup guide to connect cameras and go live.</p>
                  </div>
                  <Link
                    to={`${guideBase}?event=${encodeURIComponent(selected.title)}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-sky-700 transition"
                  >
                    Live Stream Setup Guide
                  </Link>
                </div>
              )}

              <div className={`als-studio__workspace ${isBroadcasting ? 'is-live' : ''}`}>
                <div className="als-studio__main">
                  {/* a. Studio top bar */}
                  <header className="als-topbar">
                    <div className="als-topbar__info min-w-0 flex-1">
                      <p className="als-topbar__kicker">
                        <Radio className="h-3.5 w-3.5" /> Broadcast Studio
                      </p>
                      <div className="als-topbar__title-row">
                        <h2 className="als-topbar__title">{selected.title}</h2>
                        <AdminBadge tone={statusTone(selected.status)}>
                          {selected.display_status === 'upcoming' ? 'Upcoming' : selected.status_label}
                        </AdminBadge>
                        {isBroadcasting && (
                          <span className="als-onair-dot">On air</span>
                        )}
                      </div>
                      <div className="als-topbar__chips">
                        {selected.scheduled_start_at && (
                          <span className="admin-live-studio__chip">
                            <Calendar className="h-3.5 w-3.5" />
                            Starts: {formatScheduleDisplay(selected.scheduled_start_at)}
                          </span>
                        )}
                        {selected.scheduled_end_at && (
                          <span className="admin-live-studio__chip">
                            Ends: {formatScheduleDisplay(selected.scheduled_end_at)}
                          </span>
                        )}
                        {(selected.status === 'draft' || selected.status === 'stopped' || selected.status === 'cancelled') && selected.scheduled_start_at && (
                          <span className="admin-live-studio__chip admin-live-studio__chip--warn">
                            Start time saved — click Schedule Event to publish countdown
                          </span>
                        )}
                        {selected.active_camera && (
                          <span className="admin-live-studio__chip">
                            Primary: <strong>{selected.active_camera.name}</strong>
                            {(selected.active_cameras?.length ?? 0) > 1 && (
                              <> · Grid: <strong>{selected.active_cameras!.length}</strong> cams</>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="als-topbar__link">
                      <div className="als-parent-link">
                        <Link2 className="h-4 w-4 shrink-0 text-sky-600" />
                        <a
                          href="/live"
                          target="_blank"
                          rel="noreferrer"
                          className="als-parent-link__url"
                        >
                          /live <ExternalLink className="h-3 w-3 inline" />
                        </a>
                        <button type="button" className="als-icon-btn" onClick={copyParentLink} title="Copy parent live link">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" className="als-icon-btn" onClick={shareParentLink} title="Share parent live link">
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </header>

                  {!canStartLive && !isBroadcasting && (
                    <p className="admin-live-studio__warn">
                      No cameras on this event yet. A teacher can connect from <strong>Join Live</strong> on their phone,
                      or you can add an external camera below.
                    </p>
                  )}

                  {/* b. Preview + Controls row */}
                  <div className="als-stage-row">
                    <div className="als-card als-preview-card">
                      <div className="als-card__head">
                        <Monitor className="h-4 w-4 text-sky-600" />
                        <span>Live Preview</span>
                      </div>
                      <div className="als-preview-body">
                        {previewPlayback ? (
                          <LiveStreamPlayer
                            playback={previewPlayback}
                            status={selected.status}
                            className="als-preview-player"
                            muted={Boolean(
                              !selected.audio_enabled
                              || previewCamera?.audio_muted
                              || previewPlayback.audio_muted,
                            )}
                          />
                        ) : (
                          <div className="als-preview-placeholder">
                            <Video className="h-10 w-10 opacity-40" />
                            <p>Select a camera to preview</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="als-card als-controls-card">
                      <div className="als-card__head">
                        <Signal className="h-4 w-4 text-sky-600" />
                        <span>Broadcast Controls</span>
                      </div>
                      <div className="als-controls-stack">
                        <AdminBtn
                          variant={selected.audio_enabled ? 'primary' : 'secondary'}
                          disabled={busy}
                          onClick={() => void toggleMasterAudio()}
                          title={selected.audio_enabled ? 'Mute all parent audio' : 'Unmute parent audio'}
                        >
                          {selected.audio_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                          {selected.audio_enabled ? 'Sound On' : 'Sound Off'}
                        </AdminBtn>
                        <AdminBtn
                          variant="secondary"
                          to={`${guideBase}?event=${encodeURIComponent(selected.title)}`}
                        >
                          <BookOpen className="h-4 w-4" /> Setup Guide
                        </AdminBtn>
                        <AdminBtn variant="secondary" onClick={openEdit}>
                          <Pencil className="h-4 w-4" /> Edit
                        </AdminBtn>
                        {selected.status === 'live' && (
                          <AdminBtn variant="secondary" disabled={busy} onClick={() => runWithPatch(() => liveStreamApi.pause(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Paused')}>
                            <Pause className="h-4 w-4" /> Pause
                          </AdminBtn>
                        )}
                        {selected.status === 'paused' && (
                          <AdminBtn variant="primary" disabled={busy} onClick={() => runWithPatch(() => liveStreamApi.resume(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Resumed')}>
                            <Play className="h-4 w-4" /> Resume
                          </AdminBtn>
                        )}
                        {!['live', 'paused'].includes(selected.status) && selected.status !== 'scheduled' && (
                          <AdminBtn
                            variant="primary"
                            disabled={busy}
                            onClick={() => void scheduleEvent()}
                            title={selected.scheduled_start_at ? 'Publish as Scheduled (public countdown)' : 'Opens editor to set start time'}
                          >
                            <Calendar className="h-4 w-4" /> Schedule
                          </AdminBtn>
                        )}
                        {['live', 'paused'].includes(selected.status) ? (
                          <AdminBtn variant="secondary" disabled={busy} onClick={() => runWithPatch(() => liveStreamApi.stop(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Ended')}>
                            <Square className="h-4 w-4" /> End Live
                          </AdminBtn>
                        ) : selected.status === 'scheduled' ? (
                          <>
                            <AdminBtn
                              variant="primary"
                              disabled={busy || !canStartLive}
                              title={!canStartLive ? 'Connect a mobile camera or add a stream camera first' : undefined}
                              onClick={() => runWithPatch(() => liveStreamApi.start(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Live started')}
                            >
                              <Radio className="h-4 w-4" /> Start Now
                            </AdminBtn>
                            <AdminBtn variant="secondary" disabled={busy} onClick={cancelEvent}>Cancel Event</AdminBtn>
                          </>
                        ) : (
                          <AdminBtn
                            variant="secondary"
                            disabled={busy || !canStartLive}
                            title={!canStartLive ? 'Connect a mobile camera or add a stream camera first' : undefined}
                            onClick={() => runWithPatch(() => liveStreamApi.start(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Live started')}
                          >
                            <Radio className="h-4 w-4" /> Start Live
                          </AdminBtn>
                        )}
                        <AdminBtn
                          variant="secondary"
                          className="!text-rose-600 hover:!bg-rose-50"
                          disabled={busy}
                          onClick={deleteStream}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </AdminBtn>
                      </div>
                    </div>
                  </div>

                  {/* c. Stats row */}
                  <div className="als-stats">
                    <div className="als-stat">
                      <div className="als-stat__icon"><Video className="h-4 w-4" /></div>
                      <div>
                        <p className="als-stat__label">Connected Cameras</p>
                        <p className="als-stat__value">{enabledCameraCount}</p>
                      </div>
                    </div>
                    <div className="als-stat">
                      <div className="als-stat__icon"><Smartphone className="h-4 w-4" /></div>
                      <div>
                        <p className="als-stat__label">Mobile devices</p>
                        <p className="als-stat__value">{mobileCount}</p>
                      </div>
                    </div>
                    <div className="als-stat">
                      <div className="als-stat__icon"><LayoutGrid className="h-4 w-4" /></div>
                      <div>
                        <p className="als-stat__label">Layout mode</p>
                        <p className="als-stat__value">{pipActive ? 'PiP' : `${layoutMode}-up`}</p>
                      </div>
                    </div>
                    <div className="als-stat">
                      <div className="als-stat__icon"><Signal className="h-4 w-4" /></div>
                      <div>
                        <p className="als-stat__label">Live status</p>
                        <p className="als-stat__value">{selected.status_label}</p>
                      </div>
                    </div>
                    <div className="als-stat">
                      <div className="als-stat__icon"><Users className="h-4 w-4" /></div>
                      <div>
                        <p className="als-stat__label">Viewers</p>
                        <p className="als-stat__value">{selected.viewer_count ?? 0}</p>
                      </div>
                    </div>
                    <div className="als-stat">
                      <div className="als-stat__icon">
                        {selected.audio_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="als-stat__label">Parent sound</p>
                        <p className="als-stat__value">{selected.audio_enabled ? 'On' : 'Off'}</p>
                      </div>
                    </div>
                  </div>

                  {/* d. Layout selector */}
                  {enabledCameraCount > 0 && (
                    <section className="als-card als-layout-section">
                      <div className="als-card__head als-card__head--row">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4 text-sky-600" />
                          <span>Layout</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {pipActive
                            ? 'Parents see main camera + mini PiP (max 2)'
                            : 'Parents see this exact layout on /live'}
                        </p>
                      </div>
                      <div className="als-layout-picker">
                        {[1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            disabled={busy}
                            onClick={() => setLayoutMode(n)}
                            className={`als-layout-card ${!pipActive && layoutMode === n ? 'is-active' : ''}`}
                          >
                            <span className={`als-layout-preview als-layout-preview--${n}`}>
                              {Array.from({ length: n }).map((_, i) => (
                                <span key={i} />
                              ))}
                            </span>
                            <span className="als-layout-card__label">{n} screen{n === 1 ? '' : 's'}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          disabled={busy || !canSelectPip}
                          title={canSelectPip ? 'Picture-in-Picture (main + mini)' : 'Enable at least 2 cameras for PiP'}
                          onClick={() => setLayoutMode(LAYOUT_PIP)}
                          className={`als-layout-card ${pipActive ? 'is-active' : ''} ${!canSelectPip ? 'is-disabled' : ''}`}
                        >
                          <span className="als-layout-preview als-layout-preview--pip">
                            <span className="als-layout-preview__pip-main" />
                            <span className="als-layout-preview__pip-mini" />
                          </span>
                          <span className="als-layout-card__label">PiP</span>
                        </button>
                      </div>
                      {paneSlots > 1 && (
                        <div className="als-layout-activate">
                          <p className="text-xs text-slate-500 mr-auto">
                            {pipActive
                              ? 'Select main + mini camera (max 2), then activate for PiP.'
                              : `Select up to ${paneSlots} cameras for this layout, then Activate — parents see the same ${layoutMode}-up grid.`}
                          </p>
                          <AdminBtn
                            variant="primary"
                            className="!px-3 !py-1.5 text-xs"
                            disabled={busy || layoutDraftIds.length === 0}
                            onClick={applyLayoutCameras}
                          >
                            Activate {Math.min(layoutDraftIds.length, paneSlots)} camera
                            {Math.min(layoutDraftIds.length, paneSlots) === 1 ? '' : 's'}
                          </AdminBtn>
                        </div>
                      )}
                    </section>
                  )}

                  {/* e. Mobile Cameras */}
                  <section className="admin-live-studio__section">
                    <div className="admin-live-studio__section-head">
                      <div>
                        <h3 className="admin-live-studio__section-title">Mobile Cameras</h3>
                        <p className="admin-live-studio__section-sub">
                          Connected teacher & staff phone cameras — preview, go live, or switch instantly
                        </p>
                      </div>
                    </div>
                    <AdminLiveCameraPanel
                      stream={selected}
                      busy={busy}
                      switchingId={switchingId}
                      isBroadcasting={isBroadcasting}
                      layoutMode={paneSlots}
                      layoutDraftIds={layoutDraftIds}
                      onToggleInclude={toggleLayoutDraft}
                      onSwitch={isBroadcasting ? switchCamera : goLiveWithCamera}
                      onPreview={preview}
                      onDisconnect={disconnectMobileCamera}
                      onMute={muteCameraAudio}
                      onVolume={setCameraVolume}
                    />
                  </section>

                  {/* f. Cameras grid */}
                  <section className="admin-live-studio__section">
                    <div className="admin-live-studio__section-head">
                      <div>
                        <h3 className="admin-live-studio__section-title">Cameras</h3>
                        <p className="admin-live-studio__section-sub">
                          External streams and admin browser cameras
                        </p>
                      </div>
                      <AdminBtn
                        variant="secondary"
                        onClick={() => {
                          setCameraForm(emptyCamera)
                          setCameraModal({ mode: 'add' })
                        }}
                      >
                        <Plus className="h-4 w-4" /> Add Camera
                      </AdminBtn>
                    </div>
                    <div className="als-camera-grid">
                      {[...selected.cameras].sort((a, b) => a.display_order - b.display_order).map((camera, i, arr) => (
                        <div
                          key={camera.id}
                          className={`als-camera-card ${camera.is_active ? 'is-active' : ''}`}
                        >
                          <div className="als-camera-card__top">
                            <div className="admin-live-studio__reorder">
                              <button type="button" disabled={i === 0 || busy} onClick={() => moveCamera(camera, -1)} aria-label="Move up">
                                <ChevronUp className="h-4 w-4" />
                              </button>
                              <button type="button" disabled={i === arr.length - 1 || busy} onClick={() => moveCamera(camera, 1)} aria-label="Move down">
                                <ChevronDown className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="admin-live-studio__camera-icon">
                              <Video className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-ink text-sm truncate">{camera.name}</p>
                              <p className="text-xs text-slate-500 truncate">{camera.location || '—'} · {camera.stream_type === 'builtin_camera' ? 'BUILT-IN' : camera.stream_type.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="als-camera-card__badges">
                            {!camera.is_enabled && <AdminBadge tone="neutral">Disabled</AdminBadge>}
                            {camera.is_primary && isBroadcasting && <AdminBadge tone="success">Primary</AdminBadge>}
                            {camera.is_active && !camera.is_primary && isBroadcasting && <AdminBadge tone="warning">In Grid</AdminBadge>}
                            {camera.is_active && !isBroadcasting && (
                              <AdminBadge tone={camera.is_primary ? 'neutral' : 'warning'}>
                                {camera.is_primary ? 'Selected' : 'In layout'}
                              </AdminBadge>
                            )}
                            {paneSlots > 1 && camera.is_enabled && (
                              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                  checked={layoutDraftIds.includes(camera.id)}
                                  disabled={busy}
                                  onChange={() => toggleLayoutDraft(camera.id)}
                                />
                                Include
                              </label>
                            )}
                          </div>
                          <div className="als-camera-card__actions">
                            <AdminBtn
                              variant={camera.is_primary ? 'primary' : 'secondary'}
                              className="!px-2.5 !py-1.5 text-xs"
                              disabled={!camera.is_enabled || camera.is_primary || switchingId === camera.id}
                              onClick={() => switchCamera(camera)}
                            >
                              {switchingId === camera.id
                                ? '…'
                                : camera.is_primary
                                  ? (isBroadcasting ? 'Primary' : 'Selected')
                                  : (isBroadcasting ? 'Make primary' : 'Select')}
                            </AdminBtn>
                            <AdminBtn variant="secondary" className="!px-2 !py-1.5" onClick={() => preview(camera)} title="Preview">
                              <Eye className="h-3.5 w-3.5" />
                            </AdminBtn>
                            <AdminBtn
                              variant={camera.audio_muted ? 'secondary' : 'primary'}
                              className="!px-2 !py-1.5"
                              disabled={mutingId === camera.id || !camera.is_enabled}
                              title={camera.audio_muted ? 'या कॅमेऱ्याचा आवाज चालू करा' : 'या कॅमेऱ्याचा आवाज बंद करा'}
                              onClick={() => muteCameraAudio(camera, !camera.audio_muted)}
                            >
                              {camera.audio_muted ? (
                                <VolumeX className="h-3.5 w-3.5" />
                              ) : (
                                <Volume2 className="h-3.5 w-3.5" />
                              )}
                            </AdminBtn>
                            <label className="als-camera-volume" title="Parent volume for this camera">
                              <span>{Math.max(0, Math.min(100, camera.audio_volume ?? 100))}%</span>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                disabled={!camera.is_enabled || mutingId === camera.id}
                                value={camera.audio_muted ? 0 : Math.max(0, Math.min(100, camera.audio_volume ?? 100))}
                                onChange={(e) => setCameraVolume(camera, Number(e.target.value))}
                              />
                            </label>
                            <AdminBtn
                              variant="secondary"
                              className="!px-2 !py-1.5"
                              onClick={() => {
                                setCameraForm({
                                  name: camera.name,
                                  location: camera.location || '',
                                  stream_type: camera.stream_type,
                                  stream_url: camera.stream_url,
                                  is_enabled: camera.is_enabled,
                                })
                                setCameraModal({ mode: 'edit', camera })
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </AdminBtn>
                            <AdminBtn
                              variant="secondary"
                              className="!px-2 !py-1.5 text-rose-600"
                              disabled={busy}
                              onClick={() => {
                                if (!confirm(`Remove ${camera.name}?`)) return
                                runWithPatch(() => liveStreamApi.removeCamera(selected.id, camera.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Camera removed')
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </AdminBtn>
                          </div>
                          {camera.stream_type === 'builtin_camera' && !camera.publisher_user_id && (
                            <div className="als-camera-card__studio">
                              <BuiltinCameraStudio
                                streamId={selected.id}
                                cameraId={camera.id}
                                cameraName={camera.name}
                                isActive={Boolean(camera.is_primary || camera.is_active)}
                                isBroadcasting={isBroadcasting}
                                streamPaused={selected.status === 'paused'}
                                remoteAudioMuted={Boolean(camera.audio_muted)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {selected.cameras.length === 0 && (
                        <p className="admin-live-studio__empty als-camera-grid__empty">
                          Add cameras — use Built-In Camera for browser webcam/mobile, or paste stream URLs.
                        </p>
                      )}
                    </div>
                  </section>
                </div>

                {/* Optional right quick panel */}
                <aside className="als-quick-panel">
                  <div className="als-quick-panel__inner">
                    <p className="als-quick-panel__title">Quick status</p>
                    <div className="als-quick-panel__status">
                      <AdminBadge tone={statusTone(selected.status)}>
                        {selected.display_status === 'upcoming' ? 'Upcoming' : selected.status_label}
                      </AdminBadge>
                      <p className="text-sm text-slate-600 mt-2">
                        {enabledCameraCount} camera{enabledCameraCount === 1 ? '' : 's'} · {pipActive ? 'PiP' : `${layoutMode}-up`} layout
                      </p>
                      {selected.active_camera && (
                        <p className="text-xs text-slate-500 mt-1">
                          Primary: {selected.active_camera.name}
                        </p>
                      )}
                    </div>
                    <div className="als-quick-panel__actions">
                      <AdminBtn
                        variant={selected.audio_enabled ? 'primary' : 'secondary'}
                        disabled={busy}
                        onClick={() => void toggleMasterAudio()}
                      >
                        {selected.audio_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        {selected.audio_enabled ? 'Sound On' : 'Sound Off'}
                      </AdminBtn>
                      {selected.status === 'live' && (
                        <AdminBtn variant="secondary" disabled={busy} onClick={() => runWithPatch(() => liveStreamApi.pause(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Paused')}>
                          <Pause className="h-4 w-4" /> Pause
                        </AdminBtn>
                      )}
                      {selected.status === 'paused' && (
                        <AdminBtn variant="primary" disabled={busy} onClick={() => runWithPatch(() => liveStreamApi.resume(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Resumed')}>
                          <Play className="h-4 w-4" /> Resume
                        </AdminBtn>
                      )}
                      {['live', 'paused'].includes(selected.status) ? (
                        <AdminBtn variant="secondary" disabled={busy} onClick={() => runWithPatch(() => liveStreamApi.stop(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Ended')}>
                          <Square className="h-4 w-4" /> End Live
                        </AdminBtn>
                      ) : selected.status === 'scheduled' ? (
                        <AdminBtn
                          variant="primary"
                          disabled={busy || !canStartLive}
                          title={!canStartLive ? 'Connect a mobile camera or add a stream camera first' : undefined}
                          onClick={() => runWithPatch(() => liveStreamApi.start(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Live started')}
                        >
                          <Radio className="h-4 w-4" /> Start Now
                        </AdminBtn>
                      ) : (
                        <AdminBtn
                          variant="primary"
                          disabled={busy || !canStartLive}
                          title={!canStartLive ? 'Connect a mobile camera or add a stream camera first' : undefined}
                          onClick={() => runWithPatch(() => liveStreamApi.start(selected.id) as Promise<{ data: { data: LiveStreamStaff } }>, 'Live started')}
                        >
                          <Radio className="h-4 w-4" /> Start Live
                        </AdminBtn>
                      )}
                      <AdminBtn variant="secondary" onClick={openEdit}>
                        <Pencil className="h-4 w-4" /> Edit
                      </AdminBtn>
                      <button type="button" className="als-quick-link" onClick={copyParentLink}>
                        <Copy className="h-3.5 w-3.5" /> Copy /live link
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
              )
            })()
          ) : (
            <section className="admin-live-studio__section als-empty-select">
              <div className="admin-live-studio__section-head">
                <div>
                  <h3 className="admin-live-studio__section-title">Select a CMS event</h3>
                  <p className="admin-live-studio__section-sub">
                    Pick a website event from the dropdown to set up live streaming.
                  </p>
                </div>
              </div>
              <div className="als-empty-select__body">
                <div className="als-empty-select__icon">
                  <Radio className="h-7 w-7" />
                </div>
                <p className="admin-live-studio__empty !py-0">
                  Events are managed in CMS → Events. Select one from the dropdown above to begin.
                </p>
              </div>
            </section>
          )}
        </div>
      )}
      </div>

      <AdminModal
        open={!!cameraModal}
        onClose={() => setCameraModal(null)}
        title={cameraModal?.mode === 'edit' ? 'Edit Camera' : 'Add Camera'}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setCameraModal(null)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={saveCamera} disabled={busy}>Save</AdminBtn>
          </>
        }
      >
        <FormStack>
          <Input label="Camera Name" requiredMark value={cameraForm.name} onChange={(e) => setCameraForm({ ...cameraForm, name: e.target.value })} placeholder="Camera 1 — Main Stage" />
          <Input label="Camera Location" value={cameraForm.location} onChange={(e) => setCameraForm({ ...cameraForm, location: e.target.value })} placeholder="Auditorium Stage" />

          <div className="space-y-2">
            <p className="form-label">How will this camera stream?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCameraForm({
                  ...cameraForm,
                  stream_type: 'builtin_camera',
                  stream_url: 'builtin://camera',
                })}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  cameraForm.stream_type === 'builtin_camera'
                    ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                    : 'border-slate-200 hover:border-violet-300'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Video className="h-4 w-4 text-violet-600" /> Use device camera
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Laptop webcam, USB cam, or teacher phone (LiveKit)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCameraForm({
                  ...cameraForm,
                  stream_type: cameraForm.stream_type === 'builtin_camera' ? 'youtube' : cameraForm.stream_type,
                  stream_url: cameraForm.stream_type === 'builtin_camera' ? '' : cameraForm.stream_url,
                })}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  cameraForm.stream_type !== 'builtin_camera'
                    ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                    : 'border-slate-200 hover:border-violet-300'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Radio className="h-4 w-4 text-violet-600" /> External stream URL
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  YouTube Live, HLS, Vimeo, Facebook, RTMP
                </span>
              </button>
            </div>
          </div>

          {cameraForm.stream_type !== 'builtin_camera' && (
            <Select
              label="Stream Type"
              value={cameraForm.stream_type}
              onChange={(e) => {
                const stream_type = e.target.value
                setCameraForm({
                  ...cameraForm,
                  stream_type,
                  stream_url: stream_type === 'builtin_camera' ? 'builtin://camera' : cameraForm.stream_url,
                })
              }}
            >
              <option value="youtube">YouTube Live</option>
              <option value="hls">HLS (.m3u8)</option>
              <option value="vimeo">Vimeo</option>
              <option value="facebook">Facebook Live</option>
              <option value="rtmp">RTMP</option>
              <option value="embed">Other URL</option>
            </Select>
          )}
          {cameraForm.stream_type !== 'builtin_camera' ? (
            <Input label="Stream URL" requiredMark value={cameraForm.stream_url} onChange={(e) => setCameraForm({ ...cameraForm, stream_url: e.target.value })} placeholder="https://..." />
          ) : (
            <p className="text-xs text-slate-600 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2">
              URL लागणार नाही. Save केल्यानंतर याच पेजवर <strong>camera studio</strong> उघडेल — browser/webcam किंवा teacher <strong>Join Live</strong> मधून phone camera connect करा. LiveKit Settings मध्ये enable असावे.
            </p>
          )}
          <Checkbox label="Enabled" checked={cameraForm.is_enabled} onChange={(e) => setCameraForm({ ...cameraForm, is_enabled: e.target.checked })} />
          {cameraForm.stream_type !== 'builtin_camera' && (
            <p className="text-xs text-slate-500">External stream URLs are only visible to staff. Parents receive a secure playback feed.</p>
          )}
        </FormStack>
      </AdminModal>

      <AdminModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Live Stream"
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setEditOpen(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={saveEdit} disabled={busy}>Save Changes</AdminBtn>
          </>
        }
      >
        <FormStack>
          <Input
            label="Display Title"
            requiredMark
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="Annual Day Live"
          />
          <Textarea
            label="Description"
            rows={2}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
          <ImageUpload
            label="Banner"
            value={editForm.banner}
            onChange={(path) => setEditForm({ ...editForm, banner: path })}
          />
          <p className="text-xs text-slate-500">
            Changes are saved to the live stream and the linked CMS event on the website.
          </p>
          {selected && ['live', 'paused'].includes(selected.status) ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              Stream is live — only title, description, and banner can be edited. End the stream to change schedule settings.
            </p>
          ) : (
            <>
              <Select
                label="Status"
                value={editForm.publish_status}
                onChange={(e) => setEditForm({
                  ...editForm,
                  publish_status: e.target.value as 'draft' | 'scheduled',
                })}
              >
                <option value="draft">Draft — not shown as upcoming live</option>
                <option value="scheduled">Scheduled — public countdown / reminders</option>
              </Select>
              <FormGrid cols={2}>
                <Input
                  label="Event Date"
                  type="date"
                  value={editForm.event_date}
                  onChange={(e) => setEditForm({ ...editForm, event_date: e.target.value })}
                />
                <Select
                  label="Stream Source"
                  value={editForm.stream_source}
                  onChange={(e) => setEditForm({ ...editForm, stream_source: e.target.value as StreamSource })}
                >
                  {STREAM_SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </Select>
              </FormGrid>
              <FormGrid cols={2}>
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  requiredMark={editForm.publish_status === 'scheduled'}
                  value={editForm.scheduled_start_at}
                  onChange={(e) => setEditForm({ ...editForm, scheduled_start_at: e.target.value })}
                />
                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  value={editForm.scheduled_end_at}
                  onChange={(e) => setEditForm({ ...editForm, scheduled_end_at: e.target.value })}
                />
              </FormGrid>
              <p className="text-xs text-slate-500 -mt-2">
                Status = Scheduled needs a start time. This drives the public website countdown (school timezone in Settings → Branding).
              </p>
              <Input
                label="Notify Before (minutes, comma-separated)"
                value={editForm.notify_before_minutes}
                onChange={(e) => setEditForm({ ...editForm, notify_before_minutes: e.target.value })}
                placeholder="60, 30"
              />
              <Select
                label="Who Can Watch"
                value={editForm.visibility}
                onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value as 'public' | 'parents_only' })}
              >
                <option value="public">Public + Parents</option>
                <option value="parents_only">Parents Only</option>
              </Select>
              <Checkbox
                label="Enable Countdown on Website"
                checked={editForm.enable_countdown}
                onChange={(e) => setEditForm({ ...editForm, enable_countdown: e.target.checked })}
              />
              <Checkbox
                label="Send Reminder Notifications"
                checked={editForm.enable_reminder}
                onChange={(e) => setEditForm({ ...editForm, enable_reminder: e.target.checked })}
              />
              <Checkbox
                label="Auto Start at Scheduled Time"
                checked={editForm.auto_start}
                onChange={(e) => setEditForm({ ...editForm, auto_start: e.target.checked })}
              />
              <Checkbox
                label="Auto End at Scheduled Time"
                checked={editForm.auto_end}
                onChange={(e) => setEditForm({ ...editForm, auto_end: e.target.checked })}
              />
            </>
          )}
        </FormStack>
      </AdminModal>
    </AdminPageShell>
  )
}
