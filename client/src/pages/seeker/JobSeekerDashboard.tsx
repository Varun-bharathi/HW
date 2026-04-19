import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileCheck, Search, Bell, ArrowRight } from 'lucide-react'
import { jobsApi } from '@/api/jobs'
import { applicationsApi } from '@/api/applications'

export function JobSeekerDashboard() {
  const { data: myApps = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  })
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.list(),
  })
  const suggested = jobs.filter((j) => j.status === 'live').slice(0, 2)
  const recentApps = myApps.slice(0, 3)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Track applications, discover jobs, and manage your profile
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/seeker/applications"
          className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 hover:border-slate-300 hover:bg-slate-100/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Applications</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{myApps.length}</p>
            </div>
            <FileCheck className="w-10 h-10 text-emerald-500/50 group-hover:text-emerald-400" />
          </div>
          <p className="mt-2 text-sm text-slate-600 group-hover:text-slate-700">
            View progress
            <ArrowRight className="inline w-4 h-4 ml-1" />
          </p>
        </Link>
        <Link
          to="/seeker/jobs"
          className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 hover:border-slate-300 hover:bg-slate-100/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Find jobs</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{jobs.filter((j) => j.status === 'live').length}+</p>
            </div>
            <Search className="w-10 h-10 text-brand-500/50 group-hover:text-brand-400" />
          </div>
          <p className="mt-2 text-sm text-slate-600 group-hover:text-slate-700">
            Browse openings
            <ArrowRight className="inline w-4 h-4 ml-1" />
          </p>
        </Link>
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Notifications</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">2</p>
            </div>
            <Bell className="w-10 h-10 text-amber-500/50" />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Test invite, interview update
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Recent applications</h2>
          <Link
            to="/seeker/applications"
            className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-800">
          {recentApps.length === 0 ? (
            <div className="py-12 text-center text-slate-600">
              No applications yet. <Link to="/seeker/jobs" className="text-emerald-400 hover:underline">Find jobs</Link> to apply.
            </div>
          ) : (
            recentApps.map((app) => (
              <div
                key={app.id}
                className="p-4 flex items-center justify-between hover:bg-slate-100/30"
              >
                <div>
                  <p className="font-medium text-slate-950">{app.job?.title ?? 'Job'}</p>
                  <p className="text-sm text-slate-600">
                    {app.job?.location ?? '—'} · {app.job?.employment_type ?? '—'}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    app.status === 'shortlisted'
                      ? 'bg-amber-500/20 text-amber-400'
                      : app.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-600/50 text-slate-600'
                  }`}
                >
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Suggested jobs</h2>
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
              className="block p-4 hover:bg-slate-100/30 transition-colors"
            >
              <p className="font-medium text-slate-950">{job.title}</p>
              <p className="text-sm text-slate-600">
                {job.location} · {job.employment_type} · {job.experience_level}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
