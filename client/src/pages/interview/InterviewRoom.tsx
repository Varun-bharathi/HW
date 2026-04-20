import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { applicationsApi } from '@/api/applications'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, X,
} from 'lucide-react'

interface LocationState {
  roomId?: string
  role?: 'seeker' | 'recruiter'
  candidateName?: string
}

export function InterviewRoom() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as LocationState) ?? {}
  const role = state.role ?? 'seeker'
  const roomId = state.roomId ?? `hr-${applicationId}`

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [streamReady, setStreamReady] = useState(false)
  const [streamError, setStreamError] = useState('')
  const streamRef = useRef<MediaStream | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [messages, setMessages] = useState<{ from: string; text: string; time: string }[]>([
    { from: 'System', text: 'Interview session started. Good luck!', time: new Date().toLocaleTimeString() },
  ])
  const [msgInput, setMsgInput] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  // Timer
  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        setStreamReady(true)
      })
      .catch(() => {
        setStreamError('Camera/mic access denied. Please allow permissions.')
      })
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function toggleMic() {
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled })
    setMicOn((p) => !p)
  }

  function toggleCam() {
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled })
    setCamOn((p) => !p)
  }

  async function endCall() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (applicationId) {
      await applicationsApi.endInterview(applicationId).catch(() => {})
    }
    if (role === 'seeker') {
      setShowThankYou(true)
    } else {
      navigate('/recruiter/dashboard')
    }
  }

  function sendMessage() {
    const text = msgInput.trim()
    if (!text) return
    setMessages((p) => [
      ...p,
      { from: role === 'recruiter' ? 'HR' : 'You', text, time: new Date().toLocaleTimeString() },
    ])
    setMsgInput('')
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-100">Live Interview</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-xs font-mono text-slate-300">{elapsedStr}</span>
          {role === 'recruiter' && state.candidateName && (
            <span className="text-sm text-slate-400">· {state.candidateName}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          Room: <span className="font-mono text-slate-400 max-w-[160px] truncate">{roomId}</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* Main video area */}
        <div className="flex-1 relative bg-black">
          {streamError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <VideoOff className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-slate-400">{streamError}</p>
            </div>
          ) : (
            <>
              {/* Remote placeholder (simulated — real WebRTC peer would go here) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                <div className="w-28 h-28 rounded-full bg-slate-700 flex items-center justify-center mb-4">
                  <Video className="w-12 h-12 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm">
                  {role === 'recruiter' ? 'Candidate camera' : 'HR camera'} — connecting…
                </p>
                <p className="text-slate-400 text-xs mt-1">(Peer-to-peer video requires WebRTC signaling server)</p>
              </div>

              {/* Local video (picture-in-picture) */}
              <div className="absolute bottom-6 right-6 w-48 h-36 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-900 shadow-2xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ display: streamReady ? 'block' : 'none', transform: 'scaleX(-1)' }}
                />
                {!streamReady && !streamError && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
                  </div>
                )}
                {!camOn && streamReady && (
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <span className="absolute bottom-1 left-1 text-[10px] font-medium text-slate-100 bg-black/50 rounded px-1">You</span>
              </div>
            </>
          )}
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="w-72 border-l border-slate-800 bg-slate-900/80 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="font-medium text-slate-100 text-sm">Chat</span>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-slate-300">{m.from}: </span>
                  <span className="text-slate-400">{m.text}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.time}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message…"
                className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 border border-slate-700 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-slate-100 text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="shrink-0 flex items-center justify-between px-12 py-5 bg-slate-900/80 border-t border-slate-800">
        <button
          onClick={endCall}
          className="w-14 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-slate-100 flex items-center justify-center transition-colors shadow-lg shadow-brand-500/30"
          title="End call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>

        <button
          onClick={() => setChatOpen((p) => !p)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${chatOpen ? 'bg-brand-500/30 text-brand-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-100'}`}
          title="Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-brand-500/20 hover:bg-brand-500/30 text-brand-400'}`}
            title={micOn ? 'Mute' : 'Unmute'}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleCam}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-brand-500/20 hover:bg-brand-500/30 text-brand-400'}`}
            title={camOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showThankYou && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Interview Completed</h2>
            <p className="text-slate-400 mb-8 text-lg">Thank you for attending our selection process.</p>
            <button
              onClick={() => navigate('/seeker/applications')}
              className="w-full py-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-100 font-bold transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
