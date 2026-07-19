import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, studentPortalConfig } from '@/config/erpPortals'
import { portalApi } from '@/api/services'
import { useT } from '@/i18n/LanguageContext'

interface ActivityRow {
  title: string
  time: string
  summary?: string
}

export default function StudentActivitiesPage() {
  const { locale } = useT()
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.studentActivities(locale)
      setActivities((res.data.data as ActivityRow[]) ?? [])
    } catch {
      toast.error('Could not load activities')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [locale])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Activities"
        subtitle="Fun learning activities at school"
        breadcrumbs={portalBreadcrumbs(studentPortalConfig.portalLabel, studentPortalConfig.homePath, 'Activities')}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : activities.length === 0 ? (
        <AdminPanel><p className="p-5 text-sm text-slate-500">No activities listed yet.</p></AdminPanel>
      ) : (
        <div className="grid gap-4">
          {activities.map((a) => (
            <AdminPanel key={`${a.title}-${a.time}`} noPadding>
              <div className="p-5">
                <p className="font-display font-bold text-ink">{a.title}</p>
                <p className="text-xs text-slate-400">{a.time}</p>
                {a.summary && <p className="text-sm text-slate-600 mt-2">{a.summary}</p>}
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}
