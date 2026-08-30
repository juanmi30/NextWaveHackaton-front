import { useEffect, useRef, useState } from 'react'

export type ValueDirection = 'UP' | 'DOWN' | 'CHANGED' | null

export function useValueFlash(value: number | string | null | undefined, durationMs = 700) {
  const previous = useRef(value)
  const [direction, setDirection] = useState<ValueDirection>(null)

  useEffect(() => {
    if (previous.current === value) return
    const before = previous.current
    previous.current = value
    if (before === null || before === undefined || value === null || value === undefined) return
    const nextDirection = typeof before === 'number' && typeof value === 'number'
      ? value > before ? 'UP' : value < before ? 'DOWN' : null
      : 'CHANGED'
    if (!nextDirection) return
    setDirection(nextDirection)
    const timer = window.setTimeout(() => setDirection(null), durationMs)
    return () => window.clearTimeout(timer)
  }, [durationMs, value])

  return { changed: direction !== null, direction }
}
