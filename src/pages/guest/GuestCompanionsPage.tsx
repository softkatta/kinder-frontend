import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { guestApi } from '@/api/services'
import { AdminPageHeader, AdminPageShell, AdminBtn, AdminPanel } from '@/components/admin/AdminUi'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { FormGrid } from '@/components/ui/Form'
import { Checkbox } from '@/components/ui/Checkbox'
import { portalBreadcrumbs, guestPortalConfig } from '@/config/erpPortals'
import type { GuestCompanion } from '@/components/guest/GuestVerifyPanel'

interface CompanionForm {
  full_name: string
  phone: string
  photo_path: string
  relation: string
  can_entry: boolean
}

const emptyCompanion = (): CompanionForm => ({
  full_name: '',
  phone: '',
  photo_path: '',
  relation: '',
  can_entry: true,
})

export default function GuestCompanionsPage() {
  const [companions, setCompanions] = useState<CompanionForm[]>([emptyCompanion()])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await guestApi.portalProfile()
      const profile = res.data.data as { companions?: GuestCompanion[] }
      const list = profile.companions ?? []
      setCompanions(
        list.length
          ? list.map((c) => ({
              full_name: c.full_name,
              phone: c.phone ?? '',
              photo_path: c.photo_url ?? '',
              relation: c.relation ?? '',
              can_entry: c.can_entry,
            }))
          : [emptyCompanion()],
      )
    } catch {
      toast.error('Failed to load companions')
      setCompanions([emptyCompanion()])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const save = async () => {
    const payload = companions.filter((c) => c.full_name.trim())
    if (!payload.length) {
      toast.error('Add at least one companion name')
      return
    }
    setSaving(true)
    try {
      await guestApi.updatePortalCompanions(
        payload.map((c) => ({
          full_name: c.full_name.trim(),
          phone: c.phone || null,
          photo_path: c.photo_path || null,
          relation: c.relation || null,
          can_entry: c.can_entry,
        })),
      )
      toast.success('Companions saved')
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Companions"
        subtitle="Add family or friends who will enter the event with you."
        breadcrumbs={portalBreadcrumbs(guestPortalConfig.portalLabel, guestPortalConfig.homePath, 'Companions')}
        actions={
          <AdminBtn variant="primary" onClick={save} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Companions'}
          </AdminBtn>
        }
      />

      <AdminPanel title="Who is coming with you?">
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            {companions.map((c, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <FormGrid>
                  <Input
                    label="Full Name"
                    value={c.full_name}
                    onChange={(e) => {
                      const next = [...companions]
                      next[i] = { ...c, full_name: e.target.value }
                      setCompanions(next)
                    }}
                  />
                  <Input
                    label="Phone"
                    value={c.phone}
                    onChange={(e) => {
                      const next = [...companions]
                      next[i] = { ...c, phone: e.target.value }
                      setCompanions(next)
                    }}
                  />
                  <Input
                    label="Relation"
                    placeholder="e.g. Spouse, Child"
                    value={c.relation}
                    onChange={(e) => {
                      const next = [...companions]
                      next[i] = { ...c, relation: e.target.value }
                      setCompanions(next)
                    }}
                  />
                  <ImageUpload
                    uploadTarget="guest"
                    label="Photo"
                    value={c.photo_path}
                    onChange={(p) => {
                      const next = [...companions]
                      next[i] = { ...c, photo_path: p }
                      setCompanions(next)
                    }}
                  />
                </FormGrid>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Checkbox
                    label="Allow entry with me at the gate"
                    checked={c.can_entry}
                    onChange={(e) => {
                      const next = [...companions]
                      next[i] = { ...c, can_entry: e.target.checked }
                      setCompanions(next)
                    }}
                  />
                  {companions.length > 1 && (
                    <AdminBtn
                      variant="secondary"
                      className="!px-2.5 !py-1.5 text-xs"
                      onClick={() => setCompanions(companions.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </AdminBtn>
                  )}
                </div>
              </div>
            ))}
            <AdminBtn variant="secondary" onClick={() => setCompanions([...companions, emptyCompanion()])}>
              <Plus className="h-4 w-4" /> Add another person
            </AdminBtn>
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  )
}
