import assert from 'node:assert/strict'
import test from 'node:test'
import type { AgentDiagnosis } from '../types/agent.types.ts'
import { EMPTY_ROOT_CAUSE, formatConfidence, formatScope, getResponseCodePresentation } from './diagnosisFormatting.ts'

test('formats structured root cause without rendering objects', () => {
  const rootCause = { statement: 'PSE degraded while CARD remained healthy', dimensions: { merchant: null, provider: 'Stripe', method: 'PSE', country: null, issuingBank: null, failureReason: null }, confidence: 0.99 }
  const output = [rootCause.statement, ...formatScope(rootCause.dimensions), formatConfidence(rootCause.confidence)].join(' ')
  assert.match(output, /PSE degraded while CARD remained healthy/)
  assert.match(output, /Stripe/)
  assert.match(output, /PSE/)
  assert.match(output, /99%/)
})

test('uses an explicit message when evidence is insufficient', () => {
  const rootCause = null
  assert.equal(rootCause ?? EMPTY_ROOT_CAUSE, 'Insufficient evidence to isolate root cause')
  assert.equal(formatConfidence(null), '—')
})

test('presents response code classification and UNKNOWN retryability without inventing a soft decline', () => {
  const evidence = [{ statement: 'Classification', metric: 'response_code_classification', responseCode: 'DO_NOT_HONOR', classification: 'Issuer-side', category: 'Issuer', retryability: 'UNKNOWN' }] as unknown as AgentDiagnosis['evidence']
  const result = getResponseCodePresentation(evidence)
  assert.deepEqual(result, { responseCode: 'DO_NOT_HONOR', classification: 'Issuer-side', category: 'Issuer', retryPolicy: 'Not established' })
  assert.doesNotMatch(JSON.stringify(result), /Soft decline/)
})
