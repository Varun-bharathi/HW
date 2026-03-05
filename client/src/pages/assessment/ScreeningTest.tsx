import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CountdownTimer } from '@/components/assessment/CountdownTimer'
import { CodeEditor } from '@/components/assessment/CodeEditor'
import { screeningApi } from '@/api/screening'
import { useProctoring } from '@/hooks/useProctoring'

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
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected === opt.id
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
  const [codeLanguages, setCodeLanguages] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [runResults, setRunResults] = useState<Record<string, { input: string; expected: string; output: string; passed: boolean }[]>>({})
  const [activeCaseIndex, setActiveCaseIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

  const { ProctoringView } = useProctoring(applicationId, () => {
    setSubmitError('Terminated from hiring process due to multiple tab switches.');
    setSubmitted(true);
    setTimeout(() => navigate('/seeker/dashboard'), 3000);
  });

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

  async function handleRunCode() {
    if (!current || !applicationId) return
    setIsRunning(true)
    try {
      const lang = codeLanguages[current.id] ?? 'javascript' // default
      // Map 'c' to 'c', 'cpp' to 'cpp', etc. Piston expects specific names.
      // My backend handles mapping 'js'->'javascript' etc, so frontend just sends what select has.
      const res = await screeningApi.runCode(applicationId, {
        questionId: current.id,
        code: answers[current.id] ?? '',
        language: lang
      })
      setRunResults(p => ({ ...p, [current.id]: res.results }))
    } catch (e) {
      console.error(e)
      alert('Failed to run code')
    } finally {
      setIsRunning(false)
    }
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
            {submitResult.passed ? 'You passed! You can now upload your resume to complete your application.' : 'Below cutoff. Better luck next time.'}
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
        <div className="max-w-[95vw] mx-auto px-4 py-3 flex items-center justify-between">
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

      <div className="max-w-[95vw] mx-auto px-4 py-6 flex gap-6">
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
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${i === currentIndex
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
            <>
              {current.type === 'mcq' ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <div className="p-5 border-b border-slate-800">
                    <span className="text-xs font-medium text-slate-500">
                      Question {currentIndex + 1} of {questions.length} · MCQ
                    </span>
                    <p className="mt-2 text-slate-200 whitespace-pre-wrap">{current.content}</p>
                  </div>
                  <div className="p-5">
                    <McqOptions
                      options={current.options ?? []}
                      selected={answers[current.id]}
                      onSelect={(v) => setAnswer(current.id, v)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 h-[calc(100vh-140px)]">
                  {/* Left Panel: Description */}
                  <div className="flex-1 min-w-0 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded">Easy</span>
                      <span className="text-sm font-medium text-slate-200">Question {currentIndex + 1}</span>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      <h2 className="text-lg font-bold text-white mb-4">{current.content.split(':')[0]}</h2>
                      {current.content.split(':').slice(1).join(':').trim()}

                      {current.examples && current.examples.length > 0 && (
                        <div className="mt-6 space-y-4">
                          {current.examples.map((ex, i) => (
                            <div key={i} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                              <div className="text-slate-500 mb-1">Example {i + 1}:</div>
                              <div className="mb-1"><span className="text-slate-400">Input:</span> {ex.input}</div>
                              <div className="mb-1"><span className="text-slate-400">Output:</span> {ex.output}</div>
                              {ex.explanation && (
                                <div><span className="text-slate-400">Explanation:</span> {ex.explanation}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}


                    </div>
                  </div>

                  {/* Right Panel: Editor + Console */}
                  <div className="flex-[2] min-w-0 flex flex-col gap-4">
                    {/* Top: Editor */}
                    <div className="flex-1 min-h-0 flex flex-col">
                      <CodeEditor
                        value={answers[current.id] ?? ''}
                        onChange={(v) => setAnswer(current.id, v)}
                        language={codeLanguages[current.id] ?? 'javascript'}
                        onLanguageChange={(l) => setCodeLanguages(prev => ({ ...prev, [current.id]: l }))}
                        height="100%"
                      />
                    </div>

                    {/* Bottom: Console */}
                    <div className="h-64 shrink-0 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden">
                      {/* Console Header */}
                      <div className="flex items-center justify-between p-2 border-b border-slate-800 bg-slate-900/80">
                        <div className="flex gap-1">
                          <button className="px-3 py-1 text-xs font-medium text-slate-200 bg-slate-800 rounded-t border-b-2 border-transparent">Test Result</button>
                        </div>
                        <button
                          type="button"
                          onClick={handleRunCode}
                          disabled={isRunning || !answers[current.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium disabled:opacity-50"
                        >
                          {isRunning ? (
                            <>
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Run
                            </>
                          )}
                        </button>
                      </div>

                      {/* Console Body */}
                      <div className="flex-1 p-0 flex overflow-hidden">
                        {(() => {
                          const results = runResults[current.id] ?? current.testCases?.map(tc => ({ input: tc.input, expected: tc.expected, output: '-', passed: false }))

                          if (results && results.length > 0) {
                            return (
                              <div className="flex-1 flex min-w-0">
                                {/* Case Tabs (Left strip) */}
                                <div className="w-24 border-r border-slate-800 bg-slate-900/30 flex flex-col overflow-y-auto">
                                  {results.map((r, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setActiveCaseIndex(i)}
                                      className={`px-3 py-2 text-left text-xs transition-colors border-l-2 ${activeCaseIndex === i
                                        ? 'bg-slate-800 border-white text-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                        }`}
                                    >
                                      Case {i + 1}
                                      <span className={`block w-1.5 h-1.5 rounded-full mt-1 ${r.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    </button>
                                  ))}
                                </div>

                                {/* Active Case Detail */}
                                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300">
                                  {(() => {
                                    const r = results[activeCaseIndex]
                                    if (!r) return <div className="text-slate-500">Select a case</div>
                                    const isRun = !!runResults[current.id]
                                    return (
                                      <div className="space-y-3">
                                        <div className={`text-sm font-semibold mb-2 ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                          {isRun ? (r.passed ? 'Accepted' : 'Wrong Answer') : 'Not Run'}
                                        </div>
                                        <div>
                                          <div className="text-slate-500 mb-1">Input</div>
                                          <div className="bg-slate-950 p-2 rounded border border-slate-800">{r.input}</div>
                                        </div>
                                        <div>
                                          <div className="text-slate-500 mb-1">Output</div>
                                          <div className="bg-slate-950 p-2 rounded border border-slate-800 whitespace-pre-wrap">{r.output}</div>
                                        </div>
                                        <div>
                                          <div className="text-slate-500 mb-1">Expected</div>
                                          <div className="bg-slate-950 p-2 rounded border border-slate-800">{r.expected}</div>
                                        </div>
                                      </div>
                                    )
                                  })()}
                                </div>
                              </div>
                            )
                          }

                          return (
                            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                              Run your code to see results.
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
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
      <ProctoringView />
    </div>
  )
}
