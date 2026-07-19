import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/api/services'

interface AuthState {
  user: User | null
  token: string | null
  roles: string[]
  isAuthenticated: boolean
  loading: boolean
  bootstrapped: boolean
}

const storedToken = localStorage.getItem('auth_token')
const storedRoles = (() => {
  try {
    const raw = localStorage.getItem('auth_roles')
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
})()

const initialState: AuthState = {
  user: null,
  token: storedToken,
  roles: storedToken ? storedRoles : [],
  isAuthenticated: !!storedToken,
  loading: false,
  bootstrapped: !storedToken,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; roles: string[] }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.roles = action.payload.roles
      state.isAuthenticated = true
      localStorage.setItem('auth_token', action.payload.token)
      localStorage.setItem('auth_roles', JSON.stringify(action.payload.roles))
      if (action.payload.user.tenant_id) {
        localStorage.setItem('tenant_id', String(action.payload.user.tenant_id))
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      if (action.payload.roles?.length) {
        state.roles = action.payload.roles
        localStorage.setItem('auth_roles', JSON.stringify(action.payload.roles))
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.roles = []
      state.isAuthenticated = false
      state.bootstrapped = true
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_roles')
      localStorage.removeItem('tenant_id')
    },
    setBootstrapped: (state, action: PayloadAction<boolean>) => {
      state.bootstrapped = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setCredentials, setUser, logout, setLoading, setBootstrapped } = authSlice.actions
export default authSlice.reducer

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectRoles = (state: { auth: AuthState }) => state.auth.roles
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAuthBootstrapped = (state: { auth: AuthState }) => state.auth.bootstrapped
