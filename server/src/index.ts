import 'dotenv/config'
import path from 'path'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { jobsRouter } from './routes/jobs.js'
import { applicationsRouter } from './routes/applications.js'
import { screeningRouter } from './routes/screening.js'
import { aiRouter } from './routes/ai.js'

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use('/api/auth', authRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/screening', screeningRouter)
app.use('/api/ai', aiRouter)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  const me = err as { code?: string; message?: string }
  if (err && typeof me === 'object' && 'code' in me && me.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'Resume must be under 10MB' })
    return
  }
  if (err && typeof me === 'object' && 'code' in me) {
    res.status(400).json({ message: me.message ?? 'Upload error' })
    return
  }
  const msg = err instanceof Error ? err.message : 'Internal server error'
  res.status(500).json({ message: msg })
})

app.listen(port, () => {
  console.log(`HireFlow API http://localhost:${port}`)
})
