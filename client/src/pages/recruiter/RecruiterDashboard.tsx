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
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Job posting stats, applicant funnel, and score trends
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Live jobs</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{liveJobs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-brand-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total applicants</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{totalApplicants}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>



      <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Recent jobs</h2>
          <Link
            to="/recruiter/jobs/new"
            className="text-sm font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            Post job
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {isLoading ? (
            <div className="p-8 text-center text-slate-600">Loading…</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 flex items-center justify-between hover:bg-slate-100/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-950">{job.title}</p>
                  <p className="text-sm text-slate-600">
                    {job.location} · {job.employment_type}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${job.status === 'live'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-600/50 text-slate-600'
                      }`}
                  >
                    {job.status}
                  </span>
                  {job.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => publishMu.mutate(job.id)}
                      disabled={publishMu.isPending && publishMu.variables === job.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-slate-950 text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {publishMu.isPending && publishMu.variables === job.id ? 'Publishing…' : 'Publish'}
                    </button>
                  )}
                  <Link
                    to={`/recruiter/jobs/${job.id}/edit`}
                    className="text-sm font-medium text-slate-600 hover:text-slate-950"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="text-sm font-medium text-brand-400 hover:text-brand-300"
                  >
                    View applicants
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this job?')) {
                        deleteMu.mutate(job.id)
                      }
                    }}
                    disabled={deleteMu.isPending && deleteMu.variables === job.id}
                    className="text-sm font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleteMu.isPending && deleteMu.variables === job.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            )))}
        </div>
      </div>
    </div>
  )
}
