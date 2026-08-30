export type ExplorerDimension =
  | 'merchant'
  | 'provider'
  | 'method'
  | 'country'
  | 'issuingBank'

export type OperationalState =
  | 'INCIDENT'
  | 'HIGH_RISK'
  | 'WATCH'
  | 'LOW_RISK'
  | 'INCONCLUSIVE'

export type PredictionStatus =
  | 'PREDICTION'
  | 'INSUFFICIENT_EVIDENCE'

export type PredictionSignal = {
  feature: string
  value?: number | null
  contribution?: number | null
  effect:
    | 'INCREASES_RISK'
    | 'DECREASES_RISK'
}

export type PredictionEvidence = {
  currentAttempts?: number
  baselineAttempts?: number
  bucketAttempts?: number[]
  sufficientEvidence?: boolean
  reason?: string
}

export type PredictionFeatureValue =
  | number
  | null
  | undefined

/**
 * The named fields document the current V1 contract. The index signature keeps
 * future model features available to the UI without requiring a release for
 * every new feature name.
 */
export type PredictionFeatures =
  Record<string, PredictionFeatureValue> & {
    baselineApprovalRate?: PredictionFeatureValue
    approvalDrop?: PredictionFeatureValue
    approvalSlope?: PredictionFeatureValue
    timeoutRate?: PredictionFeatureValue
    timeoutSlope?: PredictionFeatureValue
    errorRate?: PredictionFeatureValue
    p95LatencyMs?: PredictionFeatureValue
    latencySlope?: PredictionFeatureValue
  }

export type FailureReasonSummary = {
  code: string
  category: string
  actionability: string
  retryability: string
  count: number
  share: number
}

export type FailureContext = {
  totalAttempts?: number
  totalFailures?: number
  failureRate?: number

  actionableFailures?: number
  issuerSideFailures?: number
  limitedFailures?: number
  unknownFailures?: number

  topReasons?: FailureReasonSummary[]
}

export type UnifiedIncident = {
  id: string
  status: string
  severity: number

  priorityScore: number | null
  priorityRank: number | null

  lossPerMinuteCents: number
  lostApprovals: number

  summaryOps: string | null
  recommendation: string | null

  dimensions: Record<string, string>

  baselineRate: number | null
  observedRate: number | null

  dropPp: number | null
  confidence: number | null
}

export type UnifiedGraphNodeData = {
  label: string

  dimension?: ExplorerDimension
  value?: string

  segment?: Record<string, string>

  selected?: boolean
  operationalState?: OperationalState
  predictionStatus?: PredictionStatus

  riskLevel?:
    | 'LOW'
    | 'WATCH'
    | 'HIGH'
    | null

  failureProbability?:
    | number
    | null

  failureProbabilityPercent?:
    | number
    | null

  elevatedRisk?: boolean

  predictionHorizonMinutes?:
    | number
    | null

  decisionThreshold?:
    | number
    | null

  model?: {
    type: string
    version: string
  } | null

  features?:
    | PredictionFeatures
    | null

  signals?: PredictionSignal[]

  evidence?: PredictionEvidence

  failureContext?: FailureContext

  approvalDropPp?:
    | number
    | null

  incidents?: UnifiedIncident[]

  hasActiveIncident?: boolean

  focusIncident?:
    | UnifiedIncident
    | null

  activeRoutes?: number
  activeIncidents?: number
}

export type UnifiedGraphNode = {
  id: string

  type:
    | 'traffic'
    | 'dimension'
    | 'routeStatus'

  data: UnifiedGraphNodeData
}

export type UnifiedGraphEdge = {
  id: string
  source: string
  target: string

  type:
    | 'selected'
    | 'alternative'
}

export type UnifiedGraphLevel = {
  dimension: ExplorerDimension
  selectedValue: string

  parentFilters:
    Record<string, string>

  totalSiblings: number
  returnedSiblings: number
  alternativesTruncated: number
}

export type UnifiedGraphResponse = {
  mode: 'unified'

  generatedAt: string

  focus: {
    source:
      | 'INCIDENT'
      | 'PREDICTION'
      | 'TRAFFIC'

    requestedIncidentId:
      | string
      | null

    incidentScope:
      | Record<string, string>
      | null

    selectedFlow:
      Record<string, string>

    selectedFlowSource: string

    selectedFlowAttempts: number
  } | null

  summary: {
    activeRoutes: number
    predictions: number
    insufficientEvidence: number

    highRiskRoutes: number
    watchRoutes: number
    lowRiskRoutes: number

    activeIncidents: number
  }

  explorationOrder?:
    ExplorerDimension[]

  levels: UnifiedGraphLevel[]

  nodes: UnifiedGraphNode[]

  edges: UnifiedGraphEdge[]
}
