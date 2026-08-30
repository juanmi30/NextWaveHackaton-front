import type {
  AgentDiagnosis,
  AgentEvent,
} from '../types/agent.types'
import {
  EMPTY_ROOT_CAUSE,
  formatConfidence,
  formatRate,
  formatRecurrence,
  formatUsdFromCents,
  getResponseCodePresentation,
  getScopeEntries,
} from '../utils/diagnosisFormatting'

const VOLUME_AT_RISK_EXPLANATION =
  'Estimated from lost approvals × average payment value over the detection window.'

function ConfidenceSummary({
  diagnosis,
}: {
  diagnosis: AgentDiagnosis
}) {
  const detectorConfidence =
    diagnosis.confidenceAnalysis
      .detectorConfidence
  const rootCauseConfidence =
    diagnosis.confidenceAnalysis
      .rootCauseConfidence ??
    diagnosis.rootCause?.confidence
  const hasConfidence =
    typeof detectorConfidence === 'number' ||
    typeof rootCauseConfidence === 'number'
  const hasAnalysis =
    diagnosis.confidenceAnalysis.factors.length > 0 ||
    diagnosis.confidenceAnalysis.limitations.length > 0

  if (!hasConfidence && !hasAnalysis) return null

  return (
    <section className="diagnosis-section">
      <h4>Confidence signals</h4>

      {hasConfidence ? (
        <div className="impact-grid confidence-type-grid">
          {typeof detectorConfidence === 'number' ? (
            <div>
              <span>Detector confidence</span>
              <strong>{formatConfidence(detectorConfidence)}</strong>
              <small>Statistical detector</small>
            </div>
          ) : null}

          {typeof rootCauseConfidence === 'number' ? (
            <div>
              <span>Root-cause confidence</span>
              <strong>{formatConfidence(rootCauseConfidence)}</strong>
              <small>Agent diagnosis</small>
            </div>
          ) : null}
        </div>
      ) : null}

      {hasAnalysis ? (
        <div className="evidence-list confidence-evidence-list">
          {diagnosis.confidenceAnalysis.factors
            .slice(0, 4)
            .map((factor) => (
              <article key={factor.code}>
                <strong>{factor.statement}</strong>
                <span className="evidence-metric">{factor.effect}</span>
              </article>
            ))}

          {diagnosis.confidenceAnalysis.limitations.map((item) => (
            <article key={item}>
              <span>Limitation</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function DiagnosisDetails({
  diagnosis,
}: {
  diagnosis: AgentDiagnosis
}) {
  const isolated = diagnosis.rootCause
    ? getScopeEntries(diagnosis.rootCause.dimensions)
    : []
  const responseCode = getResponseCodePresentation(diagnosis.evidence)

  return (
    <article className="panel current-decision diagnosis-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Agent diagnosis</p>
          <h3>Evidence sufficiency</h3>
        </div>

        <div className="actions">
          <span
            className={`pill ${diagnosis.evidenceStatus === 'SUFFICIENT'
              ? 'agent-success'
              : 'agent-warning'}`}
          >
            {diagnosis.evidenceStatus}
          </span>

          {diagnosis.recommendation.requiresHumanApproval ? (
            <span className="pill agent-warning">Human approval required</span>
          ) : null}
        </div>
      </div>

      <section className="diagnosis-section">
        <h4>Root cause</h4>
        <p className="root-cause-statement">
          {diagnosis.rootCause?.statement ?? EMPTY_ROOT_CAUSE}
        </p>

        {diagnosis.evidenceStatus === 'INSUFFICIENT' ? (
          <p className="diagnosis-explanation">
            Affected traffic was identified, but available comparative evidence
            does not establish a unique causal origin.
          </p>
        ) : null}

        <div className="root-cause-meta">
          <div>
            <span>Isolated dimensions</span>
            <div className="diagnosis-chips">
              {isolated.map(({ label, value }) => (
                <i key={label}>
                  <small>{label}</small>
                  {value}
                </i>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="diagnosis-section compact">
        <h4>Affected scope</h4>
        <div className="diagnosis-chips">
          {getScopeEntries(diagnosis.affectedScope).map(({ label, value }) => (
            <i key={label}>
              <small>{label}</small>
              {value}
            </i>
          ))}
        </div>
      </section>

      {responseCode ? (
        <section className="diagnosis-section">
          <h4>Response code classification</h4>
          <div className="response-code-grid">
            {responseCode.responseCode ? <div><span>Response code</span><strong>{responseCode.responseCode}</strong></div> : null}
            {responseCode.classification ? <div><span>Classification</span><strong>{responseCode.classification}</strong></div> : null}
            {responseCode.category ? <div><span>Category</span><strong>{responseCode.category}</strong></div> : null}
            {responseCode.retryPolicy ? <div><span>Retry policy</span><strong>{responseCode.retryPolicy}</strong></div> : null}
          </div>
        </section>
      ) : null}

      <section className="diagnosis-section">
        <h4>Payment performance and volume at risk</h4>
        <div className="impact-grid">
          <div><span>Expected approval</span><strong>{formatRate(diagnosis.impact.expectedApprovalRate)}</strong></div>
          <div><span>Observed approval</span><strong>{formatRate(diagnosis.impact.observedApprovalRate)}</strong></div>
          <div><span>Payment volume at risk</span><strong>{formatUsdFromCents(diagnosis.impact.lossPerMinuteCents)}/min</strong></div>
          <div><span>Started</span><strong>{diagnosis.impact.startedAt ? new Date(diagnosis.impact.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</strong></div>
        </div>
        <p className="diagnosis-explanation">{VOLUME_AT_RISK_EXPLANATION}</p>
      </section>

      <section className="diagnosis-section">
        <h4>Projected payment volume at risk</h4>
        <div className="impact-grid">
          <div><span>Current estimate</span><strong>{formatUsdFromCents(diagnosis.impact.lossPerMinuteCents)}/min</strong></div>
          <div><span>Projected volume at risk</span><strong>{formatUsdFromCents(diagnosis.counterfactualImpact.estimatedRecoverableRevenuePerHourCents)}/hour</strong></div>
          <div><span>Recoverable approvals</span><strong>{diagnosis.counterfactualImpact.estimatedRecoverableApprovalsPerHour ?? '—'}/hour</strong></div>
        </div>
        <p className="diagnosis-explanation">
          {VOLUME_AT_RISK_EXPLANATION} Projection assumes approval performance
          returns to the expected level.
        </p>
      </section>

      <ConfidenceSummary diagnosis={diagnosis} />

      <section className="diagnosis-section">
        <h4>Why we believe it</h4>
        <div className="evidence-list">
          {diagnosis.evidence.map((item, index) => (
            <article key={`${item.statement}-${index}`}>
              <strong>{item.statement}</strong>
              {item.metric ? <span className="evidence-metric">{item.metric.replaceAll('_', ' ')}</span> : null}
              <div>
                {typeof item.baselineValue === 'number' ? <span>Baseline <b>{formatRate(item.baselineValue)}</b></span> : null}
                {typeof item.observedValue === 'number' ? <span>Observed <b>{formatRate(item.observedValue)}</b></span> : null}
                {typeof item.attempts === 'number' ? <span>Attempts <b>{item.attempts}</b></span> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {diagnosis.ruledOutHypotheses.length ? (
        <section className="diagnosis-section">
          <h4>What we ruled out</h4>
          <div className="evidence-list">
            {diagnosis.ruledOutHypotheses.map((item) => (
              <article key={item.hypothesis}>
                <strong>✓ {item.hypothesis}</strong>
                <p>{item.reason}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {diagnosis.diagnosisTrace.length ? (
        <section className="diagnosis-section">
          <h4>Diagnosis trace</h4>
          <div className="diagnosis-trace">
            {[...diagnosis.diagnosisTrace]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <div key={item.order}>
                  <span>{item.type.replaceAll('_', ' ')}</span>
                  <strong>{item.statement}</strong>
                </div>
              ))}
          </div>
        </section>
      ) : null}

      {diagnosis.declineIntelligence ? (
        <section className="diagnosis-section">
          <h4>Failure intelligence</h4>
          <div className="response-code-grid">
            <div><span>Response code</span><strong>{diagnosis.declineIntelligence.responseCode}</strong></div>
            <div><span>Type</span><strong>{diagnosis.declineIntelligence.declineType}</strong></div>
            <div><span>Domain</span><strong>{diagnosis.declineIntelligence.failureDomain}</strong></div>
            <div><span>Actionability</span><strong>{diagnosis.declineIntelligence.actionability}</strong></div>
            <div><span>Retry advice</span><strong>{diagnosis.declineIntelligence.retryAdvice}</strong></div>
          </div>
        </section>
      ) : null}

      {diagnosis.operationalOwnership ? (
        <section className="diagnosis-section recommendation-block">
          <div>
            <span className="eyebrow">Recommended owner</span>
            <h4>{diagnosis.operationalOwnership.primaryTeam}</h4>
            <p>{diagnosis.operationalOwnership.statement}</p>
          </div>
          <span className="pill agent-warning">Human approval required</span>
        </section>
      ) : null}

      <section className="diagnosis-section compact">
        <h4>Recurrence</h4>
        <p>{formatRecurrence(diagnosis.recurrence)}</p>
      </section>

      <section className="diagnosis-section recommendation-block">
        <div>
          <span className="eyebrow">Recommended operator action</span>
          <h4>{diagnosis.recommendation.action}</h4>
        </div>
        {diagnosis.recommendation.requiresHumanApproval ? <span className="pill agent-warning">Human approval required</span> : null}
      </section>

      <div className="summary-split">
        <section className="diagnosis-section compact">
          <h4>Operations summary</h4>
          <p>{diagnosis.summaries.operations ?? '—'}</p>
        </section>
        <section className="diagnosis-section compact executive-summary">
          <h4>Executive summary</h4>
          <p>{diagnosis.summaries.executive ?? '—'}</p>
        </section>
      </div>
    </article>
  )
}

export function CurrentDecision({
  events,
  diagnosis,
}: {
  events: AgentEvent[]
  diagnosis?: AgentDiagnosis | null
}) {
  if (diagnosis) return <DiagnosisDetails diagnosis={diagnosis} />

  const snapshot = [...events]
    .reverse()
    .find((event) => event.route && event.metrics && event.decision)
  const route = snapshot?.route
  const metrics = snapshot?.metrics
  const decision = snapshot?.decision

  return (
    <article className="panel current-decision">
      <div className="panel-header">
        <div><p className="eyebrow">Current decision</p><h3>Route assessment</h3></div>
      </div>
      <dl className="decision-list">
        <div><dt>Route</dt><dd>{route ? `${route.provider} / ${route.paymentMethod} / ${route.country} / ${route.issuer}` : '--'}</dd></div>
        <div><dt>Risk level</dt><dd>{decision?.riskLevel ?? '--'}</dd></div>
        <div><dt>Current approval</dt><dd>{metrics?.currentApproval !== undefined ? `${metrics.currentApproval}%` : '--'}</dd></div>
        <div><dt>24h baseline</dt><dd>{metrics?.baselineApproval !== undefined ? `${metrics.baselineApproval}%` : '--'}</dd></div>
        <div><dt>Deviation</dt><dd>{metrics?.deviation !== undefined ? `${metrics.deviation}%` : '--'}</dd></div>
        <div><dt>Decision confidence</dt><dd>{decision?.confidence !== undefined ? `${decision.confidence}%` : '--'}</dd></div>
        <div className="decision-action"><dt>Action</dt><dd>{decision?.action ?? '--'}</dd></div>
      </dl>
    </article>
  )
}
