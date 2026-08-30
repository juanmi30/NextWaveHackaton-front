import { useEffect, useState } from 'react'

export function LiveClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setTime(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  return <time className="live-clock" dateTime={time.toISOString()} title="Browser local time">{time.toLocaleTimeString([], { hour12: false })}</time>
}
