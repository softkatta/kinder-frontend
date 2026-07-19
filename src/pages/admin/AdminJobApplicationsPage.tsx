import { useCallback, useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { AdminPageHeader, AdminPageShell, AdminBadge } from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { cmsApi } from '@/api/services'
import { mediaUrl } from '@/utils/mediaUrl'

interface JobApplicationRow {
  id: number
  cms_item_id: number
  full_name: string
  email: string
  phone: string
  qualification?: string
  experience_years?: number
  cover_letter?: string
  resume_path?: string
  status?: string
  created_at: string
  job?: { id: number; title: string }
}

export default function AdminJobApplicationsPage() {
  const [rows, setRows] = useState<JobApplicationRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await cmsApi.jobApplications()
      setRows(res.data.data ?? [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Job Applications"
        subtitle="Career form submissions from the public website — stored when candidates apply on job detail pages."
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Website CMS', to: '/admin/cms?type=job' },
          { label: 'Job Applications' },
        ]}
      />

      {loading ? (
        <p className="text-slate-400 text-sm py-12 text-center">Loading...</p>
      ) : (
        <AdminDataTable<JobApplicationRow>
          data={rows}
          rowKey={(r) => r.id}
          onRefresh={load}
          title="Applications"
          subtitle={`${rows.length} submissions`}
          searchPlaceholder="Search name, email, job..."
          searchKeys={['full_name', 'email', 'phone', 'qualification']}
          pageSize={10}
          filterSubtitle="application status"
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'all', label: 'All Status' },
                { value: 'new', label: 'New' },
                { value: 'reviewing', label: 'Reviewing' },
                { value: 'shortlisted', label: 'Shortlisted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'hired', label: 'Hired' },
              ],
            },
          ]}
          filterConfigs={[
            { key: 'status', defaultValue: 'all', match: (row, v) => v === 'all' || (row.status ?? 'new') === v },
          ]}
          columns={[
            { key: 'id', header: '#', className: 'font-mono text-xs text-slate-400 w-12', cell: (r) => r.id },
            {
              key: 'job',
              header: 'Job',
              sortable: true,
              cell: (r) => <span className="font-semibold text-ink">{r.job?.title ?? `Job #${r.cms_item_id}`}</span>,
            },
            { key: 'full_name', header: 'Name', sortable: true, cell: (r) => r.full_name },
            { key: 'email', header: 'Email', cell: (r) => <a href={`mailto:${r.email}`} className="text-violet-600 hover:underline">{r.email}</a> },
            { key: 'phone', header: 'Phone', cell: (r) => r.phone },
            { key: 'qualification', header: 'Qualification', cell: (r) => r.qualification ?? '—' },
            { key: 'experience', header: 'Exp.', cell: (r) => r.experience_years != null ? `${r.experience_years} yrs` : '—' },
            {
              key: 'resume',
              header: 'Resume',
              cell: (r) => r.resume_path ? (
                <a
                  href={mediaUrl(r.resume_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-violet-600 hover:underline"
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </a>
              ) : '—',
            },
            {
              key: 'date',
              header: 'Applied',
              sortable: true,
              cell: (r) => new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            },
            {
              key: 'status',
              header: 'Status',
              cell: (r) => <AdminBadge tone={r.status === 'rejected' ? 'danger' : r.status === 'hired' ? 'success' : 'neutral'}>{r.status ?? 'new'}</AdminBadge>,
            },
          ]}
          emptyMessage="No applications yet. Submissions appear when candidates apply on job detail pages."
        />
      )}
    </AdminPageShell>
  )
}
