import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getUnifiedGraph } from './graphApi'
import type {
  ExplorerDimension,
  FailureContext,
  OperationalState,
  PredictionEvidence,
  PredictionFeatures,
  PredictionSignal,
  UnifiedGraphEdge,
  UnifiedGraphNode,
  UnifiedGraphNodeData,
  UnifiedGraphResponse,
  UnifiedIncident,
} from './types'

import './RootCauseExplorer.css'

const NODE_WIDTH = 238
const ROUTE_WIDTH = 310
const LEVEL_GAP = 205
const SIBLING_GAP = 286
const TOP_PADDING = 30

type FocusMode = 'predictive' | 'incident'

type GraphViews = {
  predictive: UnifiedGraphResponse | null
  incident: UnifiedGraphResponse | null
}

type PositionedNode = UnifiedGraphNode & {
  x: number
  y: number
  width: number
  height: number
}

type GraphLayout = {
  width: number
  height: number
  nodes: PositionedNode[]
}

const dimensionLabels: Record<ExplorerDimension, string> = {
  merchant: 'Merchant',
  provider: 'Provider',
  method: 'Payment method',
  country: 'Country',
  issuingBank: 'Issuing bank',
}

const featureLabels: Record<string, string> = {
  baseline_approval_rate: 'Baseline approval',
  approval_drop: 'Approval deterioration',
  approval_slope: 'Approval trend',
  timeout_rate: 'Timeout rate',
  timeout_slope: 'Timeout trend',
  error_rate: 'Error rate',
  p95_latency_ms: 'P95 latency',
  latency_slope: 'Latency trend',
  rejected_rate: 'Rejected rate',
  provider_error_rate: 'Provider error rate',
  issuer_decline_rate: 'Issuer decline rate',
  authentication_failure_rate: 'Authentication failure rate',
  fraud_failure_rate: 'Fraud failure rate',
  soft_decline_rate: 'Soft decline rate',
  hard_decline_rate: 'Hard decline rate',
  fallback_rate: 'Fallback rate',
}

function toSnakeCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

function humanizeFeatureName(feature: string) {
  const normalized = toSnakeCase(feature)
  const known = featureLabels[normalized]

  if (known) return known

  const words = normalized.replaceAll('_', ' ').trim()
  return words
    ? words[0].toUpperCase() + words.slice(1)
    : 'Unknown feature'
}

function formatMoney(cents: number | null | undefined) {
  if (typeof cents !== 'number') return '—'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatCount(value: number | null | undefined) {
  return typeof value === 'number'
    ? new Intl.NumberFormat('en-US').format(value)
    : '—'
}

function formatRate(value: number | null | undefined, digits = 1) {
  if (typeof value !== 'number') return '—'
  const percent = Math.abs(value) <= 1 ? value * 100 : value
  return `${percent.toFixed(digits)}%`
}

function formatPercentagePoints(value: number | null | undefined) {
  if (typeof value !== 'number') return '—'
  const points = Math.abs(value) <= 1 ? value * 100 : value
  return `${points.toFixed(1)} pp`
}

function probabilityPercent(data: UnifiedGraphNodeData) {
  if (typeof data.failureProbabilityPercent === 'number') {
    return data.failureProbabilityPercent
  }

  if (typeof data.failureProbability === 'number') {
    return data.failureProbability * 100
  }

  return null
}

function predictionState(data: UnifiedGraphNodeData): OperationalState {
  if (
    data.predictionStatus === 'INSUFFICIENT_EVIDENCE' ||
    data.evidence?.sufficientEvidence === false
  ) {
    return 'INCONCLUSIVE'
  }

  if (data.riskLevel === 'HIGH') return 'HIGH_RISK'
  if (data.riskLevel === 'WATCH') return 'WATCH'
  if (data.riskLevel === 'LOW') return 'LOW_RISK'

  if (data.operationalState && data.operationalState !== 'INCIDENT') {
    return data.operationalState
  }

  return 'INCONCLUSIVE'
}

function predictionLabel(state: OperationalState) {
  switch (state) {
    case 'HIGH_RISK':
      return 'ML HIGH'
    case 'WATCH':
      return 'WATCH'
    case 'LOW_RISK':
      return 'LOW'
    default:
      return 'INCONCLUSIVE'
  }
}

function stateClass(state: OperationalState) {
  switch (state) {
    case 'HIGH_RISK':
      return 'unified-state-high'
    case 'WATCH':
      return 'unified-state-watch'
    case 'LOW_RISK':
      return 'unified-state-low'
    default:
      return 'unified-state-inconclusive'
  }
}

function activeIncidents(data: UnifiedGraphNodeData) {
  const incidents = data.incidents ?? []
  return incidents.filter((incident) => incident.status !== 'RESOLVED')
}

function hasIncident(data: UnifiedGraphNodeData) {
  return data.hasActiveIncident === true || activeIncidents(data).length > 0
}

function formatEvidenceReason(reason: string | undefined) {
  switch (reason) {
    case 'INSUFFICIENT_BASELINE':
      return 'Insufficient historical baseline'
    case 'INSUFFICIENT_CURRENT_SAMPLE':
      return 'Insufficient recent traffic'
    case 'INSUFFICIENT_TIME_SERIES':
      return 'Incomplete recent time series'
    default:
      return 'Insufficient evidence'
  }
}

function featureValue(
  features: PredictionFeatures | null | undefined,
  ...names: string[]
) {
  if (!features) return null

  for (const name of names) {
    const value = features[name]
    if (typeof value === 'number') return value
  }

  return null
}

function formatSignalValue(signal: PredictionSignal) {
  if (typeof signal.value !== 'number') return null

  const normalized = toSnakeCase(signal.feature)
  if (normalized.endsWith('_rate') || normalized.includes('approval')) {
    return formatRate(signal.value)
  }
  if (normalized.includes('latency')) {
    return `${Math.round(signal.value)} ms`
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
    .format(signal.value)
}

function formatSegment(
  segment: Record<string, string> | undefined,
  order: ExplorerDimension[] = [],
) {
  if (!segment) return 'No route selected'

  const orderedKeys = [
    ...order.filter((key) => segment[key] !== undefined),
    ...Object.keys(segment).filter((key) => !order.includes(key as ExplorerDimension)),
  ]

  return orderedKeys.map((key) => segment[key]).join(' → ') || 'No route selected'
}

function nodeHeight(node: UnifiedGraphNode) {
  if (node.type === 'traffic') return 92
  if (node.type === 'routeStatus') return 176
  return 154
}

function nodeWidth(node: UnifiedGraphNode) {
  return node.type === 'routeStatus' ? ROUTE_WIDTH : NODE_WIDTH
}

function depthForNode(node: UnifiedGraphNode, graph: UnifiedGraphResponse) {
  if (node.type === 'traffic') return 0
  if (node.type === 'routeStatus') {
    return (graph.explorationOrder ?? []).length + 1
  }

  return Math.max(1, Object.keys(node.data.segment ?? {}).length)
}

function buildLayout(graph: UnifiedGraphResponse): GraphLayout {
  const rows = new Map<number, UnifiedGraphNode[]>()

  for (const node of graph.nodes) {
    const depth = depthForNode(node, graph)
    rows.set(depth, [...(rows.get(depth) ?? []), node])
  }

  const maxRowSize = Math.max(1, ...[...rows.values()].map((row) => row.length))
  const maxSideCount = Math.ceil((maxRowSize - 1) / 2)
  const width = Math.max(1040, maxSideCount * SIBLING_GAP * 2 + 560)
  const centerX = width / 2
  const positioned: PositionedNode[] = []

  for (const [depth, row] of rows.entries()) {
    const selected = row.find((node) =>
      node.type === 'traffic' ||
      node.type === 'routeStatus' ||
      node.data.selected === true,
    )
    const alternatives = row.filter((node) => node !== selected)

    if (selected) {
      positioned.push({
        ...selected,
        x: centerX,
        y: TOP_PADDING + depth * LEVEL_GAP,
        width: nodeWidth(selected),
        height: nodeHeight(selected),
      })
    }

    alternatives.forEach((node, index) => {
      const magnitude = Math.floor(index / 2) + 1
      const direction = index % 2 === 0 ? -1 : 1
      positioned.push({
        ...node,
        x: centerX + direction * magnitude * SIBLING_GAP,
        y: TOP_PADDING + depth * LEVEL_GAP,
        width: nodeWidth(node),
        height: nodeHeight(node),
      })
    })
  }

  const maxDepth = rows.size > 0 ? Math.max(...rows.keys()) : 0
  return {
    width,
    height: TOP_PADDING + maxDepth * LEVEL_GAP + 230,
    nodes: positioned,
  }
}

function edgePath(edge: UnifiedGraphEdge, positions: Map<string, PositionedNode>) {
  const source = positions.get(edge.source)
  const target = positions.get(edge.target)
  if (!source || !target) return null

  const sourceY = source.y + source.height
  const middleY = sourceY + (target.y - sourceY) / 2
  return `M ${source.x} ${sourceY} C ${source.x} ${middleY}, ${target.x} ${middleY}, ${target.x} ${target.y}`
}

function PredictionBadge({ data }: { data: UnifiedGraphNodeData }) {
  const state = predictionState(data)
  return (
    <span className={`unified-badge unified-risk-badge ${stateClass(state)}`}>
      {predictionLabel(state)}
    </span>
  )
}

function IncidentBadge() {
  return <span className="unified-badge unified-incident-badge">INCIDENT</span>
}

function NodeBadges({ data }: { data: UnifiedGraphNodeData }) {
  return (
    <div className="unified-node-badges">
      {hasIncident(data) ? <IncidentBadge /> : null}
      <PredictionBadge data={data} />
    </div>
  )
}

function GraphNodeCard({ node }: { node: PositionedNode }) {
  if (node.type === 'traffic') {
    return (
      <div className="unified-node-content unified-traffic-content">
        <span className="unified-kicker">Unified payment view</span>
        <strong>ALL ACTIVE PAYMENT TRAFFIC</strong>
        <small>
          {node.data.activeRoutes ?? 0} active routes · {node.data.activeIncidents ?? 0} incidents
        </small>
      </div>
    )
  }

  const state = predictionState(node.data)
  const probability = probabilityPercent(node.data)
  const latency = featureValue(node.data.features, 'p95LatencyMs', 'p95_latency_ms')

  return (
    <div className="unified-node-content">
      <div className="unified-node-heading">
        <span className="unified-kicker">
          {node.type === 'routeStatus'
            ? 'Selected full route'
            : dimensionLabels[node.data.dimension ?? 'merchant']}
        </span>
      </div>

      <strong className="unified-node-title">
        {node.type === 'routeStatus'
          ? formatSegment(node.data.segment)
          : node.data.value ?? node.data.label}
      </strong>

      <NodeBadges data={node.data} />

      <div className="unified-node-metrics">
        {probability !== null ? (
          <span><strong>{probability.toFixed(1)}%</strong> estimated risk</span>
        ) : (
          <span>{formatEvidenceReason(node.data.evidence?.reason)}</span>
        )}
        {state !== 'LOW_RISK' && latency !== null ? (
          <span>P95 latency {Math.round(latency)} ms</span>
        ) : null}
        {hasIncident(node.data) ? <span>Confirmed degradation overlaid</span> : null}
      </div>
    </div>
  )
}

function EvidenceSummary({ evidence }: { evidence?: PredictionEvidence }) {
  const buckets = evidence?.bucketAttempts ?? []
  const maxBucket = Math.max(1, ...buckets)

  return (
    <div className="unified-evidence">
      <div className="unified-evidence-counts">
        <span>Current sample <strong>{formatCount(evidence?.currentAttempts)}</strong></span>
        <span>Baseline sample <strong>{formatCount(evidence?.baselineAttempts)}</strong></span>
      </div>

      {buckets.length > 0 ? (
        <div className="unified-buckets" aria-label={`Recent bucket attempts: ${buckets.join(', ')}`}>
          {buckets.map((attempts, index) => (
            <div key={`${attempts}-${index}`}>
              <i style={{ height: `${Math.max(12, attempts / maxBucket * 100)}%` }} />
              <strong>{attempts}</strong>
              <span>B{index + 1}</span>
            </div>
          ))}
        </div>
      ) : (
        <small>No temporal buckets returned.</small>
      )}
    </div>
  )
}

function ModelSignals({ signals }: { signals?: PredictionSignal[] }) {
  const topSignals = [...(signals ?? [])]
    .sort((a, b) => Math.abs(b.contribution ?? 0) - Math.abs(a.contribution ?? 0))
    .slice(0, 4)

  if (topSignals.length === 0) {
    return <small className="unified-muted">No model drivers returned.</small>
  }

  return (
    <div className="unified-driver-list">
      {topSignals.map((signal, index) => {
        const increases = signal.effect === 'INCREASES_RISK'
        const value = formatSignalValue(signal)
        return (
          <div key={`${signal.feature}-${index}`}>
            <span className={increases ? 'driver-up' : 'driver-down'} aria-hidden="true">
              {increases ? '↑' : '↓'}
            </span>
            <span>
              <strong>{humanizeFeatureName(signal.feature)}</strong>
              {value ? <small>{value}</small> : null}
            </span>
            <b>{typeof signal.contribution === 'number'
              ? `${signal.contribution >= 0 ? '+' : ''}${signal.contribution.toFixed(2)}`
              : '—'}</b>
          </div>
        )
      })}
    </div>
  )
}

function FailureContextSummary({ context }: { context?: FailureContext }) {
  const reasons = context?.topReasons?.slice(0, 4) ?? []
  const hasTotals = typeof context?.totalAttempts === 'number'

  return (
    <section className="unified-context-card">
      <div className="unified-section-heading">
        <div>
          <span className="unified-kicker">Observed failure context</span>
          <strong>What failures are occurring?</strong>
        </div>
        <small>Descriptive context · not automatically model input</small>
      </div>

      {hasTotals ? (
        <div className="unified-context-totals">
          <span><strong>{formatCount(context?.totalFailures)}</strong> failures</span>
          <span><strong>{formatRate(context?.failureRate)}</strong> failure rate</span>
          <span><strong>{formatCount(context?.actionableFailures)}</strong> actionable</span>
          <span><strong>{formatCount(context?.issuerSideFailures)}</strong> issuer-side</span>
        </div>
      ) : null}

      {reasons.length > 0 ? (
        <div className="unified-reasons">
          {reasons.map((reason) => (
            <div key={`${reason.code}-${reason.category}`}>
              <strong>{formatRate(reason.share, 0)} {humanizeFeatureName(reason.code)}</strong>
              <span>{humanizeFeatureName(reason.category)} · {humanizeFeatureName(reason.actionability)}</span>
              <small>{reason.count} failures · {humanizeFeatureName(reason.retryability)} retryability</small>
            </div>
          ))}
        </div>
      ) : (
        <div className="unified-context-empty">No observed failure pattern was returned for this route.</div>
      )}
    </section>
  )
}

function IncidentSummary({ incident }: { incident: UnifiedIncident }) {
  return (
    <section className="unified-incident-panel">
      <div className="unified-section-heading">
        <div>
          <span className="unified-kicker">Confirmed incident</span>
          <strong>Detection observed an active degradation</strong>
        </div>
        <IncidentBadge />
      </div>

      <div className="unified-incident-metrics">
        <span>Actual approval <strong>{formatRate(incident.observedRate)}</strong></span>
        <span>Expected approval <strong>{formatRate(incident.baselineRate)}</strong></span>
        <span>Actual deterioration <strong>{typeof incident.dropPp === 'number' ? `${incident.dropPp.toFixed(1)} pp` : '—'}</strong></span>
        <span>Estimated impact <strong>{formatMoney(incident.lossPerMinuteCents)}/min</strong></span>
        <span>Lost approvals <strong>{formatCount(incident.lostApprovals)}</strong></span>
        <span>Detector confidence <strong>{formatRate(incident.confidence)}</strong></span>
      </div>
    </section>
  )
}

function PredictivePipeline({ data }: { data: UnifiedGraphNodeData }) {
  const state = predictionState(data)
  const probability = probabilityPercent(data)
  const baselineApproval = featureValue(
    data.features,
    'baselineApprovalRate',
    'baseline_approval_rate',
  )
  const approvalDrop = typeof data.approvalDropPp === 'number'
    ? data.approvalDropPp
    : featureValue(data.features, 'approvalDrop', 'approval_drop')
  const latency = featureValue(data.features, 'p95LatencyMs', 'p95_latency_ms')
  const modelName = data.model
    ? `${humanizeFeatureName(data.model.type)}${data.model.version ? ` ${data.model.version}` : ''}`
    : 'Model not returned'

  return (
    <section className="unified-pipeline" aria-label="Predictive model explanation">
      <div className="unified-pipeline-title">
        <div>
          <span className="unified-kicker">Predictive model</span>
          <strong>Historical behavior → recent evidence → model → estimated risk</strong>
        </div>
        <PredictionBadge data={data} />
      </div>

      <div className="unified-pipeline-stages">
        <div className="unified-stage">
          <span>01 · Historical baseline</span>
          <strong>{formatRate(baselineApproval)} approval</strong>
          <small>{formatCount(data.evidence?.baselineAttempts)} attempts</small>
        </div>

        <i aria-hidden="true">→</i>

        <div className="unified-stage unified-stage-evidence">
          <span>02 · Recent evidence</span>
          <strong>Last {data.predictionHorizonMinutes ?? 15} min</strong>
          <EvidenceSummary evidence={data.evidence} />
        </div>

        <i aria-hidden="true">→</i>

        <div className="unified-stage unified-stage-model">
          <span>03 · Model</span>
          <strong>{modelName}</strong>
          <ModelSignals signals={data.signals} />
        </div>

        <i aria-hidden="true">→</i>

        <div className={`unified-stage unified-stage-risk ${stateClass(state)}`}>
          <span>04 · Estimated degradation risk</span>
          {probability !== null ? (
            <strong>{probability.toFixed(2)}%</strong>
          ) : (
            <strong>Prediction unavailable</strong>
          )}
          <small>
            {probability !== null
              ? `Next ${data.predictionHorizonMinutes ?? 15} min${typeof data.decisionThreshold === 'number' ? ` · threshold ${formatRate(data.decisionThreshold)}` : ''}`
              : formatEvidenceReason(data.evidence?.reason)}
          </small>
        </div>
      </div>

      <div className="unified-predictive-metrics">
        <span>Approval deterioration <strong>{formatPercentagePoints(approvalDrop)}</strong></span>
        <span>P95 latency <strong>{latency !== null ? `${Math.round(latency)} ms` : '—'}</strong></span>
        <span>Recent attempts <strong>{formatCount(data.evidence?.currentAttempts)}</strong></span>
        <span>Decision threshold <strong>{formatRate(data.decisionThreshold)}</strong></span>
      </div>

      {state === 'INCONCLUSIVE' ? (
        <div className="unified-evidence-warning">
          Insufficient evidence is not a low-risk result.
          {typeof data.evidence?.currentAttempts === 'number'
            ? ` Current sample: ${formatCount(data.evidence.currentAttempts)}.`
            : ''}
        </div>
      ) : null}
    </section>
  )
}

function SelectedRouteInspector({
  node,
  graph,
}: {
  node: UnifiedGraphNode
  graph: UnifiedGraphResponse
}) {
  const incident = node.data.focusIncident ?? activeIncidents(node.data)[0]

  return (
    <div className="unified-inspector">
      <div className="unified-selected-route">
        <div>
          <span>Selected route</span>
          <strong>{formatSegment(node.data.segment, graph.explorationOrder)}</strong>
        </div>
        <NodeBadges data={node.data} />
      </div>

      <PredictivePipeline data={node.data} />
      <FailureContextSummary context={node.data.failureContext} />
      {incident ? <IncidentSummary incident={incident} /> : null}
    </div>
  )
}

export function RootCauseExplorer({ incidentId }: { incidentId?: string | null }) {
  const [views, setViews] = useState<GraphViews>({ predictive: null, incident: null })
  const [focusMode, setFocusMode] = useState<FocusMode>(incidentId ? 'incident' : 'predictive')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const requests = [getUnifiedGraph(null)]
    if (incidentId) requests.push(getUnifiedGraph(incidentId))

    void Promise.allSettled(requests).then((results) => {
      if (cancelled) return

      const predictive = results[0]?.status === 'fulfilled' ? results[0].value : null
      const incident = results[1]?.status === 'fulfilled' ? results[1].value : null
      setViews({ predictive, incident })
      setError(null)
      setLoadedRequestKey(incidentId ?? 'predictive')

      setFocusMode(incidentId && incident ? 'incident' : 'predictive')

      if (!predictive && !incident) {
        const reason = results.find((result) => result.status === 'rejected')
        setError(
          reason?.status === 'rejected' && reason.reason instanceof Error
            ? reason.reason.message
            : 'Unable to load unified risk graph',
        )
      }
    })

    return () => { cancelled = true }
  }, [incidentId])

  const graph = focusMode === 'incident'
    ? views.incident ?? views.predictive
    : views.predictive ?? views.incident

  const layout = useMemo(() => graph ? buildLayout(graph) : null, [graph])
  const positions = useMemo(() => {
    const map = new Map<string, PositionedNode>()
    for (const node of layout?.nodes ?? []) map.set(node.id, node)
    return map
  }, [layout])

  const selectedNode = graph?.nodes.find((node) => node.id === selectedNodeId)
    ?? graph?.nodes.find((node) => node.type === 'routeStatus')
    ?? graph?.nodes.find((node) => node.data.selected && node.type !== 'traffic')
    ?? null

  if (loadedRequestKey !== (incidentId ?? 'predictive')) {
    return (
      <article className="panel unified-panel">
        <div className="empty-state">Loading unified risk graph…</div>
      </article>
    )
  }

  if (error || !graph || !layout) {
    return (
      <article className="panel unified-panel">
        <div className="panel-header">
          <div><p className="eyebrow">Unified risk graph</p><h3>Graph unavailable</h3></div>
        </div>
        <div className="notice error-notice unified-error">
          {error ?? 'The backend did not return a graph.'}
        </div>
      </article>
    )
  }

  const predictiveAvailable = Boolean(
    views.predictive &&
    (views.predictive.summary.predictions > 0 || views.predictive.focus?.source === 'PREDICTION'),
  )
  const incidentAvailable = Boolean(views.incident)

  return (
    <article className={`panel unified-panel unified-focus-${focusMode}`}>
      <div className="panel-header unified-header">
        <div>
          <p className="eyebrow">Unified risk graph</p>
          <h3>Preventive intelligence + confirmed incidents</h3>
          <p>
            Prediction estimates whether recent route behavior is drifting. Separately,
            Detection confirms degradations and overlays incidents on the same topology.
          </p>
        </div>

        <div className="unified-header-controls">
          <div className="unified-focus-switch" aria-label="Graph focus mode">
            <button
              type="button"
              className={focusMode === 'predictive' ? 'active' : ''}
              disabled={!predictiveAvailable}
              onClick={() => setFocusMode('predictive')}
            >
              Predictive focus
              <small>Highest model risk</small>
            </button>
            <button
              type="button"
              className={focusMode === 'incident' ? 'active' : ''}
              disabled={!incidentAvailable}
              onClick={() => setFocusMode('incident')}
            >
              Incident focus
              <small>Selected confirmed event</small>
            </button>
          </div>

          <div className="unified-legend" aria-label="Graph legend">
            <span><i className="legend-incident" />Incident overlay</span>
            <span><i className="legend-high" />ML high</span>
            <span><i className="legend-watch" />Watch</span>
            <span><i className="legend-low" />Low</span>
            <span><i className="legend-inconclusive" />Inconclusive</span>
          </div>
        </div>
      </div>

      <div className="unified-summary">
        <div><span>Active routes</span><strong>{graph.summary.activeRoutes}</strong></div>
        <div><span>High risk</span><strong>{graph.summary.highRiskRoutes}</strong></div>
        <div><span>Watch</span><strong>{graph.summary.watchRoutes}</strong></div>
        <div><span>Low risk</span><strong>{graph.summary.lowRiskRoutes}</strong></div>
        <div><span>Incidents</span><strong>{graph.summary.activeIncidents}</strong></div>
        <div><span>Inconclusive</span><strong>{graph.summary.insufficientEvidence}</strong></div>
      </div>

      {selectedNode ? <SelectedRouteInspector node={selectedNode} graph={graph} /> : (
        <div className="unified-no-focus">
          <strong>{focusMode === 'predictive' ? 'No predictive routes in the active window.' : 'No incident route is available for this focus.'}</strong>
          <span>
            Traffic may be outside the recent prediction window. Confirmed incidents remain
            separate and can still be inspected when an incident focus is available.
          </span>
        </div>
      )}

      <div className="unified-topology-heading">
        <div>
          <span className="unified-kicker">Payment topology</span>
          <strong>All active payment routes</strong>
        </div>
        <small><b>{graph.summary.activeRoutes}</b> active routes · Click a node to inspect its segment</small>
      </div>

      <div className="unified-scroll">
        <div className={`unified-canvas ${graph.summary.activeRoutes === 0 ? 'unified-canvas-empty' : ''}`} style={{ width: layout.width, height: graph.summary.activeRoutes === 0 ? Math.max(340, layout.height) : layout.height }}>
          <svg
            className="unified-edges"
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            aria-hidden="true"
          >
            <defs>
              <marker id="unified-arrow-selected" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="unified-arrow-selected" />
              </marker>
              <marker id="unified-arrow-alternative" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="unified-arrow-alternative" />
              </marker>
            </defs>

            {graph.edges.map((edge) => {
              const path = edgePath(edge, positions)
              if (!path) return null
              const selected = edge.type === 'selected'
              return (
                <path
                  key={edge.id}
                  d={path}
                  className={selected ? 'unified-edge unified-edge-selected' : 'unified-edge unified-edge-alternative'}
                  markerEnd={selected ? 'url(#unified-arrow-selected)' : 'url(#unified-arrow-alternative)'}
                />
              )
            })}
          </svg>

          {layout.nodes.map((node) => {
            const riskState = predictionState(node.data)
            const interactive = node.type !== 'traffic'
            return (
              <button
                type="button"
                key={node.id}
                disabled={!interactive}
                aria-pressed={interactive ? node.id === selectedNode?.id : undefined}
                onClick={() => interactive && setSelectedNodeId(node.id)}
                className={[
                  'unified-node',
                  stateClass(riskState),
                  node.data.selected ? 'unified-node-selected' : '',
                  node.id === selectedNode?.id ? 'unified-node-inspected' : '',
                  hasIncident(node.data) ? 'unified-node-has-incident' : '',
                  node.type === 'traffic' ? 'unified-node-traffic' : '',
                  node.type === 'routeStatus' ? 'unified-node-route' : '',
                ].filter(Boolean).join(' ')}
                style={{
                  left: node.x - node.width / 2,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                }}
              >
                <GraphNodeCard node={node} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="unified-footnote">
        <span>Generated {new Date(graph.generatedAt).toLocaleTimeString()}</span>
        <span>
          Incident and predictive counts overlap by design: one route can be both INCIDENT and ML HIGH.
        </span>
      </div>
    </article>
  )
}
