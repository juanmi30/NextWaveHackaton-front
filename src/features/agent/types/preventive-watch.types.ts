export type PreventiveWatch = {
  id: string
  dimensions: Record<string, string>
  riskLevel: string
  riskScore?: number
  observedApproval?: number
  baselineApproval?: number
  drift?: number
  attempts?: number
  potentialImpactCents?: number
  statement?: string
}
