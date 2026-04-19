import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  role: UserRole | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({

      token: null,
      user: null,
      role: null,
      setAuth: (token, user) =>
        set({
          token,
          user,
          role: user.role,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          role: null,
        }),
      setUser: (user) =>
        set({
          user,
          role: user.role,
        }),
    }),
    { name: 'HireEngine-auth' }
  )
)
