import { Router } from 'express'
import { authMiddleware, requireRole, type AuthRequest } from '../middleware/auth.js'

export const aiRouter = Router()

aiRouter.use(authMiddleware)
aiRouter.use(requireRole('recruiter'))

/**
 * POST /api/ai/generate-description
 * Body: { title: string, skills?: string[] }
 * Returns: { description: string }
 * Stub: template-based JD. Wire to OpenAI/Anthropic later via OPENAI_API_KEY.
 */
aiRouter.post('/generate-description', async (req: AuthRequest, res) => {
  try {
    const { title, skills } = (req.body as { title?: string; skills?: string[] }) ?? {}
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ message: 'title is required' })
      return
    }
    const skillList = Array.isArray(skills) ? skills : []
    const skillsText = skillList.length
      ? skillList.slice(0, 8).join(', ')
      : 'relevant technologies'

    const description = `We are looking for a ${title.trim()} to join our team. You will work on building scalable applications, collaborate with cross-functional teams, and contribute to technical decisions.

## Responsibilities
- Design and implement features
- Write clean, maintainable code
- Participate in code reviews and team discussions
- Help improve processes and tooling

## Requirements
- Experience with ${skillsText}
- Strong problem-solving and communication skills
- Ability to work independently and in a team

## Nice to have
- Familiarity with modern development practices
- Portfolio or open-source contributions`

    res.json({ description })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to generate description' })
  }
})
