import type { User, UserRole } from '@/types'

const BASE = import.meta.env.VITE_API_URL || '/api'

export interface LoginPayload {
  email: string
  password: string
  role: UserRole
}

export interface RegisterRecruiterPayload {
  email: string
  password: string
  full_name: string
  company?: string
}

export interface RegisterSeekerPayload {
  email: string
  password: string
  full_name: string
}

export interface AuthResponse {
  token: string
  user: User
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
  })
  const data = (await res.json().catch(() => ({}))) as { message?: string }
  if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`)
  return data as T
}

export async function login(p: LoginPayload): Promise<AuthResponse> {
  return fetchJson<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(p),
  })
}

export async function registerRecruiter(p: RegisterRecruiterPayload): Promise<AuthResponse> {
  return fetchJson<AuthResponse>('/auth/register/recruiter', {
    method: 'POST',
    body: JSON.stringify(p),
  })
}

export async function registerJobSeeker(p: RegisterSeekerPayload): Promise<AuthResponse> {
  return fetchJson<AuthResponse>('/auth/register/job-seeker', {
    method: 'POST',
    body: JSON.stringify(p),
  })
}
