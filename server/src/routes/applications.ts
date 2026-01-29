import type { Request } from 'express'
import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js'

export const applicationsRouter = Router()

const uploadsDir = path.join(process.cwd(), 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

interface MulterFile {
  originalname: string
  mimetype: string
}

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: (
      _req: Request,
      _file: MulterFile,
      cb: (e: Error | null, d: string) => void
    ) => cb(null, uploadsDir),
    filename: (req: Request, file: MulterFile, cb: (e: Error | null, n: string) => void) => {
      const ext = path.extname(file.originalname) || '.pdf'
      const id = (req.params as { id?: string }).id ?? 'unknown'
      cb(null, `resume-${id}-${Date.now()}${ext}`)
    },
  }),
  fileFilter: (
    _req: Request,
    file: MulterFile,
    cb: (e: Error | null, accept?: boolean) => void
  ) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only PDF and DOC/DOCX are allowed'))
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

applicationsRouter.use(authMiddleware)

function parseJsonArray(s: string | null): string[] {
  if (!s) return []
  try {
    const a = JSON.parse(s)
    return Array.isArray(a) ? a.filter((x: unknown) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function appToJson(a: {
  id: string
  jobId: string
  jobSeekerId: string
  status: string
  resumeUrl: string | null
  resumeParsed: string | null
  resumeJdMatch: number | null
  screeningScore: number | null
  screeningAt: Date | null
  resumeSubmittedAt: Date | null
  createdAt: Date
  updatedAt: Date
  job?: { id: string; title: string; location: string | null; employmentType: string | null; requiredSkills: string | null }
  jobSeeker?: { email: string; jobSeekerProfile: { fullName: string } | null }
}) {
  return {
    id: a.id,
    job_id: a.jobId,
    job_seeker_id: a.jobSeekerId,
    status: a.status,
    resume_url: a.resumeUrl,
    resume_parsed: a.resumeParsed ? (JSON.parse(a.resumeParsed) as unknown) : undefined,
    resume_jd_match: a.resumeJdMatch,
    screening_score: a.screeningScore,
    screening_at: a.screeningAt?.toISOString(),
    resume_submitted_at: a.resumeSubmittedAt?.toISOString(),
    created_at: a.createdAt.toISOString(),
    updated_at: a.updatedAt.toISOString(),
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
  }
}

applicationsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    if (u.role !== 'job_seeker') {
      res.status(403).json({ message: 'Forbidden' })
      return
    }
    const list = await prisma.application.findMany({
      where: { jobSeekerId: u.userId },
      include: {
        job: { select: { id: true, title: true, location: true, employmentType: true, requiredSkills: true } },
        jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    })
    res.json(list.map(appToJson))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to list applications' })
  }
})

applicationsRouter.post(
  '/:id/resume',
  requireRole('job_seeker'),
  resumeUpload.single('resume'),
  async (req: AuthRequest, res) => {
    try {
      const u = req.user!
      const { id } = req.params
      const file = (req as unknown as { file?: { path: string; filename: string } }).file
      if (!file) {
        res.status(400).json({ message: 'Resume file (PDF/DOC/DOCX) required' })
        return
      }
      const app = await prisma.application.findUnique({
        where: { id },
        include: {
          job: { select: { id: true, title: true, location: true, employmentType: true, requiredSkills: true } },
          jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
        },
      })
      if (!app || app.jobSeekerId !== u.userId) {
        res.status(404).json({ message: 'Application not found' })
        return
      }
      if (app.status !== 'passed_screening') {
        res.status(400).json({ message: 'Resume upload only allowed after passing screening' })
        return
      }
      const resumeUrl = `/api/uploads/${file.filename}`
      const parsedSkills = ['React', 'TypeScript', 'Node.js']
      const resumeParsed = JSON.stringify({
        skills: parsedSkills,
        experience: 'Stub: replace with real parser (e.g. pdf-parse + LLM)',
        summary: 'Parsed resume placeholder',
      })
      const jobSkills = parseJsonArray(app.job?.requiredSkills ?? null)
      const matchScore =
        jobSkills.length > 0
          ? Math.round(
              (jobSkills.filter((js) =>
                parsedSkills.some((ps) => ps.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(ps.toLowerCase()))
              ).length /
                jobSkills.length) *
                100
            )
          : null
      const updated = await prisma.application.update({
        where: { id },
        data: {
          resumeUrl,
          resumeParsed,
          resumeJdMatch: matchScore ?? undefined,
          status: 'resume_submitted',
          resumeSubmittedAt: new Date(),
        },
        include: {
          job: { select: { id: true, title: true, location: true, employmentType: true, requiredSkills: true } },
          jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
        },
      })
      res.json(appToJson(updated))
    } catch (e) {
      console.error(e)
      res.status(500).json({ message: e instanceof Error ? e.message : 'Failed to upload resume' })
    }
  }
)

applicationsRouter.patch('/:id/accept', requireRole('recruiter'), async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { id } = req.params
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        job: { select: { id: true, recruiterId: true, title: true, location: true, employmentType: true, requiredSkills: true } },
        jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
      },
    })
    if (!app || app.job?.recruiterId !== u.userId) {
      res.status(404).json({ message: 'Application not found' })
      return
    }
    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'accepted' },
      include: {
        job: { select: { id: true, title: true, location: true, employmentType: true, requiredSkills: true } },
        jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
      },
    })
    res.json(appToJson(updated))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to accept' })
  }
})

applicationsRouter.patch('/:id/reject', requireRole('recruiter'), async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { id } = req.params
    const app = await prisma.application.findUnique({
      where: { id },
      include: { job: { select: { recruiterId: true } } },
    })
    if (!app || app.job?.recruiterId !== u.userId) {
      res.status(404).json({ message: 'Application not found' })
      return
    }
    const updated = await prisma.application.update({
      where: { id },
      data: { status: 'rejected' },
      include: {
        job: { select: { id: true, title: true, location: true, employmentType: true, requiredSkills: true } },
        jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
      },
    })
    res.json(appToJson(updated))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to reject' })
  }
})

applicationsRouter.get('/:id', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const app = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        job: { select: { id: true, title: true, location: true, employmentType: true, requiredSkills: true, recruiterId: true } },
        jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
      },
    })
    if (!app) {
      res.status(404).json({ message: 'Application not found' })
      return
    }
    const canAccess =
      u.role === 'job_seeker'
        ? app.jobSeekerId === u.userId
        : u.role === 'recruiter' && app.job?.recruiterId === u.userId
    if (!canAccess) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }
    res.json(appToJson(app))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to fetch application' })
  }
})
