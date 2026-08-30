export type ExplorerDimension =
  | 'merchant'
  | 'provider'
  | 'method'
  | 'country'
  | 'issuingBank'

export type ExplorerHealth =
  | 'SELECTED'
  | 'HEALTHY'
  | 'DEGRADED'
  | 'INCONCLUSIVE'

export type ExplorerGraphNodeType =
  | 'traffic'
  | 'dimension'
  | 'rootCause'
  | 'evidence'

export type ExplorerGraphNodeData = {
  label: string
  dimension?: ExplorerDimension | 'failureReason'
  value?: string | null
  selected?: boolean
  health?: ExplorerHealth

  segment?: Record<string, string>
  dimensions?: Record<string, string>

  baselineRate?: number | null
  observedRate?: number | null

  deltaPp?: number | null

  drop?: number | null
  dropPp?: number | null

  attempts?: number | null
  confidence?: number | null
  zScore?: number | null

  baselineAttempts?: number | null
  baselineSource?: string

  lostApprovals?: number | null
  lossPerMinuteCents?: number | null

  difference?: number | null
}

export type ExplorerGraphNode = {
  id: string
  type: ExplorerGraphNodeType
  data: ExplorerGraphNodeData
}

export type ExplorerGraphEdge = {
  id: string
  source: string
  target: string
  type:
    | 'selected'
    | 'alternative'
    | 'diagnostic_evidence'
    | 'flow'
}

export type ExplorerLevel = {
  dimension: ExplorerDimension
  selectedValue: string
  parentFilters: Record<string, string>
  totalSiblings: number
  returnedSiblings: number
  alternativesTruncated: number
}

export type IncidentExplorerGraph = {
  mode: 'explorer'

  incidentId: string

  status:
    | 'OPEN'
    | 'ACKNOWLEDGED'
    | 'RESOLVED'

  severity: number

  detectionRun: {
    id: string

    window: {
      from: string
      to: string
    }

    thresholds: {
      minSampleSize: number
      minZScore: number
      minConfidence: number
      minDrop: number
    }
  }

  diagnosis: {
    id: string
    version: number
    fingerprint: string

    dimensions: Record<string, string>

    dimensionDepth: number

    baselineRate: number
    observedRate: number
    confidence: number
  }

  rootCause: {
    label: string
    dimensions: Record<string, string>
  }

  explorationOrder: ExplorerDimension[]

  levels: ExplorerLevel[]

  nodes: ExplorerGraphNode[]

  edges: ExplorerGraphEdge[]
}