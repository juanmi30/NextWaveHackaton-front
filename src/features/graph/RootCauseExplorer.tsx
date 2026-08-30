import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getUnifiedGraph,
} from './graphApi'

import type {
  OperationalState,
  PredictionSignal,
  UnifiedGraphEdge,
  UnifiedGraphNode,
  UnifiedGraphResponse,
  UnifiedIncident,
} from './types'

import './RootCauseExplorer.css'

const NODE_WIDTH = 240
const ROUTE_WIDTH = 370

const LEVEL_GAP = 255
const SIBLING_GAP = 290
const TOP_PADDING = 36

type PositionedNode =
  UnifiedGraphNode & {
    x: number
    y: number
    width: number
    height: number
  }

type GraphLayout = {
  width: number
  height: number
  nodes: PositionedNode[]
}

function nodeHeight(
  node: UnifiedGraphNode,
) {
  if (node.type === 'traffic') {
    return 100
  }

  if (node.type === 'routeStatus') {
    return 310
  }

  return 210
}

function nodeWidth(
  node: UnifiedGraphNode,
) {
  return node.type === 'routeStatus'
    ? ROUTE_WIDTH
    : NODE_WIDTH
}

function depthForNode(
  node: UnifiedGraphNode,
  graph: UnifiedGraphResponse,
) {
  if (node.type === 'traffic') {
    return 0
  }

  if (node.type === 'routeStatus') {
    return (
      (graph.explorationOrder ?? [])
        .length + 1
    )
  }

  return Math.max(
    1,
    Object.keys(
      node.data.segment ?? {},
    ).length,
  )
}

function buildLayout(
  graph: UnifiedGraphResponse,
): GraphLayout {
  const rows =
    new Map<
      number,
      UnifiedGraphNode[]
    >()

  for (const node of graph.nodes) {
    const depth =
      depthForNode(node, graph)

    const row =
      rows.get(depth) ?? []

    row.push(node)
    rows.set(depth, row)
  }

  const maxRowSize =
    Math.max(
      1,
      ...[...rows.values()].map(
        (row) => row.length,
      ),
    )

  const maxSideCount =
    Math.ceil(
      (maxRowSize - 1) / 2,
    )

  const width =
    Math.max(
      1040,
      maxSideCount *
        SIBLING_GAP *
        2 +
        580,
    )

  const centerX =
    width / 2

  const positioned:
    PositionedNode[] = []

  for (
    const [depth, row]
    of rows.entries()
  ) {
    const selected =
      row.find(
        (node) =>
          node.type === 'traffic' ||
          node.type === 'routeStatus' ||
          node.data.selected === true,
      )

    const alternatives =
      row.filter(
        (node) =>
          node !== selected,
      )

    if (selected) {
      positioned.push({
        ...selected,

        x: centerX,

        y:
          TOP_PADDING +
          depth * LEVEL_GAP,

        width:
          nodeWidth(selected),

        height:
          nodeHeight(selected),
      })
    }

    alternatives.forEach(
      (node, index) => {
        const magnitude =
          Math.floor(index / 2) + 1

        const direction =
          index % 2 === 0
            ? -1
            : 1

        positioned.push({
          ...node,

          x:
            centerX +
            direction *
              magnitude *
              SIBLING_GAP,

          y:
            TOP_PADDING +
            depth * LEVEL_GAP,

          width:
            nodeWidth(node),

          height:
            nodeHeight(node),
        })
      },
    )
  }

  const maxDepth =
    rows.size > 0
      ? Math.max(...rows.keys())
      : 0

  const height =
    TOP_PADDING +
    maxDepth * LEVEL_GAP +
    360

  return {
    width,
    height,
    nodes: positioned,
  }
}

function edgePath(
  edge: UnifiedGraphEdge,
  positions:
    Map<string, PositionedNode>,
) {
  const source =
    positions.get(edge.source)

  const target =
    positions.get(edge.target)

  if (!source || !target) {
    return null
  }

  const sourceX = source.x
  const sourceY =
    source.y + source.height

  const targetX = target.x
  const targetY = target.y

  const middleY =
    sourceY +
    (targetY - sourceY) / 2

  return (
    `M ${sourceX} ${sourceY} ` +
    `C ${sourceX} ${middleY}, ` +
    `${targetX} ${middleY}, ` +
    `${targetX} ${targetY}`
  )
}

function formatMoney(
  cents:
    | number
    | null
    | undefined,
) {
  if (
    typeof cents !== 'number'
  ) {
    return '—'
  }

  return new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    },
  ).format(cents / 100)
}

function formatProbability(
  value:
    | number
    | null
    | undefined,
) {
  return typeof value === 'number'
    ? `${value.toFixed(1)}%`
    : null
}

function formatEvidenceReason(
  reason:
    | string
    | undefined,
) {
  switch (reason) {
    case 'INSUFFICIENT_BASELINE':
      return 'Insufficient historical baseline'

    case 'INSUFFICIENT_CURRENT_SAMPLE':
      return 'Insufficient recent traffic'

    case 'INSUFFICIENT_TIME_SERIES':
      return 'Incomplete recent time series'

    default:
      return 'Insufficient evidence'
  }
}

function stateLabel(
  state:
    | OperationalState
    | undefined,
) {
  switch (state) {
    case 'INCIDENT':
      return 'INCIDENT'

    case 'HIGH_RISK':
      return 'HIGH RISK'

    case 'WATCH':
      return 'WATCH'

    case 'LOW_RISK':
      return 'LOW RISK'

    case 'INCONCLUSIVE':
      return 'INCONCLUSIVE'

    default:
      return 'UNKNOWN'
  }
}

function stateClass(
  state:
    | OperationalState
    | undefined,
) {
  switch (state) {
    case 'INCIDENT':
      return 'unified-state-incident'

    case 'HIGH_RISK':
      return 'unified-state-high'

    case 'WATCH':
      return 'unified-state-watch'

    case 'LOW_RISK':
      return 'unified-state-low'

    case 'INCONCLUSIVE':
      return 'unified-state-inconclusive'

    default:
      return ''
  }
}

function featureLabel(
  feature: string,
) {
  switch (feature) {
    case 'baseline_approval_rate':
      return 'Baseline approval'

    case 'approval_drop':
      return 'Approval deterioration'

    case 'approval_slope':
      return 'Approval trend'

    case 'timeout_rate':
      return 'Timeout rate'

    case 'timeout_slope':
      return 'Timeout trend'

    case 'error_rate':
      return 'Error rate'

    case 'p95_latency_ms':
      return 'P95 latency'

    case 'latency_slope':
      return 'Latency trend'

    default:
      return feature.replaceAll(
        '_',
        ' ',
      )
  }
}

function SignalList({
  signals,
}: {
  signals: PredictionSignal[]
}) {
  if (signals.length === 0) {
    return null
  }

  return (
    <div className="unified-signals">
      <span className="unified-subtitle">
        Top predictive drivers
      </span>

      {signals
        .slice(0, 4)
        .map(
          (signal, index) => (
            <div
              className="unified-signal"
              key={
                `${signal.feature}-${index}`
              }
            >
              <span>
                {
                  signal.effect ===
                  'INCREASES_RISK'
                    ? '↑'
                    : '↓'
                }
              </span>

              <span>
                {featureLabel(
                  signal.feature,
                )}
              </span>
            </div>
          ),
        )}
    </div>
  )
}

function IncidentSummary({
  incident,
}: {
  incident: UnifiedIncident
}) {
  return (
    <div className="unified-incident-summary">
      <span>
        ACTIVE INCIDENT
      </span>

      <strong>
        {incident.dropPp !== null
          ? `-${incident.dropPp.toFixed(1)} pp actual`
          : 'Observed degradation'}
      </strong>

      <small>
        {formatMoney(
          incident.lossPerMinuteCents,
        )}
        /min impact
      </small>

      {incident.confidence !== null ? (
        <small>
          {(incident.confidence * 100)
            .toFixed(0)}
          % detector confidence
        </small>
      ) : null}
    </div>
  )
}

function FailureContextBlock({
  node,
}: {
  node: PositionedNode
}) {
  const context =
    node.data.failureContext

  if (
    !context ||
    context.totalAttempts === 0
  ) {
    return null
  }

  const topReason =
    context.topReasons[0]

  return (
    <div className="unified-failure-context">
      <span className="unified-subtitle">
        Recent failure context
      </span>

      <small>
        {context.totalFailures}
        {' failures / '}
        {context.totalAttempts}
        {' attempts · '}
        {(context.failureRate * 100)
          .toFixed(1)}
        %
      </small>

      <small>
        {context.actionableFailures}
        {' actionable · '}
        {context.issuerSideFailures}
        {' issuer-side'}
      </small>

      {topReason ? (
        <small>
          Top reason:{' '}
          <strong>
            {topReason.code}
          </strong>
          {' · '}
          {topReason.actionability}
        </small>
      ) : null}
    </div>
  )
}

function PredictionBlock({
  node,
}: {
  node: PositionedNode
}) {
  const probability =
    formatProbability(
      node.data
        .failureProbabilityPercent,
    )

  if (probability) {
    return (
      <div className="unified-prediction">
        <span className="unified-subtitle">
          Predicted failure risk
        </span>

        <strong>
          {probability}
        </strong>

        <small>
          next{' '}
          {
            node.data
              .predictionHorizonMinutes ??
            15
          }
          {' min'}
        </small>

        {typeof node.data
          .approvalDropPp ===
        'number' ? (
          <small>
            Approval deterioration:{' '}
            {node.data
              .approvalDropPp
              .toFixed(1)}
            {' pp'}
          </small>
        ) : null}

        {node.data.features ? (
          <small>
            P95 latency:{' '}
            {Math.round(
              node.data.features
                .p95LatencyMs,
            )}
            {' ms'}
          </small>
        ) : null}
      </div>
    )
  }

  return (
    <div className="unified-prediction unified-prediction-empty">
      <span className="unified-subtitle">
        Predictive score
      </span>

      <strong>
        Not available
      </strong>

      <small>
        {formatEvidenceReason(
          node.data
            .evidence
            ?.reason,
        )}
      </small>

      {node.data.evidence ? (
        <small>
          Current sample:{' '}
          {
            node.data
              .evidence
              .currentAttempts
          }
          {' · Baseline: '}
          {
            node.data
              .evidence
              .baselineAttempts
          }
        </small>
      ) : null}
    </div>
  )
}

function GraphNodeCard({
  node,
}: {
  node: PositionedNode
}) {
  const incidents =
    node.data.incidents ?? []

  const firstIncident =
    incidents[0]

  if (node.type === 'traffic') {
    return (
      <div className="unified-node-content unified-traffic-content">
        <span className="unified-kicker">
          Unified payment view
        </span>

        <strong>
          ALL ACTIVE PAYMENT TRAFFIC
        </strong>

        <small>
          {
            node.data
              .activeRoutes ?? 0
          }
          {' active routes · '}
          {
            node.data
              .activeIncidents ?? 0
          }
          {' active incidents'}
        </small>
      </div>
    )
  }

  if (node.type === 'routeStatus') {
    return (
      <div className="unified-node-content unified-route-content">
        <div className="unified-node-heading">
          <span className="unified-kicker">
            Selected full route
          </span>

          <span
            className={
              `unified-state-badge ` +
              stateClass(
                node.data
                  .operationalState,
              )
            }
          >
            {stateLabel(
              node.data
                .operationalState,
            )}
          </span>
        </div>

        <strong className="unified-route-title">
          {Object.values(
            node.data.segment ?? {},
          ).join(' × ')}
        </strong>

        <PredictionBlock
          node={node}
        />

        {firstIncident ? (
          <IncidentSummary
            incident={
              firstIncident
            }
          />
        ) : null}

        <FailureContextBlock
          node={node}
        />

        <SignalList
          signals={
            node.data
              .signals ?? []
          }
        />
      </div>
    )
  }

  return (
    <div className="unified-node-content">
      <div className="unified-node-heading">
        <span className="unified-kicker">
          {node.data.dimension ??
            'Dimension'}
        </span>

        <span
          className={
            `unified-state-badge ` +
            stateClass(
              node.data
                .operationalState,
            )
          }
        >
          {stateLabel(
            node.data
              .operationalState,
          )}
        </span>
      </div>

      <strong className="unified-node-title">
        {node.data.value ??
          node.data.label}
      </strong>

      <PredictionBlock
        node={node}
      />

      {firstIncident ? (
        <IncidentSummary
          incident={
            firstIncident
          }
        />
      ) : null}
    </div>
  )
}

export function RootCauseExplorer({
  incidentId,
}: {
  incidentId?: string | null
}) {
  const [graph, setGraph] =
    useState<
      UnifiedGraphResponse | null
    >(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(
      null,
    )

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    void getUnifiedGraph(
      incidentId,
    )
      .then((result) => {
        if (!cancelled) {
          setGraph(result)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setGraph(null)

          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load unified risk graph',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [incidentId])

  const layout =
    useMemo(
      () =>
        graph
          ? buildLayout(graph)
          : null,
      [graph],
    )

  const positions =
    useMemo(() => {
      const map =
        new Map<
          string,
          PositionedNode
        >()

      for (
        const node
        of layout?.nodes ?? []
      ) {
        map.set(
          node.id,
          node,
        )
      }

      return map
    }, [layout])

  if (loading) {
    return (
      <article className="panel unified-panel">
        <div className="empty-state">
          Loading unified risk graph…
        </div>
      </article>
    )
  }

  if (
    error ||
    !graph ||
    !layout
  ) {
    return (
      <article className="panel unified-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">
              Unified risk graph
            </p>

            <h3>
              Graph unavailable
            </h3>
          </div>
        </div>

        <div className="notice error-notice unified-error">
          {error ??
            'The backend did not return a graph.'}
        </div>
      </article>
    )
  }

  return (
    <article className="panel unified-panel">
      <div className="panel-header unified-header">
        <div>
          <p className="eyebrow">
            Unified risk graph
          </p>

          <h3>
            Predictive risk + observed incidents
          </h3>

          <p>
            The selected path represents
            one complete payment route.
            Each node is independently
            scored by the predictive
            model, while confirmed
            incidents are overlaid on
            the same flow.
          </p>
        </div>

        <div className="unified-legend">
          <span>
            <i className="legend-incident" />
            Incident
          </span>

          <span>
            <i className="legend-high" />
            High risk
          </span>

          <span>
            <i className="legend-watch" />
            Watch
          </span>

          <span>
            <i className="legend-low" />
            Low risk
          </span>

          <span>
            <i className="legend-inconclusive" />
            Inconclusive
          </span>
        </div>
      </div>

      <div className="unified-summary">
        <div>
          <span>
            Active routes
          </span>

          <strong>
            {
              graph.summary
                .activeRoutes
            }
          </strong>
        </div>

        <div>
          <span>
            High risk
          </span>

          <strong>
            {
              graph.summary
                .highRiskRoutes
            }
          </strong>
        </div>

        <div>
          <span>
            Watch
          </span>

          <strong>
            {
              graph.summary
                .watchRoutes
            }
          </strong>
        </div>

        <div>
          <span>
            Incidents
          </span>

          <strong>
            {
              graph.summary
                .activeIncidents
            }
          </strong>
        </div>

        <div>
          <span>
            Inconclusive
          </span>

          <strong>
            {
              graph.summary
                .insufficientEvidence
            }
          </strong>
        </div>
      </div>

      {graph.focus === null ? (
        <div className="unified-no-focus">
          <strong>
            No active predictive route
            is available right now.
          </strong>

          <span>
            The backend currently sees{' '}
            {
              graph.summary
                .activeIncidents
            }
            {' active incident(s), but no route has recent traffic in the prediction window.'}
          </span>
        </div>
      ) : null}

      <div className="unified-scroll">
        <div
          className="unified-canvas"
          style={{
            width:
              layout.width,

            height:
              layout.height,
          }}
        >
          <svg
            className="unified-edges"
            width={
              layout.width
            }
            height={
              layout.height
            }
            viewBox={
              `0 0 ${layout.width} ${layout.height}`
            }
            aria-hidden="true"
          >
            <defs>
              <marker
                id="unified-arrow-selected"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 Z"
                  className="unified-arrow-selected"
                />
              </marker>

              <marker
                id="unified-arrow-alternative"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 Z"
                  className="unified-arrow-alternative"
                />
              </marker>
            </defs>

            {graph.edges.map(
              (edge) => {
                const path =
                  edgePath(
                    edge,
                    positions,
                  )

                if (!path) {
                  return null
                }

                const selected =
                  edge.type ===
                  'selected'

                return (
                  <path
                    key={edge.id}
                    d={path}
                    className={
                      selected
                        ? 'unified-edge unified-edge-selected'
                        : 'unified-edge unified-edge-alternative'
                    }
                    markerEnd={
                      selected
                        ? 'url(#unified-arrow-selected)'
                        : 'url(#unified-arrow-alternative)'
                    }
                  />
                )
              },
            )}
          </svg>

          {layout.nodes.map(
            (node) => (
              <div
                key={node.id}
                className={
                  `unified-node ` +
                  `${stateClass(
                    node.data
                      .operationalState,
                  )} ` +
                  `${
                    node.data.selected
                      ? 'unified-node-selected'
                      : ''
                  } ` +
                  `${
                    node.type === 'traffic'
                      ? 'unified-node-traffic'
                      : ''
                  } ` +
                  `${
                    node.type === 'routeStatus'
                      ? 'unified-node-route'
                      : ''
                  }`
                }
                style={{
                  left:
                    node.x -
                    node.width / 2,

                  top:
                    node.y,

                  width:
                    node.width,

                  height:
                    node.height,
                }}
              >
                <GraphNodeCard
                  node={node}
                />
              </div>
            ),
          )}
        </div>
      </div>

      <div className="unified-footnote">
        <span>
          Generated:{' '}
          {new Date(
            graph.generatedAt,
          ).toLocaleTimeString()}
        </span>

        <span>
          Selected edges identify
          the chosen full route;
          they do not mean every
          selected node is the
          highest-risk sibling.
        </span>
      </div>
    </article>
  )
}