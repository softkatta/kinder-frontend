import { useCallback, useEffect, useState } from 'react'
import { Award, FileText, Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminPageHeader, AdminPageShell, AdminBtn, AdminBadge } from '@/components/admin/AdminUi'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { examApi } from '@/api/services'
import { printExamDocument, type ExamDocumentView } from '@/utils/printExamDocument'

interface ExamResultRow {
  id: number
  student_name: string
  roll_number?: string | null
  class_name: string
  marks_obtained: number
  grade?: string | null
  result_status: string
  marksheet_printed_at?: string | null
  certificate_printed_at?: string | null
  exam?: {
    name: string
    max_marks: number
    academic_year?: { name: string }
  }
}

export default function AdminMarksheetsPage() {
  const [rows, setRows] = useState<ExamResultRow[]>([])
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await examApi.allResults()
      setRows(res.data.data ?? [])
    } catch {
      toast.error('Failed to load results')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const printDoc = async (id: number, type: 'marksheet' | 'certificate') => {
    setPrinting(id)
    try {
      const res = type === 'marksheet'
        ? await examApi.marksheetView(id)
        : await examApi.certificateView(id)
      const doc = res.data.data as ExamDocumentView
      printExamDocument({ ...doc, type })
      await examApi.markPrinted(id, type)
      toast.success(type === 'marksheet' ? 'Marksheet sent to printer' : 'Certificate sent to printer')
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Print failed')
    } finally {
      setPrinting(null)
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Marksheets & Certificates"
        subtitle="Print marksheets and certificates for exam results."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Marksheets' }]}
      />

      {loading && rows.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8">Loading results...</p>
      )}

      <AdminDataTable<ExamResultRow>
        data={rows}
        rowKey={(row) => row.id}
        onRefresh={load}
        title="Exam Results"
        subtitle={`${rows.length} student results`}
        searchPlaceholder="Search student, roll, class..."
        searchKeys={['student_name', 'roll_number', 'class_name']}
        pageSize={10}
        filterSubtitle="result status"
        filters={[
          {
            key: 'result',
            label: 'Result',
            options: [
              { value: 'all', label: 'All' },
              { value: 'pass', label: 'Pass' },
              { value: 'fail', label: 'Fail' },
              { value: 'absent', label: 'Absent' },
            ],
          },
        ]}
        filterConfigs={[
          { key: 'result', defaultValue: 'all', match: (row, v) => v === 'all' || row.result_status === v },
        ]}
        columns={[
          {
            key: 'student_name',
            header: 'Student',
            sortable: true,
            cell: (row) => (
              <div>
                <p className="font-semibold text-ink">{row.student_name}</p>
                <p className="text-xs text-slate-500">{row.roll_number || '—'} · {row.class_name}</p>
              </div>
            ),
          },
          {
            key: 'exam',
            header: 'Exam',
            cell: (row) => (
              <div>
                <p className="text-sm text-ink">{row.exam?.name ?? '—'}</p>
                <p className="text-xs text-slate-500">{row.exam?.academic_year?.name}</p>
              </div>
            ),
          },
          {
            key: 'marks',
            header: 'Marks',
            cell: (row) => (
              <span className="font-mono text-sm">
                {row.marks_obtained}/{row.exam?.max_marks ?? '—'}
                {row.grade && <span className="ml-2 text-violet-600 font-bold">{row.grade}</span>}
              </span>
            ),
          },
          {
            key: 'result_status',
            header: 'Result',
            cell: (row) => (
              <AdminBadge tone={row.result_status === 'pass' ? 'success' : row.result_status === 'fail' ? 'danger' : 'neutral'}>
                {row.result_status}
              </AdminBadge>
            ),
          },
          {
            key: 'printed',
            header: 'Printed',
            cell: (row) => (
              <div className="text-xs text-slate-500 space-y-0.5">
                {row.marksheet_printed_at && <p>MS: {new Date(row.marksheet_printed_at).toLocaleDateString()}</p>}
                {row.certificate_printed_at && <p>Cert: {new Date(row.certificate_printed_at).toLocaleDateString()}</p>}
                {!row.marksheet_printed_at && !row.certificate_printed_at && '—'}
              </div>
            ),
          },
          {
            key: 'actions',
            header: 'Print',
            className: 'w-52',
            cell: (row) => (
              <div className="flex flex-wrap gap-2">
                <AdminBtn
                  variant="secondary"
                  className="!px-2.5 !py-1.5 text-xs"
                  disabled={printing === row.id}
                  onClick={() => printDoc(row.id, 'marksheet')}
                >
                  <FileText className="h-3.5 w-3.5" /> Marksheet
                </AdminBtn>
                <AdminBtn
                  variant="primary"
                  className="!px-2.5 !py-1.5 text-xs"
                  disabled={printing === row.id}
                  onClick={() => printDoc(row.id, 'certificate')}
                >
                  <Award className="h-3.5 w-3.5" /> Certificate
                </AdminBtn>
              </div>
            ),
          },
        ]}
      />

      <div className="mt-4 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4 flex items-start gap-3 text-sm text-slate-600">
        <Printer className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <p>
            Print dialog उघडेल — PDF save नाही. Printer select करून direct print करा. Print झाल्यानंतर record automatically marked होते.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Certificate आणि Marksheet — <strong>Template Designer</strong> templates वापरतात (certificate: achivement-certificate, marksheet: default-marksheet).
            Design बदलण्यासाठी Admin → Template Designer. Verification: <code className="text-violet-600">/verify/CERT-YYYY-####</code>
          </p>
        </div>
      </div>
    </AdminPageShell>
  )
}
