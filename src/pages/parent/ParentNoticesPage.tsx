import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { portalBreadcrumbs, parentPortalConfig } from '@/config/erpPortals'
import { portalApi } from '@/api/services'
import { useT } from '@/i18n/LanguageContext'

interface NoticeRow {
  id: number
  title: string
  body: string
  date: string
}

export default function ParentNoticesPage() {
  const { locale } = useT()
  const [notices, setNotices] = useState<NoticeRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.parentNotices(locale)
      setNotices((res.data.data as NoticeRow[]) ?? [])
    } catch {
      toast.error('Could not load notices')
      setNotices([])
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
        title="Notices"
        subtitle="School announcements and updates"
        breadcrumbs={portalBreadcrumbs(parentPortalConfig.portalLabel, parentPortalConfig.homePath, 'Notices')}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : notices.length === 0 ? (
        <AdminPanel><p className="p-5 text-sm text-slate-500">No notices at this time.</p></AdminPanel>
      ) : (
        <div className="grid gap-4">
          {notices.map((n) => (
            <AdminPanel key={n.id} noPadding>
              <div className="p-5">
                <p className="font-display font-bold text-ink">{n.title}</p>
                <p className="text-xs text-slate-400 mb-2">{n.date}</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{n.body}</p>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}
