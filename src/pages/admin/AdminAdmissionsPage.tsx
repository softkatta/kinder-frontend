import { useCallback, useEffect, useState } from 'react'
import { Eye, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminBadge, AdminBtn, AdminTableActions, AdminModal, AdminRecordFields } from '@/components/admin/AdminUi'
import { AdminAvatar, AdminSummaryCard, AdminSummaryGrid } from '@/components/admin/AdminStats'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { CameraCapture } from '@/components/ui/CameraCapture'
import { FormStack } from '@/components/ui/Form'
import { adminImages } from '@/config/adminCatalog'
import { admissionApi, contactInquiryApi, publicApi } from '@/api/services'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'

type SectionTab = 'enquiries' | 'applications'
type InquiryStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected'
type AppStatus = 'pending' | 'approved' | 'rejected'

interface InquiryRow {
  id: number
  name: string
  email: string
  phone?: string | null
  parent: string
  program: string
  subject?: string | null
  message: string
  status: InquiryStatus
  status_raw: string
  date: string
}

interface ApplicationRow {
  id: number
  applicant_name: string
  parent_name?: string | null
  parent_phone?: string | null
  parent_email?: string | null
  grade_level?: string | null
  gender?: string | null
  dob?: string | null
  address?: string | null
  photo_path?: string | null
  status: AppStatus
  status_label: string
  remarks?: string | null
  date: string
}

interface CreateAdmissionForm {
  applicant_name: string
  dob: string
  gender: '' | 'male' | 'female' | 'other'
  grade_level: '' | 'nursery' | 'lkg' | 'ukg'
  parent_name: string
  parent_phone: string
  parent_email: string
  address: string
}

const emptyCreateForm: CreateAdmissionForm = {
  applicant_name: '',
  dob: '',
  gender: '',
  grade_level: '',
  parent_name: '',
  parent_phone: '',
  parent_email: '',
  address: '',
}

const statusTone: Record<InquiryStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  Pending: 'warning',
  'Under Review': 'info',
  Approved: 'success',
  Rejected: 'danger',
}

const appStatusTone: Record<AppStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const statusToRaw: Record<InquiryStatus, string> = {
  Pending: 'new',
  'Under Review': 'review',
  Approved: 'closed',
  Rejected: 'rejected',
}

export default function AdminAdmissionsPage() {
  const [section, setSection] = useState<SectionTab>('enquiries')
  const [inquiries, setInquiries] = useState<InquiryRow[]>([])
  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [viewRow, setViewRow] = useState<InquiryRow | null>(null)
  const [viewApp, setViewApp] = useState<ApplicationRow | null>(null)
  const [reviewRow, setReviewRow] = useState<InquiryRow | null>(null)
  const [rejectApp, setRejectApp] = useState<ApplicationRow | null>(null)
  const [rejectRemarks, setRejectRemarks] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateAdmissionForm>(emptyCreateForm)
  const [createPhoto, setCreatePhoto] = useState<File | null>(null)
  const [createSaving, setCreateSaving] = useState(false)

  const loadEnquiries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await contactInquiryApi.list()
      setInquiries(res.data.data ?? [])
    } catch {
      setInquiries([])
      toast.error('Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await admissionApi.list()
      setApplications(res.data.data ?? [])
    } catch {
      setApplications([])
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [])

  const load = useCallback(async () => {
    if (section === 'enquiries') await loadEnquiries()
    else await loadApplications()
  }, [section, loadEnquiries, loadApplications])

  useEffect(() => { void load() }, [load])

  const { selection, bulkDelete, dropFromSelection, bulkDeleting } = useTableBulkDelete<InquiryRow>({
    deleteOne: async (id) => { await contactInquiryApi.delete(id) },
    onDone: loadEnquiries,
    confirmMany: (ids) => `Delete ${ids.length} enquiry record(s)?`,
  })

  const updateStatus = async (row: InquiryRow, status: InquiryStatus) => {
    try {
      await contactInquiryApi.update(row.id, { status: statusToRaw[status] })
      toast.success(`Marked as ${status}`)
      loadEnquiries()
      if (viewRow?.id === row.id) setViewRow({ ...row, status })
      if (reviewRow?.id === row.id) setReviewRow(null)
    } catch {
      toast.error('Update failed')
    }
  }

  const remove = async (row: InquiryRow) => {
    try {
      await contactInquiryApi.delete(row.id)
      dropFromSelection(row.id)
      toast.success('Deleted')
      loadEnquiries()
    } catch {
      toast.error('Delete failed')
    }
  }

  const approveApp = async (row: ApplicationRow) => {
    try {
      await admissionApi.approve(row.id)
      toast.success('Application approved')
      loadApplications()
      if (viewApp?.id === row.id) setViewApp({ ...row, status: 'approved', status_label: 'Approved' })
    } catch {
      toast.error('Approve failed')
    }
  }

  const confirmRejectApplication = async () => {
    if (!rejectApp) return
    try {
      await admissionApi.reject(rejectApp.id, rejectRemarks || undefined)
      toast.success('Application rejected')
      setRejectApp(null)
      setRejectRemarks('')
      loadApplications()
      if (viewApp?.id === rejectApp.id) setViewApp(null)
    } catch {
      toast.error('Reject failed')
    }
  }

  const submitNewAdmission = async () => {
    if (!createForm.applicant_name.trim()) {
      toast.error('Child name is required')
      return
    }
    if (!createForm.parent_name.trim()) {
      toast.error('Parent name is required')
      return
    }
    if (!createForm.parent_phone.trim()) {
      toast.error('Parent phone is required')
      return
    }

    setCreateSaving(true)
    try {
      let photoPath: string | undefined
      if (createPhoto) {
        const fd = new FormData()
        fd.append('file', createPhoto)
        const uploadRes = await publicApi.uploadAdmissionPhoto(fd)
        photoPath = uploadRes.data.data?.path || undefined
      }

      await admissionApi.submit({
        applicant_name: createForm.applicant_name.trim(),
        dob: createForm.dob || undefined,
        gender: createForm.gender || undefined,
        grade_level: createForm.grade_level || undefined,
        parent_info: {
          full_name: createForm.parent_name.trim(),
          phone: createForm.parent_phone.trim(),
          email: createForm.parent_email.trim() || undefined,
        },
        address_info: {
          address: createForm.address.trim() || undefined,
        },
        photo_path: photoPath,
      })

      toast.success('Admission created successfully')
      setCreateOpen(false)
      setCreateForm(emptyCreateForm)
      setCreatePhoto(null)
      if (section !== 'applications') {
        setSection('applications')
      }
      await loadApplications()
    } catch {
      toast.error('Failed to create admission')
    } finally {
      setCreateSaving(false)
    }
  }

  const pending = inquiries.filter((a) => a.status === 'Pending').length
  const review = inquiries.filter((a) => a.status === 'Under Review').length
  const approved = inquiries.filter((a) => a.status === 'Approved').length

  const appPending = applications.filter((a) => a.status === 'pending').length
  const appApproved = applications.filter((a) => a.status === 'approved').length
  const appRejected = applications.filter((a) => a.status === 'rejected').length

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Admissions"
        subtitle="Contact enquiries आणि online admission applications manage करा."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Admissions' }]}
        actions={
          <AdminBtn variant="primary" onClick={() => setCreateOpen(true)}>
            New Admission
          </AdminBtn>
        }
      />

      <div className="admin-page-tabs mb-4">
        <button
          type="button"
          className={section === 'enquiries' ? 'admin-page-tab active' : 'admin-page-tab'}
          onClick={() => setSection('enquiries')}
        >
          Contact Enquiries
        </button>
        <button
          type="button"
          className={section === 'applications' ? 'admin-page-tab active' : 'admin-page-tab'}
          onClick={() => setSection('applications')}
        >
          Admission Applications
        </button>
      </div>

      {section === 'enquiries' ? (
        <>
          <AdminSummaryGrid>
            <AdminSummaryCard label="Pending" value={pending} note="New enquiries" tone="amber" image={adminImages.nursery} />
            <AdminSummaryCard label="Under Review" value={review} note="Being reviewed" tone="sky" image={adminImages.classroom} />
            <AdminSummaryCard label="Closed" value={approved} note="Resolved" tone="emerald" image={adminImages.playground} />
          </AdminSummaryGrid>

          {loading && inquiries.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">Loading enquiries...</p>
          )}

          <AdminDataTable<InquiryRow>
            data={inquiries}
            rowKey={(row) => row.id}
            onRefresh={loadEnquiries}
            title="All Enquiries"
            subtitle={`${inquiries.length} contact form records`}
            selection={selection}
            onBulkDelete={bulkDelete}
            bulkDeleting={bulkDeleting}
            searchPlaceholder="Search name, email, subject..."
            searchKeys={['name', 'parent', 'program', 'email']}
            pageSize={8}
            emptyMessage="No contact enquiries yet."
            initialSort={{ key: 'date', dir: 'desc' }}
            getSortValue={(row, key) => {
              if (key === 'date') return row.date
              return String(row[key as keyof InquiryRow] ?? '')
            }}
            filterSubtitle="enquiry status"
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Under Review', label: 'Under Review' },
                  { value: 'Approved', label: 'Closed' },
                  { value: 'Rejected', label: 'Rejected' },
                ],
              },
            ]}
            filterConfigs={[
              { key: 'status', defaultValue: 'all', match: (row, v) => v === 'all' || row.status === v },
            ]}
            columns={[
              {
                key: 'name',
                header: 'Applicant',
                sortable: true,
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    <AdminAvatar name={row.name} size="sm" />
                    <span className="font-semibold text-ink">{row.name}</span>
                  </div>
                ),
              },
              { key: 'program', header: 'Subject', sortable: true, cell: (row) => row.program },
              { key: 'parent', header: 'Email', sortable: true, className: 'text-slate-600', cell: (row) => row.email },
              { key: 'date', header: 'Received', sortable: true, className: 'text-slate-500', cell: (row) => row.date },
              { key: 'status', header: 'Status', sortable: true, cell: (row) => <AdminBadge tone={statusTone[row.status]}>{row.status}</AdminBadge> },
              {
                key: 'action',
                header: 'Action',
                headerClassName: 'text-right',
                className: 'text-right',
                cell: (row) => (
                  <AdminTableActions
                    actions={[
                      { label: 'View', icon: Eye, onClick: () => setViewRow(row) },
                      ...(row.status !== 'Rejected' && row.status !== 'Approved'
                        ? [
                            { label: 'Review', icon: Pencil, variant: 'primary' as const, onClick: () => { setReviewRow(row); setReviewNotes('') } },
                            { label: 'Close', icon: CheckCircle, variant: 'success' as const, onClick: () => void updateStatus(row, 'Approved') },
                            { label: 'Reject', icon: XCircle, variant: 'danger' as const, onClick: () => void updateStatus(row, 'Rejected') },
                          ]
                        : []),
                      { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => void remove(row) },
                    ]}
                  />
                ),
              },
            ]}
          />
        </>
      ) : (
        <>
          <AdminSummaryGrid>
            <AdminSummaryCard label="Pending" value={appPending} note="New applications" tone="amber" image={adminImages.nursery} />
            <AdminSummaryCard label="Approved" value={appApproved} note="Accepted" tone="emerald" image={adminImages.classroom} />
            <AdminSummaryCard label="Rejected" value={appRejected} note="Declined" tone="violet" image={adminImages.playground} />
          </AdminSummaryGrid>

          {loading && applications.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">Loading applications...</p>
          )}

          <AdminDataTable<ApplicationRow>
            data={applications}
            rowKey={(row) => row.id}
            onRefresh={loadApplications}
            title="Admission Applications"
            subtitle={`${applications.length} online applications`}
            searchPlaceholder="Search applicant, parent, grade..."
            searchKeys={['applicant_name', 'parent_name', 'parent_phone', 'grade_level']}
            pageSize={8}
            emptyMessage="No admission applications yet."
            initialSort={{ key: 'date', dir: 'desc' }}
            getSortValue={(row, key) => {
              if (key === 'date') return row.date
              return String(row[key as keyof ApplicationRow] ?? '')
            }}
            filterSubtitle="application status"
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ],
              },
            ]}
            filterConfigs={[
              { key: 'status', defaultValue: 'all', match: (row, v) => v === 'all' || row.status === v },
            ]}
            columns={[
              {
                key: 'applicant_name',
                header: 'Child',
                sortable: true,
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    <AdminAvatar name={row.applicant_name} size="sm" />
                    <span className="font-semibold text-ink">{row.applicant_name}</span>
                  </div>
                ),
              },
              { key: 'grade_level', header: 'Grade', sortable: true, cell: (row) => (row.grade_level ? row.grade_level.toUpperCase() : '—') },
              { key: 'parent_name', header: 'Parent', sortable: true, className: 'text-slate-600', cell: (row) => row.parent_name || '—' },
              { key: 'parent_phone', header: 'Phone', sortable: true, className: 'text-slate-500', cell: (row) => row.parent_phone || '—' },
              { key: 'date', header: 'Applied', sortable: true, className: 'text-slate-500', cell: (row) => row.date },
              { key: 'status', header: 'Status', sortable: true, cell: (row) => <AdminBadge tone={appStatusTone[row.status]}>{row.status_label}</AdminBadge> },
              {
                key: 'action',
                header: 'Action',
                headerClassName: 'text-right',
                className: 'text-right',
                cell: (row) => (
                  <AdminTableActions
                    actions={[
                      { label: 'View', icon: Eye, onClick: () => setViewApp(row) },
                      ...(row.status === 'pending'
                        ? [
                            { label: 'Approve', icon: CheckCircle, variant: 'success' as const, onClick: () => void approveApp(row) },
                            { label: 'Reject', icon: XCircle, variant: 'danger' as const, onClick: () => { setRejectApp(row); setRejectRemarks('') } },
                          ]
                        : []),
                    ]}
                  />
                ),
              },
            ]}
          />
        </>
      )}

      <AdminModal open={!!viewRow} onClose={() => setViewRow(null)} title={viewRow ? viewRow.name : 'Enquiry'} footer={<AdminBtn variant="secondary" onClick={() => setViewRow(null)}>Close</AdminBtn>}>
        {viewRow && (
          <AdminRecordFields
            fields={[
              { label: 'Subject', value: viewRow.program },
              { label: 'Email', value: viewRow.email },
              { label: 'Phone', value: viewRow.phone || '—' },
              { label: 'Received', value: viewRow.date },
              { label: 'Message', value: viewRow.message },
              { label: 'Status', value: <AdminBadge tone={statusTone[viewRow.status]}>{viewRow.status}</AdminBadge> },
            ]}
          />
        )}
      </AdminModal>

      <AdminModal
        open={!!viewApp}
        onClose={() => setViewApp(null)}
        title={viewApp ? viewApp.applicant_name : 'Application'}
        footer={<AdminBtn variant="secondary" onClick={() => setViewApp(null)}>Close</AdminBtn>}
      >
        {viewApp && (
          <AdminRecordFields
            fields={[
              { label: 'Grade', value: viewApp.grade_level ? viewApp.grade_level.toUpperCase() : '—' },
              { label: 'DOB', value: viewApp.dob || '—' },
              { label: 'Gender', value: viewApp.gender || '—' },
              { label: 'Parent', value: viewApp.parent_name || '—' },
              { label: 'Phone', value: viewApp.parent_phone || '—' },
              { label: 'Email', value: viewApp.parent_email || '—' },
              { label: 'Address', value: viewApp.address || '—' },
              { label: 'Applied', value: viewApp.date },
              { label: 'Status', value: <AdminBadge tone={appStatusTone[viewApp.status]}>{viewApp.status_label}</AdminBadge> },
              ...(viewApp.remarks ? [{ label: 'Remarks', value: viewApp.remarks }] : []),
              ...(viewApp.photo_path ? [{ label: 'Photo', value: <a href={viewApp.photo_path} target="_blank" rel="noreferrer" className="text-primary-600 underline">View photo</a> }] : []),
            ]}
          />
        )}
      </AdminModal>

      <AdminModal
        open={!!reviewRow}
        onClose={() => setReviewRow(null)}
        title={reviewRow ? `Review — ${reviewRow.name}` : 'Review'}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setReviewRow(null)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={() => {
              if (reviewRow) void updateStatus(reviewRow, 'Under Review')
              toast.success('Marked under review')
              setReviewRow(null)
            }}>Save Review</AdminBtn>
          </>
        }
      >
        {reviewRow && (
          <FormStack>
            <AdminRecordFields fields={[{ label: 'Subject', value: reviewRow.program }, { label: 'Message', value: reviewRow.message }]} />
            <Textarea label="Review Notes" rows={4} placeholder="Internal notes..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
          </FormStack>
        )}
      </AdminModal>

      <AdminModal
        open={!!rejectApp}
        onClose={() => { setRejectApp(null); setRejectRemarks('') }}
        title={rejectApp ? `Reject — ${rejectApp.applicant_name}` : 'Reject'}
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => { setRejectApp(null); setRejectRemarks('') }}>Cancel</AdminBtn>
            <AdminBtn variant="secondary" onClick={() => void confirmRejectApplication()}>Reject Application</AdminBtn>
          </>
        }
      >
        {rejectApp && (
          <FormStack>
            <AdminRecordFields fields={[{ label: 'Applicant', value: rejectApp.applicant_name }, { label: 'Parent', value: rejectApp.parent_name || '—' }]} />
            <Textarea label="Rejection remarks (optional)" rows={3} placeholder="Reason for rejection..." value={rejectRemarks} onChange={(e) => setRejectRemarks(e.target.value)} />
          </FormStack>
        )}
      </AdminModal>

      <AdminModal
        open={createOpen}
        onClose={() => {
          if (createSaving) return
          setCreateOpen(false)
        }}
        title="New Admission"
        footer={
          <>
            <AdminBtn
              variant="secondary"
              onClick={() => {
                if (createSaving) return
                setCreateOpen(false)
              }}
            >
              Cancel
            </AdminBtn>
            <AdminBtn variant="primary" onClick={() => void submitNewAdmission()}>
              {createSaving ? 'Saving...' : 'Create Admission'}
            </AdminBtn>
          </>
        }
      >
        <FormStack>
          <Input
            label="Child Name"
            requiredMark
            value={createForm.applicant_name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, applicant_name: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Date of Birth"
              type="date"
              value={createForm.dob}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, dob: e.target.value }))}
            />
            <Select
              label="Gender"
              value={createForm.gender}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, gender: e.target.value as CreateAdmissionForm['gender'] }))}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <Select
            label="Grade"
            value={createForm.grade_level}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, grade_level: e.target.value as CreateAdmissionForm['grade_level'] }))}
          >
            <option value="">Select</option>
            <option value="nursery">Nursery</option>
            <option value="lkg">LKG</option>
            <option value="ukg">UKG</option>
          </Select>
          <Input
            label="Parent Name"
            requiredMark
            value={createForm.parent_name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, parent_name: e.target.value }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Parent Phone"
              requiredMark
              value={createForm.parent_phone}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, parent_phone: e.target.value }))}
            />
            <Input
              label="Parent Email"
              type="email"
              value={createForm.parent_email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, parent_email: e.target.value }))}
            />
          </div>
          <Textarea
            label="Address"
            rows={3}
            value={createForm.address}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))}
          />
          <CameraCapture label="Student Photo (optional)" onChange={setCreatePhoto} />
        </FormStack>
      </AdminModal>
    </AdminPageShell>
  )
}
