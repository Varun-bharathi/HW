import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { mockJobs } from '@/api/mockData'

export function JobPostingEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const job = mockJobs.find((j) => j.id === id)

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Job not found.</p>
        <Link to="/recruiter/dashboard" className="mt-2 inline-block text-brand-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/recruiter/dashboard"
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit job</h1>
          <p className="mt-1 text-slate-400">{job.title}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-slate-400">
          Full edit form reuses Job Posting Create layout. For this demo, we only show the
          placeholder. Integrate with job update API and prefill form state.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            to={`/recruiter/jobs/${id}/applicants`}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600"
          >
            View applicants
          </Link>
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
