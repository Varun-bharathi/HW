import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { applicationsApi } from '@/api/applications'
import { Video, Clock, Wifi, WifiOff } from 'lucide-react'

export function InterviewLobby() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')
  const [dots, setDots] = useState(0)
  const [pollError, setPollError] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Animate waiting dots
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 600)
    return () => clearInterval(t)
  }, [])

  // Join lobby on mount
  useEffect(() => {
    if (!applicationId) return
    applicationsApi.joinInterviewLobby(applicationId)
      .then(() => setJoined(true))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to join lobby'))
  }, [applicationId])

  // Poll for admission
  useEffect(() => {
    if (!applicationId || !joined) return

    intervalRef.current = setInterval(async () => {
      try {
        const status = await applicationsApi.getInterviewStatus(applicationId)
        setPollError(false)
        if (status.ended) {
          setError('The interview session has ended.')
          clearInterval(intervalRef.current!)
          return
        }
        if (status.admitted && status.roomId) {
          clearInterval(intervalRef.current!)
          navigate(`/interview/room/${applicationId}`, { state: { roomId: status.roomId, role: 'seeker' } })
        }
      } catch {
        setPollError(true)
      }
    }, 2000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [applicationId, joined, navigate])

  if (!applicationId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Invalid application.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-8 text-center shadow-2xl">
          {error ? (
            <>
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/10 flex items-center justify-center">
                <WifiOff className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Session Unavailable</h2>
              <p className="text-slate-400 mb-6">{error}</p>
              <Link
                to="/seeker/applications"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium"
              >
                Back to Applications
              </Link>
            </>
          ) : (
            <>
              {/* Animated pulsing icon */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-brand-500/30 animate-ping [animation-delay:0.3s]" />
                <div className="relative w-full h-full rounded-full bg-brand-500/10 border border-brand-500/40 flex items-center justify-center">
                  <Video className="w-10 h-10 text-brand-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">You're in the Lobby</h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Please wait while the HR interviewer admits you into the interview room. Stay on this page.
              </p>

              <div className="mb-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <p className="text-sm text-slate-300 font-medium flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Waiting for HR to let you in{'.'.repeat(dots)}
                </p>
              </div>

              {pollError && (
                <div className="mb-4 flex items-center justify-center gap-2 text-amber-400 text-sm">
                  <WifiOff className="w-4 h-4" />
                  Connection issue — retrying…
                </div>
              )}

              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Checking every 2s
                </span>
                <span className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  Connected
                </span>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800">
                <Link
                  to="/seeker/applications"
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Leave lobby & go back
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
