import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronUp, ChevronDown, User, Send, Check, X } from 'lucide-react'
import { mockApplications, mockJobs } from '@/api/mockData'
import { CandidateDetailModal } from '@/components/recruiter/CandidateDetailModal'
import type { Application, ApplicationStatus } from '@/types'

type SortKey = 'name' | 'match' | 'score' | 'status'
type SortDir = 'asc' | 'desc'

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

export function JobApplicants() {
  const { id } = useParams<{ id: string }>()
  const job = mockJobs.find((j) => j.id === id)
  const applications = useMemo(
    () => mockApplications.filter((a) => a.job_id === id),
    [id]
  )
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'match',
    dir: 'desc',
  })
  const [selected, setSelected] = useState<Application | null>(null)

  const sorted = useMemo(() => {
    const list = [...applications]
    list.sort((a, b) => {
      let cmp = 0
      switch (sort.key) {
        case 'name':
          cmp = (a.job_seeker?.full_name ?? '').localeCompare(b.job_seeker?.full_name ?? '')
          break
        case 'match':
          cmp = (a.resume_jd_match ?? 0) - (b.resume_jd_match ?? 0)
          break
        case 'score':
          cmp = (a.screening_score ?? 0) - (b.screening_score ?? 0)
          break
        case 'status':
          cmp = (a.status ?? '').localeCompare(b.status ?? '')
          break
      }
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return list
  }, [applications, sort])

  const toggleSort = (key: SortKey) => {
    setSort((p) => ({
      key,
      dir: p.key === key && p.dir === 'desc' ? 'asc' : 'desc',
    }))
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/recruiter/dashboard"
            className="text-sm text-slate-400 hover:text-white mb-1 inline-block"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Applicants · {job.title}</h1>
          <p className="mt-1 text-slate-400">
            Resume-JD match, test scores, status. View profile, send assessment, accept/reject.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th
                className="text-left py-3 px-4 sortable-th"
                onClick={() => toggleSort('name')}
                data-sort-active={sort.key === 'name' ? true : undefined}
              >
                <span className="flex items-center gap-1">
                  Candidate
                  {sort.key === 'name' &&
                    (sort.dir === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </span>
              </th>
              <th
                className="text-left py-3 px-4 sortable-th"
                onClick={() => toggleSort('match')}
                data-sort-active={sort.key === 'match' ? true : undefined}
              >
                <span className="flex items-center gap-1">
                  Resume–JD match
                  {sort.key === 'match' &&
                    (sort.dir === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </span>
              </th>
              <th
                className="text-left py-3 px-4 sortable-th"
                onClick={() => toggleSort('score')}
                data-sort-active={sort.key === 'score' ? true : undefined}
              >
                <span className="flex items-center gap-1">
                  Test score
                  {sort.key === 'score' &&
                    (sort.dir === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </span>
              </th>
              <th
                className="text-left py-3 px-4 sortable-th"
                onClick={() => toggleSort('status')}
                data-sort-active={sort.key === 'status' ? true : undefined}
              >
                <span className="flex items-center gap-1">
                  Status
                  {sort.key === 'status' &&
                    (sort.dir === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </span>
              </th>
              <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((app) => (
              <tr
                key={app.id}
                className="border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <button
                    onClick={() => setSelected(app)}
                    className="flex items-center gap-2 text-left font-medium text-white hover:text-brand-400"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    {app.job_seeker?.full_name ?? '—'}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-brand-400">
                    {app.resume_jd_match != null ? `${app.resume_jd_match}%` : '—'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-emerald-400">
                    {app.screening_score != null ? `${app.screening_score}%` : '—'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
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
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelected(app)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white"
                      title="View profile"
                    >
                      <User className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-brand-400"
                      title="Send assessment"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-emerald-400"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-red-400"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            No applicants yet. Share the job link to start receiving applications.
          </div>
        )}
      </div>

      {selected && (
        <CandidateDetailModal
          application={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
