import { useCallback, useEffect, useState } from 'react'
import { Plus, Eye, Pencil, Trash2, UserX, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminBadge, AdminBtn, AdminTableActions, AdminModal, AdminRecordFields } from '@/components/admin/AdminUi'
import { AdminAvatar, AdminSummaryGrid, AdminSummaryCard } from '@/components/admin/AdminStats'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormStack } from '@/components/ui/Form'
import { adminImages } from '@/config/adminCatalog'
import { roleApi, userApi } from '@/api/services'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'

interface RoleOption {
  id: number
  name: string
  label: string
}

interface UserRow {
  id: number
  name: string
  email: string
  phone?: string | null
  role: string
  status: 'Active' | 'Inactive'
  is_active: boolean
}

const roleTone: Record<string, 'violet' | 'info' | 'warning' | 'success'> = {
  'Super Admin': 'violet',
  Admin: 'violet',
  Teacher: 'info',
  Parent: 'warning',
  Student: 'success',
  Staff: 'info',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [viewUser, setViewUser] = useState<UserRow | null>(null)
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
  const [createOpen, setCreateOpen] = useState(false)
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '', role: 'parent' })
  const [saving, setSaving] = useState(false)

  const loadRoles = useCallback(async () => {
    try {
      const res = await roleApi.list()
      setRoles((res.data.data as RoleOption[]) ?? [])
    } catch {
      setRoles([])
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await userApi.list()
      setUsers(res.data.data ?? [])
    } catch {
      setUsers([])
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load(); void loadRoles() }, [load, loadRoles])

  const { selection, bulkDelete, dropFromSelection, bulkDeleting } = useTableBulkDelete<UserRow>({
    deleteOne: async (id) => { await userApi.delete(id) },
    onDone: load,
    confirmMany: (ids) => `Delete ${ids.length} user account(s)?`,
  })

  const remove = async (row: UserRow) => {
    if (!confirm(`Delete user ${row.name}?`)) return
    try {
      await userApi.delete(row.id)
      dropFromSelection(row.id)
      toast.success('Deleted')
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Delete failed')
    }
  }

  const toggleStatus = async (row: UserRow) => {
    try {
      await userApi.update(row.id, { is_active: !row.is_active })
      toast.success(`${row.is_active ? 'Disabled' : 'Enabled'} ${row.name}`)
      load()
    } catch {
      toast.error('Update failed')
    }
  }

  const openEdit = (row: UserRow) => {
    setEditUser(row)
    setEditForm({ name: row.name, email: row.email, phone: row.phone || '' })
  }

  const saveEdit = async () => {
    if (!editUser) return
    setSaving(true)
    try {
      await userApi.update(editUser.id, editForm)
      toast.success('User updated')
      setEditUser(null)
      load()
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const createUser = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      toast.error('Name, email and password are required')
      return
    }
    setSaving(true)
    try {
      await userApi.create({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone || null,
        password: createForm.password,
        roles: [createForm.role],
        is_active: true,
      })
      toast.success('User created')
      setCreateOpen(false)
      setCreateForm({ name: '', email: '', phone: '', password: '', role: 'parent' })
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data?.errors?.email?.[0]
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  const teachers = users.filter((u) => u.role === 'Teacher').length
  const parents = users.filter((u) => u.role === 'Parent').length
  const active = users.filter((u) => u.status === 'Active').length

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Users"
        subtitle="Portal accounts from the database."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Users' }]}
        actions={
          <AdminBtn variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Add User
          </AdminBtn>
        }
      />

      <AdminSummaryGrid>
        <AdminSummaryCard label="Total Users" value={users.length} note="Portal accounts" tone="violet" image={adminImages.about} />
        <AdminSummaryCard label="Teachers" value={teachers} note="Staff access" tone="sky" image={adminImages.classroom} />
        <AdminSummaryCard label="Parents" value={parents} note="Family portals" tone="amber" image={adminImages.event} />
        <AdminSummaryCard label="Active" value={active} note="Enabled logins" tone="emerald" image={adminImages.playground} />
      </AdminSummaryGrid>

      {loading && users.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">Loading users...</p>
      )}

      <AdminDataTable<UserRow>
        data={users}
        rowKey={(row) => row.id}
        onRefresh={load}
        title="All Users"
        subtitle={`${users.length} accounts`}
        selection={selection}
        onBulkDelete={bulkDelete}
        bulkDeleting={bulkDeleting}
        searchPlaceholder="Search name, email, role..."
        searchKeys={['name', 'email', 'role']}
        pageSize={8}
        emptyMessage="No users in the database."
        initialSort={{ key: 'name', dir: 'asc' }}
        getSortValue={(row, key) => String(row[key as keyof UserRow] ?? '')}
        filterSubtitle="role & account status"
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'all', label: 'All Roles' },
              { value: 'Super Admin', label: 'Super Admin' },
              { value: 'Teacher', label: 'Teacher' },
              { value: 'Parent', label: 'Parent' },
              { value: 'Student', label: 'Student' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ],
          },
        ]}
        filterConfigs={[
          { key: 'role', defaultValue: 'all', match: (row, v) => v === 'all' || row.role === v },
          { key: 'status', defaultValue: 'all', match: (row, v) => v === 'all' || row.status === v },
        ]}
        columns={[
          { key: 'id', header: '#', className: 'text-slate-400 font-mono text-xs w-12', cell: (row) => row.id },
          {
            key: 'name',
            header: 'Name',
            sortable: true,
            cell: (row) => (
              <div className="flex items-center gap-3">
                <AdminAvatar name={row.name} size="sm" />
                <span className="font-semibold text-ink">{row.name}</span>
              </div>
            ),
          },
          { key: 'email', header: 'Email', sortable: true, className: 'text-slate-600', cell: (row) => row.email },
          { key: 'role', header: 'Role', sortable: true, cell: (row) => <AdminBadge tone={roleTone[row.role] ?? 'neutral'}>{row.role}</AdminBadge> },
          { key: 'status', header: 'Status', sortable: true, cell: (row) => <AdminBadge tone={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</AdminBadge> },
          { key: 'portal', header: 'Portal Access', cell: (row) => <span className="text-slate-500 text-sm">{row.status === 'Active' ? 'Enabled' : 'Disabled'}</span> },
          {
            key: 'actions',
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            cell: (row) => (
              <AdminTableActions
                actions={[
                  { label: 'View', icon: Eye, onClick: () => setViewUser(row) },
                  { label: 'Edit', icon: Pencil, onClick: () => openEdit(row) },
                  {
                    label: row.status === 'Active' ? 'Disable' : 'Enable',
                    icon: row.status === 'Active' ? UserX : UserCheck,
                    variant: row.status === 'Active' ? 'danger' : 'success',
                    onClick: () => void toggleStatus(row),
                  },
                  { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => void remove(row) },
                ]}
              />
            ),
          },
        ]}
      />

      <AdminModal open={!!viewUser} onClose={() => setViewUser(null)} title={viewUser ? viewUser.name : 'User'} footer={<AdminBtn variant="secondary" onClick={() => setViewUser(null)}>Close</AdminBtn>}>
        {viewUser && (
          <AdminRecordFields
            fields={[
              { label: 'Email', value: viewUser.email },
              { label: 'Phone', value: viewUser.phone || '—' },
              { label: 'Role', value: <AdminBadge tone={roleTone[viewUser.role] ?? 'neutral'}>{viewUser.role}</AdminBadge> },
              { label: 'Status', value: <AdminBadge tone={viewUser.status === 'Active' ? 'success' : 'neutral'}>{viewUser.status}</AdminBadge> },
            ]}
          />
        )}
      </AdminModal>

      <AdminModal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={editUser ? `Edit — ${editUser.name}` : 'Edit User'}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setEditUser(null)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={() => void saveEdit()} disabled={saving}>{saving ? 'Saving...' : 'Save'}</AdminBtn>
          </>
        }
      >
        {editUser && (
          <FormStack>
            <Input label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          </FormStack>
        )}
      </AdminModal>

      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add portal user"
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={() => void createUser()} disabled={saving}>
              {saving ? 'Creating...' : 'Create user'}
            </AdminBtn>
          </>
        }
      >
        <FormStack>
          <Input label="Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <Input label="Phone" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
          <Input label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
          <Select label="Role" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>{r.label}</option>
            ))}
          </Select>
        </FormStack>
      </AdminModal>
    </AdminPageShell>
  )
}
