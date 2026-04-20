import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CountdownTimer } from '@/components/assessment/CountdownTimer'
import { applicationsApi } from '@/api/applications'
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
    selected?: number
    onSelect: (id: string) => void
}) {
    return (
        <div className="space-y-2">
            {options.map((opt, idx) => (
                <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected === idx
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                        }`}
                >
                    <input
                        type="radio"
                        name="mcq"
                        value={opt.id}
                        checked={selected === idx}
                        onChange={() => onSelect(opt.id)}
                        className="sr-only"
                    />
                    <span className="text-slate-100">{opt.text}</span>
                </label>
            ))}
        </div>
    )
}

export function AptitudeTest() {
    const { applicationId } = useParams<{ applicationId: string }>()
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [submitted, setSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const { ProctoringView } = useProctoring(applicationId, () => {
        setSubmitError('Terminated from hiring process due to multiple tab switches.');
        setSubmitted(true);
        setTimeout(() => navigate('/seeker/dashboard'), 3000);
    });

    const { data: config, isLoading, error } = useQuery({
        queryKey: ['aptitude', applicationId],
        queryFn: () => applicationsApi.startAssessment(applicationId!),
        enabled: !!applicationId,
        retry: false
    })

    // config.questions is Array of { id, content, options, category }
    const questions = config?.questions ?? []
    const durationMinutes = config?.duration_minutes ?? 60
    const current = questions[currentIndex] ?? null

    const handleExpire = useCallback(() => {
        if (!submitted) submitTest()
    }, [submitted])

    async function submitTest() {
        if (!applicationId) return
        setSubmitError('')
        setSubmitted(true)
        try {
            await applicationsApi.submitAssessment(applicationId, answers)
            // No result shown, just redirect
            setTimeout(() => navigate('/seeker/dashboard'), 2000)
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Submit failed')
            setSubmitted(false)
        }
    }

    function setAnswer(qIdx: number, optId: string) {
        const val = parseInt(optId, 10)
        setAnswers((p) => ({ ...p, [qIdx]: val }))
    }

    if (!applicationId) return null

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center text-slate-400">Loading aptitude test…</div>
            </div>
        )
    }

    if (error || !config) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400">Could not load test. Maybe already completed or invalid.</p>
                    <Link to="/seeker/applications" className="mt-2 inline-block text-emerald-400 hover:underline">
                        Back to applications
                    </Link>
                </div>
            </div>
        )
    }

    if (submitted && !submitError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold text-slate-100">Test Submitted</h2>
                    <p className="mt-2 text-slate-400">
                        {submitError ? submitError : 'Your responses have been recorded. The recruiter will be notified.'}
                    </p>
                    <p className="mt-4 text-sm text-slate-500">Redirecting to dashboard…</p>
                </div>
            </div>
        )
    } return (
        <div className="min-h-screen bg-black">
            <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
                <div className="max-w-[95vw] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-100">Aptitude Assessment</span>
                        <span className="text-slate-400 text-sm">{questions.length} Questions</span>
                    </div>
                    <CountdownTimer
                        durationMinutes={durationMinutes}
                        onExpire={handleExpire}
                        paused={false}
                    />
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8 flex gap-8">
                {/* Sidebar */}
                <div className="w-64 shrink-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Questions
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((_: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-8 rounded text-sm font-medium transition-colors ${i === currentIndex
                                    ? 'bg-brand-500 text-slate-100'
                                    : answers[i] !== undefined
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    {(() => {
                        const answeredCount = Object.keys(answers).length;
                        const totalCount = questions.length;
                        const completionPercentage = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
                        return (
                            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col items-center">
                                <div className="relative flex items-center justify-center w-24 h-24">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="36"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-slate-800"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="36"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={226.2}
                                            strokeDashoffset={226.2 - (completionPercentage / 100) * 226.2}
                                            className="text-brand-500 transition-all duration-500 ease-out"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-slate-100">{completionPercentage}%</span>
                                    </div>
                                </div>
                                <p className="mt-3 mb-6 text-xs font-medium text-slate-400 text-center leading-tight">
                                    {answeredCount} of {totalCount} <br />answered
                                </p>
                            </div>
                        );
                    })()}

                    <button
                        onClick={() => submitTest()}
                        className="w-full py-2.5 rounded-lg bg-emerald-500 text-slate-100 hover:bg-emerald-600 font-bold transition-colors"
                    >
                        Submit Test
                    </button>
                </div>

                {/* Main */}
                <div className="flex-1">
                    {current && (
                        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-brand-400 bg-brand-400/10 px-2 py-0.5 rounded">
                                    {current.category ?? 'Aptitude'}
                                </span>
                                <span className="text-slate-500 text-sm">Question {currentIndex + 1}</span>
                            </div>
                            <p className="text-lg text-slate-100 mb-6 font-medium">{current.content}</p>

                            <McqOptions
                                options={current.options}
                                selected={answers[currentIndex]}
                                onSelect={(optId) => setAnswer(currentIndex, optId)}
                            />
                        </div>
                    )}

                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                            disabled={currentIndex === questions.length - 1}
                            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            <ProctoringView />
        </div>
    )
}
