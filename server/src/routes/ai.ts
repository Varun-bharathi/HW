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

    const t = title.toLowerCase()
    let description = ''

    if (t.includes('frontend') || t.includes('front-end') || t.includes('front end') || t.includes('ui/ux') || t.includes('react') || t.includes('angular') || t.includes('vue')) {
      description = `We are looking for a ${title.trim()} to join our team. You will focus on building highly responsive, accessible, and user-friendly web interfaces.

## Responsibilities
- Architect, build, and maintain excellent front-end web applications
- Collaborate with designers to translate wireframes into interactive UI components
- Optimize applications for maximum speed and scalability across devices
- Ensure the technical feasibility of UI/UX designs
- Debug and resolve frontend issues and performance bottlenecks

## Requirements
- Proven experience working as a ${title.trim()} or similar role
- Proficiency in ${skillsText} and modern CSS
- Deep understanding of web performance, accessibility, and browser compatibility
- Experience with testing frameworks (e.g., Jest, Cypress)
- Strong eye for design and attention to detail

## Nice to have
- Experience with state management libraries
- Knowledge of server-side rendering or static site generation
- Portfolio of interactive web applications`
    } else if (t.includes('backend') || t.includes('back-end') || t.includes('back end') || t.includes('node') || t.includes('java') || t.includes('python') || t.includes('spring')) {
      description = `We are looking for a ${title.trim()} to join our backend engineering team. You will be responsible for building robust APIs and scaling our server architecture.

## Responsibilities
- Design, implement, and maintain scalable backend services and REST/GraphQL APIs
- Design database schemas and optimize query performance
- Integrate third-party systems and external APIs
- Ensure applications are secure, performant, and reliable
- Write comprehensive unit and integration tests

## Requirements
- Strong software engineering background in backend development
- Experience with ${skillsText}
- Solid understanding of database systems (SQL and NoSQL)
- Experience with cloud platforms (AWS, GCP, Azure) and containerization
- Knowledge of authentication and authorization protocols

## Nice to have
- Experience with real-time systems or message brokers
- Familiarity with CI/CD pipelines and DevOps practices`
    } else if (t.includes('data') || t.includes('machine learning') || t.includes('ai ') || t.includes('analytics')) {
      description = `We are seeking a talented ${title.trim()} to help us derive insights from complex datasets and build intelligent systems.

## Responsibilities
- Develop and deploy machine learning models or data pipelines
- Analyze large amounts of information to discover trends and patterns
- Collaborate with engineering and product teams to integrate models into the platform
- Present information using data visualization techniques
- Propose solutions and strategies to business challenges

## Requirements
- Proven experience as a ${title.trim()} or Data Analyst
- Proficiency with ${skillsText}
- Strong math skills (e.g., statistics, algebra) and problem-solving aptitude
- Experience with data visualization tools
- Analytical mind and business acumen

## Nice to have
- Advanced degree in Data Science, Mathematics, Computer Science, or similar
- Experience working with cloud-based data warehouses`
    } else if (t.includes('devops') || t.includes('site reliability') || t.includes('sre') || t.includes('infrastructure')) {
      description = `We are looking for a ${title.trim()} to manage our infrastructure and ensure our applications run smoothly and securely.

## Responsibilities
- Design, implement, and maintain CI/CD pipelines
- Manage and monitor cloud infrastructure for performance, reliability, and security
- Automate repetitive tasks and reduce manual intervention
- Troubleshoot system outages and perform root cause analysis
- Maintain backup, disaster recovery, and fault tolerance systems

## Requirements
- Proven track record as a ${title.trim()} or Cloud Engineer
- Expertise with ${skillsText} and infrastructure-as-code
- Deep understanding of containerization (Docker, Kubernetes)
- Strong background in Linux administration and shell scripting
- Experience with monitoring and logging tools

## Nice to have
- Security certifications or strong background in DevSecOps
- On-call experience in a high-availability environment`
    } else if (t.includes('fullstack') || t.includes('full-stack') || t.includes('full stack')) {
      description = `We are seeking a versatile ${title.trim()} to work on both client-side and server-side components of our applications.

## Responsibilities
- End-to-end development of feature sets, spanning front-end and back-end
- Design client-side and server-side architecture
- Build the front-end of applications through appealing visual design
- Develop and manage well-functioning databases and applications
- Test software to ensure responsiveness and efficiency

## Requirements
- Proven experience as a ${title.trim()} or similar role
- Experience working with ${skillsText}
- Knowledge of multiple front-end languages and libraries
- Knowledge of multiple back-end languages and frameworks
- Familiarity with databases, web servers, and UI/UX design

## Nice to have
- Experience building mobile applications
- Great attention to detail and organizational skills`
    } else {
      description = `We are looking for a ${title.trim()} to join our team. You will work on exciting projects, collaborate with cross-functional teams, and contribute to our core objectives.

## Responsibilities
- Take ownership of your domain and deliver high-quality outcomes
- Collaborate with team members to solve complex problems
- Participate in planning, execution, and review processes
- Continuously learn and adapt to new industry trends
- Help improve existing processes, workflows, and standards

## Requirements
- Relevant experience operating effectively as a ${title.trim()}
- Demonstrated ability to work with ${skillsText}
- Strong problem-solving and communication skills
- Ability to work independently and as part of a team
- Proactive attitude and willingness to take initiative

## Nice to have
- Pertinent certifications or a portfolio of previous work
- Familiarity with modern industry software and practices`
    }

    res.json({ description })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: 'Failed to generate description' })
  }
})
