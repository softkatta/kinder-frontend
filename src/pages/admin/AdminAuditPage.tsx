import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminBadge } from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { auditApi } from '@/api/services'

interface AuditRow {
  id: number
  action: string
  summary: string
  user_name?: string | null
  user_email?: string | null
  ip_address?: string | null
  time: string
}

export default function AdminAuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await auditApi.list()
      setRows((res.data.data as AuditRow[]) ?? [])
    } catch {
      toast.error('Failed to load audit logs')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Audit Logs"
        subtitle="Who changed what in the ERP"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Audit Logs' }]}
      />

      {loading && rows.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">Loading audit logs...</p>
      )}

      <AdminDataTable<AuditRow>
        data={rows}
        rowKey={(row) => row.id}
        onRefresh={load}
        title="Activity trail"
        subtitle={`${rows.length} recent events`}
        searchPlaceholder="Search action or summary..."
        searchKeys={['action', 'summary', 'user_name', 'user_email']}
        pageSize={12}
        emptyMessage="No audit events yet."
        columns={[
          { key: 'time', header: 'When', className: 'text-slate-500 text-sm', cell: (row) => row.time },
          {
            key: 'action',
            header: 'Action',
            cell: (row) => <AdminBadge tone="info">{row.action}</AdminBadge>,
          },
          { key: 'summary', header: 'Summary', cell: (row) => <span className="text-sm text-ink">{row.summary}</span> },
          {
            key: 'user',
            header: 'User',
            cell: (row) => (
              <div className="text-sm">
                <p className="font-semibold text-ink">{row.user_name ?? 'System'}</p>
                <p className="text-xs text-slate-500">{row.user_email ?? row.ip_address ?? '—'}</p>
              </div>
            ),
          },
        ]}
      />
    </AdminPageShell>
  )
}
