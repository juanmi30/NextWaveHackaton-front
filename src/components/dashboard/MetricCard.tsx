type Props = {
  label: string
  value: string
  detail?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
  delta?: string
  changed?: boolean
  direction?: 'up' | 'down' | 'changed'
  children?: React.ReactNode
}

export function MetricCard({ label, value, detail, tone = 'default', delta, changed, direction, children }: Props) {
  return (
    <article className={`metric-card tone-${tone}`} data-flash={changed ? direction : undefined}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {delta ? <span className="metric-delta">{delta}</span> : null}
      {detail ? <span className="metric-detail">{detail}</span> : null}
      {children}
    </article>
  )
}
