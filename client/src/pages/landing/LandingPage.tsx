import { Link } from 'react-router-dom'
import { Briefcase, UserCheck, Zap, BarChart3, MessageSquare } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-xl text-white flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-mono">H</span>
            HireFlow
          </span>
          <nav className="flex items-center gap-4">
            <Link to="/forum" className="text-slate-400 hover:text-white text-sm font-medium">
              Community
            </Link>
            <Link
              to="/auth/recruiter/login"
              className="text-slate-400 hover:text-white text-sm font-medium"
            >
              Recruiter
            </Link>
            <Link
              to="/auth/job-seeker/login"
              className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Job Seeker
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
            AI-powered hiring that connects{' '}
            <span className="text-brand-400">recruiters</span> and{' '}
            <span className="text-emerald-400">job seekers</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400">
            Create jobs, screen with AI-generated tests, match resumes to JDs, and manage
            candidates—all in one platform. Reduce time-to-hire and improve match quality.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth/recruiter/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Briefcase className="w-5 h-5" />
              Sign up as Recruiter
            </Link>
            <Link
              to="/auth/job-seeker/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            >
              <UserCheck className="w-5 h-5" />
              Sign up as Job Seeker
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: 'AI screening', desc: 'Auto-generated MCQ & coding tests, resume parsing, JD matching' },
            { icon: BarChart3, title: 'Analytics', desc: 'Applicant funnel, score trends, job-level stats' },
            { icon: MessageSquare, title: 'Chat & community', desc: 'Direct messaging and forum for Q&A' },
            { icon: Briefcase, title: 'Assessments', desc: 'Embedded code editor, pause/resume tests' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors"
            >
              <Icon className="w-8 h-8 text-brand-400 mb-3" />
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
