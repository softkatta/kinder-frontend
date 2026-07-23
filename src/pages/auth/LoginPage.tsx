import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import { authApi } from '@/api/services'
import { Input } from '@/components/ui/Input'
import { useT } from '@/i18n/LanguageContext'
import { kindergartenPhotos } from '@/config/kindergartenPlaceholders'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { mediaUrl } from '@/utils/mediaUrl'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCredentials, selectIsAuthenticated, selectRoles, selectAuthBootstrapped } from '@/store/slices/authSlice'
import { getPortalHome } from '@/utils/auth'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const { t } = useT()
  const p = t.pages.login
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuthenticated)
  const roles = useAppSelector(selectRoles)
  const bootstrapped = useAppSelector(selectAuthBootstrapped)
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>()
  const { logoUrl, schoolName } = useSchoolBranding()
  const logoSrc = logoUrl ? mediaUrl(logoUrl) : ''

  useEffect(() => {
    if (bootstrapped && isAuth && roles.length) {
      const home = redirectTo && redirectTo.startsWith('/') ? redirectTo : getPortalHome(roles)
      navigate(home, { replace: true })
    }
  }, [bootstrapped, isAuth, roles, navigate, redirectTo])

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data)
      const payload = res.data.data
      const token = payload?.token
      const user = payload?.user
      const userRoles = payload?.roles ?? user?.roles ?? []

      if (token && user) {
        dispatch(setCredentials({ user, token, roles: userRoles }))
        toast.success(p.success)
        const home = redirectTo && redirectTo.startsWith('/') ? redirectTo : getPortalHome(userRoles)
        navigate(home)
        return
      }
      toast.error(p.error)
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } }
      const msg = ax.response?.data?.errors?.email?.[0]
        ?? ax.response?.data?.message
        ?? (ax.response?.status === 401 || ax.response?.status === 422 ? p.error : p.offlineNote)
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-orange-500 text-white">
        <div className="absolute inset-0 opacity-20">
          <img src={kindergartenPhotos.heroWide} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-bold">
            {logoSrc ? (
              <img src={logoSrc} alt={schoolName} className="h-12 w-auto max-w-[200px] object-contain bg-white/10 rounded-xl px-2 py-1" />
            ) : (
              <>
                <GraduationCap className="h-8 w-8" />
                {schoolName || 'Little Stars'}
              </>
            )}
          </Link>
        </div>
        <div className="relative z-10 max-w-md">
          <Sparkles className="h-10 w-10 text-orange-200 mb-4" />
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">{p.heroTitle}</h1>
          <p className="text-white/85 text-lg leading-relaxed">{p.heroSubtitle}</p>
        </div>
        <p className="relative z-10 text-sm text-white/60">{p.footerNote}</p>
      </div>

      <div className="flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#FFF8F0] min-h-screen lg:min-h-0">
        <div className="w-full max-w-md px-1">
          <div className="lg:hidden mb-8 text-center">
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={p.emailOrGuestCode}
                  required
                  autoComplete="username"
                  leadingIcon={<Mail className="h-4 w-4" />}
                  {...register('email')}
                />
              </div>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  className="pr-10"
                  placeholder={p.password}
                  required
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300" />
                  {p.remember}
                </label>
                <Link to="/forgot-password" className="font-semibold text-violet-600 hover:text-orange-500">
                  {p.forgot}
                </Link>
              </div>

              <button type="submit" className="btn-kidscholl w-full justify-center" disabled={isSubmitting}>
                {isSubmitting ? p.signingIn : p.signIn} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
