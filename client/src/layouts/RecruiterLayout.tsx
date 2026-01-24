import { Outlet } from 'react-router-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  User,
  LogOut,
} from 'lucide-react'

const nav = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/recruiter/jobs/new', label: 'Post Job', icon: Briefcase },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/recruiter/profile', label: 'Profile', icon: User },
]

export function RecruiterLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/auth/recruiter/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <aside className="w-64 flex flex-col border-r border-slate-800 bg-slate-900/50">
        <div className="p-6 border-b border-slate-800">
          <Link to="/recruiter/dashboard" className="flex items-center gap-2 font-semibold text-lg text-white">
            <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-mono">H</span>
            HireFlow
          </Link>
          <p className="text-xs text-slate-400 mt-1">Recruiter</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/recruiter/dashboard' && location.pathname.startsWith(to))
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
