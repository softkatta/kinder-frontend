import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { GraduationCap, Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import { authApi } from '@/api/services'
import { Input } from '@/components/ui/Input'
import { useT } from '@/i18n/LanguageContext'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { mediaUrl } from '@/utils/mediaUrl'

interface ForgotForm {
  email: string
}

export default function ForgotPasswordPage() {
  const { t } = useT()
  const p = t.pages.forgotPassword
  const { logoUrl, schoolName } = useSchoolBranding()
  const logoSrc = logoUrl ? mediaUrl(logoUrl) : ''
  const [sent, setSent] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ForgotForm>()

  const onSubmit = async (data: ForgotForm) => {
    try {
      const res = await authApi.forgotPassword(data.email.trim())
      setSent(true)
      const resetUrl = (res.data.data as { reset_url?: string } | null)?.reset_url
      if (resetUrl) {
        setDevResetUrl(resetUrl)
      }
      toast.success(res.data.message || p.success)
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const msg = ax.response?.data?.errors?.email?.[0]
        ?? ax.response?.data?.message
        ?? p.error
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FFF8F0]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 font-display text-xl font-bold text-ink">
            {logoSrc ? (
              <img src={logoSrc} alt={schoolName} className="h-12 w-auto max-w-[220px] object-contain" />
            ) : (
              <>
                <GraduationCap className="h-7 w-7 text-violet-600" />
                {schoolName || 'Little Stars'}
              </>
            )}
          </Link>
        </div>

        <div className="kidscholl-form-card !p-8 shadow-xl">
          <h2 className="font-display text-2xl font-bold text-ink">{p.title}</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">{sent ? p.sentSubtitle : p.subtitle}</p>

          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">{p.checkInbox}</p>
              {devResetUrl && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 break-all">
                  <p className="font-semibold mb-1">{p.devLink}</p>
                  <a href={devResetUrl} className="text-violet-700 underline">{devResetUrl}</a>
                </div>
              )}
              <Link to="/login" className="btn-kidscholl w-full justify-center inline-flex">
                <ArrowLeft className="h-4 w-4" /> {p.backToLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                type="email"
                placeholder={p.email}
                required
                autoComplete="email"
                leadingIcon={<Mail className="h-4 w-4" />}
                {...register('email')}
              />
              <button type="submit" className="btn-kidscholl w-full justify-center" disabled={isSubmitting}>
                {isSubmitting ? p.sending : p.sendLink} <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-violet-600 hover:text-orange-500">
                <ArrowLeft className="h-4 w-4" /> {p.backToLogin}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
