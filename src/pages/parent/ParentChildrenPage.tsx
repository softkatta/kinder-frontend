import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminPanel } from '@/components/admin/AdminUi'
import { AdminAvatar } from '@/components/admin/AdminStats'
import { portalBreadcrumbs, parentPortalConfig } from '@/config/erpPortals'
import { portalApi } from '@/api/services'
import { mediaUrl } from '@/utils/mediaUrl'

interface ChildRow {
  id: number
  name: string
  class: string
  admission_number?: string
  blood_group?: string | null
  attendance_today?: string
  emergency_contact?: string | null
  photo_path?: string | null
}

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ChildRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await portalApi.parentChildren()
      setChildren((res.data.data as ChildRow[]) ?? [])
    } catch {
      toast.error('Could not load children')
      setChildren([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="My Children"
        subtitle="Linked student profiles from school ID cards"
        breadcrumbs={portalBreadcrumbs(parentPortalConfig.portalLabel, parentPortalConfig.homePath, 'Children')}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : children.length === 0 ? (
        <AdminPanel><p className="p-5 text-sm text-slate-500">No children linked to your account yet. Contact the school office.</p></AdminPanel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <AdminPanel key={child.id} noPadding>
              <div className="p-5 flex gap-4">
                {child.photo_path ? (
                  <img src={mediaUrl(child.photo_path)} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                ) : (
                  <AdminAvatar name={child.name} size="lg" />
                )}
                <div>
                  <p className="font-display font-bold text-ink">{child.name}</p>
                  <p className="text-sm text-slate-500">Class: {child.class}</p>
                  {child.admission_number && <p className="text-xs text-slate-400">ID: {child.admission_number}</p>}
                  <p className="text-sm text-slate-600 mt-2">Today: {child.attendance_today}</p>
                  {child.emergency_contact && <p className="text-xs text-slate-500 mt-1">Emergency: {child.emergency_contact}</p>}
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </AdminPageShell>
  )
}
