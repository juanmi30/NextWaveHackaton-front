export type AgentDataSource = 'mock' | 'sse'
const configuredAgentSource = import.meta.env.VITE_AGENT_DATA_SOURCE
const hasBackend = Boolean(import.meta.env.VITE_API_URL)
export const dataSources = {
  agent: (configuredAgentSource === 'mock' ? 'mock' : configuredAgentSource === 'sse' || configuredAgentSource === 'backend' || hasBackend ? 'sse' : 'mock') as AgentDataSource,
}
