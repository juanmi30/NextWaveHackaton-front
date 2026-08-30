import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getGraphCapabilities,
  getPredictionState,
  hasIncidentOverlay,
  initialFocusMode,
  resolveGraphViews,
} from './graphState.ts'
import type {
  UnifiedGraphNodeData,
  UnifiedGraphResponse,
} from './types.ts'

function graphWith(
  source: 'INCIDENT' | 'PREDICTION' | 'TRAFFIC',
  data?: UnifiedGraphNodeData,
): UnifiedGraphResponse {
  const hasRoute = Boolean(data)

  return {
    mode: 'unified',
    generatedAt: '2026-08-30T00:00:00.000Z',
    focus: source === 'TRAFFIC' ? null : {
      source,
      requestedIncidentId: source === 'INCIDENT' ? 'incident-1' : null,
      incidentScope: source === 'INCIDENT' ? { merchant: 'Nova' } : null,
      selectedFlow: { merchant: 'Nova' },
      selectedFlowSource: source,
      selectedFlowAttempts: 0,
    },
    summary: {
      activeRoutes: source === 'PREDICTION' ? 1 : 0,
      predictions: source === 'PREDICTION' ? 1 : 0,
      insufficientEvidence: data?.predictionStatus === 'INSUFFICIENT_EVIDENCE' ? 1 : 0,
      highRiskRoutes: data?.riskLevel === 'HIGH' ? 1 : 0,
      watchRoutes: data?.riskLevel === 'WATCH' ? 1 : 0,
      lowRiskRoutes: data?.riskLevel === 'LOW' ? 1 : 0,
      activeIncidents: source === 'INCIDENT' ? 3 : 0,
    },
    explorationOrder: hasRoute ? ['merchant'] : [],
    levels: [],
    nodes: [
      {
        id: 'traffic',
        type: 'traffic',
        data: { label: 'All payment traffic' },
      },
      ...(data ? [{
        id: 'route-status',
        type: 'routeStatus' as const,
        data,
      }] : []),
    ],
    edges: hasRoute ? [{
      id: 'traffic-route',
      source: 'traffic',
      target: 'route-status',
      type: 'selected',
    }] : [],
  }
}

test('renders incident topology when activeRoutes is zero', () => {
  const incidentGraph = graphWith('INCIDENT', {
    label: 'Confirmed incident',
    operationalState: 'INCIDENT',
    hasActiveIncident: true,
  })
  const capabilities = getGraphCapabilities(incidentGraph)
  const views = resolveGraphViews(incidentGraph, null)

  assert.equal(incidentGraph.summary.activeRoutes, 0)
  assert.equal(capabilities.hasIncidentTopology, true)
  assert.equal(capabilities.isTrulyEmpty, false)
  assert.equal(views.incident, incidentGraph)
  assert.equal(initialFocusMode(null, views), 'incident')
})

test('keeps fresh prediction topology in predictive focus', () => {
  const predictiveGraph = graphWith('PREDICTION', {
    label: 'Fresh prediction',
    predictionStatus: 'PREDICTION',
    riskLevel: 'WATCH',
  })
  const views = resolveGraphViews(predictiveGraph, null)

  assert.equal(getGraphCapabilities(predictiveGraph).hasPredictionTopology, true)
  assert.equal(views.predictive, predictiveGraph)
  assert.equal(initialFocusMode(null, views), 'predictive')
})

test('incident and high-risk prediction remain independent overlays', () => {
  const data: UnifiedGraphNodeData = {
    label: 'Incident plus prediction',
    operationalState: 'INCIDENT',
    hasActiveIncident: true,
    predictionStatus: 'PREDICTION',
    riskLevel: 'HIGH',
  }

  assert.equal(hasIncidentOverlay(data), true)
  assert.equal(getPredictionState(data), 'HIGH_RISK')

  const focusedIncidentGraph = graphWith('INCIDENT', data)
  const views = resolveGraphViews(focusedIncidentGraph, null)
  assert.equal(initialFocusMode(null, views), 'incident')
})

test('incident with insufficient evidence is inconclusive, never low', () => {
  const data: UnifiedGraphNodeData = {
    label: 'Incident without fresh evidence',
    operationalState: 'INCIDENT',
    hasActiveIncident: true,
    predictionStatus: 'INSUFFICIENT_EVIDENCE',
    evidence: {
      sufficientEvidence: false,
      reason: 'INSUFFICIENT_CURRENT_SAMPLE',
    },
  }

  assert.equal(hasIncidentOverlay(data), true)
  assert.equal(getPredictionState(data), 'INCONCLUSIVE')
  assert.notEqual(getPredictionState(data), 'LOW_RISK')
})

test('only the traffic root with no focus is a true empty graph', () => {
  const emptyGraph = graphWith('TRAFFIC')
  const capabilities = getGraphCapabilities(emptyGraph)

  assert.equal(capabilities.hasNonTrafficNodes, false)
  assert.equal(capabilities.hasIncidentTopology, false)
  assert.equal(capabilities.hasPredictionTopology, false)
  assert.equal(capabilities.isTrulyEmpty, true)
})
