import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { User, Save, Upload } from 'lucide-react'
import { getMe, patchMe } from '@/api/me'

export function JobSeekerProfile() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    skills: '',
    experience: '',
    location: '',
    portfolio_urls: '',
    email: '',
  })

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((res) => {
        if (cancelled) return
        const p = res.user.jobSeekerProfile
        const skills = p?.skills && p.skills.length ? p.skills.join(', ') : ''
        const urls = p?.portfolio_urls && p.portfolio_urls.length ? p.portfolio_urls.join(', ') : ''
        setForm({
          full_name: p?.full_name ?? '',
          skills,
          experience: p?.experience ?? '',
          location: p?.location ?? '',
          portfolio_urls: urls,
          email: res.user.email ?? user?.email ?? '',
        })
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load profile')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [user?.email])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await patchMe({
        full_name: form.full_name,
        skills: form.skills,
        experience: form.experience,
        location: form.location,
        portfolio_urls: form.portfolio_urls,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <p className="text-slate-400">Loading profile…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
        <p className="mt-1 text-slate-400">
          Resume upload, skills, experience, location, portfolio links
        </p>
      </div>
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-red-300 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-slate-100">Job Seeker</p>
              <p className="text-sm text-slate-400">{form.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Resume</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                <Upload className="w-4 h-4" />
                Upload PDF/DOC
              </button>
              <span className="text-sm text-slate-500">AI-parsed after upload (coming soon)</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              value={form.skills}
              onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="React, TypeScript, ..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Experience</label>
            <textarea
              value={form.experience}
              onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
              placeholder="Role @ Company (years)..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Portfolio links (comma-separated)
            </label>
            <input
              type="text"
              value={form.portfolio_urls}
              onChange={(e) => setForm((p) => ({ ...p, portfolio_urls: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://..."
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 text-slate-100 font-medium hover:bg-emerald-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
