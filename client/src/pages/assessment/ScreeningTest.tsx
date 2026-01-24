import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { CountdownTimer } from '@/components/assessment/CountdownTimer'
import { CodeEditor } from '@/components/assessment/CodeEditor'
import { mockAssessment } from '@/api/mockData'
import type { McqOption } from '@/types'

const DURATION_MIN = 45

export function ScreeningTest() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const [paused, setPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const assessment = applicationId ? mockAssessment : null
  const questions = assessment?.questions ?? []
  const current = questions[currentIndex] ?? null

  const handleExpire = useCallback(() => {
    if (!submitted) submitTest()
  }, [submitted])

  function submitTest() {
    setSubmitted(true)
    // Mock: always "pass" for demo; real app would POST answers and get score vs cutoff
    setTimeout(() => {
      navigate('/seeker/dashboard')
    }, 2000)
  }

  function setAnswer(qId: string, value: string) {
    setAnswers((p) => ({ ...p, [qId]: value }))
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Assessment not found.</p>
          <Link to="/seeker/jobs" className="mt-2 inline-block text-emerald-400 hover:underline">
            Back to jobs
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-white">Test submitted</h2>
          <p className="mt-2 text-slate-400">
            Your answers have been scored. If you meet the cutoff, you’ll be able to upload your
            resume and complete your application.
          </p>
          <p className="mt-4 text-sm text-slate-500">Redirecting to dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/seeker/jobs"
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Exit
            </Link>
            <h1 className="font-semibold text-white">{assessment.title ?? 'Preliminary screening'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <CountdownTimer
              durationMinutes={DURATION_MIN}
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
