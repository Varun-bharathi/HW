import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { User, Save } from 'lucide-react'
import { getMe, patchMe } from '@/api/me'

export function RecruiterProfile() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    company: '',
    email: '',
  })

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((res) => {
        if (cancelled) return
        const p = res.user.recruiterProfile
        setForm({
          full_name: p?.full_name ?? '',
          company: p?.company ?? '',
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
      await patchMe({ full_name: form.full_name, company: form.company || null })
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
        <p className="mt-1 text-slate-400">Editable recruiter information</p>
      </div>
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-red-300 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center">
            <User className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <p className="font-medium text-slate-100">Recruiter</p>
            <p className="text-sm text-slate-400">{form.email}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            readOnly
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-500">Email cannot be changed here.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-slate-100 font-medium hover:bg-brand-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
