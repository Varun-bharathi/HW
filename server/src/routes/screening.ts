import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, type AuthRequest } from '../middleware/auth.js'
import { getFuncName, prepareSource } from './applications.js'
import type { QuestionTemplate } from '../lib/questionBank.js'

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
      questions: (prelim.questions ?? []).map((q: any) => ({
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
    const { answers: userAnswers, time_spent_sec } = body

    if (!userAnswers || typeof userAnswers !== 'object') {
      res.status(400).json({ message: 'answers required' })
      return
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { screening: true },
    })

    if (!app || app.jobSeekerId !== u.userId) {
      res.status(404).json({ message: 'Not found' })
      return
    }

    const attempt = app.screening[0]
    if (!attempt || !attempt.answers) {
      res.status(400).json({ message: 'No active screening found' })
      return
    }

    const savedData = JSON.parse(attempt.answers) as { questions: QuestionTemplate[] }
    const questions = savedData.questions || []

    let totalScore = 0
    let maxPossibleScore = 0

    // Parallel processing might be too heavy if many coding Qs, but here only 2.
    // However, to be safe, we process sequentially or use Promise.all for blocks.
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const ans = userAnswers[`q-${i}`]

      if (q.type === 'mcq') {
        maxPossibleScore += 1
        const selectedIdx = parseInt(ans, 10)
        if (!isNaN(selectedIdx) && selectedIdx === q.correctIndex) {
          totalScore += 1
        }
      } else if (q.type === 'coding') {
        maxPossibleScore += 10
        // Verify coding answer (re-run logic)
        // If empty code strings, 0.
        if (!ans || !ans.trim()) continue

        // We must run the code against test cases to verify
        // This prevents clients from just sending "passed" status
        if (!q.testCases || q.testCases.length === 0) continue

        const funcName = getFuncName(q.content)
        // Assume language is inferred or passed. 
        // Ideally frontend sends language map, but usually we just support JS/Python.
        // ScreenTest sends `code` but not language in `answers` map directly?
        // Wait, the `answers` map is just `questionId -> string`. 
        // For coding, it is the code text. What is the language?
        // We default to Checking if code looks like Python or JS, or assume 'javascript' default
        // if user changed language.
        // Actually, for this strict verification, let's assume 'javascript' default or try to detect?
        // Or better, we can try running as JS, if syntax error, try Python? Unsafe.
        // Let's assume Javascript for now as simplified fallback, or Python if `def ` exists.
        const lang = ans.includes('def ') || ans.includes('import ') ? 'python' : 'javascript'
        const pistonLang = lang === 'javascript' ? 'javascript' : 'python'

        let allPassed = true
        for (const tc of q.testCases) {
          const source = prepareSource(lang, ans, tc.input, funcName)
          try {
            const runRes = await fetch('https://emkc.org/api/v2/piston/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language: pistonLang,
                version: '*',
                files: [{ content: source }]
              })
            })
            if (!runRes.ok) { allPassed = false; break; }
            const runData = await runRes.json()
            const output = (runData as any).run?.stdout?.trim() ?? ''
            const error = (runData as any).run?.stderr?.trim() ?? ''
            const passed = !error && (output === tc.expected || output === JSON.stringify(JSON.parse(tc.expected || 'null')))
            if (!passed) {
              allPassed = false
              break
            }
          } catch (e) {
            allPassed = false
            break
          }
        }

        if (allPassed) {
          totalScore += 10
        }
      }
    }

    const pct = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0
    // Cutoff default 70
    const passed = pct >= 70

    // Update DB
    await prisma.screeningAttempt.update({
      where: { id: attempt.id },
      data: {
        submittedAt: new Date(),
        score: pct,
        answers: JSON.stringify(userAnswers), // Save user answers separately or merge? userAnswers is simple map
        timeSpentSec: time_spent_sec,
      },
    })

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        screeningAt: new Date(),
        screeningScore: pct,
        status: 'screening_submitted',
      },
    })

    res.json({
      score: pct,
      passed,
      status: 'screening_submitted',
    })

  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to submit screening' })
  }
})
