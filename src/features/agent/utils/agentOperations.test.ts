import assert from 'node:assert/strict'
import test from 'node:test'
import type { Incident } from '../../../types/domain.ts'
import { compareIncidentPriority } from '../../incidents/incidentPriority.ts'
import { mergeIncidentOperations, summarizeOperationStatuses } from './agentOperations.ts'

const incident = (id: string, loss: number, status: Incident['analysisStatus'], priorityRank?: number): Incident => ({ id, detectionRunId: 'run', anchorFingerprint: id, fingerprint: id, severity: 3, priorityRank, analysisStatus: status, status: 'OPEN', expectedApprovals: 0, actualApprovals: 0, lostApprovals: 0, averageTicketCents: 0, lossPerMinuteCents: loss, diagnoses: [], startedAt: '2026-01-01T00:00:00Z', detectedAt: '2026-01-01T00:00:00Z', lastSeenAt: '2026-01-01T00:00:00Z', resolvedAt: null })

test('orders by backend priority and canonical payment-volume-at-risk fallback', () => {
  const values = [incident('low', 1000, 'QUEUED'), incident('high', 8000, 'QUEUED')].sort(compareIncidentPriority)
  assert.deepEqual(values.map((value) => value.id), ['high', 'low'])
  const ranked = [incident('rank-2', 9000, 'RUNNING', 2), incident('rank-1', 1000, 'RUNNING', 1)].sort(compareIncidentPriority)
  assert.deepEqual(ranked.map((value) => value.id), ['rank-1', 'rank-2'])
})

test('aggregate counters follow the same canonical incident states', () => {
  assert.deepEqual(summarizeOperationStatuses(['RUNNING', 'RUNNING']), { diagnosing: 2, queued: 0, pending: 0, reportsReady: 0, failed: 0 })
  assert.deepEqual(summarizeOperationStatuses(['COMPLETED', 'COMPLETED']), { diagnosing: 0, queued: 0, pending: 0, reportsReady: 2, failed: 0 })
})

test('keeps independent incident entries and preserves prior diagnosis state', () => {
  const initial = mergeIncidentOperations({}, [incident('A', 5000, 'RUNNING'), incident('B', 3000, 'COMPLETED'), incident('C', 1000, 'QUEUED')])
  assert.deepEqual(Object.keys(initial), ['A', 'B', 'C'])
  const updated = mergeIncidentOperations(initial, [incident('A', 5000, 'COMPLETED'), incident('B', 3000, 'COMPLETED'), incident('C', 1000, 'RUNNING'), incident('D', 8000, 'QUEUED')])
  assert.equal(updated.A.analysisStatus, 'COMPLETED')
  assert.equal(updated.B.analysisStatus, 'COMPLETED')
  assert.equal(updated.C.analysisStatus, 'RUNNING')
  assert.equal(updated.D.analysisStatus, 'QUEUED')
})
