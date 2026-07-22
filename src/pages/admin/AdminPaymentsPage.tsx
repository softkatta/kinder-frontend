import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Download, Eye, Plus, Trash2, IndianRupee, CheckCircle, Clock, XCircle,
  Settings, QrCode, Wallet, Banknote, RotateCcw, FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  AdminPageHeader, AdminPageShell, AdminBadge, AdminBtn, AdminTableActions,
  AdminModal, AdminRecordFields, AdminPanel,
} from '@/components/admin/AdminUi'
import { AdminAvatar, AdminStatGrid } from '@/components/admin/AdminStats'
import { AdminDataTable } from '@/components/admin/AdminDataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormGrid } from '@/components/ui/Form'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { paymentApi } from '@/api/services'
import { invalidatePaymentInfo } from '@/hooks/useSchoolBranding'
import { useTableBulkDelete } from '@/hooks/useTableBulkDelete'
import { mediaUrl } from '@/utils/mediaUrl'

interface PaymentRow {
  id: number
  student_name?: string | null
  payer_name: string
  payer_phone?: string | null
  amount: number
  amount_label: string
  payment_method: string
  method_label: string
  payment_reference?: string | null
  status: string
  status_label: string
  date: string
  remarks?: string | null
}

interface PaymentSettings {
  upi_id?: string
  account_name?: string
  account_number?: string
  ifsc_code?: string
  bank_name?: string
  branch?: string
  upi_qr_path?: string
  upi_qr_url?: string
  enable_upi?: boolean
  enable_cash?: boolean
  enable_qr?: boolean
  enable_razorpay?: boolean
  razorpay_key_id?: string
  razorpay_key_secret?: string
  razorpay_key_secret_set?: boolean
  razorpay_webhook_secret?: string
  razorpay_webhook_secret_set?: boolean
  payment_note?: string
}

const methodColors: Record<string, string> = {
  upi: 'bg-violet-50 text-violet-700',
  cash: 'bg-emerald-50 text-emerald-700',
  qr: 'bg-sky-50 text-sky-700',
  razorpay: 'bg-primary-50 text-primary-700',
}

const emptyRecord = {
  student_name: '',
  admission_number: '',
  payer_name: '',
  payer_phone: '',
  amount: '',
  payment_method: 'cash',
  payment_reference: '',
  remarks: '',
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'transactions' | 'setup'>('transactions')
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [viewPayment, setViewPayment] = useState<PaymentRow | null>(null)
  const [recordOpen, setRecordOpen] = useState(false)
  const [recordForm, setRecordForm] = useState(emptyRecord)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<PaymentSettings>({})
  const [settingsForm, setSettingsForm] = useState<PaymentSettings>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await paymentApi.list()
      setPayments(res.data.data ?? [])
    } catch {
      toast.error('Failed to load payments')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSettings = useCallback(async () => {
    try {
      const res = await paymentApi.settings()
      const data = res.data.data as PaymentSettings
      setSettings(data)
      setSettingsForm(data)
    } catch {
      toast.error('Failed to load payment settings')
    }
  }, [])

  useEffect(() => { load(); loadSettings() }, [load, loadSettings])

  const pending = payments.filter((p) => p.status === 'pending').length
  const verified = payments.filter((p) => p.status === 'verified').length

  const verify = async (row: PaymentRow, approved: boolean) => {
    try {
      await paymentApi.verify(row.id, approved)
      toast.success(approved ? 'Payment verified' : 'Payment rejected')
      load()
      if (viewPayment?.id === row.id) {
        setViewPayment({ ...row, status: approved ? 'verified' : 'rejected', status_label: approved ? 'Verified' : 'Rejected' })
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const { selection, bulkDelete, dropFromSelection, bulkDeleting } = useTableBulkDelete<PaymentRow>({
    deleteOne: async (id) => { await paymentApi.delete(id) },
    onDone: load,
    confirmMany: (ids) => `Delete ${ids.length} selected payment record(s)?`,
  })

  const remove = async (row: PaymentRow) => {
    try {
      await paymentApi.delete(row.id)
      dropFromSelection(row.id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const recordPayment = async () => {
    if (!recordForm.payer_name || !recordForm.amount) {
      toast.error('Payer name and amount required')
      return
    }
    setSaving(true)
    try {
      await paymentApi.record({
        ...recordForm,
        amount: Number(recordForm.amount),
        student_name: recordForm.student_name || null,
        admission_number: recordForm.admission_number || null,
        payer_phone: recordForm.payer_phone || null,
        payment_reference: recordForm.payment_reference || null,
        remarks: recordForm.remarks || null,
      })
      toast.success('Payment recorded')
      setRecordOpen(false)
      setRecordForm(emptyRecord)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to record')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const res = await paymentApi.exportCsv()
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export downloaded')
    } catch {
      toast.error('Export failed')
    }
  }

  const downloadReceipt = async (row: PaymentRow) => {
    try {
      const res = await paymentApi.downloadReceipt(row.id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payment-receipt-${row.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Receipt downloaded')
    } catch {
      toast.error('Receipt download failed')
    }
  }

  const refundPayment = async (row: PaymentRow) => {
    const remarks = window.prompt('Refund remarks (optional):') ?? undefined
    try {
      await paymentApi.refund(row.id, remarks)
      toast.success('Payment refunded')
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Refund failed')
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await paymentApi.updateSettings({ ...settingsForm } as Record<string, unknown>)
      setSettings(res.data.data)
      setSettingsForm(res.data.data)
      invalidatePaymentInfo(queryClient)
      toast.success('Payment settings saved')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Payments"
        subtitle="UPI, QR, Cash verify करा — fee collection manage करा."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Payments' }]}
        actions={
          tab === 'transactions' ? (
            <>
              <AdminBtn variant="secondary" onClick={() => void handleExport()}>
                <Download className="h-4 w-4" /> Export
              </AdminBtn>
              <AdminBtn variant="primary" onClick={() => setRecordOpen(true)}>
                <Plus className="h-4 w-4" /> Record Payment
              </AdminBtn>
            </>
          ) : (
            <AdminBtn variant="primary" onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </AdminBtn>
          )
        }
      />

      <div className="admin-page-tabs mb-4">
        {([
          { id: 'transactions' as const, label: 'Transactions', icon: IndianRupee },
          { id: 'setup' as const, label: 'UPI / QR / Cash Setup', icon: Settings },
        ]).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'admin-page-tab admin-page-tab--active' : 'admin-page-tab'}
          >
            <t.icon className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'transactions' && (
        <>
          <AdminStatGrid
            stats={[
              { label: 'Total', value: payments.length, change: 'All methods', icon: IndianRupee, tone: 'sky' },
              { label: 'Verified', value: verified, change: `${payments.length ? Math.round((verified / payments.length) * 100) : 0}% cleared`, icon: CheckCircle, tone: 'emerald' },
              { label: 'Pending', value: pending, change: 'Needs action', icon: Clock, tone: 'amber' },
            ]}
          />

          {loading && payments.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">Loading payments...</p>
          )}

          <AdminDataTable<PaymentRow>
            data={payments}
            rowKey={(row) => row.id}
            onRefresh={load}
            title="All Transactions"
            subtitle={`${payments.length} payment records`}
            searchPlaceholder="Search student, payer, reference..."
            searchKeys={['student_name', 'payer_name', 'payment_reference']}
            pageSize={8}
            initialSort={{ key: 'date', dir: 'desc' }}
            getSortValue={(row, key) => {
              if (key === 'id') return row.id
              if (key === 'date') return row.date
              return String(row[key as keyof PaymentRow] ?? '')
            }}
            filterSubtitle="status & payment method"
            filters={[
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'rejected', label: 'Rejected' },
                  { value: 'refunded', label: 'Refunded' },
                ],
              },
              {
                key: 'method',
                label: 'Method',
                options: [
                  { value: 'all', label: 'All' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'cash', label: 'Cash' },
                  { value: 'qr', label: 'QR' },
                  { value: 'razorpay', label: 'Razorpay' },
                ],
              },
            ]}
            filterConfigs={[
              { key: 'status', defaultValue: 'all', match: (row, v) => v === 'all' || row.status === v },
              { key: 'method', defaultValue: 'all', match: (row, v) => v === 'all' || row.payment_method === v },
            ]}
            selection={selection}
            onBulkDelete={bulkDelete}
            bulkDeleting={bulkDeleting}
            columns={[
              {
                key: 'student',
                header: 'Student / Payer',
                sortable: true,
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    <AdminAvatar name={row.student_name || row.payer_name} size="sm" />
                    <div>
                      <p className="font-semibold text-ink">{row.student_name || row.payer_name}</p>
                      <p className="text-xs text-slate-500">{row.payer_name}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'amount',
                header: 'Amount',
                sortable: true,
                className: 'font-display font-bold text-violet-700',
                cell: (row) => row.amount_label,
              },
              {
                key: 'method',
                header: 'Method',
                cell: (row) => (
                  <span className={`rounded-lg px-2 py-1 text-xs font-bold ${methodColors[row.payment_method] ?? 'bg-slate-100 text-slate-600'}`}>
                    {row.method_label}
                  </span>
                ),
              },
              {
                key: 'ref',
                header: 'Reference',
                className: 'font-mono text-xs text-slate-400',
                cell: (row) => row.payment_reference || '—',
              },
              {
                key: 'status',
                header: 'Status',
                cell: (row) => (
                  <AdminBadge tone={
                    row.status === 'verified' ? 'success'
                      : row.status === 'rejected' ? 'danger'
                        : row.status === 'refunded' ? 'neutral'
                          : 'warning'
                  }>
                    {row.status_label}
                  </AdminBadge>
                ),
              },
              { key: 'date', header: 'Date', className: 'text-slate-500', cell: (row) => row.date },
              {
                key: 'action',
                header: 'Action',
                headerClassName: 'text-right',
                className: 'text-right',
                cell: (row) => (
                  <AdminTableActions
                    actions={[
                      { label: 'View', icon: Eye, onClick: () => setViewPayment(row) },
                      ...(row.status === 'verified' || row.status === 'refunded'
                        ? [{ label: 'Receipt', icon: FileText, onClick: () => void downloadReceipt(row) }]
                        : []),
                      ...(row.status === 'pending'
                        ? [
                            { label: 'Verify', icon: CheckCircle, variant: 'success' as const, onClick: () => verify(row, true) },
                            { label: 'Reject', icon: XCircle, variant: 'danger' as const, onClick: () => verify(row, false) },
                          ]
                        : []),
                      ...(row.status === 'verified'
                        ? [{ label: 'Refund', icon: RotateCcw, variant: 'danger' as const, onClick: () => void refundPayment(row) }]
                        : []),
                      { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => remove(row) },
                    ]}
                  />
                ),
              },
            ]}
          />
        </>
      )}

      {tab === 'setup' && (
        <div className="space-y-6">
          <p className="admin-settings-sync-note">
            Payment method toggles sync with <Link to="/admin/settings">Settings → Payment Gateway</Link>. Save on either page updates the same configuration.
          </p>
          <AdminPanel title="Payment Methods" subtitle="कोणते channels enable करायचे ते निवडा">
            <FormGrid cols={2}>
              {([
                { key: 'enable_upi', label: 'UPI Payments', icon: Wallet, desc: 'Manual UPI + reference verify' },
                { key: 'enable_qr', label: 'QR Scan Pay', icon: QrCode, desc: 'UPI QR code on website' },
                { key: 'enable_cash', label: 'Cash at Office', icon: Banknote, desc: 'Admin records cash payments' },
                { key: 'enable_razorpay', label: 'Razorpay Online', icon: IndianRupee, desc: 'Online card/UPI gateway' },
              ] as const).map((m) => (
                <Checkbox
                  key={m.key}
                  label={m.label}
                  description={m.desc}
                  checked={Boolean(settingsForm[m.key])}
                  onChange={(e) => setSettingsForm({ ...settingsForm, [m.key]: e.target.checked })}
                  className="!items-start"
                />
              ))}
            </FormGrid>
          </AdminPanel>

          <AdminPanel title="UPI & Bank Details" subtitle="Website वर parents ला दिसेल">
            <FormGrid>
              <Input label="UPI ID" value={settingsForm.upi_id ?? ''} onChange={(e) => setSettingsForm({ ...settingsForm, upi_id: e.target.value })} placeholder="school@upi" />
              <Input label="Account Name" value={settingsForm.account_name ?? ''} onChange={(e) => setSettingsForm({ ...settingsForm, account_name: e.target.value })} />
              <Input label="Account Number" value={settingsForm.account_number ?? ''} onChange={(e) => setSettingsForm({ ...settingsForm, account_number: e.target.value })} />
              <Input label="IFSC Code" value={settingsForm.ifsc_code ?? ''} onChange={(e) => setSettingsForm({ ...settingsForm, ifsc_code: e.target.value })} />
              <Input label="Bank Name" value={settingsForm.bank_name ?? ''} onChange={(e) => setSettingsForm({ ...settingsForm, bank_name: e.target.value })} />
              <Input label="Branch" value={settingsForm.branch ?? ''} onChange={(e) => setSettingsForm({ ...settingsForm, branch: e.target.value })} />
            </FormGrid>
          </AdminPanel>

          <AdminPanel title="UPI QR Code Image" subtitle="Parents QR scan करून pay करू शकतील">
            <FormGrid className="items-start">
              <ImageUpload
                label="Upload QR Image"
                value={settingsForm.upi_qr_path ?? ''}
                onChange={(p) => setSettingsForm({ ...settingsForm, upi_qr_path: p })}
              />
              {(settings.upi_qr_url || settingsForm.upi_qr_path) && (
                <div className="rounded-xl border border-slate-200 p-4 text-center">
                  <img src={mediaUrl(settingsForm.upi_qr_path) || settings.upi_qr_url} alt="UPI QR" className="mx-auto h-40 w-40 object-contain" />
                  <p className="text-xs text-slate-500 mt-2">Preview on payment page</p>
                </div>
              )}
            </FormGrid>
          </AdminPanel>

          <AdminPanel title="Razorpay (Optional)" subtitle="Key Secret for checkout; Webhook Secret for callbacks only">
            <Input label="Razorpay Key ID" value={settingsForm.razorpay_key_id ?? ''} onChange={(e) => setSettingsForm({ ...settingsForm, razorpay_key_id: e.target.value })} placeholder="rzp_live_xxx" className="max-w-md" />
            <Input
              label={settingsForm.razorpay_key_secret_set ? 'Key Secret (leave blank to keep)' : 'Razorpay Key Secret'}
              type="password"
              value={settingsForm.razorpay_key_secret ?? ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, razorpay_key_secret: e.target.value })}
              placeholder="••••••••"
              className="max-w-md mt-3"
            />
            <Input
              label={settingsForm.razorpay_webhook_secret_set ? 'Webhook Secret (leave blank to keep)' : 'Webhook Secret'}
              type="password"
              value={settingsForm.razorpay_webhook_secret ?? ''}
              onChange={(e) => setSettingsForm({ ...settingsForm, razorpay_webhook_secret: e.target.value })}
              placeholder="••••••••"
              className="max-w-md mt-3"
            />
          </AdminPanel>
        </div>
      )}

      <AdminModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        title="Record Payment (Cash / UPI / QR)"
        wide
        footer={
          <>
            <AdminBtn variant="secondary" onClick={() => setRecordOpen(false)}>Cancel</AdminBtn>
            <AdminBtn variant="primary" onClick={recordPayment} disabled={saving}>{saving ? 'Saving...' : 'Save'}</AdminBtn>
          </>
        }
      >
        <FormGrid>
          <Input label="Student Name" value={recordForm.student_name} onChange={(e) => setRecordForm({ ...recordForm, student_name: e.target.value })} />
          <Input label="Admission No." value={recordForm.admission_number} onChange={(e) => setRecordForm({ ...recordForm, admission_number: e.target.value })} />
          <Input label="Payer Name" requiredMark value={recordForm.payer_name} onChange={(e) => setRecordForm({ ...recordForm, payer_name: e.target.value })} />
          <Input label="Phone" value={recordForm.payer_phone} onChange={(e) => setRecordForm({ ...recordForm, payer_phone: e.target.value })} />
          <Input label="Amount (₹)" requiredMark type="number" value={recordForm.amount} onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })} />
          <Select label="Method" value={recordForm.payment_method} onChange={(e) => setRecordForm({ ...recordForm, payment_method: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="qr">QR</option>
            <option value="razorpay">Razorpay</option>
          </Select>
          <div className="span-2">
            <Input label="Reference / Receipt No." value={recordForm.payment_reference} onChange={(e) => setRecordForm({ ...recordForm, payment_reference: e.target.value })} />
          </div>
          <div className="span-2">
            <Textarea label="Remarks" rows={3} value={recordForm.remarks} onChange={(e) => setRecordForm({ ...recordForm, remarks: e.target.value })} />
          </div>
        </FormGrid>
        <p className="text-xs text-slate-500 mt-3">Cash payment auto-verified होते. UPI/QR manual entry pending राहते — नंतर Verify करा.</p>
      </AdminModal>

      <AdminModal
        open={!!viewPayment}
        onClose={() => setViewPayment(null)}
        title={viewPayment ? `Payment — ${viewPayment.payer_name}` : 'Payment'}
        footer={
          viewPayment?.status === 'pending' ? (
            <>
              <AdminBtn variant="secondary" onClick={() => setViewPayment(null)}>Close</AdminBtn>
              <AdminBtn variant="primary" onClick={() => verify(viewPayment, true)}>Verify</AdminBtn>
            </>
          ) : (
            <AdminBtn variant="secondary" onClick={() => setViewPayment(null)}>Close</AdminBtn>
          )
        }
      >
        {viewPayment && (
          <AdminRecordFields
            fields={[
              { label: 'Student', value: viewPayment.student_name || '—' },
              { label: 'Payer', value: viewPayment.payer_name },
              { label: 'Amount', value: viewPayment.amount_label },
              { label: 'Method', value: viewPayment.method_label },
              { label: 'Reference', value: viewPayment.payment_reference || '—' },
              { label: 'Date', value: viewPayment.date },
              { label: 'Status', value: <AdminBadge tone={viewPayment.status === 'verified' ? 'success' : viewPayment.status === 'rejected' ? 'danger' : 'warning'}>{viewPayment.status_label}</AdminBadge> },
            ]}
          />
        )}
      </AdminModal>
    </AdminPageShell>
  )
}
