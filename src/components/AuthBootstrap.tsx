import { useLocation } from 'react-router-dom'
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap'
import { useAppSelector } from '@/store/hooks'
import { selectAuthBootstrapped } from '@/store/slices/authSlice'

function isInstallOrLicensePath(pathname: string): boolean {
  return pathname.startsWith('/install') || pathname.startsWith('/license/')
}

export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const skip = isInstallOrLicensePath(location.pathname)

  useAuthBootstrap({ skip })
  const bootstrapped = useAppSelector(selectAuthBootstrapped)

  if (skip) {
    return <>{children}</>
  }

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="text-sm font-semibold text-slate-500">Loading session...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
