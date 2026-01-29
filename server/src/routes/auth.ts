import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, signToken, type AuthRequest } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/register/recruiter', async (req, res) => {
  try {
    const { email, password, full_name, company } = req.body as {
      email?: string
      password?: string
      full_name?: string
      company?: string
    }
    if (!email || !password || !full_name) {
      res.status(400).json({ message: 'email, password, and full_name required' })
      return
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ message: 'Email already registered' })
      return
    }
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: 'recruiter',
      },
    })
    await prisma.recruiterProfile.create({
      data: {
        userId: user.id,
        fullName: full_name,
        company: company ?? null,
      },
    })
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'recruiter',
    })
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: 'recruiter' },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Registration failed' })
  }
})

authRouter.post('/register/job-seeker', async (req, res) => {
  try {
    const { email, password, full_name } = req.body as {
      email?: string
      password?: string
      full_name?: string
    }
    if (!email || !password || !full_name) {
      res.status(400).json({ message: 'email, password, and full_name required' })
      return
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ message: 'Email already registered' })
      return
    }
    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: 'job_seeker',
      },
    })
    await prisma.jobSeekerProfile.create({
      data: {
        userId: user.id,
        fullName: full_name,
      },
    })
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'job_seeker',
    })
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: 'job_seeker' },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Registration failed' })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body as {
      email?: string
      password?: string
      role?: 'recruiter' | 'job_seeker'
    }
    if (!email || !password || !role) {
      res.status(400).json({ message: 'email, password, and role required' })
      return
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.role !== role) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'recruiter' | 'job_seeker',
    })
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Login failed' })
  }
})

function parseJsonArray(s: string | null): string[] | null {
  if (!s) return null
  try {
    const arr = JSON.parse(s) as unknown
    return Array.isArray(arr) ? (arr as string[]) : null
  } catch {
    return null
  }
}

function meResponse(user: {
  id: string
  email: string
  role: string
  recruiterProfile: { fullName: string; company: string | null } | null
  jobSeekerProfile: {
    fullName: string
    skills: string | null
    experience: string | null
    location: string | null
    portfolioUrls: string | null
  } | null
}) {
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      recruiterProfile: user.recruiterProfile
        ? {
            full_name: user.recruiterProfile.fullName,
            company: user.recruiterProfile.company,
          }
        : null,
      jobSeekerProfile: user.jobSeekerProfile
        ? {
            full_name: user.jobSeekerProfile.fullName,
            skills: parseJsonArray(user.jobSeekerProfile.skills),
            experience: user.jobSeekerProfile.experience,
            location: user.jobSeekerProfile.location,
            portfolio_urls: parseJsonArray(user.jobSeekerProfile.portfolioUrls),
          }
        : null,
    },
  }
}

authRouter.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const user = await prisma.user.findUnique({
      where: { id: u.userId },
      include: {
        recruiterProfile: true,
        jobSeekerProfile: true,
      },
    })
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json(meResponse(user))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
})

authRouter.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const body = (req.body as Record<string, unknown>) ?? {}
    const user = await prisma.user.findUnique({
      where: { id: u.userId },
      include: { recruiterProfile: true, jobSeekerProfile: true },
    })
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    if (user.role === 'recruiter' && user.recruiterProfile) {
      const full_name = body.full_name as string | undefined
      const company = body.company as string | null | undefined
      await prisma.recruiterProfile.update({
        where: { userId: user.id },
        data: {
          ...(typeof full_name === 'string' && { fullName: full_name }),
          ...(company !== undefined && { company: company ?? null }),
        },
      })
    } else if (user.role === 'job_seeker' && user.jobSeekerProfile) {
      const full_name = body.full_name as string | undefined
      const skills = body.skills as string | undefined
      const experience = body.experience as string | undefined
      const location = body.location as string | undefined
      const portfolio_urls = body.portfolio_urls as string | string[] | undefined
      const skillsJson =
        typeof skills === 'string'
          ? JSON.stringify(skills.split(',').map((s) => s.trim()).filter(Boolean))
          : undefined
      let portfolioJson: string | undefined
      if (Array.isArray(portfolio_urls)) {
        portfolioJson = JSON.stringify(portfolio_urls)
      } else if (typeof portfolio_urls === 'string') {
        portfolioJson = JSON.stringify(
          portfolio_urls.split(',').map((s) => s.trim()).filter(Boolean)
        )
      }
      await prisma.jobSeekerProfile.update({
        where: { userId: user.id },
        data: {
          ...(typeof full_name === 'string' && { fullName: full_name }),
          ...(skillsJson !== undefined && { skills: skillsJson }),
          ...(typeof experience === 'string' && { experience }),
          ...(typeof location === 'string' && { location }),
          ...(portfolioJson !== undefined && { portfolioUrls: portfolioJson }),
        },
      })
    }
    const updated = await prisma.user.findUnique({
      where: { id: u.userId },
      include: { recruiterProfile: true, jobSeekerProfile: true },
    })
    if (!updated) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json(meResponse(updated))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to update profile' })
  }
})
