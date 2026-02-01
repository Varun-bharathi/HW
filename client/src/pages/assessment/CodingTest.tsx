
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Editor from '@monaco-editor/react'
import { Clock, Play, CheckCircle, AlertCircle } from 'lucide-react'
import { applicationsApi } from '@/api/applications'

export function CodingTest() {
    const { applicationId } = useParams<{ applicationId: string }>()
    const navigate = useNavigate()
    const [currentQIndex, setCurrentQIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({}) // Key: "index-lang"
    const [results, setResults] = useState<Record<string, { input: string; expected: string; output: string; passed: boolean }[]>>({})
    const [submitted, setSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [running, setRunning] = useState(false)
    const [language, setLanguage] = useState('javascript')

    const { data: config, isLoading, error } = useQuery({
        queryKey: ['coding', applicationId],
        queryFn: () => applicationsApi.startCodingAssessment(applicationId!),
        enabled: !!applicationId,
        retry: false
    })

    // Timer logic
    const [timeLeft, setTimeLeft] = useState<number | null>(null)

    useEffect(() => {
        if (config?.duration_minutes && timeLeft === null) {
            setTimeLeft(config.duration_minutes * 60)
        }
    }, [config, timeLeft])

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || submitted) return
        const timer = setInterval(() => {
            setTimeLeft((p) => {
                if (p === null || p <= 0) {
                    handleSubmit()
                    return 0
                }
                return p - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [timeLeft, submitted])

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    // Safety check for questions
    const hasQuestions = config?.questions && config.questions.length > 0
    const currentQuestion = hasQuestions ? config.questions[currentQIndex] : null

    const getStarterCode = (q: any, lang: string) => {
        if (!q?.starterCode) return '// Write your code here'
        if (typeof q.starterCode === 'string') return q.starterCode
        // Map common aliases if needed, though we try to keep them synced
        return q.starterCode[lang] || '// No starter code available for this language'
    }

    const answerKey = `${currentQIndex}-${language}`
    const currentCode = answers[answerKey] ?? getStarterCode(currentQuestion, language)

    const handleCodeChange = (val: string | undefined) => {
        if (val !== undefined) {
            setAnswers(prev => ({ ...prev, [answerKey]: val }))
        }
    }

    const handleRun = async () => {
        if (!currentQuestion) return
        setRunning(true)
        try {
            const res = await applicationsApi.runCodeWithDetails(applicationId!, {
                questionId: currentQuestion.id,
                code: currentCode,
                language: language,
                type: 'coding'
            })
            setResults(prev => ({ ...prev, [currentQIndex]: res.results }))
        } catch (e) {
            console.error(e)
        } finally {
            setRunning(false)
        }
    }

    const handleSubmit = async () => {
        if (submitted) return
        setSubmitted(true)
        try {
            // Prepare answers: { "0": code, "1": code } for the *current* language
            const submissionAnswers: Record<string, string> = {}
            if (config?.questions) {
                config.questions.forEach((_: any, idx: number) => {
                    const key = `${idx}-${language}`
                    submissionAnswers[idx] = answers[key] || getStarterCode(config.questions[idx], language)
                })
            }

            await applicationsApi.submitCodingAssessment(applicationId!, submissionAnswers, language)
            // Redirect after short delay
            setTimeout(() => {
                navigate('/seeker/applications')
            }, 2000)
        } catch (e) {
            console.error(e)
            setSubmitError('Failed to submit test. Please try again.')
            setSubmitted(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <p className="text-slate-400">Loading assessment...</p>
            </div>
        )
    }

    if (error || !config || (config.questions && config.questions.length === 0)) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center flex-col gap-4">
                <p className="text-red-400">
                    {config && config.questions.length === 0
                        ? 'No questions found regarding this assessment.'
                        : 'Failed to load assessment. It may have expired or already been completed.'}
                </p>
                <button onClick={() => navigate('/seeker/applications')} className="text-brand-400 hover:underline">
                    Return to Applications
                </button>
            </div>
        )
    }

    if (submitted && !submitError) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center flex-col gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Test Submitted!</h2>
                <p className="text-slate-400">You will be redirected shortly...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen lg:h-screen">
            {/* Header */}
            <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-white">Coding Assessment</span>
                </div>
                <div className="flex items-center gap-6">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-slate-800 text-slate-300 text-xs rounded px-2 py-1 border border-slate-700 outline-none focus:border-brand-500"
                    >
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="javascript">JavaScript</option>
                        <option value="csharp">C#</option>
                        <option value="c">C</option>
                        <option value="cpp">C++</option>
                    </select>
                    <div className={`flex items-center gap-2 font-mono text-lg ${timeLeft && timeLeft < 300 ? 'text-red-400' : 'text-slate-300'}`}>
                        <Clock className="w-4 h-4" />
                        {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitted}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
                    >
                        Submit Test
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Problem Description */}
                <div className="w-1/3 border-r border-slate-800 bg-slate-900 overflow-y-auto flex flex-col">
                    <div className="p-6 flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Question {currentQIndex + 1} of {config.questions.length}</h2>
                            <div className="flex gap-1">
                                {config.questions.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentQIndex(i)}
                                        className={`w-6 h-6 rounded flex items-center justify-center text-xs ${currentQIndex === i ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="prose prose-invert prose-sm max-w-none">
                            {currentQuestion && (
                                <>
                                    <h3 className="text-xl text-white mb-2">{currentQuestion.content?.split(':')[0]}</h3>
                                    <p className="text-slate-300 mb-4">{currentQuestion.content?.split(':')[1] || currentQuestion.content}</p>

                                    {currentQuestion.examples && currentQuestion.examples.map((ex: any, i: number) => (
                                        <div key={i} className="mb-4">
                                            <p className="font-semibold text-white mb-1">Example {i + 1}:</p>
                                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-800 font-mono text-sm">
                                                <div><span className="text-slate-400">Input:</span> {ex.input}</div>
                                                <div><span className="text-slate-400">Output:</span> {ex.output}</div>
                                                {ex.explanation && <div><span className="text-slate-400">Explanation:</span> {ex.explanation}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-900/50 shrink-0">
                        <div className="flex justify-between">
                            <button
                                onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
                                disabled={currentQIndex === 0}
                                className="text-sm text-slate-400 hover:text-white disabled:opacity-30"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentQIndex(Math.min(config.questions.length - 1, currentQIndex + 1))}
                                disabled={currentQIndex === config.questions.length - 1}
                                className="text-sm text-brand-400 hover:text-brand-300 disabled:opacity-30"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Editor & Output */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    {/* Editor */}
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            defaultLanguage="javascript"
                            language={language}
                            theme="vs-dark"
                            value={currentCode}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 16 }
                            }}
                        />
                    </div>

                    {/* Output/Console */}
                    <div className="h-1/3 border-t border-slate-800 bg-slate-900 flex flex-col">
                        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-300">Test Results</span>
                            <button
                                onClick={handleRun}
                                disabled={running}
                                className="flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 disabled:opacity-50"
                            >
                                <Play className="w-3 h-3" />
                                {running ? 'Running...' : 'Run Code'}
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                            {results[currentQIndex] ? (
                                <div className="space-y-4">
                                    {results[currentQIndex].map((res, i) => (
                                        <div key={i} className={`p-3 rounded border ${res.passed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {res.passed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                                                <span className={res.passed ? 'text-emerald-400' : 'text-red-400'}>
                                                    Test Case {i + 1}: {res.passed ? 'Passed' : 'Failed'}
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-slate-300">
                                                <div><span className="text-slate-500">Input:</span> {res.input}</div>
                                                <div><span className="text-slate-500">Expected:</span> {res.expected}</div>
                                                <div><span className="text-slate-500">Output:</span> {res.output}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">Run your code to see test results.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
