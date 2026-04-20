import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, FileText, Upload } from 'lucide-react'
import { jobsApi } from '@/api/jobs'
import { aiApi } from '@/api/ai'

const employmentTypes = ['full_time', 'part_time', 'contract', 'internship']
const experienceLevels = ['entry', 'mid', 'senior', 'lead']

export function JobPostingCreate() {
  const navigate = useNavigate()
  const [jdSource, setJdSource] = useState<'manual' | 'ai' | 'file'>('manual')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const totalSteps = 6
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    skills: '' as string,
    experience_level: 'mid',
    location: '',
    employment_type: 'full_time',
    cutoff_score: 70,
    publish_immediately: false,
  })

  const skillsList = form.skills
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)

  async function handleGenerateJD() {
    if (!form.title.trim()) return
    setLoading(true)
    try {
      const { description } = await aiApi.generateDescription({
        title: form.title.trim(),
        skills: skillsList.length ? skillsList : undefined,
      })
      setForm((p) => ({ ...p, description }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const created = await jobsApi.create({
        title: form.title,
        description: form.description,
        required_skills: skillsList,
        experience_level: form.experience_level,
        location: form.location || undefined,
        employment_type: form.employment_type,
        cutoff_score: form.cutoff_score,
      })
      if (form.publish_immediately) {
        await jobsApi.publish(created.id)
      }
      navigate('/recruiter/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const nextDisabled = 
    (step === 0 && !form.title.trim()) ||
    (step === 1 && !form.description.trim())

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/recruiter/dashboard"
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-100">Create job posting</h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-slate-400 font-medium">
              Step {step + 1} of {totalSteps}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-brand-500 h-full transition-all duration-300 ease-out" 
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="relative min-h-[350px] bg-slate-900 border border-slate-800 rounded-2xl p-8">
        
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">What role are you hiring for?</h2>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Job title *
              </label>
              <input
                autoFocus
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-4 rounded-xl bg-black border border-slate-700 text-slate-100 placeholder-slate-600 text-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">Describe the role</h2>
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(['manual', 'ai', 'file'] as const).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setJdSource(src)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      jdSource === src
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50'
                        : 'bg-black text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {src === 'manual' && <FileText className="w-4 h-4" />}
                    {src === 'ai' && <Sparkles className="w-4 h-4" />}
                    {src === 'file' && <Upload className="w-4 h-4" />}
                    {src === 'manual' && 'Manual Entry'}
                    {src === 'ai' && 'Auto-generate'}
                    {src === 'file' && 'Upload PDF/DOC'}
                  </button>
                ))}
              </div>
              
              {jdSource === 'ai' && (
                <button
                  type="button"
                  onClick={handleGenerateJD}
                  disabled={loading || !form.title.trim()}
                  className="mb-4 inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? 'Generating magic...' : 'Generate using AI'}
                </button>
              )}
              {jdSource === 'file' && (
                <p className="mb-4 text-sm text-slate-400">
                  Upload a PDF or DOC file to extract job description (coming soon).
                </p>
              )}
              
              <textarea
                autoFocus={jdSource === 'manual'}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-5 py-4 rounded-xl bg-black border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[220px] transition-colors"
                placeholder="Describe the role, responsibilities, and requirements..."
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">What skills are required?</h2>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Required skills (comma- or semicolon-separated)
              </label>
              <input
                autoFocus
                type="text"
                value={form.skills}
                onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
                className="w-full px-4 py-4 rounded-xl bg-black border border-slate-700 text-slate-100 placeholder-slate-600 text-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                placeholder="e.g. React, TypeScript, Node.js"
              />
              
              {skillsList.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skillsList.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">Employment Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Experience Level
                </label>
                <div className="space-y-2">
                  {experienceLevels.map((l) => (
                    <label key={l} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.experience_level === l ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800 bg-black hover:border-slate-600'}`}>
                      <input 
                        type="radio" 
                        name="exp" 
                        value={l} 
                        checked={form.experience_level === l}
                        onChange={(e) => setForm(p => ({ ...p, experience_level: e.target.value }))}
                        className="text-brand-500 bg-slate-900 border-slate-700 focus:ring-brand-500 focus:ring-offset-slate-900" 
                      />
                      <span className="text-slate-200 capitalize">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">
                  Employment Type
                </label>
                <div className="space-y-2">
                  {employmentTypes.map((t) => (
                    <label key={t} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.employment_type === t ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800 bg-black hover:border-slate-600'}`}>
                      <input 
                        type="radio" 
                        name="emp" 
                        value={t} 
                        checked={form.employment_type === t}
                        onChange={(e) => setForm(p => ({ ...p, employment_type: e.target.value }))}
                        className="text-brand-500 bg-slate-900 border-slate-700 focus:ring-brand-500 focus:ring-offset-slate-900" 
                      />
                      <span className="text-slate-200 capitalize">{t.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">Where is this role located?</h2>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Location (or Remote)
              </label>
              <input
                autoFocus
                type="text"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-4 py-4 rounded-xl bg-black border border-slate-700 text-slate-100 placeholder-slate-600 text-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                placeholder="e.g. Remote, New York NY, London"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
            <h2 className="text-2xl font-semibold text-slate-100 mb-6">Final Details</h2>
            
            <div className="bg-black p-6 rounded-xl border border-slate-800">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Preliminary screening cutoff score (0–100)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.cutoff_score}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      cutoff_score: Math.min(100, Math.max(0, +e.target.value)),
                    }))
                  }
                  className="w-24 px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-lg text-center focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <span className="text-slate-400 text-sm">
                  Points required to pass automated screening
                </span>
              </div>
              <p className="mt-4 text-xs text-brand-400/80 bg-brand-500/10 p-3 rounded-lg">
                Note: Minimum 10 questions (MCQ + coding). You will configure the specific questions in the next step after saving.
              </p>
            </div>

            <label className="flex items-center gap-4 p-5 rounded-xl border border-slate-800 bg-black cursor-pointer hover:border-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={form.publish_immediately}
                onChange={(e) =>
                  setForm((p) => ({ ...p, publish_immediately: e.target.checked }))
                }
                className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900"
              />
              <div className="flex flex-col">
                <span className="font-medium text-slate-200">
                  Publish immediately
                </span>
                <span className="text-sm text-slate-500">
                  Make exactly this visible to job seekers right away
                </span>
              </div>
            </label>
          </div>
        )}

        <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pt-6 border-t border-slate-800 mt-12 bg-slate-900">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-2.5 rounded-lg bg-black border border-slate-800 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
          ) : (
            <Link
              to="/recruiter/dashboard"
              className="px-6 py-2.5 rounded-lg text-slate-500 font-medium hover:text-slate-300 transition-colors"
            >
              Cancel
            </Link>
          )}

          {step < totalSteps - 1 ? (
             <button
               type="button"
               disabled={nextDisabled}
               onClick={() => setStep(s => s + 1)}
               className="px-8 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-white disabled:opacity-50 transition-colors"
             >
               Next
             </button>
          ) : (
             <button
               type="submit"
               disabled={loading}
               className="px-8 py-2.5 rounded-lg bg-brand-500 text-white font-bold hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-lg shadow-brand-500/20"
             >
               {loading
                 ? 'Saving...'
                 : form.publish_immediately
                   ? 'Create & Publish'
                   : 'Save as Draft'}
             </button>
          )}
        </div>
      </form>
    </div>
  )
}
