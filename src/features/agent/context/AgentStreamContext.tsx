import { createContext, useContext, type ReactNode } from 'react'
import { useAgentStream, type AgentStreamState } from '../hooks/useAgentStream'

const AgentStreamContext = createContext<AgentStreamState | null>(null)

export function AgentStreamProvider({ children, incidentId = null }: { children: ReactNode; incidentId?: string | null }) {
  const stream = useAgentStream(incidentId)
  return <AgentStreamContext.Provider value={stream}>{children}</AgentStreamContext.Provider>
}

export function useAgentStreamContext(): AgentStreamState {
  const context = useContext(AgentStreamContext)
  if (!context) throw new Error('useAgentStreamContext must be used inside AgentStreamProvider')
  return context
}
