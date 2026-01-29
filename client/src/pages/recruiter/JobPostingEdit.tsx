import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Sparkles, Send } from 'lucide-react'
import { jobsApi } from '@/api/jobs'

const employmentTypes = ['full_time', 'part_time', 'contract', 'internship']
const experienceLevels = ['entry', 'mid', 'senior', 'lead']

export function JobPostingEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.get(id!),
    enabled: !!id,
  })
  const [form, setForm] = useState({
    title: '',
    description: '',
    skills: '',
    experience_level: 'mid',
    location: '',
    employment_type: 'full_time',
    cutoff_score: 70,
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!job) return
    setForm({
      title: job.title,
      description: job.description,
      skills: Array.isArray(job.required_skills) ? job.required_skills.join(', ') : '',
      experience_level: job.experience_level ?? 'mid',
      location: job.location ?? '',
      employment_type: job.employment_type ?? 'full_time',
      cutoff_score: job.cutoff_score ?? 70,
    })
  }, [job])

  const updateMu = useMutation({
    mutationFn: (payload: Record<string, unknown>) => jobsApi.update(id!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job', id] })
      qc.invalidateQueries({ queryKey: ['jobs'] })
      setSaveError(null)
    },
    onError: (e: Error) => setSaveError(e.message),
  })

  const genQuestionsMu = useMutation({
    mutationFn: () => jobsApi.generateQuestions(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job', id] })
    },
  })

  const publishMu = useMutation({
    mutationFn: () => jobsApi.publish(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job', id] })
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  const skillsList = form.skills
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    updateMu.mutate(
      {
        title: form.title,
        description: form.description,
        required_skills: skillsList,
        experience_level: form.experience_level,
        location: form.location || undefined,
        employment_type: form.employment_type,
        cutoff_score: form.cutoff_score,
      },
      { onSettled: () => setSaving(false) }
    )
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
  if (isLoading || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">{isLoading ? 'Loading…' : error ? 'Job not found.' : 'Job not found.'}</p>
        <Link to="/recruiter/dashboard" className="mt-2 inline-block text-brand-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/recruiter/dashboard"
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit job</h1>
          <p className="mt-1 text-slate-400">{job.title}</p>
        </div>
      </div>

      {saveError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-red-300 text-sm">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Job title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Senior Frontend Engineer"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Job description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[180px]"
            placeholder="Describe the role, responsibilities, and requirements..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Required skills (comma- or semicolon-separated) *
          </label>
          <input
            type="text"
            value={form.skills}
            onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. React, TypeScript, Node.js"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Experience level</label>
            <select
              value={form.experience_level}
              onChange={(e) => setForm((p) => ({ ...p, experience_level: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {experienceLevels.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Employment type</label>
            <select
              value={form.employment_type}
              onChange={(e) => setForm((p) => ({ ...p, employment_type: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
          <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g. Remote, New York NY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Preliminary screening cutoff (0–100)
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
            className="w-full max-w-[120px] px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || updateMu.isPending}
            className="px-6 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {updateMu.isPending || saving ? 'Saving…' : 'Save changes'}
          </button>
          {job.status === 'draft' && (
            <button
              type="button"
              onClick={() => publishMu.mutate()}
              disabled={publishMu.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              {publishMu.isPending ? 'Publishing…' : 'Publish (go live)'}
            </button>
          )}
          <button
            type="button"
            onClick={() => genQuestionsMu.mutate()}
            disabled={genQuestionsMu.isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {genQuestionsMu.isPending ? 'Generating…' : 'Generate screening questions'}
          </button>
          {genQuestionsMu.isSuccess && (
            <span className="text-sm text-emerald-400 self-center">
              {genQuestionsMu.data?.message ?? 'Questions generated.'}
            </span>
          )}
          <Link
            to={`/recruiter/jobs/${id}/applicants`}
            className="px-6 py-3 rounded-lg bg-slate-700 text-slate-300 font-medium hover:bg-slate-600 transition-colors"
          >
            View applicants
          </Link>
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-6 py-3 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </form>
    </div>
  )
}
