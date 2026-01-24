import type { Job, Application, Assessment, Question } from '@/types'

export const mockJobs: Job[] = [
  {
    id: 'j1',
    recruiter_id: 'r1',
    title: 'Senior Frontend Engineer',
    description: 'Build scalable React applications. You will work with TypeScript, React Query, and modern tooling.',
    required_skills: ['React', 'TypeScript', 'CSS', 'REST APIs'],
    experience_level: 'senior',
    location: 'Remote',
    employment_type: 'full_time',
    status: 'live',
    cutoff_score: 70,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'j2',
    recruiter_id: 'r1',
    title: 'Full-Stack Developer',
    description: 'Join our product team. Node.js, React, PostgreSQL experience required.',
    required_skills: ['Node.js', 'React', 'PostgreSQL', 'Redis'],
    experience_level: 'mid',
    location: 'New York, NY',
    employment_type: 'full_time',
    status: 'live',
    cutoff_score: 70,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const mockApplications: Application[] = [
  {
    id: 'a1',
    job_id: 'j1',
    job_seeker_id: 's1',
    status: 'shortlisted',
    resume_jd_match: 92,
    screening_score: 85,
    screening_at: new Date().toISOString(),
    resume_submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    job: mockJobs[0],
    job_seeker: { full_name: 'Alex Chen', email: 'alex@example.com' },
  },
  {
    id: 'a2',
    job_id: 'j1',
    job_seeker_id: 's2',
    status: 'under_review',
    resume_jd_match: 78,
    screening_score: 72,
    screening_at: new Date().toISOString(),
    resume_submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    job: mockJobs[0],
    job_seeker: { full_name: 'Sam Rivera', email: 'sam@example.com' },
  },
]

const mcqOptions = (correctIndex: number) =>
  ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'].map((text, i) => ({
    id: `opt-${i}`,
    text,
    correct: i === correctIndex,
  }))

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    assessment_id: 'asm1',
    type: 'mcq',
    content: 'What is the time complexity of binary search on a sorted array?',
    options: mcqOptions(2),
    max_score: 1,
    order_index: 0,
  },
  {
    id: 'q2',
    assessment_id: 'asm1',
    type: 'mcq',
    content: 'Which hook is used to perform side effects in React?',
    options: [
      { id: 'a', text: 'useState', correct: false },
      { id: 'b', text: 'useEffect', correct: true },
      { id: 'c', text: 'useContext', correct: false },
      { id: 'd', text: 'useMemo', correct: false },
    ],
    max_score: 1,
    order_index: 1,
  },
  {
    id: 'q3',
    assessment_id: 'asm1',
    type: 'coding',
    content: 'Implement a function `fib(n)` that returns the n-th Fibonacci number. Assume n >= 0.',
    solution: 'function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }',
    max_score: 2,
    order_index: 2,
  },
]

export const mockAssessment: Assessment = {
  id: 'asm1',
  job_id: 'j1',
  type: 'preliminary',
  title: 'Preliminary Screening',
  config: { duration_minutes: 45, cutoff: 70 },
  questions: mockQuestions,
}
