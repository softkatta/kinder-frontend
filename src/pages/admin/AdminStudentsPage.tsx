import { useCallback, useEffect, useState } from 'react'
import { Plus, Download, Eye, Pencil, Trash2, Users, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminListPageLayout, AdminBadge, AdminBtn, AdminTableActions, AdminModal, AdminRecordFields } from '@/components/admin/AdminUi'
import { AdminAvatar } from '@/components/admin/AdminStats'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { adminImages } from '@/config/adminCatalog'
import { idCardApi } from '@/api/services'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'

interface StudentRow {
  id: number
  name: string
  roll: string
  class: string
  parent: string
  status: string
}

function mapStudent(card: {
  id: number
  full_name: string
  card_number: string
  status: string
  emergency_contact?: string | null
  meta?: Record<string, string> | null
}): StudentRow {
  const meta = card.meta ?? {}
  return {
    id: card.id,
    name: card.full_name,
    roll: card.card_number,
    class: meta.class ?? '—',
    parent: meta.parent ?? card.emergency_contact ?? '—',
    status: card.status === 'active' ? 'Active' : card.status,
  }
}

const classLevel = (cls: string) => {
  if (cls.startsWith('Nursery')) return 'nursery'
  if (cls.startsWith('LKG')) return 'lkg'
  if (cls.startsWith('UKG')) return 'ukg'
  return 'all'
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [viewStudent, setViewStudent] = useState<StudentRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await idCardApi.list({ type: 'student' })
      setStudents((res.data.data ?? []).map(mapStudent))
    } catch {
      setStudents([])
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const { selection, bulkDelete, dropFromSelection, bulkDeleting } = useTableBulkDelete<StudentRow>({
    deleteOne: async (id) => { await idCardApi.delete(id) },
    onDone: load,
    confirmMany: (ids) => `Delete ${ids.length} student ID card(s)?`,
  })

  const remove = async (row: StudentRow) => {
    if (!confirm(`Delete student card for ${row.name}?`)) return
    try {
      await idCardApi.delete(row.id)
      dropFromSelection(row.id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const activeCount = students.filter((s) => s.status === 'Active').length
  const inactiveCount = students.length - activeCount

  const primaryAction = (
    <AdminBtn variant="primary" to="/admin/id-cards">
      <Plus className="h-4 w-4" /> Manage ID Cards
    </AdminBtn>
  )

  return (
    <AdminListPageLayout
      title="Student Management"
      subtitle="Manage enrolled students from ID cards in the database."
      breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Students' }]}
      heroImage={adminImages.classroom}
      primaryAction={primaryAction}
      headerActions={
        <AdminBtn variant="secondary" onClick={() => toast('Use Excel export in the table toolbar')}>
          <Download className="h-4 w-4" /> Export
        </AdminBtn>
      }
      stats={[
        { label: 'Total Students', value: students.length, change: 'ID cards', icon: Users, tone: 'sky' },
        { label: 'Active', value: activeCount, change: students.length ? `${Math.round((activeCount / students.length) * 100)}%` : '0%', icon: UserCheck, tone: 'emerald', changeDirection: 'up' },
        { label: 'Inactive', value: inactiveCount, change: 'Other statuses', icon: UserX, tone: 'amber' },
      ]}
      loading={loading && students.length === 0}
    >
      <AdminDataTable<StudentRow>
        data={students}
        rowKey={(row) => row.id}
        onRefresh={load}
        toolbarExtra={primaryAction}
        exportFilename="students"
        selection={selection}
        onBulkDelete={bulkDelete}
        bulkDeleting={bulkDeleting}
        searchPlaceholder="Search by name, card number..."
        searchKeys={['name', 'roll', 'parent', 'class']}
        pageSize={8}
        emptyMessage="No student ID cards in the database yet."
        initialSort={{ key: 'name', dir: 'asc' }}
        getSortValue={(row, key) => String(row[key as keyof StudentRow] ?? '')}
        filterSubtitle="class & status"
        filters={[
          {
            key: 'class',
            label: 'Class',
            options: [
              { value: 'all', label: 'All Classes' },
              { value: 'nursery', label: 'Nursery' },
              { value: 'lkg', label: 'LKG' },
              { value: 'ukg', label: 'UKG' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
        filterConfigs={[
          { key: 'class', defaultValue: 'all', match: (row, v) => v === 'all' || classLevel(row.class) === v },
          { key: 'status', defaultValue: 'all', match: (row, v) => v === 'all' || row.status === v },
        ]}
        columns={[
          { key: 'id', header: '#', sortable: true, className: 'text-slate-400 font-mono text-xs w-12', cell: (row) => row.id },
          {
            key: 'name',
            header: 'Student',
            sortable: true,
            cell: (row) => (
              <div className="flex items-center gap-3">
                <AdminAvatar name={row.name} size="sm" />
                <span className="font-semibold text-ink">{row.name}</span>
              </div>
            ),
          },
          { key: 'roll', header: 'Card #', sortable: true, className: 'font-mono text-xs text-slate-500', cell: (row) => row.roll },
          {
            key: 'class',
            header: 'Class',
            sortable: true,
            cell: (row) => (
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{row.class}</span>
            ),
          },
          { key: 'parent', header: 'Parent / Contact', sortable: true, className: 'text-slate-600', cell: (row) => row.parent },
          {
            key: 'status',
            header: 'Status',
            sortable: true,
            cell: (row) => (
              <AdminBadge tone={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</AdminBadge>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => (
              <AdminTableActions
                actions={[
                  { label: 'View', icon: Eye, to: `/admin/students/${row.id}` },
                  { label: 'Edit', icon: Pencil, to: '/admin/id-cards' },
                  { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => void remove(row) },
                ]}
              />
            ),
          },
        ]}
      />

      <AdminModal
        open={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title={viewStudent ? viewStudent.name : 'Student'}
        footer={<AdminBtn variant="secondary" onClick={() => setViewStudent(null)}>Close</AdminBtn>}
      >
        {viewStudent && (
          <AdminRecordFields
            fields={[
              { label: 'Card #', value: viewStudent.roll },
              { label: 'Class', value: viewStudent.class },
              { label: 'Parent / Contact', value: viewStudent.parent },
              { label: 'Status', value: <AdminBadge tone={viewStudent.status === 'Active' ? 'success' : 'neutral'}>{viewStudent.status}</AdminBadge> },
            ]}
          />
        )}
      </AdminModal>
    </AdminListPageLayout>
  )
}
