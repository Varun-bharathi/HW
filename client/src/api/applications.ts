import { useAuthStore } from '@/stores/authStore'
import { api } from './client'
import type { ApplicationListItem } from './jobs'

const BASE = '/api'

async function uploadResumeRequest(applicationId: string, file: File): Promise<ApplicationListItem> {
  const { token } = useAuthStore.getState()
  const form = new FormData()
  form.append('resume', file)
  const headers: HeadersInit = {}
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}/applications/${applicationId}/resume`, {
    method: 'POST',
    headers,
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<ApplicationListItem>
}

export const applicationsApi = {
  list: () => api.get<ApplicationListItem[]>('/applications'),
  get: (id: string) => api.get<ApplicationListItem>(`/applications/${id}`),
  uploadResume: (applicationId: string, file: File) => uploadResumeRequest(applicationId, file),
  accept: (id: string) => api.patch<ApplicationListItem>(`/applications/${id}/accept`),
  reject: (id: string) => api.patch<ApplicationListItem>(`/applications/${id}/reject`),
}
