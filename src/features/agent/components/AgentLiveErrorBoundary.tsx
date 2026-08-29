import { Component, type ErrorInfo, type ReactNode } from 'react'
export class AgentLiveErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Unable to render agent analysis', error, info) }
  private reset = () => { this.props.onReset(); this.setState({ failed: false }) }
  render() { return this.state.failed ? <div className="panel empty-state"><p>Unable to render agent analysis</p><button type="button" className="button secondary" onClick={this.reset}>Reset</button></div> : this.props.children }
}
