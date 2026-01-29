import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileCheck, ExternalLink, Upload } from 'lucide-react'
import { applicationsApi } from '@/api/applications'
import type { ApplicationListItem } from '@/api/jobs'

const statusLabels: Record<string, string> = {
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
  const qc = useQueryClient()
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
  })
  const uploadMu = useMutation({
    mutationFn: ({ appId, file }: { appId: string; file: File }) =>
      applicationsApi.uploadResume(appId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
    },
  })
  const [pendingUploadId, setPendingUploadId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  function handleUploadClick(app: ApplicationListItem) {
    if (app.status !== 'passed_screening' && app.status !== 'accepted') return
    setPendingUploadId(app.id)
    fileRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingUploadId) return
    uploadMu.mutate(
      { appId: pendingUploadId, file },
      { onSettled: () => setPendingUploadId(null) }
    )
    e.target.value = ''
  }

  const uploadingId = uploadMu.isPending ? uploadMu.variables?.appId ?? null : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My applications</h1>
        <p className="mt-1 text-slate-400">Track progress and interview invitations</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="divide-y divide-slate-800">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Loading…</div>
          ) : applications.length === 0 ? (
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
                  {(app.status === 'passed_screening' || app.status === 'accepted') && (
                    <button
                      type="button"
                      onClick={() => handleUploadClick(app)}
                      disabled={uploadMu.isPending}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-medium disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingId === app.id ? 'Uploading…' : 'Upload resume'}
                    </button>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${app.status === 'accepted'
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
