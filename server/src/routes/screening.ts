import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'

export const screeningRouter = Router()

screeningRouter.use(authMiddleware)

function parseJson<T>(s: string | null): T | null {
  if (!s) return null
  try {
    return JSON.parse(s) as T
  } catch {
    return null
  }
}

interface McqOption {
  id: string
  text: string
  correct: boolean
}

function scoreMcq(questionId: string, questions: { id: string; options: string | null }[], answers: Record<string, string>): number {
  const q = questions.find((x) => x.id === questionId)
  if (!q?.options) return 0
  const opts = parseJson<McqOption[]>(q.options)
  if (!opts) return 0
  const selected = answers[questionId]
  const correct = opts.find((o) => o.correct)
  return correct && selected === correct.id ? 1 : 0
}

screeningRouter.get('/:applicationId', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { applicationId } = req.params
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            assessments: {
              where: { type: 'preliminary' },
              include: { questions: { orderBy: { orderIndex: 'asc' } } },
            },
          },
        },
      },
    })
    if (!app || app.jobSeekerId !== u.userId) {
      res.status(404).json({ message: 'Not found' })
      return
    }
    const prelim = app.job?.assessments[0]
    if (!prelim) {
      res.status(404).json({ message: 'No screening configured' })
      return
    }
    const config = parseJson<{ duration_minutes?: number; cutoff?: number }>(prelim.config) ?? {}
    res.json({
      assessment_id: prelim.id,
      duration_minutes: config.duration_minutes ?? 45,
      cutoff: config.cutoff ?? 70,
      questions: (prelim.questions ?? []).map((q) => ({
        id: q.id,
        type: q.type,
        content: q.content,
        options: q.options ? (parseJson(q.options) as McqOption[]) : undefined,
        max_score: q.maxScore,
        order_index: q.orderIndex,
      })),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to fetch screening' })
  }
})

screeningRouter.post('/:applicationId/start', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { applicationId } = req.params
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { screening: true },
    })
    if (!app || app.jobSeekerId !== u.userId) {
      res.status(404).json({ message: 'Not found' })
      return
    }
    let attempt = app.screening[0] ?? null
    if (!attempt) {
      attempt = await prisma.screeningAttempt.create({
        data: { applicationId },
      })
    }
    res.json({
      attempt_id: attempt.id,
      started_at: attempt.startedAt.toISOString(),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to start screening' })
  }
})

screeningRouter.post('/:applicationId/pause', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { applicationId } = req.params
    const body = (req.body as { answers?: Record<string, string>; time_spent_sec?: number }) ?? {}
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { screening: true },
    })
    if (!app || app.jobSeekerId !== u.userId) {
      res.status(404).json({ message: 'Not found' })
      return
    }
    const attempt = app.screening[0]
    if (!attempt) {
      res.status(400).json({ message: 'No active attempt' })
      return
    }
    await prisma.screeningAttempt.update({
      where: { id: attempt.id },
      data: {
        pausedAt: new Date(),
        answers: body.answers ? JSON.stringify(body.answers) : attempt.answers,
        timeSpentSec: body.time_spent_sec ?? attempt.timeSpentSec,
      },
    })
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to pause' })
  }
})

screeningRouter.post('/:applicationId/resume', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { applicationId } = req.params
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { screening: true },
    })
    if (!app || app.jobSeekerId !== u.userId) {
      res.status(404).json({ message: 'Not found' })
      return
    }
    const attempt = app.screening[0]
    if (!attempt) {
      res.status(400).json({ message: 'No attempt' })
      return
    }
    await prisma.screeningAttempt.update({
      where: { id: attempt.id },
      data: { pausedAt: null },
    })
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to resume' })
  }
})

screeningRouter.post('/:applicationId/submit', async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { applicationId } = req.params
    const body = (req.body as { answers: Record<string, string>; time_spent_sec?: number }) ?? {}
    const { answers, time_spent_sec } = body
    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ message: 'answers required' })
      return
    }
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            assessments: {
              where: { type: 'preliminary' },
              include: { questions: { orderBy: { orderIndex: 'asc' } } },
            },
          },
        },
        screening: true,
      },
    })
    if (!app || app.jobSeekerId !== u.userId) {
      res.status(404).json({ message: 'Not found' })
      return
    }
    const prelim = app.job?.assessments[0]
    if (!prelim) {
      res.status(400).json({ message: 'No screening configured' })
      return
    }
    const config = parseJson<{ duration_minutes?: number; cutoff?: number }>(prelim.config) ?? {}
    const cutoff = config.cutoff ?? 70
    const questions = prelim.questions ?? []
    let total = 0
    let scored = 0
    for (const q of questions) {
      total += q.maxScore
      if (q.type === 'mcq') {
        scored += scoreMcq(q.id, questions, answers)
      } else {
        scored += 0
      }
    }
    const pct = total > 0 ? Math.round((scored / total) * 100) : 0
    const passed = pct >= cutoff

    const attempt = app.screening[0]
    if (attempt) {
      await prisma.screeningAttempt.update({
        where: { id: attempt.id },
        data: {
          submittedAt: new Date(),
          score: pct,
          answers: JSON.stringify(answers),
          timeSpentSec: time_spent_sec ?? undefined,
        },
      })
    } else {
      await prisma.screeningAttempt.create({
        data: {
          applicationId,
          submittedAt: new Date(),
          score: pct,
          answers: JSON.stringify(answers),
          timeSpentSec: time_spent_sec ?? undefined,
        },
      })
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        screeningAt: new Date(),
        screeningScore: pct,
        status: passed ? 'passed_screening' : 'screening',
      },
    })

    res.json({
      score: pct,
      passed,
      status: passed ? 'passed_screening' : 'screening',
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to submit screening' })
  }
})
