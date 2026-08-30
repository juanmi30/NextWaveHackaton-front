import type {
  OperationalState,
  UnifiedGraphNodeData,
  UnifiedGraphResponse,
} from './types'

export type GraphFocusMode =
  | 'predictive'
  | 'incident'

export type ResolvedGraphViews = {
  predictive: UnifiedGraphResponse | null
  incident: UnifiedGraphResponse | null
}

export function hasIncidentOverlay(
  data: UnifiedGraphNodeData,
) {
  return Boolean(
    data.hasActiveIncident ||
    data.focusIncident ||
    data.operationalState === 'INCIDENT' ||
    data.incidents?.some(
      (incident) =>
        incident.status !== 'RESOLVED',
    ),
  )
}

function nodeHasPrediction(
  data: UnifiedGraphNodeData,
) {
  return Boolean(
    data.predictionStatus === 'PREDICTION' ||
    data.riskLevel ||
    typeof data.failureProbability === 'number' ||
    typeof data.failureProbabilityPercent === 'number',
  )
}

export function getPredictionState(
  data: UnifiedGraphNodeData,
): OperationalState {
  if (
    data.predictionStatus === 'INSUFFICIENT_EVIDENCE' ||
    data.evidence?.sufficientEvidence === false
  ) {
    return 'INCONCLUSIVE'
  }

  if (data.riskLevel === 'HIGH') return 'HIGH_RISK'
  if (data.riskLevel === 'WATCH') return 'WATCH'
  if (data.riskLevel === 'LOW') return 'LOW_RISK'

  if (
    data.operationalState &&
    data.operationalState !== 'INCIDENT'
  ) {
    return data.operationalState
  }

  return 'INCONCLUSIVE'
}

export function getGraphCapabilities(
  graph: UnifiedGraphResponse,
) {
  const hasNonTrafficNodes =
    graph.nodes.some(
      (node) => node.type !== 'traffic',
    )

  const hasIncidentTopology =
    hasNonTrafficNodes &&
    (
      graph.focus?.source === 'INCIDENT' ||
      graph.nodes.some(
        (node) =>
          hasIncidentOverlay(node.data),
      )
    )

  const hasPredictionTopology =
    hasNonTrafficNodes &&
    (
      graph.focus?.source === 'PREDICTION' ||
      graph.summary.predictions > 0 ||
      graph.nodes.some(
        (node) =>
          nodeHasPrediction(node.data),
      )
    )

  const isTrulyEmpty =
    !hasNonTrafficNodes &&
    graph.edges.length === 0 &&
    graph.focus?.source !== 'INCIDENT' &&
    graph.focus?.source !== 'PREDICTION'

  return {
    hasNonTrafficNodes,
    hasIncidentTopology,
    hasPredictionTopology,
    isTrulyEmpty,
  }
}

export function resolveGraphViews(
  defaultGraph: UnifiedGraphResponse | null,
  requestedIncidentGraph: UnifiedGraphResponse | null,
): ResolvedGraphViews {
  const requestedIncident =
    requestedIncidentGraph &&
    requestedIncidentGraph.focus?.source === 'INCIDENT'
      ? requestedIncidentGraph
      : null

  const defaultIncident =
    defaultGraph &&
    defaultGraph.focus?.source === 'INCIDENT'
      ? defaultGraph
      : null

  const predictive =
    defaultGraph &&
    (
      defaultGraph.focus?.source === 'PREDICTION' ||
      defaultGraph.summary.predictions > 0
    )
      ? defaultGraph
      : null

  return {
    predictive,
    incident:
      requestedIncident ??
      defaultIncident,
  }
}

export function initialFocusMode(
  incidentId: string | null | undefined,
  views: ResolvedGraphViews,
): GraphFocusMode {
  if (incidentId && views.incident) {
    return 'incident'
  }

  if (views.incident?.focus?.source === 'INCIDENT') {
    return 'incident'
  }

  if (views.predictive) {
    return 'predictive'
  }

  if (views.incident) {
    return 'incident'
  }

  return 'predictive'
}
