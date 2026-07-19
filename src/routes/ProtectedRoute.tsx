import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated, selectRoles, selectAuthBootstrapped } from '@/store/slices/authSlice'
import { hasAnyRole } from '@/utils/auth'

interface ProtectedRouteProps {
  roles?: string[]
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const isAuth = useAppSelector(selectIsAuthenticated)
  const userRoles = useAppSelector(selectRoles)
  const bootstrapped = useAppSelector(selectAuthBootstrapped)

  if (!bootstrapped) {
    return null
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  if (roles && !hasAnyRole(userRoles, roles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
