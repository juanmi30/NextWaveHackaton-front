export type AgentDataSource = 'mock' | 'backend'
const configuredAgentSource = import.meta.env.VITE_AGENT_DATA_SOURCE
export const dataSources = {
  agent: (configuredAgentSource === 'backend' ? 'backend' : 'mock') as AgentDataSource,
}
