import { api } from './client'

export interface MeRecruiterProfile {
  full_name: string
  company: string | null
}

export interface MeJobSeekerProfile {
  full_name: string
  skills: string[] | null
  experience: string | null
  location: string | null
  portfolio_urls: string[] | null
}

export interface MeUser {
  id: string
  email: string
  role: 'recruiter' | 'job_seeker'
  recruiterProfile: MeRecruiterProfile | null
  jobSeekerProfile: MeJobSeekerProfile | null
}

export interface MeResponse {
  user: MeUser
}

export async function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/auth/me')
}

export interface PatchMePayload {
  full_name?: string
  company?: string | null
  skills?: string
  experience?: string
  location?: string
  portfolio_urls?: string
}

export async function patchMe(payload: PatchMePayload): Promise<MeResponse> {
  return api.patch<MeResponse>('/auth/me', payload)
}
