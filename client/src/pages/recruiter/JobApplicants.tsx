import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronUp, ChevronDown, User, Check, X, Code, FileCheck, Calendar, UserCheck } from 'lucide-react'
import { jobsApi, type ApplicationListItem } from '@/api/jobs'
import { applicationsApi } from '@/api/applications'
import { CandidateDetailModal } from '@/components/recruiter/CandidateDetailModal'

type SortKey = 'name' | 'match' | 'score' | 'status'
type SortDir = 'asc' | 'desc'

const statusLabels: Record<string, string> = {
  screening: 'Screening',
  screening_submitted: 'Screening done',
  passed_screening: 'Passed screening',
  passed_aptitude: 'Passed aptitude',
  resume_submitted: 'Resume submitted',
  under_review: 'Under review',
  shortlisted: 'Shortlisted',
  assessment_sent: 'Assessment sent',
  assessment_completed: 'Assessment done',
  coding_sent: 'Coding sent',
  coding_completed: 'Coding done',
  passed_coding: 'Passed coding assessment',
  interview_scheduled: 'Interview',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

export function JobApplicants() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.get(id!),
    enabled: !!id,
  })
  const { data: applications = [] } = useQuery({
    queryKey: ['jobs', id, 'applications'],
    queryFn: () => jobsApi.applications(id!),
    enabled: !!id,
  })
  const acceptMu = useMutation({
    mutationFn: (appId: string) => applicationsApi.accept(appId),
    onSuccess: () => {
      if (id) {
        qc.invalidateQueries({ queryKey: ['jobs', id, 'applications'] })
        qc.invalidateQueries({ queryKey: ['job', id] })
      }
    },
  })
  const rejectMu = useMutation({
    mutationFn: (appId: string) => applicationsApi.reject(appId),
    onSuccess: () => {
      if (id) {
        qc.invalidateQueries({ queryKey: ['jobs', id, 'applications'] })
        qc.invalidateQueries({ queryKey: ['job', id] })
      }
    },
  })

  const sendAssessmentMu = useMutation({
    mutationFn: (appId: string) => applicationsApi.sendAssessment(appId),
    onSuccess: () => {
      if (id) {
        qc.invalidateQueries({ queryKey: ['jobs', id, 'applications'] })
        qc.invalidateQueries({ queryKey: ['job', id] })
      }
    },
  })

  const sendCodingMu = useMutation({
    mutationFn: (appId: string) => applicationsApi.sendCodingAssessment(appId),
    onSuccess: () => {
      if (id) {
        qc.invalidateQueries({ queryKey: ['jobs', id, 'applications'] })
        qc.invalidateQueries({ queryKey: ['job', id] })
      }
    },
  })


  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'score',
    dir: 'desc',
  })
  const [selected, setSelected] = useState<ApplicationListItem | null>(null)
  const navigate = useNavigate()

  // Track lobby status for interview_scheduled applications
  const [lobbyStatus, setLobbyStatus] = useState<Record<string, { inLobby: boolean; admitted: boolean; roomId: string | null }>>({}
  )

  const interviewApps = useMemo(
    () => applications.filter((a) => a.status === 'interview_scheduled'),
    [applications]
  )

  useEffect(() => {
    if (interviewApps.length === 0) return
    const poll = async () => {
      const results = await Promise.allSettled(
        interviewApps.map((a) => applicationsApi.getInterviewStatus(a.id))
      )
      const next: typeof lobbyStatus = {}
      interviewApps.forEach((a, i) => {
        const r = results[i]
        if (r.status === 'fulfilled') {
          next[a.id] = { inLobby: r.value.inLobby, admitted: r.value.admitted, roomId: r.value.roomId }
        }
      })
      setLobbyStatus(next)
    }
    poll()
    const t = setInterval(poll, 3000)
    return () => clearInterval(t)
  }, [interviewApps])

  const admitMu = useMutation({
    mutationFn: (appId: string) => applicationsApi.admitCandidate(appId),
    onSuccess: (data, appId) => {
      const candidateName = applications.find((a) => a.id === appId)?.job_seeker?.full_name ?? ''
      navigate(`/interview/room/${appId}`, { state: { roomId: data.roomId, role: 'recruiter', candidateName } })
    },
  })

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

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Invalid job.</p>
        <Link to="/recruiter/dashboard" className="mt-2 inline-block text-brand-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    )
  }
  if (jobLoading || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">{jobLoading ? 'Loading…' : 'Job not found.'}</p>
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
            className="text-sm text-slate-400 hover:text-slate-100 mb-1 inline-block"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Applicants · {job.title}</h1>
          <p className="mt-1 text-slate-400">
            Test scores, status. View profile, send assessment, accept/reject.
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-slate-400 mr-2 shrink-0">Sort by:</span>
          <button onClick={() => toggleSort('name')} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 transition-colors ${sort.key === 'name' ? 'bg-brand-500/20 text-slate-100 border-brand-500/30' : 'bg-black text-slate-400 border-slate-800 hover:bg-slate-900'}`}>Candidate {sort.key === 'name' && (sort.dir === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</button>
          <button onClick={() => toggleSort('match')} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 transition-colors ${sort.key === 'match' ? 'bg-brand-500/20 text-slate-100 border-brand-500/30' : 'bg-black text-slate-400 border-slate-800 hover:bg-slate-900'}`}>Match {sort.key === 'match' && (sort.dir === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</button>
          <button onClick={() => toggleSort('score')} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 transition-colors ${sort.key === 'score' ? 'bg-brand-500/20 text-slate-100 border-brand-500/30' : 'bg-black text-slate-400 border-slate-800 hover:bg-slate-900'}`}>Score {sort.key === 'score' && (sort.dir === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</button>
          <button onClick={() => toggleSort('status')} className={`shrink-0 text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 transition-colors ${sort.key === 'status' ? 'bg-brand-500/20 text-slate-100 border-brand-500/30' : 'bg-black text-slate-400 border-slate-800 hover:bg-slate-900'}`}>Status {sort.key === 'status' && (sort.dir === 'asc' ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>)}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((app) => (
            <div key={app.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-4 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <button
                  onClick={() => setSelected(app)}
                  className="flex items-center gap-3 text-left font-medium text-slate-100 hover:text-brand-600"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-base font-bold line-clamp-1">{app.job_seeker?.full_name ?? '—'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Match: <span className="font-mono text-brand-600 font-bold">{app.resume_jd_match != null ? `${app.resume_jd_match}%` : '—'}</span></div>
                  </div>
                </button>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${app.status === 'accepted'
                    ? 'bg-emerald-500/20 text-emerald-600'
                    : app.status === 'rejected'
                      ? 'bg-red-500/20 text-red-600'
                      : app.status === 'shortlisted'
                        ? 'bg-amber-500/20 text-amber-600'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                >
                  {statusLabels[app.status] ?? app.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="px-2.5 py-1.5 bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">
                  Screening: {app.screening_score != null ? `${app.screening_score}%` : '—'}
                </span>
                {app.aptitude_score != null && (
                  <span className="px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-md border border-amber-200">
                    Aptitude: {app.aptitude_score}/10
                  </span>
                )}
                {app.coding_score != null && (
                  <span className="px-2.5 py-1.5 bg-purple-100 text-purple-700 rounded-md border border-purple-200">
                    Coding: {app.coding_score}/50
                  </span>
                )}
              </div>

              <div className="border-t border-slate-800 pt-4 mt-auto flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => setSelected(app)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-slate-900 transition-colors"
                  title="View profile"
                >
                  <User className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  {(app.status === 'accepted' || app.status === 'shortlisted') && (
                    <button
                      onClick={() => sendAssessmentMu.mutate(app.id)}
                      disabled={sendAssessmentMu.isPending}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-brand-100 hover:text-brand-600 disabled:opacity-30 transition-colors"
                      title="Send Aptitude Test"
                    >
                      <FileCheck className="w-4 h-4" />
                    </button>
                  )}

                  {app.status === 'passed_aptitude' && (
                    <button
                      onClick={() => sendCodingMu.mutate(app.id)}
                      disabled={sendCodingMu.isPending}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-purple-100 hover:text-purple-600 disabled:opacity-30 transition-colors"
                      title="Send Coding Assessment"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                  )}

                  {app.status === 'interview_scheduled' && (() => {
                    const ls = lobbyStatus[app.id]
                    const waiting = ls?.inLobby && !ls?.admitted
                    return (
                      <button
                        onClick={() => admitMu.mutate(app.id)}
                        disabled={admitMu.isPending}
                        className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-100 text-brand-600 hover:bg-brand-200 text-xs font-bold disabled:opacity-50 transition-colors"
                        title="Admit candidate & join interview"
                      >
                        {waiting && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        )}
                        <UserCheck className="w-3.5 h-3.5" />
                        {waiting ? 'Wait' : 'Start'}
                      </button>
                    )
                  })()}

                  {app.status !== 'accepted' &&
                    app.status !== 'rejected' &&
                    app.status !== 'passed_aptitude' &&
                    app.status !== 'coding_sent' &&
                    app.status !== 'interview_scheduled' &&
                    app.status !== 'assessment_sent' && (
                      <>
                        <button
                          onClick={() => acceptMu.mutate(app.id)}
                          disabled={acceptMu.isPending || rejectMu.isPending}
                          className="px-3 py-1.5 rounded-md border border-emerald-400 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold disabled:opacity-50 transition-colors"
                          title="Accept/Pass"
                        >
                          SEND
                        </button>
                        <button
                          onClick={() => rejectMu.mutate(app.id)}
                          disabled={acceptMu.isPending || rejectMu.isPending}
                          className="px-3 py-1.5 rounded-md border border-rose-400 text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-bold disabled:opacity-50 transition-colors"
                          title="Reject"
                        >
                          REJECT
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {sorted.length === 0 && (
          <div className="py-12 border border-slate-800 rounded-xl bg-slate-900/50 mt-4 text-center text-slate-400">
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
