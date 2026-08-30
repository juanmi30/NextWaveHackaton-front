import { useCallback, useEffect, useState } from 'react'
import { getUserFacingError } from '../../lib/api'
import {
  bundledModelMetrics,
  getModelMetrics,
  type EvaluationMetrics,
  type ModelMetrics,
} from './mlMetricsApi'

const percentage = (value: number) => `${(value * 100).toFixed(1)}%`
const integer = new Intl.NumberFormat('en-US')
const prettyLabel = (value: string) => value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

function MetricTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="ml-metric-tile"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

function ConfusionMatrix({ metrics }: { metrics: EvaluationMetrics }) {
  const { tn, fp, fn, tp } = metrics.confusion
  const total = tn + fp + fn + tp
  return (
    <div className="confusion-wrap">
      <div className="confusion-axis predicted">Predicted</div>
      <div className="confusion-axis actual">Actual</div>
      <div className="confusion-labels"><span>Healthy</span><span>Degradation</span></div>
      <div className="confusion-matrix" aria-label={`Confusion matrix for ${metrics.split} split`}>
        <div className="correct"><span>True negative</span><strong>{integer.format(tn)}</strong><small>{percentage(tn / total)} of samples</small></div>
        <div className="incorrect"><span>False positive</span><strong>{integer.format(fp)}</strong><small>Healthy route alerted</small></div>
        <div className="incorrect"><span>False negative</span><strong>{integer.format(fn)}</strong><small>Degradation missed</small></div>
        <div className="correct"><span>True positive</span><strong>{integer.format(tp)}</strong><small>{percentage(tp / total)} of samples</small></div>
      </div>
    </div>
  )
}

export function MLMetricsPage() {
  const [data, setData] = useState<ModelMetrics>(bundledModelMetrics)
  const [split, setSplit] = useState<'test' | 'validation'>('test')
  const [source, setSource] = useState<'loading' | 'api' | 'snapshot'>('snapshot')
  const [detail, setDetail] = useState('')

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setSource('loading')
      setDetail('')
    }
    try {
      setData(await getModelMetrics())
      setSource('api')
    } catch (error) {
      setData(bundledModelMetrics)
      setSource('snapshot')
      setDetail(getUserFacingError(error, 'The metrics endpoint is not deployed yet.'))
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void load(true), 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const metrics = data.metrics[split]
  const scenarios = [...data.perScenario].sort((a, b) => (b.recall ?? -1) - (a.recall ?? -1))

  return (
    <section className="page-content ml-metrics-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Predictive model · offline evaluation</p>
          <h2>ML model performance</h2>
          <p>How well the model predicts a payment-route degradation within the next {data.predictionHorizonMinutes} minutes.</p>
        </div>
        <button className="button ghost" type="button" onClick={() => void load()} disabled={source === 'loading'}>{source === 'loading' ? 'Loading…' : 'Refresh metrics'}</button>
      </div>

      <div className={`ml-source-banner ${source}`} role="status">
        <i />
        <div><strong>{source === 'api' ? 'Live backend artifact' : source === 'loading' ? 'Checking backend metrics…' : 'Bundled artifact snapshot'}</strong><span>{source === 'snapshot' ? `${detail} Showing the verified v${data.modelVersion} artifact snapshot.` : source === 'api' ? 'Loaded from GET /predictions/metrics.' : 'Connecting to GET /predictions/metrics.'}</span></div>
        <span className="pill neutral">v{data.modelVersion}</span>
      </div>

      <div className="ml-model-strip">
        <div><span>Model</span><strong>{prettyLabel(data.modelType)}</strong></div>
        <div><span>Target</span><strong>Route degrades in {data.predictionHorizonMinutes} min</strong></div>
        <div><span>Decision threshold</span><strong>{percentage(data.decisionThreshold)}</strong></div>
        <div><span>Input features</span><strong>{data.features.length}</strong></div>
      </div>

      <div className="ml-section-heading">
        <div><h3>Evaluation scorecard</h3><p>Threshold-dependent metrics use a {percentage(metrics.threshold)} decision boundary.</p></div>
        <div className="ml-split-toggle" aria-label="Evaluation dataset">
          <button type="button" className={split === 'test' ? 'active' : ''} onClick={() => setSplit('test')}>Test · {integer.format(data.training.testRows)}</button>
          <button type="button" className={split === 'validation' ? 'active' : ''} onClick={() => setSplit('validation')}>Validation · {integer.format(data.training.validationRows)}</button>
        </div>
      </div>

      <div className="ml-metric-grid">
        <MetricTile label="ROC–AUC" value={metrics.rocAuc.toFixed(3)} detail="Ranking quality across thresholds" />
        <MetricTile label="Precision" value={percentage(metrics.precision)} detail="Alerts that were degradations" />
        <MetricTile label="Recall" value={percentage(metrics.recall)} detail="Degradations detected early" />
        <MetricTile label="F1 score" value={metrics.f1.toFixed(3)} detail="Precision / recall balance" />
        <MetricTile label="Avg. precision" value={metrics.averagePrecision.toFixed(3)} detail="Quality on the positive class" />
        <MetricTile label="Brier score" value={metrics.brierScore.toFixed(3)} detail="Probability error · lower is better" />
      </div>

      <div className="ml-detail-grid">
        <article className="panel ml-confusion-panel">
          <div className="panel-header"><div><h3>Confusion matrix</h3><p>{prettyLabel(split)} split · {integer.format(Object.values(metrics.confusion).reduce((sum, value) => sum + value, 0))} samples</p></div></div>
          <ConfusionMatrix metrics={metrics} />
        </article>

        <article className="panel ml-dataset-panel">
          <div className="panel-header"><div><h3>Dataset & guardrails</h3><p>Context for reading these results correctly.</p></div></div>
          <div className="ml-dataset-stats">
            <div><span>Total samples</span><strong>{integer.format(data.training.datasetRows)}</strong></div>
            <div><span>Training samples</span><strong>{integer.format(data.training.trainRows)}</strong></div>
            <div><span>Positive rate</span><strong>{percentage(data.training.positiveRate)}</strong></div>
            <div><span>Healthy false alarms</span><strong>{percentage(data.falseAlarmRateHealthyScenarios)}</strong></div>
          </div>
          <div className="ml-guardrail"><strong>Evaluation scope</strong><p>Offline results on a synthetic, episode-grouped dataset. They demonstrate model behavior, not production ground truth.</p><small>{data.training.splitStrategy} · seed {data.training.randomSeed}</small></div>
        </article>
      </div>

      <article className="panel ml-scenarios-panel">
        <div className="panel-header"><div><h3>Recall by degradation scenario</h3><p>Which failure modes the model catches before the 15-minute horizon.</p></div><span className="pill neutral">Predictable ROC–AUC {data.rocAucPredictableScenarios.toFixed(3)}</span></div>
        <div className="ml-scenario-table" role="table" aria-label="Model performance by scenario">
          <div className="ml-scenario-row header" role="row"><span>Scenario</span><span>Samples</span><span>Recall</span><span>Alert rate</span></div>
          {scenarios.map((scenario) => <div className="ml-scenario-row" role="row" key={scenario.scenario}>
            <strong>{prettyLabel(scenario.scenario)}</strong>
            <span>{integer.format(scenario.rows)}</span>
            <div className="ml-recall-cell">{scenario.recall === null ? <em>Not applicable</em> : <><div><i style={{ width: percentage(scenario.recall) }} /></div><b>{percentage(scenario.recall)}</b></>}</div>
            <span>{percentage(scenario.alertRate)}</span>
          </div>)}
        </div>
      </article>
    </section>
  )
}
