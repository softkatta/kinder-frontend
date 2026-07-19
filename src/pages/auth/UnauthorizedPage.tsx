import { Link } from 'react-router-dom'
import { ShieldAlert, LogIn } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { selectRoles } from '@/store/slices/authSlice'
import { getPortalHome } from '@/utils/auth'

export default function UnauthorizedPage() {
  const roles = useAppSelector(selectRoles)
  const home = roles.length ? getPortalHome(roles) : '/login'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-6">
      <div className="text-center max-w-md">
        <ShieldAlert className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold text-ink">Access denied</h1>
        <p className="text-slate-600 mt-2 mb-6">You do not have permission to view this page.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={home} className="btn-kidscholl inline-flex justify-center">
            Go to my portal
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white">
            <LogIn className="h-4 w-4" /> Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
