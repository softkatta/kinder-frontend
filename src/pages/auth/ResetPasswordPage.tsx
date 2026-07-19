import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { GraduationCap, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authApi } from '@/api/services'
import { Input } from '@/components/ui/Input'
import { useT } from '@/i18n/LanguageContext'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { mediaUrl } from '@/utils/mediaUrl'

interface ResetForm {
  password: string
  password_confirmation: string
}

export default function ResetPasswordPage() {
  const { t } = useT()
  const p = t.pages.resetPassword
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const { logoUrl, schoolName } = useSchoolBranding()
  const logoSrc = logoUrl ? mediaUrl(logoUrl) : ''
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ResetForm>()

  const invalidLink = !email || !token

  const onSubmit = async (data: ResetForm) => {
    if (invalidLink) {
      toast.error(p.invalidLink)
      return
    }

    try {
      const res = await authApi.resetPassword({
        email,
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      toast.success(res.data.message || p.success)
      navigate('/login', { replace: true })
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const msg = ax.response?.data?.errors?.token?.[0]
        ?? ax.response?.data?.errors?.password?.[0]
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
          <p className="text-slate-500 text-sm mt-1 mb-6">{p.subtitle}</p>

          {invalidLink ? (
            <div className="space-y-4">
              <p className="text-sm text-red-600">{p.invalidLink}</p>
              <Link to="/forgot-password" className="btn-kidscholl w-full justify-center inline-flex">
                {p.requestNew}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-xs text-slate-500 rounded-lg bg-slate-50 px-3 py-2">{email}</p>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  className="pr-10"
                  placeholder={p.password}
                  required
                  minLength={8}
                  leadingIcon={<Lock className="h-4 w-4" />}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                type="password"
                placeholder={p.confirmPassword}
                required
                minLength={8}
                leadingIcon={<Lock className="h-4 w-4" />}
                {...register('password_confirmation')}
              />
              <button type="submit" className="btn-kidscholl w-full justify-center" disabled={isSubmitting}>
                {isSubmitting ? p.saving : p.save} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
