import { useCallback, useEffect, useState } from 'react'
import { Bus, Pencil, Plus, RefreshCw, Trash2, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AdminPageHeader, AdminPageShell, AdminPanel, AdminBtn, AdminBadge, AdminModal,
} from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { studentApi, transportApi } from '@/api/services'

interface TransportRoute {
  id: number
  name: string
  area?: string
  pickup_points?: string
  driver_name?: string
  driver_phone?: string
  vehicle_number?: string
  monthly_fee: number
  status: string
  students_count?: number
}

interface StudentRow {
  id: number
  full_name: string
  class?: string
  transport_route_id?: number | null
}

const emptyRoute = {
  name: '',
  area: '',
  pickup_points: '',
  driver_name: '',
  driver_phone: '',
  vehicle_number: '',
  monthly_fee: '',
}

export default function AdminTransportPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [form, setForm] = useState(emptyRoute)
  const [assignStudentId, setAssignStudentId] = useState('')
  const [assignRouteId, setAssignRouteId] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [routeRes, studentRes] = await Promise.all([transportApi.list(), studentApi.list()])
      setRoutes(routeRes.data.data ?? [])
      setStudents(studentRes.data.data ?? [])
    } catch {
      toast.error('Failed to load transport data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyRoute)
    setModalOpen(true)
  }

  const openEdit = (route: TransportRoute) => {
    setEditingId(route.id)
    setForm({
      name: route.name,
      area: route.area ?? '',
      pickup_points: route.pickup_points ?? '',
      driver_name: route.driver_name ?? '',
      driver_phone: route.driver_phone ?? '',
      vehicle_number: route.vehicle_number ?? '',
      monthly_fee: String(route.monthly_fee ?? ''),
    })
    setModalOpen(true)
  }

  const saveRoute = async () => {
    if (!form.name.trim()) {
      toast.error('Route name is required')
      return
    }
    setSaving(true)
    try {
      const payload = { ...form, monthly_fee: form.monthly_fee ? Number(form.monthly_fee) : 0 }
      if (editingId) {
        await transportApi.update(editingId, payload)
        toast.success('Route updated')
      } else {
        await transportApi.create(payload)
        toast.success('Route created')
      }
      setModalOpen(false)
      setForm(emptyRoute)
      void load()
    } catch {
      toast.error('Could not save route')
    } finally {
      setSaving(false)
    }
  }

  const assignTransport = async () => {
    if (!assignStudentId) {
      toast.error('Select a student')
      return
    }
    setSaving(true)
    try {
      await transportApi.assignStudent(Number(assignStudentId), assignRouteId ? Number(assignRouteId) : null)
      toast.success('Transport updated')
      setAssignOpen(false)
      setAssignStudentId('')
      setAssignRouteId('')
      void load()
    } catch {
      toast.error('Could not assign transport')
    } finally {
      setSaving(false)
    }
  }

  const removeRoute = async (id: number) => {
    if (!confirm('Delete this route? Students will be unassigned.')) return
    try {
      await transportApi.delete(id)
      toast.success('Route deleted')
      void load()
    } catch {
      toast.error('Could not delete')
    }
  }

  const routeName = (id?: number | null) => routes.find((r) => r.id === id)?.name ?? '—'

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Transport"
        subtitle="School bus routes and student assignments"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Transport' }]}
        actions={
          <>
            <AdminBtn variant="secondary" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</AdminBtn>
            <AdminBtn variant="secondary" onClick={() => setAssignOpen(true)}><UserCheck className="h-4 w-4" /> Assign student</AdminBtn>
            <AdminBtn variant="primary" onClick={openCreate}><Plus className="h-4 w-4" /> New route</AdminBtn>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {routes.map((route) => (
          <AdminPanel key={route.id} noPadding>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Bus className="h-5 w-5 text-sky-600 shrink-0" />
                  <p className="font-display font-bold text-ink truncate">{route.name}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button type="button" className="text-slate-500 hover:text-ink" onClick={() => openEdit(route)}><Pencil className="h-4 w-4" /></button>
                  <button type="button" className="text-red-500" onClick={() => void removeRoute(route.id)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">{route.area ?? '—'}</p>
              <p className="text-xs text-slate-500 mt-1">{route.pickup_points}</p>
              <div className="mt-3 flex items-center justify-between">
                <AdminBadge tone="info">₹{Number(route.monthly_fee).toLocaleString('en-IN')}/mo</AdminBadge>
                <span className="text-xs text-slate-500">{route.students_count ?? 0} students</span>
              </div>
            </div>
          </AdminPanel>
        ))}
      </div>

      <AdminPanel title="Students & routes" noPadding>
        {loading && students.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Loading...</p>
        ) : (
          <AdminDataTable<StudentRow>
            data={students}
            rowKey={(row) => row.id}
            onRefresh={load}
            emptyMessage="No students found."
            columns={[
              { key: 'name', header: 'Student', cell: (r) => r.full_name },
              { key: 'class', header: 'Class', cell: (r) => r.class ?? '—' },
              { key: 'route', header: 'Route', cell: (r) => routeName(r.transport_route_id) },
            ]}
          />
        )}
      </AdminPanel>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit route' : 'New transport route'}
        footer={<><AdminBtn variant="secondary" onClick={() => setModalOpen(false)}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => void saveRoute()} disabled={saving}>{saving ? 'Saving...' : 'Save'}</AdminBtn></>}>
        <div className="space-y-4">
          <Input placeholder="Route name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          <Input placeholder="Pickup points" value={form.pickup_points} onChange={(e) => setForm({ ...form, pickup_points: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Driver name" value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} />
            <Input placeholder="Driver phone" value={form.driver_phone} onChange={(e) => setForm({ ...form, driver_phone: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Vehicle number" value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
            <Input type="number" placeholder="Monthly fee" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} />
          </div>
        </div>
      </AdminModal>

      <AdminModal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign student to route"
        footer={<><AdminBtn variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</AdminBtn>
          <AdminBtn variant="primary" onClick={() => void assignTransport()} disabled={saving}>Assign</AdminBtn></>}>
        <div className="space-y-4">
          <Select value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)}>
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <Select value={assignRouteId} onChange={(e) => setAssignRouteId(e.target.value)}>
            <option value="">No route / remove</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </div>
      </AdminModal>
    </AdminPageShell>
  )
}
