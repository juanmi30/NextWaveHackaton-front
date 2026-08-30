import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePredictiveRisks } from './preventiveWatch.ts'

test('normalizes only factual predictive risk fields', () => {
  const [watch] = normalizePredictiveRisks([{ id: 'risk-1', dimensions: { provider: 'dLocal', country: 'CO' }, riskLevel: 'HIGH', score: 0.82, currentApprovalRate: 0.61, baselineApprovalRate: 0.83, transactionCount: 120 }])
  assert.deepEqual(watch, { id: 'risk-1', dimensions: { provider: 'dLocal', country: 'CO' }, riskLevel: 'HIGH', riskScore: 0.82, observedApproval: 0.61, baselineApproval: 0.83, drift: undefined, attempts: 120, potentialImpactCents: undefined, statement: undefined })
  assert.equal('rootCause' in watch, false)
})

test('keeps dimensionless watches separate and expires absent predictions', () => {
  const watches = normalizePredictiveRisks([{ riskLevel: 'WATCH' }, { riskLevel: 'WATCH' }])
  assert.deepEqual(watches.map((watch) => watch.id), ['watch-0', 'watch-1'])
  assert.deepEqual(normalizePredictiveRisks([]), [])
})
