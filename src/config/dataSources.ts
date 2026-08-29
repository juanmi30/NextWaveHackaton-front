export type AgentDataSource = 'mock' | 'sse'
const configuredAgentSource = import.meta.env.VITE_AGENT_DATA_SOURCE
export const dataSources = {
  agent: (configuredAgentSource === 'sse' || configuredAgentSource === 'backend' ? 'sse' : 'mock') as AgentDataSource,
}
