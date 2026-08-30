import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useAnimatedNumber(value: number, durationMs = 320) {
  const reduced = usePrefersReducedMotion()
  const [displayed, setDisplayed] = useState(value)
  const displayedRef = useRef(value)

  useEffect(() => {
    if (reduced) return
    const startValue = displayedRef.current
    if (startValue === value) return
    const startedAt = performance.now()
    let frame = 0
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs)
      const next = startValue + (value - startValue) * (1 - Math.pow(1 - progress, 3))
      displayedRef.current = next
      setDisplayed(next)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [durationMs, reduced, value])

  return reduced ? value : displayed
}
