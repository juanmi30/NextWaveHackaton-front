import type { AgentDiagnosis } from '../types/agent.types'

export const EMPTY_ROOT_CAUSE = 'Insufficient evidence to isolate root cause'
const scopeLabels: Record<string, string> = { merchant: 'Merchant', provider: 'Provider', method: 'Method', country: 'Country', issuingBank: 'Issuing bank', failureReason: 'Failure reason' }
export function getScopeEntries(scope: AgentDiagnosis['affectedScope']): Array<{ label: string; value: string }> {
  return Object.entries(scope).filter((entry): entry is [string, string] => typeof entry[1] === 'string').map(([key, value]) => ({ label: scopeLabels[key] ?? key, value }))
}
export function formatScope(scope: AgentDiagnosis['affectedScope']): string[] {
  return getScopeEntries(scope).map(({ label, value }) => `${label}: ${value}`)
}
export function formatRate(value: number | null): string { return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '—' }
export function formatUsdFromCents(value: number | null): string { return typeof value === 'number' ? `$${(value / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—' }
export function formatConfidence(value: number | null | undefined): string { return typeof value === 'number' ? `${(value * 100).toFixed(0)}%` : '—' }
export function formatUnknownText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return '—'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return Object.entries(value as Record<string, unknown>).filter(([, item]) => item != null).map(([key, item]) => `${key}: ${typeof item === 'object' ? JSON.stringify(item) : String(item)}`).join(' · ') || '—'
}
export function formatRecurrence(value: AgentDiagnosis['recurrence']): string {
  if (typeof value === 'string') return value
  const recurring = value.isRecurrence === true
  const count = typeof value.previousOccurrenceCount === 'number' ? value.previousOccurrenceCount : 0
  if (!recurring && count === 0) return 'No previous occurrences'
  return `Recurring incident · ${count} previous ${count === 1 ? 'occurrence' : 'occurrences'}`
}

export type ResponseCodePresentation = { responseCode?: string; classification?: string; category?: string; retryPolicy?: string }
export function getResponseCodePresentation(evidence: AgentDiagnosis['evidence']): ResponseCodePresentation | null {
  const item = evidence.find((entry) => entry.metric === 'response_code_classification')
  if (!item) return null
  const record = item as unknown as Record<string, unknown>
  const read = (key: string) => typeof record[key] === 'string' ? record[key] : undefined
  const retryability = read('retryability')
  const retryPolicy = retryability === 'UNKNOWN' ? 'Not established' : retryability === 'HARD' ? 'Hard decline — automatic retry not recommended' : retryability
  return { responseCode: read('responseCode') ?? read('code'), classification: read('classification'), category: read('category'), retryPolicy }
}
