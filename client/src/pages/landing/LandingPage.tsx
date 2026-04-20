import { Link } from 'react-router-dom'
import { Briefcase, UserCheck, Zap, BarChart3, MessageSquare } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-100">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-xl text-slate-100 flex items-center gap-2">
            <span className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-slate-100 text-sm font-mono">H</span>
            HireEngine
          </span>
          <nav className="flex items-center justify-start gap-6 flex-row-reverse">
            <Link
              to="/auth/job-seeker/login"
              className="px-4 py-2 rounded-lg bg-brand-500 text-slate-100 text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Job Seeker
            </Link>
            <Link
              to="/auth/recruiter/login"
              className="px-4 py-2 rounded-lg bg-brand-500 text-slate-100 text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Recruiter
            </Link>
            <Link to="/forum" className="text-slate-400 hover:text-slate-100 text-sm font-medium">
              Community
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight">
            Connect. <span className="text-brand-400">Match.</span> Hire.
          </h1>
          <p className="mt-6 text-lg text-slate-400">
            Screen, match, and manage candidates with AI to reduce time-to-hire and improve match quality.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            <Link
              to="/auth/recruiter/register"
              className="inline-flex items-center justify-center w-80 gap-3 px-8 py-4 rounded-xl bg-brand-500 text-slate-100 text-lg font-medium hover:bg-brand-600 transition-colors"
            >
              <Briefcase className="w-6 h-6" />
              Sign up as Recruiter
            </Link>
            <Link
              to="/auth/job-seeker/register"
              className="inline-flex items-center justify-center w-80 gap-3 px-8 py-4 rounded-xl bg-brand-500 text-slate-100 text-lg font-medium hover:bg-brand-600 transition-colors"
            >
              <UserCheck className="w-6 h-6" />
              Sign up as Job Seeker
            </Link>
          </div>
        </div>


      </main>
    </div>
  )
}
