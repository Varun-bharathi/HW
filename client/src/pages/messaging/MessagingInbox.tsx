import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { MessageSquare, Send, ArrowLeft } from 'lucide-react'

const mockConversations = [
  { id: 'c1', with: 'Alex Chen', jobTitle: 'Senior Frontend Engineer', last: 'Thanks for applying. We’d like to invite you to a coding assessment.', time: '2h ago' },
  { id: 'c2', with: 'Sam Rivera', jobTitle: 'Full-Stack Developer', last: 'When can you do an interview?', time: '1d ago' },
]

export function MessagingInbox() {
  const { role } = useAuthStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const dashboardLink = role === 'recruiter' ? '/recruiter/dashboard' : '/seeker/dashboard'

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="w-80 border-r border-slate-200 bg-slate-50/50 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Link
            to={dashboardLink}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            <span className="font-semibold text-slate-950">Messages</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {mockConversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              className={`w-full text-left p-4 border-b border-slate-200/80 hover:bg-slate-100/50 transition-colors ${
                selected === c.id ? 'bg-slate-100' : ''
              }`}
            >
              <p className="font-medium text-slate-950">{c.with}</p>
              <p className="text-xs text-slate-500">{c.jobTitle}</p>
              <p className="mt-1 text-sm text-slate-600 truncate">{c.last}</p>
              <p className="mt-0.5 text-xs text-slate-500">{c.time}</p>
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="p-4 border-b border-slate-200">
              <p className="font-medium text-slate-950">
                {mockConversations.find((c) => c.id === selected)?.with}
              </p>
              <p className="text-sm text-slate-600">
                {mockConversations.find((c) => c.id === selected)?.jobTitle}
              </p>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              <div className="flex justify-start">
                <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2">
                  <p className="text-slate-200 text-sm">
                    Thanks for applying. We’d like to invite you to a coding assessment.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">2h ago</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-brand-500/20 px-4 py-2">
                  <p className="text-slate-200 text-sm">I’ve completed it. What’s the next step?</p>
                  <p className="text-xs text-slate-500 mt-1">1h ago</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-950 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                className="px-4 py-2.5 rounded-lg bg-brand-500 text-slate-950 hover:bg-brand-600 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <p>Select a conversation</p>
          </div>
        )}
      </main>
    </div>
  )
}
