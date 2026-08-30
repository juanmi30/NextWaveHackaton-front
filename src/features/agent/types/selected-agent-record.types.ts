export type SelectedAgentRecord =
  | { kind: 'incident'; incidentId: string }
  | { kind: 'watch'; watchId: string; scopeKey: string }
