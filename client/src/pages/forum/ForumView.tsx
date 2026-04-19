import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Pin, ChevronRight } from 'lucide-react'

const mockCategories = [
  { id: 'cat1', name: 'Career Advice', slug: 'career-advice', description: 'Tips and discussions about career growth' },
  { id: 'cat2', name: 'Job Q&A', slug: 'job-qa', description: 'Questions about specific roles and hiring' },
  { id: 'cat3', name: 'Recruiter Announcements', slug: 'announcements', description: 'Updates and news from recruiters' },
]

const mockPosts = [
  { id: 'p1', category: 'Career Advice', title: 'How to prepare for technical interviews', author: 'Alex C.', replies: 12, isAnnouncement: false },
  { id: 'p2', category: 'Recruiter Announcements', title: 'New roles open: Frontend & Backend', author: 'HireEngine Team', replies: 5, isAnnouncement: true },
  { id: 'p3', category: 'Job Q&A', title: 'Remote work policy for Senior Engineer role?', author: 'Job Seeker', replies: 3, isAnnouncement: false },
]

export function ForumView() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-slate-950">
            <span className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-slate-950 text-sm font-mono">H</span>
            HireEngine
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/auth/recruiter/login" className="text-slate-600 hover:text-slate-950 text-sm">
              Recruiter
            </Link>
            <Link to="/auth/job-seeker/login" className="text-slate-600 hover:text-slate-950 text-sm">
              Job Seeker
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="w-8 h-8 text-brand-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Community forum</h1>
            <p className="text-slate-600">Career discussions, job-related Q&A, recruiter announcements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Categories
            </h2>
            <div className="space-y-1">
              {mockCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedCategory === cat.slug ? 'bg-brand-500/20 text-brand-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                >
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Recent posts
            </h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden divide-y divide-slate-800">
              {mockPosts.map((p) => (
                <Link
                  key={p.id}
                  to="#"
                  className="block p-4 hover:bg-slate-100/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-950">{p.title}</span>
                        {p.isAnnouncement && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">
                            <Pin className="w-3 h-3" />
                            Announcement
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {p.category} · {p.author} · {p.replies} replies
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
