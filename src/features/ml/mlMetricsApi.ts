import { api } from '../../lib/api'

export type EvaluationMetrics = {
  split: 'validation' | 'test'
  threshold: number
  rocAuc: number
  averagePrecision: number
  brierScore: number
  precision: number
  recall: number
  f1: number
  fbeta: number
  confusion: { tn: number; fp: number; fn: number; tp: number }
}

export type ScenarioMetrics = {
  scenario: string
  rows: number
  positives: number
  recall: number | null
  alertRate: number
}

export type ModelMetrics = {
  modelType: string
  modelVersion: string
  target: string
  predictionHorizonMinutes: number
  decisionThreshold: number
  features: string[]
  metrics: { validation: EvaluationMetrics; test: EvaluationMetrics }
  perScenario: ScenarioMetrics[]
  falseAlarmRateHealthyScenarios: number
  rocAucPredictableScenarios: number
  training: {
    datasetRows: number
    trainRows: number
    validationRows: number
    testRows: number
    positiveRate: number
    randomSeed: number
    splitStrategy: string
  }
}

// Snapshot of ml/artifacts/failure_prediction_v2.json in the backend repository.
// It keeps the demo useful until the deployed backend exposes GET /predictions/metrics.
export const bundledModelMetrics: ModelMetrics = {
  modelType: 'logistic_regression',
  modelVersion: '2.0.0',
  target: 'will_degrade_within_15m',
  predictionHorizonMinutes: 15,
  decisionThreshold: 0.55,
  features: [
    'local_time_sin', 'local_time_cos', 'baseline_approval_rate', 'approval_drop',
    'approval_slope', 'p95_latency_ms', 'latency_slope', 'provider_error_rate',
    'provider_timeout_rate', 'provider_failure_slope', 'rejected_rate',
    'issuer_decline_rate', 'auth_3ds_failure_rate', 'fraud_screening_failure_rate',
    'data_quality_failure_rate', 'provider_config_failure_rate', 'hard_decline_share',
    'retry_attempt_rate',
  ],
  metrics: {
    validation: {
      split: 'validation', threshold: 0.55, rocAuc: 0.6759, averagePrecision: 0.4334,
      brierScore: 0.20063, precision: 0.3706, recall: 0.4434, f1: 0.4037,
      fbeta: 0.4181, confusion: { tn: 4695, fp: 732, fn: 541, tp: 431 },
    },
    test: {
      split: 'test', threshold: 0.55, rocAuc: 0.6907, averagePrecision: 0.4588,
      brierScore: 0.19706, precision: 0.397, recall: 0.4584, f1: 0.4255,
      fbeta: 0.4376, confusion: { tn: 5926, fp: 846, fn: 658, tp: 557 },
    },
  },
  perScenario: [
    { scenario: 'AUTHENTICATION_3DS_DEGRADATION', rows: 309, positives: 73, recall: 0.5479, alertRate: 0.2395 },
    { scenario: 'FRAUD_SCREENING_DEGRADATION', rows: 374, positives: 99, recall: 0.2626, alertRate: 0.1818 },
    { scenario: 'ISSUER_DECLINE_SURGE', rows: 552, positives: 133, recall: 0.406, alertRate: 0.1884 },
    { scenario: 'MERCHANT_DATA_QUALITY_DEGRADATION', rows: 555, positives: 136, recall: 0.2279, alertRate: 0.1532 },
    { scenario: 'NORMAL', rows: 2019, positives: 0, recall: null, alertRate: 0.0857 },
    { scenario: 'PRE_PROVIDER_REJECTION_SURGE', rows: 396, positives: 105, recall: 0.2857, alertRate: 0.154 },
    { scenario: 'PROVIDER_CONFIGURATION_FAILURE', rows: 329, positives: 92, recall: 0.0978, alertRate: 0.076 },
    { scenario: 'PROVIDER_LATENCY_DEGRADATION', rows: 605, positives: 130, recall: 0.9846, alertRate: 0.3124 },
    { scenario: 'PROVIDER_RATE_LIMIT', rows: 413, positives: 97, recall: 0.6186, alertRate: 0.2252 },
    { scenario: 'PROVIDER_TIMEOUT_DEGRADATION', rows: 590, positives: 114, recall: 1, alertRate: 0.2729 },
    { scenario: 'RECOVERY', rows: 896, positives: 0, recall: null, alertRate: 0.24 },
    { scenario: 'ROUTING_FALLBACK_STRESS', rows: 392, positives: 92, recall: 0.5978, alertRate: 0.2755 },
    { scenario: 'SUDDEN_FAILURE', rows: 557, positives: 144, recall: 0.0694, alertRate: 0.0844 },
  ],
  falseAlarmRateHealthyScenarios: 0.1331,
  rocAucPredictableScenarios: 0.7429,
  training: {
    datasetRows: 40450, trainRows: 26064, validationRows: 6399, testRows: 7987,
    positiveRate: 0.1485, randomSeed: 42,
    splitStrategy: 'GroupShuffleSplit by episode_id, 64/16/20',
  },
}

export const getModelMetrics = () => api<ModelMetrics>('/predictions/metrics')
