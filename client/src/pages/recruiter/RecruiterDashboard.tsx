import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  Briefcase,
  ArrowRight,
  Send,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { jobsApi } from '@/api/jobs'

const funnelData = [
  { stage: 'Applied', count: 6, fill: '#0ea5e9' },
  { stage: 'Screened', count: 4, fill: '#38bdf8' },
  { stage: 'Interview', count: 1, fill: '#bae6fd' },
]

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
  const liveJobs = jobs.filter((j) => j.status === 'live')
  const totalApplicants = jobs.length * 3

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Job posting stats, applicant funnel, and score trends
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Live jobs</p>
              <p className="mt-1 text-2xl font-bold text-white">{liveJobs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-brand-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total applicants</p>
              <p className="mt-1 text-2xl font-bold text-white">{totalApplicants}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Applicant funnel</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  stroke="#94a3b8"
                  fontSize={12}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Score trend (last 7 days)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { day: 'Mon', avg: 76 },
                  { day: 'Tue', avg: 81 },
                  { day: 'Wed', avg: 79 },
                  { day: 'Thu', avg: 85 },
                  { day: 'Fri', avg: 82 },
                  { day: 'Sat', avg: 84 },
                  { day: 'Sun', avg: 86 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="avg" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Avg %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent jobs</h2>
          <Link
            to="/recruiter/jobs/new"
            className="text-sm font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            Post job
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="px-4 py-2 text-sm text-slate-500 border-b border-slate-800">
          Draft jobs are not visible to job seekers. Click <strong>Publish</strong> to go live.
        </p>
        <div className="divide-y divide-slate-800">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading…</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-white">{job.title}</p>
                  <p className="text-sm text-slate-400">
                    {job.location} · {job.employment_type}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${job.status === 'live'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-600/50 text-slate-400'
                      }`}
                  >
                    {job.status}
                  </span>
                  {job.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => publishMu.mutate(job.id)}
                      disabled={publishMu.isPending && publishMu.variables === job.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {publishMu.isPending && publishMu.variables === job.id ? 'Publishing…' : 'Publish'}
                    </button>
                  )}
                  <Link
                    to={`/recruiter/jobs/${job.id}/edit`}
                    className="text-sm font-medium text-slate-400 hover:text-white"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="text-sm font-medium text-brand-400 hover:text-brand-300"
                  >
                    View applicants
                  </Link>
                </div>
              </div>
            )))}
        </div>
      </div>
    </div>
  )
}
