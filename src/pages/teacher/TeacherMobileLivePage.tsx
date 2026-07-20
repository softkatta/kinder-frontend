import { useCallback, useEffect, useState } from 'react'
import { Radio, Calendar, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { liveStreamApi } from '@/api/services'
import { MobileCameraPublisher } from '@/components/live/MobileCameraPublisher'
import { AdminPageHeader, AdminPageShell } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, teacherPortalConfig } from '@/config/erpPortals'
import type { PublisherEvent } from '@/types/liveStream'

function parsePublisherEvents(res: { data: { data?: unknown } }): PublisherEvent[] {
  const raw = res.data.data
  return Array.isArray(raw) ? (raw as PublisherEvent[]) : []
}

function extractApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
  const bag = data?.errors
  return (bag && Object.values(bag).flat()[0]) || data?.message || fallback
}

export default function TeacherMobileLivePage() {
  const [events, setEvents] = useState<PublisherEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await liveStreamApi.publisherEvents()
      const items = parsePublisherEvents(res)
      setEvents(items)
      setSelectedId((prev) => {
        if (prev && items.some((e) => e.id === prev)) return prev
        const live = items.find((e) => ['live', 'paused'].includes(e.status))
        return live?.id ?? items[0]?.id ?? null
      })
    } catch (err: unknown) {
      const message = extractApiError(err, 'Could not load live events')
      setLoadError(message)
      setEvents([])
      setSelectedId(null)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const selected = events.find((e) => e.id === selectedId) ?? null

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Join Live"
        subtitle="Connect your mobile camera. The admin controls which feed parents see."
        breadcrumbs={portalBreadcrumbs(teacherPortalConfig.portalLabel, teacherPortalConfig.homePath, 'Join Live')}
      />

      <div className="max-w-lg space-y-6">
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
            <p className="font-semibold text-rose-800">Could not load events</p>
            <p className="text-sm text-rose-700">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center space-y-3">
            <Radio className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-ink">No live events right now</p>
            <p className="text-sm text-slate-500">
              Admin ने event schedule केला की live start केला तर तो इथे दिसेल.
              Admin → Live Streams मध्ये CMS event निवडा आणि schedule करा.
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Assigned events</p>
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedId(event.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                    selectedId === event.id
                      ? 'border-violet-300 bg-violet-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">{event.title}</p>
                      {event.scheduled_start_at && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {event.scheduled_start_at.replace('T', ' ')}
                        </p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      event.status === 'live' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {event.status_label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selected && (
              <MobileCameraPublisher
                streamId={selected.id}
                eventTitle={selected.title}
                canJoin={selected.can_join}
              />
            )}
          </>
        )}
      </div>
    </AdminPageShell>
  )
}
