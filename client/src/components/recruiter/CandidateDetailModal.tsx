import { X } from 'lucide-react'
import type { ApplicationListItem } from '@/api/jobs'

interface CandidateDetailModalProps {
  application: ApplicationListItem
  onClose: () => void
}

function skillGaps(jobSkills: string[], resumeSkills: string[]): string[] {
  const r = resumeSkills.map((s) => s.toLowerCase())
  return jobSkills.filter((js) => !r.some((rs) => rs.includes(js.toLowerCase()) || js.toLowerCase().includes(rs)))
}

export function CandidateDetailModal({ application, onClose }: CandidateDetailModalProps) {
  const name = application.job_seeker?.full_name ?? '—'
  const parsed = application.resume_parsed
  const skills = parsed?.skills ?? []
  const experience = parsed?.experience
  const summary = parsed?.summary
  const jobSkills = application.job?.required_skills ?? []
  const gaps = skillGaps(jobSkills, skills)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Candidate · {name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Resume–JD match
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-400">
                {application.resume_jd_match != null ? `${application.resume_jd_match}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Screening score
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {application.screening_score != null ? `${application.screening_score}%` : '—'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Parsed resume data</h3>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-300 space-y-1">
              {skills.length > 0 && <p>Skills: {skills.join(', ')}</p>}
              {experience && <p>Experience: {experience}</p>}
              {summary && <p>Summary: {summary}</p>}
              {!skills.length && !experience && !summary && (
                <p className="text-slate-500">No parsed data yet.</p>
              )}
            </div>
          </div>

          {gaps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-2">Skill gaps vs JD</h3>
              <p className="text-sm text-slate-400">
                Missing or weaker: {gaps.join(', ')}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Match breakdown</h3>
            <p className="text-sm text-slate-400">
              Resume–JD match is based on overlap between job required skills and parsed resume
              skills. Skill gaps list required skills not clearly present on the resume.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
