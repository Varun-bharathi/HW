import { Link } from 'react-router-dom'
import { FileCheck, ExternalLink } from 'lucide-react'
import { mockApplications, mockJobs } from '@/api/mockData'
import type { ApplicationStatus } from '@/types'

const statusLabels: Record<ApplicationStatus, string> = {
  screening: 'Screening',
  passed_screening: 'Passed screening',
  resume_submitted: 'Resume submitted',
  under_review: 'Under review',
  shortlisted: 'Shortlisted',
  assessment_sent: 'Assessment sent',
  assessment_completed: 'Assessment done',
  interview_scheduled: 'Interview',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

export function MyApplications() {
  const applications = mockApplications.map((a) => ({
    ...a,
    job: mockJobs.find((j) => j.id === a.job_id),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My applications</h1>
        <p className="mt-1 text-slate-400">Track progress and interview invitations</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="divide-y divide-slate-800">
          {applications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileCheck className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p>No applications yet.</p>
              <Link to="/seeker/jobs" className="mt-2 inline-block text-emerald-400 hover:underline">
                Find jobs to apply
              </Link>
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="p-4 flex items-center justify-between hover:bg-slate-800/30"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">{app.job?.title ?? 'Job'}</p>
                  <p className="text-sm text-slate-400">
                    {app.job?.location ?? '—'} · {app.job?.employment_type ?? '—'}
                  </p>
                  {app.screening_score != null && (
                    <p className="mt-1 text-xs text-slate-500">
                      Screening: {app.screening_score}% · Match: {app.resume_jd_match ?? '—'}%
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      app.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : app.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : app.status === 'shortlisted'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-600/50 text-slate-400'
                    }`}
                  >
                    {statusLabels[app.status]}
                  </span>
                  {app.job && (
                    <Link
                      to={`/seeker/jobs/${app.job.id}`}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white"
                      title="View job"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
