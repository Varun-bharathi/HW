/// <reference types="node" />
import { prisma } from '../src/lib/prisma.js'
import bcrypt from 'bcryptjs'

async function main() {
  const hash = await bcrypt.hash('password123', 10)
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@HireEngine.demo' },
    create: {
      email: 'recruiter@HireEngine.demo',
      passwordHash: hash,
      role: 'recruiter',
    },
    update: {},
  })
  await prisma.recruiterProfile.upsert({
    where: { userId: recruiter.id },
    create: { userId: recruiter.id, fullName: 'Demo Recruiter', company: 'HireEngine Demo' },
    update: {},
  })

  const seeker = await prisma.user.upsert({
    where: { email: 'seeker@HireEngine.demo' },
    create: {
      email: 'seeker@HireEngine.demo',
      passwordHash: hash,
      role: 'job_seeker',
    },
    update: {},
  })
  await prisma.jobSeekerProfile.upsert({
    where: { userId: seeker.id },
    create: { userId: seeker.id, fullName: 'Demo Seeker' },
    update: {},
  })

  const job = await prisma.job.findFirst({ where: { recruiterId: recruiter.id } })
  if (!job) {
    const j = await prisma.job.create({
      data: {
        recruiterId: recruiter.id,
        title: 'Senior Frontend Engineer',
        description: 'Build scalable React applications. TypeScript, React Query, modern tooling.',
        requiredSkills: JSON.stringify(['React', 'TypeScript', 'CSS', 'REST APIs']),
        experienceLevel: 'senior',
        location: 'Remote',
        employmentType: 'full_time',
        status: 'live',
        cutoffScore: 70,
        screeningConfig: JSON.stringify({ duration_minutes: 45, cutoff: 70 }),
      },
    })
    const a = await prisma.assessment.create({
      data: {
        jobId: j.id,
        type: 'preliminary',
        title: 'Preliminary Screening',
        config: JSON.stringify({ duration_minutes: 45, cutoff: 70 }),
      },
    })
    const mcq = [
      { content: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2 },
      { content: 'Which React hook is for side effects?', options: ['useState', 'useEffect', 'useContext', 'useMemo'], correct: 1 },
    ]
    for (let i = 0; i < mcq.length; i++) {
      const m = mcq[i]!
      await prisma.question.create({
        data: {
          assessmentId: a.id,
          type: 'mcq',
          content: m.content,
          options: JSON.stringify(
            m.options.map((text, idx) => ({ id: `opt-${idx}`, text, correct: idx === m.correct }))
          ),
          maxScore: 1,
          orderIndex: i,
        },
      })
    }
    await prisma.question.create({
      data: {
        assessmentId: a.id,
        type: 'coding',
        content: 'Implement `fib(n)` returning the n-th Fibonacci number.',
        solution: 'function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }',
        maxScore: 2,
        orderIndex: mcq.length,
      },
    })
  }
  console.log('Seed done. recruiter@HireEngine.demo / seeker@HireEngine.demo — password: password123')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
