import type { User, UserRole } from '@/types'

/** Mock auth for development. Replace with real API calls. */
export interface LoginPayload {
  email: string
  password: string
  role: UserRole
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  company?: string // recruiter
}

export interface AuthResponse {
  token: string
  user: User
}

const MOCK_TOKEN = 'mock-jwt-token'

export async function mockLogin(p: LoginPayload): Promise<AuthResponse> {
  await delay(600)
  const id = 'u-' + Math.random().toString(36).slice(2, 9)
  return {
    token: MOCK_TOKEN,
    user: {
      id,
      email: p.email,
      role: p.role,
    },
  }
}

export async function mockRegisterRecruiter(p: RegisterPayload): Promise<AuthResponse> {
  await delay(800)
  const id = 'u-' + Math.random().toString(36).slice(2, 9)
  return {
    token: MOCK_TOKEN,
    user: { id, email: p.email, role: 'recruiter' },
  }
}

export async function mockRegisterJobSeeker(p: Omit<RegisterPayload, 'company'>): Promise<AuthResponse> {
  await delay(800)
  const id = 'u-' + Math.random().toString(36).slice(2, 9)
  return {
    token: MOCK_TOKEN,
    user: { id, email: p.email, role: 'job_seeker' },
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
