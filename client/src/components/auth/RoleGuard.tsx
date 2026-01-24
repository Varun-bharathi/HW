import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  children: ReactNode
  role: UserRole
}

export function RoleGuard({ children, role }: RoleGuardProps) {
  const { role: userRole } = useAuthStore()

  if (userRole !== role) {
    const redirect = userRole === 'recruiter' ? '/recruiter/dashboard' : '/seeker/dashboard'
    return <Navigate to={redirect} replace />
  }

  return <>{children}</>
}
