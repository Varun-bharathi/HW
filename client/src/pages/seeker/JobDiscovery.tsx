import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Briefcase } from 'lucide-react'
import { mockJobs } from '@/api/mockData'

export function JobDiscovery() {
  const [q, setQ] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [experience, setExperience] = useState('')

  const filtered = useMemo(() => {
    let list = mockJobs.filter((j) => j.status === 'live')
    if (q.trim()) {
      const lower = q.toLowerCase()
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(lower) ||
          j.required_skills.some((s) => s.toLowerCase().includes(lower))
      )
    }
    if (location.trim()) {
      const lower = location.toLowerCase()
      list = list.filter((j) => (j.location ?? '').toLowerCase().includes(lower))
    }
    if (employmentType) {
      list = list.filter((j) => j.employment_type === employmentType)
    }
    if (experience) {
      list = list.filter((j) => j.experience_level === experience)
    }
    return list
  }, [q, location, employmentType, experience])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Find jobs</h1>
        <p className="mt-1 text-slate-400">Browse and filter available positions</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Job title or skills"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All types</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All levels</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((job) => (
          <Link
            key={job.id}
            to={`/seeker/jobs/${job.id}`}
            className="block rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{job.title}</h3>
                <p className="mt-1 text-sm text-slate-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location ?? 'Remote'}
                </p>
                <p className="mt-1 text-sm text-slate-400 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {job.employment_type.replace('_', ' ')} · {job.experience_level}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.required_skills.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-300 text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-400 line-clamp-2">{job.description}</p>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-12 text-center text-slate-400">
          No jobs match your filters. Try broadening your search.
        </div>
      )}
    </div>
  )
}
