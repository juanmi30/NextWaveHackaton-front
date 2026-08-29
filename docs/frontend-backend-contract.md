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
data: {"type":"phase_changed","phase":"DIAGNOSE","timestamp":"2026-08-29T12:00:00.000Z"}
```

Required transport behavior:

- Public event names are `run_started`, `phase_changed`, `tool_started`, `tool_completed`, `diagnosis`, `run_completed`, and `error`.
- The public lifecycle is `OBSERVE → INVESTIGATE → DIAGNOSE → RECOMMEND → REPORT`.
- `SseAgentEventSource` maps public payloads into frontend domain events and stores diagnosis/tool activity separately.
- Timestamps must be ISO 8601.
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

The UI consumes domain state only. Live mode selects `SseAgentEventSource`; demo mode selects `MockAgentEventSource`. Set `VITE_AGENT_DATA_SOURCE=sse` and configure `VITE_API_URL` to enable live mode.

## Scenario contract

`approvalDropColombia` contains only scenario data: identity, initial route, ordered events, routing candidates and playback interval. It contains no timers or React state. The mock event source owns playback mechanics, while `AgentStreamProvider` remains the application's single stream instance and state boundary.
