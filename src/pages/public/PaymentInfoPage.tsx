import { useState } from 'react'
import { publicApi } from '@/api/services'
import { usePaymentInfo } from '@/hooks/useSchoolBranding'
import { Copy, Upload, CreditCard, Building2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import { PublicPageHero } from '@/components/design/PublicPageHero'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormCard, FormGrid, FormStack } from '@/components/ui/Form'
import { SuccessModal } from '@/components/ui/SuccessModal'
import { FadeIn } from '@/components/ui/Motion'
import { useT } from '@/i18n/LanguageContext'
import { SectionDecorations } from '@/components/design/SectionDecorations'

export default function PaymentInfoPage() {
  const { t } = useT()
  const p = t.pages.payment
  const { data: settings = {} } = usePaymentInfo()
  const [form, setForm] = useState({
    admission_number: '', payer_name: '', payer_phone: '', amount: '', payment_method: 'upi', payment_reference: '', remarks: '',
  })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(p.copied)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let proofPath = ''
      if (proofFile) {
        const fd = new FormData()
        fd.append('file', proofFile)
        const up = await publicApi.uploadPaymentProof(fd)
        proofPath = up.data.data?.path || ''
      }
      await publicApi.submitPayment({ ...form, amount: Number(form.amount), transaction_proof_path: proofPath })
      setForm({ admission_number: '', payer_name: '', payer_phone: '', amount: '', payment_method: 'upi', payment_reference: '', remarks: '' })
      setProofFile(null)
      setSuccessOpen(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || p.submitError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PublicPageHero imageKey="page_payment_image" label={p.label} title={p.title} subtitle={p.subtitle} />
      <section className="section bg-[#FFF8F0] relative overflow-hidden">
        <SectionDecorations variant="pricing" />
        <div className="mx-auto max-w-3xl px-4 space-y-6 relative z-10">
          {settings.upi_id && (
            <FadeIn>
              <div className="kidscholl-form-card">
                <h2 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-orange-500" /> {p.upi}</h2>
                <div className="flex items-center justify-between bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <span className="font-mono font-bold text-ink">{settings.upi_id}</span>
                  <button type="button" onClick={() => copy(settings.upi_id)} className="btn-kidscholl-outline !py-2 !px-3"><Copy className="h-4 w-4" /></button>
                </div>
              </div>
            </FadeIn>
          )}
          {settings.upi_qr_url && (
            <FadeIn delay={0.03}>
              <div className="kidscholl-form-card text-center">
                <h2 className="font-display font-bold text-lg text-ink mb-4 flex items-center justify-center gap-2">
                  <QrCode className="h-5 w-5 text-sky-500" /> Scan & Pay
                </h2>
                <img src={settings.upi_qr_url} alt="UPI QR" className="mx-auto h-48 w-48 rounded-xl border border-slate-200 object-contain" />
              </div>
            </FadeIn>
          )}
          <FadeIn delay={0.05}>
            <div className="kidscholl-form-card">
              <h2 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2"><Building2 className="h-5 w-5 text-violet-500" /> {p.bankDetails}</h2>
              <dl className="space-y-3 text-sm">
                {[[p.accountName, settings.account_name], [p.accountNumber, settings.account_number], ['IFSC', settings.ifsc_code], [p.bank, settings.bank_name], [p.branch, settings.branch]]
                  .filter(([, v]) => v).map(([label, value]) => (
                    <div key={label as string} className="flex justify-between border-b border-slate-100 pb-2">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <FormCard title={p.confirmTitle} subtitle={p.confirmSubtitle}>
              <form onSubmit={handleSubmit}>
                <FormStack>
                  <Input label={p.admissionNo} requiredMark value={form.admission_number} onChange={(e) => setForm({ ...form, admission_number: e.target.value })} />
                  <FormGrid>
                    <Input label={p.yourName} requiredMark value={form.payer_name} onChange={(e) => setForm({ ...form, payer_name: e.target.value })} />
                    <Input label={p.phone} requiredMark value={form.payer_phone} onChange={(e) => setForm({ ...form, payer_phone: e.target.value })} />
                  </FormGrid>
                  <FormGrid>
                    <Input label={p.amount} type="number" requiredMark value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    <Select label="Payment Method" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                      <option value="upi">UPI</option>
                      <option value="gpay">Google Pay</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="paytm">Paytm</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </Select>
                  </FormGrid>
                  <Input label={p.reference} value={form.payment_reference} onChange={(e) => setForm({ ...form, payment_reference: e.target.value })} />
                  <div className="form-field">
                    <span className="form-label">{p.uploadProof}</span>
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-orange-200 rounded-xl p-6 cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition mt-1.5">
                      <Upload className="h-5 w-5 text-orange-400" />
                      <span className="text-sm text-slate-500">{proofFile ? proofFile.name : p.chooseFile}</span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
                  <button type="submit" className="btn-kidscholl w-full justify-center" disabled={submitting}>
                    {submitting ? p.submitting : p.submit}
                  </button>
                </FormStack>
              </form>
            </FormCard>
          </FadeIn>
        </div>
      </section>
      <SuccessModal open={successOpen} title={p.successTitle} message={p.successMessage} onClose={() => setSuccessOpen(false)} />
    </div>
  )
}
