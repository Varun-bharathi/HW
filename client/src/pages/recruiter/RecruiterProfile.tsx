import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { User, Save } from 'lucide-react'

export function RecruiterProfile() {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: 'Recruiter User',
    company: 'Acme Inc.',
    email: user?.email ?? '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => setSaving(false), 800)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-slate-400">Editable recruiter information</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center">
            <User className="w-8 h-8 text-brand-400" />
          </div>
          <div>
            <p className="font-medium text-white">Recruiter</p>
            <p className="text-sm text-slate-400">{form.email}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Full name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
