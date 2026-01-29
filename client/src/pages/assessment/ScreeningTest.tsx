import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CountdownTimer } from '@/components/assessment/CountdownTimer'
import { CodeEditor } from '@/components/assessment/CodeEditor'
import { screeningApi } from '@/api/screening'

interface McqOption {
  id: string
  text: string
  correct: boolean
}

function McqOptions({
  options,
  selected,
  onSelect,
}: {
  options: McqOption[]
  selected?: string
  onSelect: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            selected === opt.id
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
          }`}
        >
          <input
            type="radio"
            name="mcq"
            value={opt.id}
            checked={selected === opt.id}
            onChange={() => onSelect(opt.id)}
            className="sr-only"
          />
          <span className="text-slate-200">{opt.text}</span>
        </label>
      ))}
    </div>
  )
}

export function ScreeningTest() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const [paused, setPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const startTimeRef = useRef<number>(Date.now())

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['screening', applicationId],
    queryFn: () => screeningApi.get(applicationId!),
    enabled: !!applicationId,
  })

  const questions = config?.questions ?? []
  const durationMinutes = config?.duration_minutes ?? 45
  const current = questions[currentIndex] ?? null

  useEffect(() => {
    if (config && !submitted) startTimeRef.current = Date.now()
  }, [config, submitted])

  const handleExpire = useCallback(() => {
    if (!submitted) submitTest()
  }, [submitted])

  async function submitTest() {
    if (!applicationId) return
    setSubmitError('')
    setSubmitted(true)
    try {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
      const res = await screeningApi.submit(applicationId, {
        answers,
        time_spent_sec: timeSpent,
      })
      setSubmitResult(res)
      setTimeout(() => navigate('/seeker/dashboard'), 2500)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Submit failed')
      setSubmitted(false)
    }
  }

  const [submitResult, setSubmitResult] = useState<{ score: number; passed: boolean } | null>(null)

  function setAnswer(qId: string, value: string) {
    setAnswers((p) => ({ ...p, [qId]: value }))
  }

  if (!applicationId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Invalid assessment.</p>
          <Link to="/seeker/jobs" className="mt-2 inline-block text-emerald-400 hover:underline">
            Back to jobs
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading || (!config && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-slate-400">Loading screening…</div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Could not load assessment. Please log in and try again.</p>
          <Link to="/seeker/jobs" className="mt-2 inline-block text-emerald-400 hover:underline">
            Back to jobs
          </Link>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">No questions configured.</p>
          <Link to="/seeker/jobs" className="mt-2 inline-block text-emerald-400 hover:underline">
            Back to jobs
          </Link>
        </div>
      </div>
    )
  }

  if (submitted && !submitError && !submitResult) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-slate-400">Submitting…</div>
      </div>
    )
  }

  if (submitted && submitResult) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-white">Test submitted</h2>
          <p className="mt-2 text-slate-400">
            Score: <strong className="text-white">{submitResult.score}%</strong>
            {submitResult.passed ? ' — You passed! You can now upload your resume to complete your application.' : ' — Below cutoff. Better luck next time.'}
          </p>
          <p className="mt-4 text-sm text-slate-500">Redirecting to dashboard…</p>
        </div>
      </div>
    )
  }

  if (submitted && submitError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center max-w-md">
          <p className="text-red-400">{submitError}</p>
          <button
            type="button"
            onClick={() => { setSubmitted(false); setSubmitError(''); }}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-700 text-white"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/seeker/jobs" className="text-sm text-slate-400 hover:text-white">
              ← Exit
            </Link>
            <h1 className="font-semibold text-white">Preliminary screening</h1>
          </div>
          <div className="flex items-center gap-3">
            <CountdownTimer
              durationMinutes={durationMinutes}
              onExpire={handleExpire}
              paused={paused}
            />
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700"
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 flex gap-6">
        <aside className="w-48 shrink-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  i === currentIndex
                    ? 'bg-brand-500 text-white'
                    : answers[q.id]
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {current && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="p-5 border-b border-slate-800">
                <span className="text-xs font-medium text-slate-500">
                  Question {currentIndex + 1} of {questions.length}
                  {current.type === 'mcq' ? ' · MCQ' : ' · Coding'}
                </span>
                <p className="mt-2 text-slate-200 whitespace-pre-wrap">{current.content}</p>
              </div>
              <div className="p-5">
                {current.type === 'mcq' ? (
                  <McqOptions
                    options={current.options ?? []}
                    selected={answers[current.id]}
                    onSelect={(v) => setAnswer(current.id, v)}
                  />
                ) : (
                  <CodeEditor
                    value={answers[current.id] ?? ''}
                    onChange={(v) => setAnswer(current.id, v)}
                    height={220}
                  />
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
            >
              Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submitTest()}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
              >
                Submit test
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
