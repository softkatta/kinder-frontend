import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Shield } from 'lucide-react'
import { attendanceApi } from '@/api/services'
import { useAppSelector } from '@/store/hooks'
import { selectAuthBootstrapped, selectIsAuthenticated, selectRoles } from '@/store/slices/authSlice'
import { getPortalHome, hasAnyRole } from '@/utils/auth'

export default function ScanGatePage() {
  const { scanCode } = useParams<{ scanCode: string }>()
  const navigate = useNavigate()
  const bootstrapped = useAppSelector(selectAuthBootstrapped)
  const isAuth = useAppSelector(selectIsAuthenticated)
  const roles = useAppSelector(selectRoles)

  useEffect(() => {
    if (!bootstrapped || !isAuth || !scanCode) return

    let cancelled = false

    void (async () => {
      try {
        const res = await attendanceApi.resolveScan(scanCode)
        const type = res.data.data?.type as string | undefined
        if (cancelled) return

        if (type === 'guest') {
          navigate(`/admin/guests/scan?c=${encodeURIComponent(scanCode)}`, { replace: true })
          return
        }

        if (hasAnyRole(roles, ['teacher'])) {
          navigate(`/teacher/attendance?c=${encodeURIComponent(scanCode)}`, { replace: true })
          return
        }

        if (hasAnyRole(roles, ['super_admin'])) {
          navigate(`/admin/attendance/qr?c=${encodeURIComponent(scanCode)}`, { replace: true })
          return
        }
      } catch {
        if (cancelled) return
        if (hasAnyRole(roles, ['teacher'])) {
          navigate(`/teacher/attendance?c=${encodeURIComponent(scanCode)}`, { replace: true })
          return
        }
        if (hasAnyRole(roles, ['super_admin'])) {
          navigate(`/admin/attendance/qr?c=${encodeURIComponent(scanCode)}`, { replace: true })
          return
        }
      }

      if (!cancelled) {
        navigate(getPortalHome(roles), { replace: true })
      }
    })()

    return () => { cancelled = true }
  }, [bootstrapped, isAuth, scanCode, roles, navigate])

  if (!bootstrapped) {
    return null
  }

  if (!isAuth) {
    const redirect = scanCode ? `/s/${scanCode}` : '/login'
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="kidscholl-form-card max-w-md w-full text-center !p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink">Staff login required</h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            QR verify करण्यासाठी school staff login आवश्यक आहे. Login शिवाय कोणतीही माहिती दिसणार नाही.
          </p>
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="btn-kidscholl mt-6 inline-flex w-full justify-center">
            Staff Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500">
      Verifying scan...
    </div>
  )
}
