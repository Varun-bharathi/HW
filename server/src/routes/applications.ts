import type { Request } from 'express'
import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js'
import { QUESTION_POOL, type QuestionTemplate } from '../lib/questionBank.js'
import { APTITUDE_POOL } from '../lib/aptitudeQuestions.js'
import { CODING_POOL } from '../lib/codingQuestions.js'

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
  aptitudeScore?: number | null
  codingScore?: number | null
  screeningAt: Date | null
  resumeSubmittedAt: Date | null
  createdAt: Date
  updatedAt: Date
  job?: { id: string; title: string; location: string | null; employmentType: string | null; requiredSkills: string | null }
  jobSeeker?: { email: string; jobSeekerProfile: { fullName: string } | null }
}, role?: string) {
  const isRecruiter = role === 'recruiter'

  return {
    id: a.id,
    job_id: a.jobId,
    job_seeker_id: a.jobSeekerId,
    status: a.status,
    resume_url: a.resumeUrl,
    resume_parsed: a.resumeParsed ? (JSON.parse(a.resumeParsed) as unknown) : undefined,
    resume_jd_match: a.resumeJdMatch,
    screening_score: isRecruiter ? a.screeningScore : undefined,
    aptitude_score: isRecruiter ? a.aptitudeScore : undefined,
    coding_score: isRecruiter ? a.codingScore : undefined,
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
    res.json(list.map((a: any) => appToJson(a, u.role)))
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
      const file = (req as unknown as { file?: { path: string; filename: string; mimetype: string; originalname: string } }).file
      if (!file) {
        res.status(400).json({ message: 'Resume file (PDF/DOC/DOCX) required' })
        return
      }
      const app = await prisma.application.findUnique({
        where: { id },
        include: {
          job: { select: { id: true, title: true, location: true, employmentType: true, requiredSkills: true, description: true } },
          jobSeeker: { select: { email: true, jobSeekerProfile: { select: { fullName: true } } } },
        },
      })
      if (!app || app.jobSeekerId !== u.userId) {
        res.status(404).json({ message: 'Application not found' })
        return
      }
      if (app.status !== 'passed_screening' && app.status !== 'accepted') {
        res.status(400).json({ message: 'Resume upload only allowed after passing screening or being accepted' })
        return
      }
      const resumeUrl = `/api/uploads/${file.filename}`

      // Call Python Resume Parser Service
      let matchScore = 0
      let resumeSummary = 'Parsed via Python Service'

      try {
        const fileBuffer = fs.readFileSync(path.join(uploadsDir, file.filename))
        console.log('DEBUG: Read file buffer size:', fileBuffer.length)
        const blob = new Blob([fileBuffer], { type: file.mimetype })

        console.log('DEBUG: Job Description Length:', app.job?.description?.length)

        const formData = new FormData()
        formData.append('resume', blob, file.originalname)
        formData.append('job_description', app.job?.description || '')

        console.log('DEBUG: Sending to Python API...')
        const pyRes = await fetch('http://localhost:5001/parse-resume', {
          method: 'POST',
          body: formData
        })

        if (pyRes.ok) {
          const pyData: any = await pyRes.json()
          matchScore = pyData.resume_score ?? 0
          if (pyData.extracted_text_preview) {
            resumeSummary = pyData.extracted_text_preview
          }
        } else {
          console.error('Python API returned error:', await pyRes.text())
        }
      } catch (err) {
        console.error('Failed to call Resume Parser API:', err)
        // Fallback to 0 or keeping previous logic if critical, but user wants Python API specifically.
      }

      const resumeParsed = JSON.stringify({
        skills: [], // We could extract skills in python too if needed, but for now just score.
        experience: 'Analyzed by AI',
        summary: resumeSummary,
      })

      const updated = await prisma.application.update({
        where: { id },
        data: {
          resumeUrl,
          resumeParsed,
          resumeJdMatch: matchScore,
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
    const newStatus =
      app.status === 'screening' || app.status === 'screening_submitted'
        ? 'passed_screening'
        : app.status === 'resume_submitted'
          ? 'shortlisted'
          : app.status === 'assessment_completed'
            ? 'passed_aptitude'
            : app.status === 'coding_completed'
              ? 'passed_coding'
              : app.status === 'passed_coding'
                ? 'interview_scheduled'
                : 'accepted'

    const updated = await prisma.application.update({
      where: { id },
      data: { status: newStatus },
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
    res.json(appToJson(app, u.role))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to fetch application' })
  }
})

function getRandomQuestions(): QuestionTemplate[] {
  const categories = ['Data Structures', 'DBMS', 'Software Testing', 'Debugging', 'Cloud Computing', 'Leetcode'] as const
  const selected: QuestionTemplate[] = []

  categories.forEach((cat) => {
    const pool = QUESTION_POOL.filter((q) => q.category === cat)
    // Simple shuffle and pick 2
    const shuffled = pool.sort(() => 0.5 - Math.random())
    selected.push(...shuffled.slice(0, 2))
  })

  return selected
}

applicationsRouter.patch('/:id/assessment/send', requireRole('recruiter'), async (req: AuthRequest, res) => {
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
      data: { status: 'assessment_sent' },
    })
    res.json(appToJson(updated as any))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to send assessment' })
  }
})

applicationsRouter.post('/:id/assessment/start', requireRole('job_seeker'), async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { id } = req.params
    const app = await prisma.application.findUnique({ where: { id } })
    if (!app || app.jobSeekerId !== u.userId) {
      res.status(404).json({ message: 'Application not found' })
      return
    }

    let attempt = await prisma.screeningAttempt.findFirst({
      where: { applicationId: id, type: 'aptitude' },
    })

    if (!attempt) {
      const verbal = APTITUDE_POOL.filter(q => q.category === 'Verbal').sort(() => 0.5 - Math.random()).slice(0, 3)
      const quant = APTITUDE_POOL.filter(q => q.category === 'Quantitative').sort(() => 0.5 - Math.random()).slice(0, 4)
      const reasoning = APTITUDE_POOL.filter(q => q.category === 'Logical Reasoning').sort(() => 0.5 - Math.random()).slice(0, 3)
      // Fallback if pool is small (should not happen with my file)
      const questions = [...verbal, ...quant, ...reasoning]

      attempt = await prisma.screeningAttempt.create({
        data: {
          applicationId: id,
          type: 'aptitude',
          answers: JSON.stringify({ questions, userAnswers: {} }),
          startedAt: new Date(),
        },
      })
    }

    const data = attempt.answers ? JSON.parse(attempt.answers) : {}
    const questions = data.questions || []

    res.json({
      attemptId: attempt.id,
      questions: questions.map((q: QuestionTemplate, idx: number) => ({
        id: `q-${idx}`,
        content: q.content,
        options: q.options?.map((text, i) => ({ id: i.toString(), text })),
        type: q.type,
        category: q.category
      })),
      duration_minutes: 60,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to start assessment' })
  }
})

applicationsRouter.post('/:id/assessment/submit', requireRole('job_seeker'), async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { id } = req.params
    const { answers } = req.body

    const attempt = await prisma.screeningAttempt.findFirst({
      where: { applicationId: id, type: 'aptitude' },
    })
    if (!attempt) {
      res.status(404).json({ message: 'Assessment not found' })
      return
    }
    const data = JSON.parse(attempt.answers as string)
    const questions = data.questions as QuestionTemplate[]

    let score = 0
    questions.forEach((q, idx) => {
      const userAns = answers[idx.toString()]
      if (userAns !== undefined && userAns === q.correctIndex) {
        score += 1
      }
    })

    await prisma.screeningAttempt.update({
      where: { id: attempt.id },
      data: {
        submittedAt: new Date(),
        score: score,
        answers: JSON.stringify({ ...data, userAnswers: answers })
      }
    })

    await prisma.application.update({
      where: { id },
      data: {
        aptitudeScore: score,
        status: 'assessment_completed'
      }
    })

    res.json({ message: 'Assessment submitted successfully' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to submit' })
  }
})

applicationsRouter.post(
  '/:id/screening/start',
  requireRole('job_seeker'),
  async (req: AuthRequest, res) => {
    try {
      const u = req.user!
      const { id } = req.params

      const app = await prisma.application.findUnique({
        where: { id },
      })
      if (!app || app.jobSeekerId !== u.userId) {
        res.status(404).json({ message: 'Application not found' })
        return
      }

      // Check if attempt exists
      let attempt = await prisma.screeningAttempt.findFirst({
        where: { applicationId: id },
      })

      if (!attempt) {
        // Generate new questions
        const questions = getRandomQuestions()
        // Format for storage (we'll store them in 'answers' for now as a wrapper to avoid schema change, or just rely on client? No, must be server side to validitate)
        // Storing in 'answers' field as: { questions: [...], answers: {} }
        const initialData = {
          questions,
          userAnswers: {}
        }

        attempt = await prisma.screeningAttempt.create({
          data: {
            applicationId: id,
            answers: JSON.stringify(initialData),
            startedAt: new Date(),
          },
        })
      }

      // Parse existing to return questions
      const data = attempt.answers ? JSON.parse(attempt.answers) : {}
      const questions = data.questions || []

      res.json({
        attemptId: attempt.id,
        questions: questions.map((q: QuestionTemplate, idx: number) => ({
          id: `q-${idx}`, // Generate temp ID if not present
          ...q,
          solution: undefined, // Hide solution
          correctIndex: undefined, // Hide correct index
          options: q.options?.map((text, i) => ({ id: i.toString(), text })),
        })),
        duration_minutes: 45,
        cutoff: 70,
      })

    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Failed to start screening' })
    }
  }
)

// Helper to prepare source code with driver for testing
export function prepareSource(lang: string, userCode: string, input: string, funcName: string): string {
  // Common adjustments
  // JS/Python input is comma separated values.
  // Existing input in testCases might be `[1,2,3], 4`.
  // Note: input string might contain newlines in original data but `testCases` in file has commas.

  if (lang === 'javascript') {
    return `${userCode}
try {
  const result = ${funcName}(${input});
  console.log(JSON.stringify(result));
} catch(e) { console.error(e.message); }`
  }

  if (lang === 'python') {
    let pyInput = input.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')
    return `${userCode}
import json
try:
    result = ${funcName}(${pyInput})
    print(json.dumps(result))
except Exception as e:
    print(str(e))`
  }

  if (lang === 'java') {
    // Input `[1,2,3], 2` -> `new int[]{1,2,3}, 2`
    const args = input.replace(/\[/g, 'new int[]{').replace(/\]/g, '}')
    // We assume the user code is `class Solution { ... }`
    return `${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            Solution s = new Solution();
            System.out.println(s.${funcName}(${args}));
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}`
  }

  if (lang === 'csharp' || lang === 'c#') {
    // Input `[1,2,3], 2` -> `new int[]{1,2,3}, 2`
    const args = input.replace(/\[/g, 'new int[]{').replace(/\]/g, '}')
    return `using System;
using System.Collections.Generic;

${userCode}

public class Program {
    public static void Main() {
        try {
            Solution s = new Solution();
            Console.WriteLine(s.${funcName.charAt(0).toUpperCase() + funcName.slice(1)}(${args}));
        } catch (Exception e) {
            Console.WriteLine(e.Message);
        }
    }
}`
  }

  if (lang === 'cpp' || lang === 'c++') {
    // Input `[1,2,3], 2` -> `{1,2,3}, 2`
    const args = input.replace(/\[/g, '{').replace(/\]/g, '}')
    return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>

using namespace std;

${userCode}

int main() {
    Solution s;
    auto res = s.${funcName}(${args});
    // Simple print for int/bool. Vectors need helper.
    // Assuming int/bool/float return for now based on questions.
    cout << boolalpha << res << endl;
    return 0;
}`
  }

  if (lang === 'c') {
    // Input `[1,2,3], 2` -> `(int[]){1,2,3}, 3, 2` (inject size)
    // Extract array to count size.
    // Heuristic: finding [ ... ] block.
    let args = input
    const arrayMatch = input.match(/\[(.*?)\]/)
    let size = 0
    if (arrayMatch) {
      const content = arrayMatch[1]
      size = content.split(',').filter(x => x.trim().length > 0).length
      // Replace [ ... ] with (int[]){ ... }, size
      args = input.replace(/\[(.*?)\]/, `(int[]){$1}, ${size}`)
    }

    return `#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>

${userCode}

int main() {
    // Assuming int/bool return
    printf("%d", ${funcName}(${args}));
    return 0;
}`
  }

  return userCode
}

// Function name mapping per question content (heuristic)
export function getFuncName(content: string): string {
  if (content.includes('Two Sum')) return 'twoSum'
  if (content.includes('Palindrome')) return 'isPalindrome'
  if (content.includes('Reverse String')) return 'reverseString'
  if (content.includes('FizzBuzz')) return 'fizzBuzz'
  // New Coding questions
  if (content.includes('Subarray Sum Equals K')) return 'subarraySum'
  if (content.includes('Subarray Sums Divisible by K')) return 'subarraysDivByK'
  if (content.includes('Maximum Average Subarray I')) return 'findMaxAverage'
  if (content.includes('Find Subarrays With Equal Sum')) return 'findSubarrays'
  return 'solution'
}

applicationsRouter.post(
  '/:id/screening/run-code',
  requireRole('job_seeker'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params
      const { questionId, code, language, type } = req.body as { questionId: string; code: string; language: string; type?: string }

      // Get attempt - Support specific type if provided, else default to first (screening)
      const where: any = { applicationId: id }
      if (type) where.type = type

      // If no type specified, we might grab the wrong one if multiple exist.
      // But preserving backward compat for screening (which doesn't send type yet) implies findFirst is risky if coding exists.
      // However, usually screening is done before coding/aptitude.
      // Ideally client should send type.

      const attempt = await prisma.screeningAttempt.findFirst({
        where,
        orderBy: { startedAt: 'desc' } // Get latest if ambiguity
      })
      if (!attempt || !attempt.answers) {
        res.status(404).json({ message: 'Assessment not found' })
        return
      }

      const data = JSON.parse(attempt.answers)
      const qIndex = parseInt(questionId.replace('q-', ''), 10)
      const question = data.questions[qIndex] as QuestionTemplate

      if (!question || !question.testCases) {
        res.status(400).json({ message: 'Question does not have test cases' })
        return
      }

      const results = []
      const funcName = getFuncName(question.content)
      const pistonLang = language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : language

      // Run each test case (Limit concurrency or run sequential)
      for (const tc of question.testCases) {
        // Prepare source with driver code
        const source = prepareSource(language, code, tc.input, funcName)

        // Map language names for Piston if needed
        let pistonLang = language
        if (language === 'c#') pistonLang = 'csharp'
        if (language === 'c++') pistonLang = 'cpp'
        if (language === 'python') pistonLang = 'python'
        if (language === 'javascript') pistonLang = 'javascript'
        if (language === 'c') pistonLang = 'c'

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

          if (!runRes.ok) throw new Error('Piston error')

          const runData = await runRes.json()
          const output = (runData as any).run?.stdout?.trim() ?? ''
          const error = (runData as any).run?.stderr?.trim() ?? ''

          // Compare (naive string comparison of JSON)
          const passed = !error && (output === tc.expected || output === JSON.stringify(JSON.parse(tc.expected)))

          results.push({
            input: tc.input,
            expected: tc.expected,
            output: error || output,
            passed
          })

        } catch (err) {
          results.push({
            input: tc.input,
            expected: tc.expected,
            output: 'Error executing code',
            passed: false
          })
        }
      }

      res.json({ results })

    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Failed to run code' })
    }
  }
)

applicationsRouter.patch('/:id/coding-assessment/send', requireRole('recruiter'), async (req: AuthRequest, res) => {
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
      data: { status: 'coding_sent' },
    })
    res.json(appToJson(updated as any))
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to send coding assessment' })
  }
})

applicationsRouter.post('/:id/coding-assessment/start', requireRole('job_seeker'), async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { id } = req.params
    const app = await prisma.application.findUnique({ where: { id } })
    if (!app || app.jobSeekerId !== u.userId) {
      res.status(404).json({ message: 'Application not found' })
      return
    }

    let attempt = await prisma.screeningAttempt.findFirst({
      where: { applicationId: id, type: 'coding' },
    })

    if (!attempt) {
      // Pick 2 random from CODING_POOL
      const shuffled = CODING_POOL.sort(() => 0.5 - Math.random())
      const questions = shuffled.slice(0, 2)

      attempt = await prisma.screeningAttempt.create({
        data: {
          applicationId: id,
          type: 'coding',
          answers: JSON.stringify({ questions, userAnswers: {} }),
          startedAt: new Date(),
        },
      })
    }

    const data = attempt.answers ? JSON.parse(attempt.answers) : {}
    const questions = data.questions || []

    res.json({
      attemptId: attempt.id,
      questions: questions.map((q: QuestionTemplate, idx: number) => ({
        id: `q-${idx}`,
        content: q.content,
        options: q.options?.map((text, i) => ({ id: i.toString(), text })),
        type: q.type,
        category: q.category,
        examples: q.examples,
        starterCode: q.starterCode,
        testCases: q.testCases // Typically we might hide this, but UI needs it for "Run" potentially. 
        // Actually UI needs examples. Test cases are for internal run or "Run" button if we show them cases. 
        // ScreeningTest shows cases. So we send them.
      })),
      duration_minutes: 60,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to start coding assessment' })
  }
})

applicationsRouter.post('/:id/coding-assessment/submit', requireRole('job_seeker'), async (req: AuthRequest, res) => {
  try {
    const u = req.user!
    const { id } = req.params
    const { answers, language = 'javascript' } = req.body

    const attempt = await prisma.screeningAttempt.findFirst({
      where: { applicationId: id, type: 'coding' },
    })
    if (!attempt) {
      res.status(404).json({ message: 'Assessment not found' })
      return
    }
    const data = JSON.parse(attempt.answers as string)
    const questions = data.questions as QuestionTemplate[]

    // Grading Logic: Run all test cases for each question
    let totalScore = 0

    // We need to execute code for each question.
    // This can be slow. In prod we'd queue this. For prototype we await.
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const userCode = answers[i.toString()]
      let passedAll = false

      if (userCode) {
        const funcName = getFuncName(q.content)
        // Check all test cases
        if (q.testCases) {
          let allCasesPassed = true
          for (const tc of q.testCases) {
            try {
              // NOTE: We are running piston calls here sequentially. 
              // If there are 2 questions * 2 cases = 4 calls. 
              // Piston might rate limit or be slow.
              const source = prepareSource(language, userCode, tc.input, funcName)

              // Map language names for Piston
              let pistonLang = language
              if (language === 'c#') pistonLang = 'csharp'
              if (language === 'c++') pistonLang = 'cpp'
              if (language === 'python') pistonLang = 'python'
              if (language === 'javascript') pistonLang = 'javascript'
              if (language === 'c') pistonLang = 'c'

              const runRes = await fetch('https://emkc.org/api/v2/piston/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  language: pistonLang,
                  version: '*',
                  files: [{ content: source }]
                })
              })
              if (!runRes.ok) { allCasesPassed = false; break; }
              const runData = await runRes.json()
              const output = (runData as any).run?.stdout?.trim() ?? ''
              const error = (runData as any).run?.stderr?.trim() ?? ''
              const passed = !error && (output === tc.expected || output === JSON.stringify(JSON.parse(tc.expected)))

              if (!passed) { allCasesPassed = false; break; }
            } catch (err) {
              allCasesPassed = false; break;
            }
          }
          passedAll = allCasesPassed
        }
      }

      if (passedAll) {
        totalScore += 25
      }
    }

    await prisma.screeningAttempt.update({
      where: { id: attempt.id },
      data: {
        submittedAt: new Date(),
        score: totalScore,
        answers: JSON.stringify({ ...data, userAnswers: answers })
      }
    })

    // Update Application
    await prisma.application.update({
      where: { id },
      data: {
        codingScore: totalScore,
        status: 'coding_completed'
      }
    })

    res.json({ message: 'Assessment submitted successfully' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to submit' })
  }
})
