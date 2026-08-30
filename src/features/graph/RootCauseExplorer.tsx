import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getIncidentExplorerGraph,
} from './graphApi'

import type {
  ExplorerDimension,
  ExplorerGraphEdge,
  ExplorerGraphNode,
  ExplorerHealth,
  IncidentExplorerGraph,
} from './types'

import './RootCauseExplorer.css'

const NODE_WIDTH = 214
const ROOT_NODE_WIDTH = 300

const NODE_HEIGHT = 128

const LEVEL_GAP = 190
const SIBLING_GAP = 265

const TOP_PADDING = 32

const dimensionLabels:
  Record<ExplorerDimension, string> = {
    merchant: 'Merchant',
    provider: 'Provider',
    method: 'Payment method',
    country: 'Country',
    issuingBank: 'Issuing bank',
  }

type PositionedNode =
  ExplorerGraphNode & {
    x: number
    y: number
    width: number
  }

type GraphLayout = {
  width: number
  height: number
  nodes: PositionedNode[]
}

const formatRate = (
  value: number | null | undefined,
) =>
  typeof value === 'number'
    ? `${(value * 100).toFixed(1)}%`
    : '—'

const formatDelta = (
  value: number | null | undefined,
) => {
  if (typeof value !== 'number') {
    return '—'
  }

  const sign =
    value > 0 ? '+' : ''

  return `${sign}${value.toFixed(1)} pp`
}

const formatMoney = (
  cents: number | null | undefined,
) =>
  typeof cents === 'number'
    ? new Intl.NumberFormat(
        'en-US',
        {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        },
      ).format(cents / 100)
    : '—'

function depthForNode(
  node: ExplorerGraphNode,
  graph: IncidentExplorerGraph,
) {
  if (node.type === 'traffic') {
    return 0
  }

  if (node.type === 'rootCause') {
    return (
      graph.explorationOrder.length + 1
    )
  }

  if (node.type === 'evidence') {
    return (
      graph.explorationOrder.length + 2
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
  graph: IncidentExplorerGraph,
): GraphLayout {
  const rows =
    new Map<
      number,
      ExplorerGraphNode[]
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
      980,
      maxSideCount *
        SIBLING_GAP *
        2 +
        520,
    )

  const centerX =
    width / 2

  const positionedNodes:
    PositionedNode[] = []

  for (
    const [depth, row]
    of rows.entries()
  ) {
    /*
     * Siempre colocamos el camino
     * seleccionado en el centro.
     */
    const selected =
      row.find(
        (node) =>
          node.type ===
            'traffic' ||
          node.type ===
            'rootCause' ||
          node.data.selected ===
            true,
      )

    const alternatives =
      row.filter(
        (node) =>
          node !== selected,
      )

    if (selected) {
      positionedNodes.push({
        ...selected,

        x:
          centerX,

        y:
          TOP_PADDING +
          depth * LEVEL_GAP,

        width:
          selected.type ===
          'rootCause'
            ? ROOT_NODE_WIDTH
            : NODE_WIDTH,
      })
    }

    /*
     * Alternativas:
     *
     * izquierda
     * derecha
     * más izquierda
     * más derecha...
     */
    alternatives.forEach(
      (node, index) => {
        const magnitude =
          Math.floor(index / 2) + 1

        const direction =
          index % 2 === 0
            ? -1
            : 1

        const evidenceOffset =
          node.type === 'evidence'
            ? 1.35
            : 1

        positionedNodes.push({
          ...node,

          x:
            centerX +
            direction *
              magnitude *
              SIBLING_GAP *
              evidenceOffset,

          y:
            TOP_PADDING +
            depth * LEVEL_GAP,

          width:
            NODE_WIDTH,
        })
      },
    )
  }

  const maxDepth =
    Math.max(
      ...rows.keys(),
    )

  const height =
    TOP_PADDING +
    maxDepth * LEVEL_GAP +
    NODE_HEIGHT +
    48

  return {
    width,
    height,
    nodes:
      positionedNodes,
  }
}

function edgePath(
  edge: ExplorerGraphEdge,
  positions:
    Map<
      string,
      PositionedNode
    >,
) {
  const source =
    positions.get(edge.source)

  const target =
    positions.get(edge.target)

  if (!source || !target) {
    return null
  }

  const sourceX =
    source.x

  const sourceY =
    source.y + NODE_HEIGHT

  const targetX =
    target.x

  const targetY =
    target.y

  const middleY =
    sourceY +
    (
      targetY -
      sourceY
    ) / 2

  /*
   * Curva vertical limpia:
   *
   * parent
   *   |
   *   |____ child
   */
  return (
    `M ${sourceX} ${sourceY} ` +
    `C ${sourceX} ${middleY}, ` +
    `${targetX} ${middleY}, ` +
    `${targetX} ${targetY}`
  )
}

function healthClass(
  health:
    ExplorerHealth |
    undefined,
) {
  return health
    ? `root-explorer-health-${health.toLowerCase()}`
    : ''
}

function deltaClass(
  delta:
    number |
    null |
    undefined,
) {
  if (
    typeof delta !== 'number' ||
    delta === 0
  ) {
    return (
      'root-explorer-delta-neutral'
    )
  }

  return delta < 0
    ? 'root-explorer-delta-negative'
    : 'root-explorer-delta-positive'
}

function GraphNodeCard({
  node,
}: {
  node: PositionedNode
}) {
  /*
   * Nodo inicial.
   */
  if (
    node.type === 'traffic'
  ) {
    return (
      <div
        className={
          'root-explorer-node-content ' +
          'root-explorer-traffic-content'
        }
      >
        <span className="root-explorer-node-kicker">
          Live scope
        </span>

        <strong>
          ALL PAYMENT TRAFFIC
        </strong>
      </div>
    )
  }

  /*
   * Nodo final:
   * combinación de causa raíz.
   */
  if (
    node.type ===
    'rootCause'
  ) {
    const label =
      node.data.label.replace(
        /^Root cause:\s*/i,
        '',
      )

    return (
      <div
        className={
          'root-explorer-node-content ' +
          'root-explorer-root-content'
        }
      >
        <span className="root-explorer-node-kicker">
          Root cause
        </span>

        <strong>
          {label}
        </strong>

        <span
          className={
            `root-explorer-delta ` +
            deltaClass(
              node.data.deltaPp,
            )
          }
        >
          {formatDelta(
            node.data.deltaPp,
          )}
        </span>

        <small>
          {formatRate(
            node.data
              .observedRate,
          )}{' '}
          observed ·{' '}
          {formatRate(
            node.data
              .baselineRate,
          )}{' '}
          baseline
        </small>

        <small>
          {formatMoney(
            node.data
              .lossPerMinuteCents,
          )}
          /min estimated impact
        </small>
      </div>
    )
  }

  /*
   * failureReason u otra evidencia.
   */
  if (
    node.type ===
    'evidence'
  ) {
    return (
      <div className="root-explorer-node-content">
        <span className="root-explorer-node-kicker">
          Evidence
        </span>

        <strong>
          {node.data.value ??
            node.data.label}
        </strong>

        <small>
          {node.data.attempts ??
            0}{' '}
          attempts
        </small>
      </div>
    )
  }

  /*
   * Nodo normal:
   * merchant/provider/method/...
   */
  const health =
    node.data.health

  const dimension =
    node.data.dimension

  const dimensionLabel =
    dimension &&
    dimension !==
      'failureReason'
      ? dimensionLabels[
          dimension
        ]
      : 'Dimension'

  return (
    <div className="root-explorer-node-content">
      <div className="root-explorer-node-heading">
        <span className="root-explorer-node-kicker">
          {dimensionLabel}
        </span>

        {health ? (
          <span
            className={
              `root-explorer-health ` +
              healthClass(
                health,
              )
            }
          >
            {health}
          </span>
        ) : null}
      </div>

      <strong>
        {node.data.value ??
          '—'}
      </strong>

      <span
        className={
          `root-explorer-delta ` +
          deltaClass(
            node.data.deltaPp,
          )
        }
      >
        {formatDelta(
          node.data.deltaPp,
        )}
      </span>

      <small>
        {formatRate(
          node.data
            .observedRate,
        )}{' '}
        observed ·{' '}
        {formatRate(
          node.data
            .baselineRate,
        )}{' '}
        baseline
      </small>

      <small>
        {node.data.attempts ??
          0}{' '}
        attempts
      </small>
    </div>
  )
}

export function RootCauseExplorer({
  incidentId,
}: {
  incidentId: string
}) {
  const [
    graph,
    setGraph,
  ] =
    useState<
      IncidentExplorerGraph |
      null
    >(null)

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(null)

  useEffect(() => {
    let cancelled =
      false

    setLoading(true)
    setError(null)

    void getIncidentExplorerGraph(
      incidentId,
    )
      .then(
        (result) => {
          if (!cancelled) {
            setGraph(result)
          }
        },
      )
      .catch(
        (
          err:
            unknown,
        ) => {
          if (!cancelled) {
            setGraph(null)

            setError(
              err instanceof Error
                ? err.message
                : 'Unable to load root-cause explorer',
            )
          }
        },
      )
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
          ? buildLayout(
              graph,
            )
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
        of layout?.nodes ??
        []
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
      <article className="panel root-explorer-panel">
        <div className="empty-state">
          Loading root-cause explanation…
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
      <article className="panel root-explorer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">
              Root cause explorer
            </p>

            <h3>
              Diagnosis graph unavailable
            </h3>
          </div>
        </div>

        <div
          className={
            'notice error-notice ' +
            'root-explorer-error'
          }
        >
          {error ??
            'The explorer did not return a graph.'}
        </div>
      </article>
    )
  }

  return (
    <article className="panel root-explorer-panel">
      <div
        className={
          'panel-header ' +
          'root-explorer-header'
        }
      >
        <div>
          <p className="eyebrow">
            Root cause explorer
          </p>

          <h3>
            Why this path was isolated
          </h3>

          <p>
            Same detection
            window and
            statistical
            thresholds used
            by the backend
            diagnosis.
          </p>
        </div>

        <div
          className="root-explorer-legend"
          aria-label="Graph legend"
        >
          <span>
            <i className="legend-selected" />
            Selected path
          </span>

          <span>
            <i className="legend-healthy" />
            Healthy
          </span>

          <span>
            <i className="legend-degraded" />
            Degraded
          </span>

          <span>
            <i className="legend-inconclusive" />
            Inconclusive
          </span>
        </div>
      </div>

      <div className="root-explorer-summary">
        <div>
          <span>
            Diagnosis
          </span>

          <strong>
            {
              graph
                .rootCause
                .label
            }
          </strong>
        </div>

        <div>
          <span>
            Confidence
          </span>

          <strong>
            {(
              graph
                .diagnosis
                .confidence *
              100
            ).toFixed(0)}
            %
          </strong>
        </div>

        <div>
          <span>
            Observed
          </span>

          <strong>
            {formatRate(
              graph
                .diagnosis
                .observedRate,
            )}
          </strong>
        </div>

        <div>
          <span>
            Baseline
          </span>

          <strong>
            {formatRate(
              graph
                .diagnosis
                .baselineRate,
            )}
          </strong>
        </div>
      </div>

      <div className="root-explorer-scroll">
        <div
          className="root-explorer-canvas"
          style={{
            width:
              layout.width,

            height:
              layout.height,
          }}
        >
          <svg
            className="root-explorer-edges"
            width={
              layout.width
            }
            height={
              layout.height
            }
            viewBox={
              `0 0 ` +
              `${layout.width} ` +
              `${layout.height}`
            }
            aria-hidden="true"
          >
            <defs>
              <marker
                id="root-arrow-selected"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 Z"
                  className="root-arrow-selected"
                />
              </marker>

              <marker
                id="root-arrow-alternative"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 Z"
                  className="root-arrow-alternative"
                />
              </marker>

              <marker
                id="root-arrow-evidence"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 Z"
                  className="root-arrow-evidence"
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

                const edgeClass =
                  edge.type ===
                  'selected'
                    ? 'root-explorer-edge-selected'
                    : edge.type ===
                        'diagnostic_evidence'
                      ? 'root-explorer-edge-evidence'
                      : 'root-explorer-edge-alternative'

                const marker =
                  edge.type ===
                  'selected'
                    ? 'url(#root-arrow-selected)'
                    : edge.type ===
                        'diagnostic_evidence'
                      ? 'url(#root-arrow-evidence)'
                      : 'url(#root-arrow-alternative)'

                return (
                  <path
                    key={
                      edge.id
                    }
                    d={path}
                    className={
                      `root-explorer-edge ` +
                      edgeClass
                    }
                    markerEnd={
                      marker
                    }
                  />
                )
              },
            )}
          </svg>

          {layout.nodes.map(
            (node) => {
              const health =
                node.data
                  .health

              const stateClass =
                node.type ===
                'traffic'
                  ? 'root-explorer-node-traffic'
                  : node.type ===
                      'rootCause'
                    ? 'root-explorer-node-root'
                    : node.type ===
                        'evidence'
                      ? 'root-explorer-node-evidence'
                      : healthClass(
                          health,
                        )

              return (
                <div
                  key={
                    node.id
                  }
                  className={
                    `root-explorer-node ` +
                    stateClass
                  }
                  style={{
                    left:
                      node.x -
                      node.width /
                        2,

                    top:
                      node.y,

                    width:
                      node.width,

                    height:
                      NODE_HEIGHT,
                  }}
                >
                  <GraphNodeCard
                    node={
                      node
                    }
                  />
                </div>
              )
            },
          )}
        </div>
      </div>

      <div className="root-explorer-footnote">
        <span>
          Window:{' '}
          {new Date(
            graph
              .detectionRun
              .window
              .from,
          ).toLocaleTimeString(
            [],
            {
              hour:
                '2-digit',
              minute:
                '2-digit',
            },
          )}
          {' → '}
          {new Date(
            graph
              .detectionRun
              .window
              .to,
          ).toLocaleTimeString(
            [],
            {
              hour:
                '2-digit',
              minute:
                '2-digit',
            },
          )}
        </span>

        <span>
          Min sample{' '}
          {
            graph
              .detectionRun
              .thresholds
              .minSampleSize
          }
          {' · '}
          Min drop{' '}
          {(
            graph
              .detectionRun
              .thresholds
              .minDrop *
            100
          ).toFixed(0)}
          {' pp'}
        </span>
      </div>
    </article>
  )
}