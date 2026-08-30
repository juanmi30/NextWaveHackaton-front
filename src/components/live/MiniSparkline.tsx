import { useMemo } from 'react'

type Props = { values: number[]; width?: number; height?: number; tone?: 'neutral' | 'success' | 'warning' | 'danger'; baseline?: number | null }
export function MiniSparkline({ values, width = 110, height = 32, tone = 'neutral', baseline = null }: Props) {
  const points = useMemo(() => {
    if (!values.length) return ''
    const min = Math.min(...values, baseline ?? Number.POSITIVE_INFINITY)
    const max = Math.max(...values, baseline ?? Number.NEGATIVE_INFINITY)
    const range = max - min || 1
    return values.map((value, index) => `${values.length === 1 ? width / 2 : index * width / (values.length - 1)},${height - 3 - ((value - min) / range) * (height - 6)}`).join(' ')
  }, [baseline, height, values, width])
  if (!values.length) return null
  return <svg className={`mini-sparkline sparkline-${tone}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Recent values: ${values.join(', ')}`}><polyline points={points} /></svg>
}
