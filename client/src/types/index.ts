export type UserRole = 'recruiter' | 'job_seeker'

export interface User {
  id: string
  email: string
  role: UserRole
}

export interface RecruiterProfile {
  id: string
  user_id: string
  full_name: string
  company?: string
  avatar_url?: string
}

export interface JobSeekerProfile {
  id: string
  user_id: string
  full_name: string
  resume_url?: string
  resume_parsed?: Record<string, unknown>
  skills: string[]
  experience: Array<{ company: string; role: string; years: number; description?: string }>
  location?: string
  portfolio_urls?: string[]
  avatar_url?: string
}

export interface Job {
  id: string
  recruiter_id: string
  title: string
  description: string
  required_skills: string[]
  experience_level: string
  location?: string
  employment_type: string
  status: 'draft' | 'live' | 'closed'
  cutoff_score?: number
  created_at: string
  updated_at: string
}

export type ApplicationStatus =
  | 'screening'
  | 'passed_screening'
  | 'resume_submitted'
  | 'under_review'
  | 'shortlisted'
  | 'assessment_sent'
  | 'assessment_completed'
  | 'interview_scheduled'
  | 'accepted'
  | 'rejected'

export interface Application {
  id: string
  job_id: string
  job_seeker_id: string
  status: ApplicationStatus
  resume_url?: string
  resume_parsed?: Record<string, unknown>
  resume_jd_match?: number
  screening_score?: number
  screening_at?: string
  resume_submitted_at?: string
  created_at: string
  job?: Job
  job_seeker?: { full_name: string; email?: string }
}

export type QuestionType = 'mcq' | 'coding'

export interface McqOption {
  id: string
  text: string
  correct: boolean
}

export interface Question {
  id: string
  assessment_id: string
  type: QuestionType
  content: string
  options?: McqOption[]
  solution?: string
  max_score: number
  order_index: number
}

export interface Assessment {
  id: string
  job_id: string
  type: 'preliminary' | 'mcq' | 'coding'
  title?: string
  config: { duration_minutes: number; cutoff?: number }
  questions?: Question[]
}
