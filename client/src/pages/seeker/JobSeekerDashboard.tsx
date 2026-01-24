import { Link } from 'react-router-dom'
import { FileCheck, Search, Bell, ArrowRight } from 'lucide-react'
import { mockApplications, mockJobs } from '@/api/mockData'

export function JobSeekerDashboard() {
  const myApps = mockApplications.slice(0, 3)
  const suggested = mockJobs.filter((j) => j.status === 'live').slice(0, 2)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Track applications, discover jobs, and manage your profile
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/seeker/applications"
          className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 hover:bg-slate-800/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Applications</p>
              <p className="mt-1 text-2xl font-bold text-white">{myApps.length}</p>
            </div>
            <FileCheck className="w-10 h-10 text-emerald-500/50 group-hover:text-emerald-400" />
          </div>
          <p className="mt-2 text-sm text-slate-400 group-hover:text-slate-300">
            View progress
            <ArrowRight className="inline w-4 h-4 ml-1" />
          </p>
        </Link>
        <Link
          to="/seeker/jobs"
          className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 hover:bg-slate-800/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Find jobs</p>
              <p className="mt-1 text-2xl font-bold text-white">{suggested.length}+</p>
            </div>
            <Search className="w-10 h-10 text-brand-500/50 group-hover:text-brand-400" />
          </div>
          <p className="mt-2 text-sm text-slate-400 group-hover:text-slate-300">
            Browse openings
            <ArrowRight className="inline w-4 h-4 ml-1" />
          </p>
        </Link>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Notifications</p>
              <p className="mt-1 text-2xl font-bold text-white">2</p>
            </div>
            <Bell className="w-10 h-10 text-amber-500/50" />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Test invite, interview update
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent applications</h2>
          <Link
            to="/seeker/applications"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-800">
          {myApps.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No applications yet. <Link to="/seeker/jobs" className="text-emerald-400 hover:underline">Find jobs</Link> to apply.
            </div>
          ) : (
            myApps.map((app) => (
              <div
                key={app.id}
                className="p-4 flex items-center justify-between hover:bg-slate-800/30"
              >
                <div>
                  <p className="font-medium text-white">{app.job?.title ?? 'Job'}</p>
                  <p className="text-sm text-slate-400">
                    {app.job?.location ?? '—'} · {app.job?.employment_type ?? '—'}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    app.status === 'shortlisted'
                      ? 'bg-amber-500/20 text-amber-400'
                      : app.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-600/50 text-slate-400'
                  }`}
                >
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Suggested jobs</h2>
          <Link
            to="/seeker/jobs"
            className="text-sm font-medium text-brand-400 hover:text-brand-300"
          >
            Browse all
          </Link>
        </div>
        <div className="divide-y divide-slate-800">
          {suggested.map((job) => (
            <Link
              key={job.id}
              to={`/seeker/jobs/${job.id}`}
              className="block p-4 hover:bg-slate-800/30 transition-colors"
            >
              <p className="font-medium text-white">{job.title}</p>
              <p className="text-sm text-slate-400">
                {job.location} · {job.employment_type} · {job.experience_level}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
