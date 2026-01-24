import { X } from 'lucide-react'
import type { Application } from '@/types'

interface CandidateDetailModalProps {
  application: Application
  onClose: () => void
}

const mockParsed = {
  name: 'Alex Chen',
  email: 'alex@example.com',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  experience: [
    { company: 'Tech Co', role: 'Frontend Engineer', years: 3 },
    { company: 'Startup XYZ', role: 'Full-stack Developer', years: 2 },
  ],
  education: 'B.S. Computer Science',
}
const jobSkills = ['React', 'TypeScript', 'CSS', 'REST APIs']
const skillGaps = jobSkills.filter((s) => !mockParsed.skills.some((x) => x.toLowerCase().includes(s.toLowerCase())))

export function CandidateDetailModal({ application, onClose }: CandidateDetailModalProps) {
  const name = application.job_seeker?.full_name ?? mockParsed.name

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
                {application.resume_jd_match ?? '—'}%
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Screening score
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {application.screening_score ?? '—'}%
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Parsed resume data</h3>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-300 space-y-1">
              <p>Skills: {mockParsed.skills.join(', ')}</p>
              <p>Experience: {mockParsed.experience.map((e) => `${e.role} @ ${e.company}`).join('; ')}</p>
              <p>Education: {mockParsed.education}</p>
            </div>
          </div>

          {skillGaps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-2">Skill gaps vs JD</h3>
              <p className="text-sm text-slate-400">
                Missing or weaker: {skillGaps.join(', ')}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Match breakdown</h3>
            <p className="text-sm text-slate-400">
              Semantic similarity between resume and job description; skills overlap; experience
              level alignment. Full breakdown available via API.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
