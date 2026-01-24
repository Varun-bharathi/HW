import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, ArrowLeft } from 'lucide-react'
import { mockJobs, mockApplications } from '@/api/mockData'

export function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const job = mockJobs.find((j) => j.id === id)
  const hasApplied = mockApplications.some((a) => a.job_id === id)

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Job not found.</p>
        <Link to="/seeker/jobs" className="mt-2 inline-block text-emerald-400 hover:underline">
          Back to jobs
        </Link>
      </div>
    )
  }

  function handleApply() {
    // In real app: start application → redirect to preliminary test
    // For demo, we use a mock screening application ID
    navigate(`/assessment/screening/a1`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/seeker/jobs"
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{job.title}</h1>
          <p className="mt-1 text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location ?? 'Remote'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {job.employment_type.replace('_', ' ')} · {job.experience_level}
            </span>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
        <p className="text-slate-300 whitespace-pre-wrap">{job.description}</p>
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Required skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {hasApplied ? (
          <span className="inline-flex items-center px-4 py-2.5 rounded-lg bg-slate-700 text-slate-400">
            Application submitted
          </span>
        ) : (
          <button
            onClick={handleApply}
            className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
          >
            Apply
          </button>
        )}
        <Link
          to="/seeker/jobs"
          className="px-6 py-3 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
        >
          Back to jobs
        </Link>
      </div>
    </div>
  )
}
