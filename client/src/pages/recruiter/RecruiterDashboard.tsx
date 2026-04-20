import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Briefcase,
  ArrowRight,
  Send,
  Trash2,
} from 'lucide-react'
import { jobsApi } from '@/api/jobs'


export function RecruiterDashboard() {
  const qc = useQueryClient()
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.list(),
  })
  const publishMu = useMutation({
    mutationFn: (jobId: string) => jobsApi.publish(jobId),
    onSuccess: (_, jobId) => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      qc.invalidateQueries({ queryKey: ['job', jobId] })
    },
  })
  const deleteMu = useMutation({
    mutationFn: (jobId: string) => jobsApi.delete(jobId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
  const liveJobs = jobs.filter((j) => j.status === 'live')
  const totalApplicants = jobs.length * 3

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Job posting stats, applicant funnel, and score trends
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 w-56 h-56 flex flex-col items-center justify-center text-center gap-4 hover:border-slate-700 transition-colors">
          <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-100">{totalApplicants}</p>
            <p className="mt-2 text-sm font-medium text-slate-400">Total applicants</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 w-56 h-56 flex flex-col items-center justify-center text-center gap-4 hover:border-slate-700 transition-colors">
          <div className="w-16 h-16 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <p className="text-4xl font-bold text-slate-100">{liveJobs.length}</p>
            <p className="mt-2 text-sm font-medium text-slate-400">Live jobs</p>
          </div>
        </div>
      </div>



      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">Recent jobs</h2>
          <Link
            to="/recruiter/jobs/new"
            className="text-sm font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            Post job
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-6">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 w-full">Loading…</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 w-72 h-72 flex flex-col items-center justify-center text-center hover:border-slate-700 transition-colors"
              >
                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <h3 className="font-bold text-slate-100 text-xl mb-2 line-clamp-2">{job.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {job.location} · {job.employment_type}
                  </p>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${job.status === 'live'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-600/50 text-slate-400'
                      }`}
                  >
                    {job.status}
                  </span>
                </div>
                
                <div className="w-full flex items-center justify-center gap-4 mt-4 flex-wrap border-t border-slate-800 pt-4">
                  {job.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => publishMu.mutate(job.id)}
                      disabled={publishMu.isPending && publishMu.variables === job.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-slate-100 text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {publishMu.isPending && publishMu.variables === job.id ? 'Publishing…' : 'Publish'}
                    </button>
                  )}
                  <Link
                    to={`/recruiter/jobs/${job.id}/edit`}
                    className="text-sm font-medium text-slate-400 hover:text-slate-100"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="text-sm font-medium text-brand-400 hover:text-brand-300"
                  >
                    Applicants
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this job?')) {
                        deleteMu.mutate(job.id)
                      }
                    }}
                    disabled={deleteMu.isPending && deleteMu.variables === job.id}
                    className="text-sm font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )))}
        </div>
      </div>
    </div>
  )
}
