import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminBtn, AdminBadge, AdminTableActions } from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { templateDesignerApi } from '@/api/services'
import { portalBreadcrumbs } from '@/config/erpPortals'
import type { TemplateRow } from '@/types/templateDesigner'

export default function TemplateDesignerListPage() {
  const [rows, setRows] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await templateDesignerApi.templates.list()
      setRows(res.data.data ?? [])
    } catch {
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const remove = async (row: TemplateRow) => {
    try {
      await templateDesignerApi.templates.delete(row.id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Template Designer"
        subtitle="Create printable templates with background images and dynamic variables."
        breadcrumbs={[...portalBreadcrumbs('Admin', '/admin', 'Template Designer')]}
        actions={<AdminBtn to="/admin/template-designer/new"><Plus className="h-4 w-4" /> New Template</AdminBtn>}
      />

      {loading && rows.length === 0 && <p className="text-sm text-slate-500 text-center py-8">Loading...</p>}

      <AdminDataTable<TemplateRow>
        data={rows}
        rowKey={(r) => r.id}
        onRefresh={load}
        title="Templates"
        subtitle={`${rows.length} templates`}
        searchPlaceholder="Search templates..."
        searchKeys={['name']}
        pageSize={10}
        columns={[
          {
            key: 'thumb',
            header: 'Preview',
            cell: (r) => (
              <div className="h-14 w-10 rounded border bg-slate-50 overflow-hidden">
                {r.background_url ? <img src={r.background_url} alt="" className="h-full w-full object-cover" /> : <span className="text-[9px] text-slate-400 p-1">A4</span>}
              </div>
            ),
          },
          { key: 'name', header: 'Name', sortable: true, cell: (r) => <span className="font-semibold">{r.name}</span> },
          { key: 'cat', header: 'Category', cell: (r) => r.category?.name ?? '—' },
          { key: 'paper', header: 'Paper', cell: (r) => r.paper_size.replace('_', ' ').toUpperCase() },
          { key: 'status', header: 'Status', cell: (r) => <AdminBadge tone={r.is_active ? 'success' : 'neutral'}>{r.is_active ? 'Active' : 'Inactive'}</AdminBadge> },
          {
            key: 'actions',
            header: '',
            className: 'w-32',
            cell: (r) => (
              <AdminTableActions
                actions={[
                  { label: 'Edit', icon: Pencil, to: `/admin/template-designer/${r.id}/edit` },
                  { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => remove(r), confirm: true },
                ]}
              />
            ),
          },
        ]}
      />
    </AdminPageShell>
  )
}
