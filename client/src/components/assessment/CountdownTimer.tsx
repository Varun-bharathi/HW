import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  durationMinutes: number
  onExpire: () => void
  paused?: boolean
  initialRemainingSeconds?: number
  onTick?: (remainingSeconds: number) => void
}

export function CountdownTimer({
  durationMinutes,
  onExpire,
  paused = false,
  initialRemainingSeconds,
  onTick,
}: CountdownTimerProps) {
  const total = durationMinutes * 60
  const [remaining, setRemaining] = useState(
    initialRemainingSeconds ?? total
  )
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    if (ended || paused || remaining <= 0) return
    const t = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1
        onTick?.(next)
        if (next <= 0) {
          setEnded(true)
          onExpire()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(t)
  }, [paused, ended, onExpire, onTick])

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const danger = remaining <= 5 * 60

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
        danger ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
      }`}
    >
      <span className="w-8 text-right">{m}</span>
      <span className="text-slate-500">:</span>
      <span className="w-8">{s.toString().padStart(2, '0')}</span>
      {paused && (
        <span className="ml-2 text-xs font-normal text-amber-400">Paused</span>
      )}
    </div>
  )
}
