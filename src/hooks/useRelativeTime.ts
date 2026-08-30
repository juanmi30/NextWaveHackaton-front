import { useEffect, useState } from 'react'

export function useRelativeTime(value: string | Date | null) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const update = () => setNow(performance.timeOrigin + performance.now())
    const initial = window.setTimeout(update, 0)
    const timer = window.setInterval(update, 1000)
    return () => { window.clearTimeout(initial); window.clearInterval(timer) }
  }, [])
  if (!value) return 'never'
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime()
  if (!Number.isFinite(time)) return 'unknown'
  if (now === null) return 'now'
  const seconds = Math.max(0, Math.floor((now - time) / 1000))
  if (seconds < 2) return 'now'
  if (seconds < 60) return `${seconds}s ago`
  return `${Math.floor(seconds / 60)}m ago`
}
