import { Outlet } from 'react-router-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  Search,
  FileCheck,
  MessageSquare,
  User,
  LogOut,
} from 'lucide-react'

const nav = [
  { to: '/seeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seeker/jobs', label: 'Find Jobs', icon: Search },
  { to: '/seeker/applications', label: 'My Applications', icon: FileCheck },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/seeker/profile', label: 'Profile', icon: User },
]

export function JobSeekerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/auth/job-seeker/login')
  }

  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-64 flex flex-col border-r border-slate-200 bg-slate-50/50">
        <div className="p-6 border-b border-slate-200">
          <Link to="/seeker/dashboard" className="flex items-center gap-2 font-semibold text-lg text-slate-950">
            <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-slate-950 text-sm font-mono">H</span>
            HireEngine
          </Link>
          <p className="text-xs text-slate-600 mt-1">Job Seeker</p>
        </div>
        <div className="p-3 border-b border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Log out
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/seeker/dashboard' && location.pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-brand-500/20 text-brand-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-200'
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className={`${location.pathname.includes('/assessment/coding/') ? '' : 'max-w-7xl mx-auto p-6 lg:p-8'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
