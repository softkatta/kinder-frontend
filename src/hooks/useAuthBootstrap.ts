import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials, setBootstrapped, logout } from '@/store/slices/authSlice'
import { authApi } from '@/api/services'

export function useAuthBootstrap(options?: { skip?: boolean }) {
  const dispatch = useAppDispatch()
  const skip = options?.skip ?? false

  useEffect(() => {
    if (skip) {
      dispatch(setBootstrapped(true))
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      dispatch(setBootstrapped(true))
      return
    }

    authApi.me()
      .then((res) => {
        const user = res.data.data
        dispatch(setCredentials({
          user,
          token,
          roles: user.roles ?? [],
        }))
      })
      .catch(() => {
        dispatch(logout())
      })
      .finally(() => {
        dispatch(setBootstrapped(true))
      })
  }, [dispatch, skip])
}
