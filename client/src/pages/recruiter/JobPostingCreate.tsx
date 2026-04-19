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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/recruiter/dashboard"
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Create job posting</h1>
          <p className="mt-1 text-slate-600">
            Job title, required skills, experience level, location, employment type
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Job title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Senior Frontend Engineer"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job description *
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(['manual', 'ai', 'file'] as const).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setJdSource(src)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  jdSource === src
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-700 border border-transparent'
                }`}
              >
                {src === 'manual' && <FileText className="w-4 h-4" />}
                {src === 'ai' && <Sparkles className="w-4 h-4" />}
                {src === 'file' && <Upload className="w-4 h-4" />}
                {src === 'manual' && 'Manual'}
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
              className="mb-2 text-sm text-brand-400 hover:text-brand-300 disabled:opacity-50"
            >
              {loading ? 'Generating…' : 'Generate from title & skills'}
            </button>
          )}
          {jdSource === 'file' && (
            <p className="mb-2 text-sm text-slate-600">
              Upload a PDF or DOC file to extract job description (coming soon).
            </p>
          )}
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[180px]"
            placeholder="Describe the role, responsibilities, and requirements..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Required skills (comma- or semicolon-separated) *
          </label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. React, TypeScript, Node.js"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Experience level
            </label>
            <select
              value={form.experience_level}
              onChange={(e) =>
                setForm((p) => ({ ...p, experience_level: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {experienceLevels.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Employment type
            </label>
            <select
              value={form.employment_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, employment_type: e.target.value }))
              }
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {employmentTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Remote, New York NY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Preliminary screening cutoff score (0–100)
          </label>
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
            className="w-full max-w-[120px] px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-slate-600">
            Min. 10 questions (MCQ + coding). Configure in next step after saving.
          </p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.publish_immediately}
            onChange={(e) =>
              setForm((p) => ({ ...p, publish_immediately: e.target.checked }))
            }
            className="rounded border-slate-600 bg-slate-50 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-700">
            Publish immediately — visible to job seekers right away
          </span>
        </label>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-brand-500 text-slate-950 font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {loading
              ? 'Saving…'
              : form.publish_immediately
                ? 'Create & publish'
                : 'Save as draft'}
          </button>
          <Link
            to="/recruiter/dashboard"
            className="px-6 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
