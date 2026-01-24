import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { token } = useAuthStore()
  const location = useLocation()

  if (!token) {
    const from = (location.state as { from?: string })?.from ?? '/'
    const isRecruiterPath = from.startsWith('/recruiter')
    const loginPath = isRecruiterPath
      ? '/auth/recruiter/login'
      : '/auth/job-seeker/login'
    return <Navigate to={loginPath} state={{ from }} replace />
  }

  return <>{children}</>
}
