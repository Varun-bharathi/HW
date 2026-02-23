import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js'

export const jobsRouter = Router()

jobsRouter.use(authMiddleware)

function parseSkills(s: unknown): string[] {
  if (Array.isArray(s)) return s.filter((x) => typeof x === 'string')
  if (typeof s === 'string') {
    return s
      .split(/[,;]/)
      .map((x) => x.trim())
      .filter(Boolean)
  }
  return []
}

jobsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const isRecruiter = u.role === 'recruiter'
    const where = isRecruiter ? { recruiterId: u.userId } : { status: 'live' }
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    })
    const list = jobs.map((j: any) => ({
      id: j.id,
      recruiter_id: j.recruiterId,
      title: j.title,
      description: j.description,
      required_skills: parseJsonArray(j.requiredSkills),
      experience_level: j.experienceLevel,
      location: j.location,
      employment_type: j.employmentType,
      status: j.status,
      cutoff_score: j.cutoffScore,
      created_at: j.createdAt.toISOString(),
      updated_at: j.updatedAt.toISOString(),
    }))
    res.json(list)
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to list jobs' })
  }
})

jobsRouter.post('/', requireRole('recruiter'), async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const body = req.body as Record<string, unknown>
    const skills = parseSkills(body.required_skills ?? body.skills)
    const job = await prisma.job.create({
      data: {
        recruiterId: u.userId,
        title: String(body.title ?? ''),
        description: String(body.description ?? ''),
        requiredSkills: JSON.stringify(skills),
        experienceLevel: (body.experience_level as string) ?? 'mid',
        location: (body.location as string) || null,
        employmentType: (body.employment_type as string) ?? 'full_time',
        status: 'draft',
        cutoffScore: typeof body.cutoff_score === 'number' ? body.cutoff_score : 70,
        screeningConfig: JSON.stringify({
          duration_minutes: 45,
          cutoff: typeof body.cutoff_score === 'number' ? body.cutoff_score : 70,
        }),
      },
    })
    const prelim = await createPreliminaryAssessment(job.id, job.cutoffScore ?? 70)
    res.status(201).json(toJobJson(job, prelim))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to create job' })
  }
})

jobsRouter.get('/:id/applications', requireRole('recruiter'), async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.id
    const job = await prisma.job.findFirst({
      where: { id: jobId, recruiterId: req.user!.userId },
    })
    if (!job) {
      res.status(404).json({ message: 'Job not found' })
      return
    }
    const list = await prisma.application.findMany({
      where: { jobId },
      include: {
        job: { select: { id: true, title: true, location: true, employmentType: true, requiredSkills: true } },
        jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
      },
      orderBy: [{ resumeJdMatch: 'desc' }, { screeningScore: 'desc' }],
    })
    res.json(
      list.map((a: any) => ({
        id: a.id,
        job_id: a.jobId,
        job_seeker_id: a.jobSeekerId,
        status: a.status,
        resume_jd_match: a.resumeJdMatch,
        resume_parsed: a.resumeParsed ? (JSON.parse(a.resumeParsed) as unknown) : undefined,
        screening_score: a.screeningScore,
        aptitude_score: a.aptitudeScore,
        coding_score: a.codingScore,
        screening_at: a.screeningAt?.toISOString(),
        resume_submitted_at: a.resumeSubmittedAt?.toISOString(),
        created_at: a.createdAt.toISOString(),
        job: a.job
          ? {
            id: a.job.id,
            title: a.job.title,
            location: a.job.location,
            employment_type: a.job.employmentType,
            required_skills: parseJsonArray(a.job.requiredSkills),
          }
          : undefined,
        job_seeker: a.jobSeeker
          ? {
            full_name: a.jobSeeker.jobSeekerProfile?.fullName ?? a.jobSeeker.email,
            email: a.jobSeeker.email,
          }
          : undefined,
      }))
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to list applications' })
  }
})

jobsRouter.post('/:id/apply', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    if (u.role !== 'job_seeker') {
      res.status(403).json({ message: 'Forbidden' })
      return
    }
    const jobId = req.params.id
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        assessments: {
          where: { type: 'preliminary' },
          include: { questions: { orderBy: { orderIndex: 'asc' } } },
        },
      },
    })
    if (!job || job.status !== 'live') {
      res.status(404).json({ message: 'Job not found or not open' })
      return
    }
    const existing = await prisma.application.findUnique({
      where: { jobId_jobSeekerId: { jobId, jobSeekerId: u.userId } },
    })
    if (existing) {
      res.status(409).json({ message: 'Already applied' })
      return
    }
    const app = await prisma.application.create({
      data: { jobId, jobSeekerId: u.userId, status: 'screening' },
    })
    const prelim = job.assessments[0]
    const config = prelim?.config ? (JSON.parse(prelim.config) as { duration_minutes?: number; cutoff?: number }) : {}
    res.status(201).json({
      application_id: app.id,
      screening: prelim
        ? {
          assessment_id: prelim.id,
          duration_minutes: config.duration_minutes ?? 45,
          cutoff: config.cutoff ?? 70,
          questions: (prelim.questions ?? []).map((q: any) => ({
            id: q.id,
            type: q.type,
            content: q.content,
            options: q.options ? (JSON.parse(q.options) as unknown) : undefined,
            max_score: q.maxScore,
            order_index: q.orderIndex,
          })),
        }
        : null,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to apply' })
  }
})

jobsRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { assessments: { include: { questions: { orderBy: { orderIndex: 'asc' } } } } },
    })
    if (!job) {
      res.status(404).json({ message: 'Job not found' })
      return
    }
    res.json(toJobJson(job, job.assessments[0]))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to fetch job' })
  }
})

jobsRouter.patch('/:id', requireRole('recruiter'), async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, recruiterId: req.user!.userId },
    })
    if (!job) {
      res.status(404).json({ message: 'Job not found' })
      return
    }
    const body = req.body as Record<string, unknown>
    const skills = body.required_skills !== undefined ? parseSkills(body.required_skills) : undefined
    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        ...(body.title != null && { title: String(body.title) }),
        ...(body.description != null && { description: String(body.description) }),
        ...(skills != null && { requiredSkills: JSON.stringify(skills) }),
        ...(body.experience_level != null && { experienceLevel: String(body.experience_level) }),
        ...(body.location != null && { location: (body.location as string) || null }),
        ...(body.employment_type != null && { employmentType: String(body.employment_type) }),
        ...(body.status != null && { status: String(body.status) }),
        ...(typeof body.cutoff_score === 'number' && { cutoffScore: body.cutoff_score }),
      },
    })
    const prelim = await prisma.assessment.findFirst({
      where: { jobId: updated.id, type: 'preliminary' },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    })
    res.json(toJobJson(updated, prelim ?? undefined))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to update job' })
  }
})

jobsRouter.delete('/:id', requireRole('recruiter'), async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, recruiterId: req.user!.userId },
    })
    if (!job) {
      res.status(404).json({ message: 'Job not found' })
      return
    }
    await prisma.job.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to delete job' })
  }
})

jobsRouter.post('/:id/publish', requireRole('recruiter'), async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, recruiterId: req.user!.userId },
    })
    if (!job) {
      res.status(404).json({ message: 'Job not found' })
      return
    }
    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: { status: 'live' },
    })
    res.json(toJobJson(updated))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to publish job' })
  }
})

jobsRouter.post('/:id/ai/generate-questions', requireRole('recruiter'), async (req: AuthRequest, res) => {
  try {
    const jobId = req.params.id
    const job = await prisma.job.findFirst({
      where: { id: jobId, recruiterId: req.user!.userId },
      include: {
        assessments: {
          where: { type: 'preliminary' },
          include: { questions: true },
        },
      },
    })
    if (!job) {
      res.status(404).json({ message: 'Job not found' })
      return
    }
    const prelim = job.assessments[0]
    if (!prelim) {
      res.status(400).json({ message: 'No preliminary assessment for this job' })
      return
    }
    await prisma.question.deleteMany({ where: { assessmentId: prelim.id } })
    const mcqPool: { content: string; options: string[]; correct: number }[] = [
      { content: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2 },
      { content: 'Which hook is used to perform side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useMemo'], correct: 1 },
      { content: 'What does REST stand for?', options: ['Representational State Transfer', 'Remote State Transfer', 'Resource State Transfer', 'Representative State Transfer'], correct: 0 },
      { content: 'Which HTTP method is idempotent?', options: ['POST', 'PUT', 'PATCH', 'DELETE'], correct: 1 },
      { content: 'What is a primary key?', options: ['A unique identifier for a row', 'A foreign key', 'An index', 'A constraint'], correct: 0 },
      { content: 'Which is not a JavaScript data type?', options: ['undefined', 'symbol', 'integer', 'bigint'], correct: 2 },
      { content: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Color Style Sheets'], correct: 0 },
      { content: 'What is Git?', options: ['A version control system', 'A programming language', 'An OS', 'A database'], correct: 0 },
      { content: 'What is the default port for HTTPS?', options: ['80', '443', '8080', '8443'], correct: 1 },
      { content: 'Which structure ensures FIFO order?', options: ['Stack', 'Queue', 'Array', 'Hash map'], correct: 1 },
      { content: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Sequential Query Language'], correct: 0 },
      { content: 'Which keyword declares a block-scoped variable in JS?', options: ['var', 'let', 'const', 'Both let and const'], correct: 3 },
    ]
    const codingPool: { content: string; solution: string }[] = [
      { content: 'Implement a function `fib(n)` that returns the n-th Fibonacci number. Assume n >= 0.', solution: 'function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }' },
      { content: 'Implement `isPrime(n)` returning true if n is prime, false otherwise. Assume n >= 2.', solution: 'function isPrime(n) { for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }' },
    ]
    let orderIndex = 0
    for (let i = 0; i < 8; i++) {
      const m = mcqPool[i]!
      const options = m.options.map((text, idx) => ({ id: `opt-${idx}`, text, correct: idx === m.correct }))
      await prisma.question.create({
        data: {
          assessmentId: prelim.id,
          type: 'mcq',
          content: m.content,
          options: JSON.stringify(options),
          maxScore: 1,
          orderIndex: orderIndex++,
        },
      })
    }
    for (let i = 0; i < 2; i++) {
      const c = codingPool[i]!
      await prisma.question.create({
        data: {
          assessmentId: prelim.id,
          type: 'coding',
          content: c.content,
          solution: c.solution,
          maxScore: 2,
          orderIndex: orderIndex++,
        },
      })
    }
    const count = 10
    res.json({ count, message: `Generated ${count} screening questions (8 MCQ, 2 coding).` })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to generate questions' })
  }
})

async function createPreliminaryAssessment(jobId: string, cutoff: number) {
  const a = await prisma.assessment.create({
    data: {
      jobId,
      type: 'preliminary',
      title: 'Preliminary Screening',
      config: JSON.stringify({ duration_minutes: 45, cutoff }),
    },
  })
  const mcq = [
    { content: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2 },
    { content: 'Which hook is used to perform side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useMemo'], correct: 1 },
    { content: 'What does REST stand for?', options: ['Representational State Transfer', 'Remote State Transfer', 'Resource State Transfer', 'Representative State Transfer'], correct: 0 },
    { content: 'Which HTTP method is idempotent?', options: ['POST', 'PUT', 'PATCH', 'DELETE'], correct: 1 },
    { content: 'What is a primary key?', options: ['A unique identifier for a row', 'A foreign key', 'An index', 'A constraint'], correct: 0 },
    { content: 'Which is not a JavaScript data type?', options: ['undefined', 'symbol', 'integer', 'bigint'], correct: 2 },
    { content: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Color Style Sheets'], correct: 0 },
    { content: 'What is Git?', options: ['A version control system', 'A programming language', 'An OS', 'A database'], correct: 0 },
  ]
  for (let i = 0; i < mcq.length; i++) {
    const m = mcq[i]!
    const options = m.options.map((text, idx) => ({
      id: `opt-${idx}`,
      text,
      correct: idx === m.correct,
    }))
    await prisma.question.create({
      data: {
        assessmentId: a.id,
        type: 'mcq',
        content: m.content,
        options: JSON.stringify(options),
        maxScore: 1,
        orderIndex: i,
      },
    })
  }
  await prisma.question.create({
    data: {
      assessmentId: a.id,
      type: 'coding',
      content: 'Implement a function `fib(n)` that returns the n-th Fibonacci number. Assume n >= 0.',
      solution: 'function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }',
      maxScore: 2,
      orderIndex: mcq.length,
    },
  })
  return prisma.assessment.findUnique({
    where: { id: a.id },
    include: { questions: { orderBy: { orderIndex: 'asc' } } },
  })!
}

function parseJsonArray(s: string | null): string[] {
  if (!s) return []
  try {
    const a = JSON.parse(s)
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function toJobJson(job: { id: string; recruiterId: string; title: string; description: string; requiredSkills: string | null; experienceLevel: string | null; location: string | null; employmentType: string | null; status: string; cutoffScore: number | null; screeningConfig: string | null; createdAt: Date; updatedAt: Date }, prelim?: { id: string; config: string | null; questions: Array<{ id: string; type: string; content: string; options: string | null; solution: string | null; maxScore: number; orderIndex: number }> } | null) {
  const config = prelim?.config ? (JSON.parse(prelim.config) as { duration_minutes?: number; cutoff?: number }) : {}
  const questions = (prelim?.questions ?? []).map((q) => ({
    id: q.id,
    assessment_id: prelim?.id ?? '',
    type: q.type,
    content: q.content,
    options: q.options ? (JSON.parse(q.options) as unknown) : undefined,
    solution: q.solution ?? undefined,
    max_score: q.maxScore,
    order_index: q.orderIndex,
  }))
  return {
    id: job.id,
    recruiter_id: job.recruiterId,
    title: job.title,
    description: job.description,
    required_skills: parseJsonArray(job.requiredSkills),
    experience_level: job.experienceLevel,
    location: job.location,
    employment_type: job.employmentType,
    status: job.status,
    cutoff_score: job.cutoffScore,
    created_at: job.createdAt.toISOString(),
    updated_at: job.updatedAt.toISOString(),
    screening: prelim
      ? {
        assessment_id: prelim.id,
        duration_minutes: config.duration_minutes ?? 45,
        cutoff: config.cutoff ?? 70,
        questions,
      }
      : undefined,
  }
}
