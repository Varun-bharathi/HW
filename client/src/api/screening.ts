import { api } from './client'

export interface ScreeningConfig {
  assessment_id: string
  duration_minutes: number
  cutoff: number
  questions: Array<{
    id: string
    type: string
    content: string
    options?: Array<{ id: string; text: string; correct: boolean }>
    max_score: number
    order_index: number
  }>
}

export interface SubmitScreeningResponse {
  score: number
  passed: boolean
  status: string
}

export const screeningApi = {
  get: (applicationId: string) =>
    api.get<ScreeningConfig>(`/screening/${applicationId}`),
  start: (applicationId: string) =>
    api.post<{ attempt_id: string; started_at: string }>(`/screening/${applicationId}/start`),
  pause: (applicationId: string, body: { answers?: Record<string, string>; time_spent_sec?: number }) =>
    api.post(`/screening/${applicationId}/pause`, body),
  resume: (applicationId: string) =>
    api.post(`/screening/${applicationId}/resume`),
  submit: (applicationId: string, body: { answers: Record<string, string>; time_spent_sec?: number }) =>
    api.post<SubmitScreeningResponse>(`/screening/${applicationId}/submit`, body),
}
