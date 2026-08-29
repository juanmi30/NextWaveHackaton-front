# Frontend–backend integration contract

This document describes the target integration boundary. Future endpoints listed below are proposals, not implemented APIs.

## Agent event stream (future)

Conceptual endpoint:

```http
GET /api/agent/events
Accept: text/event-stream
```

The server should emit `agent.event` SSE messages whose JSON data maps directly to the frontend `AgentEvent` contract.

```text
event: agent.event
data: {"id":"event-4","runId":"run-1","scenarioId":"approval-drop-colombia","timestamp":"2026-08-29T12:00:00.000Z","phase":"ANALYZE","status":"warning","title":"Significant degradation detected","summary":"Approval rate is below baseline.","route":{"provider":"dLocal","paymentMethod":"CARD","country":"CO","issuer":"Bancolombia"},"metrics":{"currentApproval":61,"baselineApproval":83,"deviation":-22,"transactionCount":120}}
```

Required transport behavior:

- Each `data` payload is one complete `AgentEvent`.
- IDs must be unique within a run and timestamps must be ISO 8601.
- Unknown or invalid phases/statuses should be rejected at the adapter boundary.
- Reconnection, ordering and duplicate handling remain to be defined before implementing SSE.

## REST API

### Existing / to confirm

These routes are used by the current frontend and must be confirmed against the deployed backend:

- `GET /health`
- `GET /api/analytics/summary`
- `GET /api/analytics/risk`
- `POST /api/analytics/detect`
- `GET /api/incidents`
- `GET /api/transactions`
- `POST /api/demo/seed`

All current REST requests use `VITE_API_URL` through `src/lib/api.ts`. Missing configuration or an offline API affects only backend-backed screens; the agent demo remains local.

### Future — not implemented

- `GET /api/agent/events`
- `POST /api/agent/run`
- `GET /api/agent/status`
- `GET /api/routes/health`
- `GET /api/routing/recommendations/:incidentId`

## Data flow

### Demo mode

```text
approvalDropColombia
        ↓
MockAgentEventSource
        ↓
AgentStreamProvider
        ↓
AgentEvent[]
        ↓
RouteHealth
        ↓
RoutingRecommendation
        ↓
UI
```

### Future live mode

```text
Backend Agent
        ↓
SSE AgentEventSource adapter
        ↓
AgentStreamProvider
        ↓
AgentEvent[]
        ↓
RouteHealth
        ↓
RoutingRecommendation
        ↓
UI
```

The UI consumes domain state only. Replacing demo mode with live mode should require a new `AgentEventSource` implementation and source selection, without changes to visual components.

## Scenario contract

`approvalDropColombia` contains only scenario data: identity, initial route, ordered events, routing candidates and playback interval. It contains no timers or React state. The mock event source owns playback mechanics, while `AgentStreamProvider` remains the application's single stream instance and state boundary.
