import type { RoutingCandidate } from '../types/routing.types'

export function RoutingCandidateTable({ candidates }: { candidates: RoutingCandidate[] }) {
  return <article className="panel routing-candidates"><div className="panel-header"><div><h3>Candidate comparison</h3><p>Deterministic scoring across available routes.</p></div></div>
    <div className="table-wrap"><table><thead><tr><th>Provider</th><th>Approval</th><th>Latency</th><th>Cost</th><th>Availability</th><th>Score</th></tr></thead>
      <tbody>{candidates.map((candidate) => <tr key={candidate.id} className={candidate.recommended ? 'candidate-recommended' : ''}>
        <td><strong>{candidate.provider}</strong>{candidate.recommended ? <span className="watching-label">Recommended</span> : null}</td><td>{candidate.approvalRate}%</td><td>{candidate.latencyMs} ms</td><td>{candidate.estimatedCost.toFixed(1)}</td><td><span className={`availability ${candidate.availability.toLowerCase()}`}>{candidate.availability.toLowerCase()}</span></td><td><strong>{candidate.score}</strong></td>
      </tr>)}</tbody></table></div>
  </article>
}
