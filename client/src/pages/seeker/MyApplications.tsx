import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileCheck, ExternalLink, UploadCloud, Code, Video } from 'lucide-react'
import { applicationsApi } from '@/api/applications'
import type { ApplicationListItem } from '@/api/jobs'

const statusLabels: Record<string, string> = {
  screening: 'Screening',
  screening_submitted: 'Screening under review',
  passed_screening: 'Passed screening',
  resume_submitted: 'Resume submitted',
  under_review: 'Under review',
  shortlisted: 'Shortlisted',
  assessment_sent: 'Aptitude Test Pending',
  assessment_completed: 'Assessment done',
  coding_sent: 'Coding Test Pending',
  coding_completed: 'Coding done',
  passed_coding: 'Passed Coding Test',
  interview_scheduled: 'HR Interview Ready',
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
        <h1 className="text-2xl font-bold text-slate-100">My applications</h1>
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
              <FileCheck className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No applications yet.</p>
              <Link to="/seeker/jobs" className="mt-2 inline-block text-emerald-400 hover:underline">
                Find jobs to apply
              </Link>
            </div>
          ) : (
            applications.map((app) => {
              const needsResume = app.status === 'passed_screening' || app.status === 'accepted'

              if (needsResume) {
                return (
                  <div key={app.id} className="p-12 flex flex-col items-center justify-center text-center hover:bg-slate-800/30 transition-colors">
                    <div className="mb-6">
                      <p className="font-bold text-xl text-slate-100">{app.job?.title ?? 'Job'}</p>
                      <p className="text-emerald-400 font-medium mt-2">You passed the screening!</p>
                      <p className="text-sm text-slate-400 mt-1">Please upload your resume to complete your application.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUploadClick(app)}
                      disabled={uploadMu.isPending}
                      title={uploadingId === app.id ? 'Uploading…' : 'Upload your resume'}
                      className="group relative flex flex-col items-center justify-center gap-3 w-64 h-48 rounded-2xl border-2 border-dashed border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
                    >
                      {uploadingId === app.id ? (
                        <span className="w-10 h-10 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                      ) : (
                        <UploadCloud className="w-12 h-12 group-hover:-translate-y-2 transition-transform duration-300" />
                      )}
                      <span className="text-lg font-bold">
                        {uploadingId === app.id ? 'Uploading…' : 'Upload Resume'}
                      </span>
                      {!uploadingId && <span className="text-xs text-emerald-500/80">PDF, DOC, DOCX</span>}
                    </button>
                  </div>
                )
              }

              return (
                <div
                  key={app.id}
                  className="p-6 flex items-center justify-between hover:bg-slate-800/30"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-100 text-lg">{app.job?.title ?? 'Job'}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {app.job?.location ?? '—'} · {app.job?.employment_type ?? '—'}
                    </p>
                    {app.resume_jd_match != null && (
                      <p className="mt-2 inline-flex border border-brand-500/30 bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded text-xs font-mono">
                        Match: {app.resume_jd_match}%
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {app.status === 'interview_scheduled' && (
                      <Link
                        to={`/interview/lobby/${app.id}`}
                        className="group inline-flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl border-2 border-brand-500/50 bg-brand-500/10 text-brand-400 hover:border-brand-400 hover:bg-brand-500/20 transition-all duration-200"
                      >
                        <Video className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs font-medium">Join HR Interview</span>
                      </Link>
                    )}
                    {app.status === 'assessment_sent' && (
                      <Link
                        to={`/assessment/aptitude/${app.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 text-sm font-medium transition-colors"
                      >
                        <FileCheck className="w-4 h-4" />
                        Take Aptitude Test
                      </Link>
                    )}
                    {app.status === 'coding_sent' && (
                      <Link
                        to={`/assessment/coding/${app.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm font-medium transition-colors"
                      >
                        <Code className="w-4 h-4" />
                        Take Coding Test
                      </Link>
                    )}
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${app.status === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : app.status === 'rejected'
                          ? 'bg-red-500/20 text-red-500'
                          : app.status === 'shortlisted'
                            ? 'bg-amber-500/20 text-amber-500'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                    >
                      {statusLabels[app.status] ?? app.status}
                    </span>
                    {app.job && (
                      <Link
                        to={`/seeker/jobs/${app.job.id}`}
                        className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors ml-2"
                        title="View job"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
