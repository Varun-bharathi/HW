import { api } from './client'

export interface JobListItem {
  id: string
  recruiter_id: string
  title: string
  description: string
  required_skills: string[]
  experience_level: string | null
  location: string | null
  employment_type: string | null
  status: string
  cutoff_score: number | null
  created_at: string
  updated_at: string
}

export interface JobDetail extends JobListItem {
  screening?: {
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
}

export interface ApplyResponse {
  application_id: string
  screening: JobDetail['screening'] | null
}

export interface GenerateQuestionsResponse {
  count: number
  message: string
}

export const jobsApi = {
  list: () => api.get<JobListItem[]>('/jobs'),
  get: (id: string) => api.get<JobDetail>(`/jobs/${id}`),
  create: (body: Record<string, unknown>) => api.post<JobDetail>('/jobs', body),
  update: (id: string, body: Record<string, unknown>) => api.patch<JobDetail>(`/jobs/${id}`, body),
  publish: (id: string) => api.post<JobDetail>(`/jobs/${id}/publish`),
  applications: (jobId: string) => api.get<ApplicationListItem[]>(`/jobs/${jobId}/applications`),
  apply: (jobId: string) => api.post<ApplyResponse>(`/jobs/${jobId}/apply`),
  generateQuestions: (jobId: string) =>
    api.post<GenerateQuestionsResponse>(`/jobs/${jobId}/ai/generate-questions`),
}

export interface ResumeParsed {
  skills?: string[]
  experience?: string
  summary?: string
  [k: string]: unknown
}

export interface ApplicationListItem {
  id: string
  job_id: string
  job_seeker_id: string
  status: string
  resume_jd_match?: number | null
  resume_parsed?: ResumeParsed | null
  screening_score?: number | null
  screening_at?: string | null
  resume_submitted_at?: string | null
  created_at: string
  job?: { id: string; title: string; location: string | null; employment_type: string | null; required_skills: string[] }
  job_seeker?: { full_name: string; email: string }
}
