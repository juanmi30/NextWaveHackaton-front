# Frontend–backend integration contract

## Live monitor

- `GET /api/live/status`
- `POST /api/live/start` with `{ "autoSeed": true }`
- `POST /api/live/stop`
- `POST /api/live/degradations`
- `GET /api/live/degradations`
- `DELETE /api/live/degradations/:id`

Injected degradations are runtime conditions, not incidents. Prediction is an early warning; only detection creates incidents.

## Analytics and operations

- `GET /health`
- `GET /api/analytics/summary`
- `GET /api/analytics/breakdown`
- `GET /api/incidents`
- `PATCH /api/incidents/:id/acknowledge`
- `PATCH /api/incidents/:id/resolve`
- `GET /api/transactions`
- `POST /api/detection/run`
- `POST /api/demo/seed`

Live Overview route health uses breakdown rows directly. It does not substitute frontend risk classification for backend detection.

## Agent SSE

`GET /api/agent/incidents/:incidentId/analyze/stream` returns standard SSE `message` events. JSON `data.type` discriminates public events.

```text
OBSERVE → INVESTIGATE → DIAGNOSE → RECOMMEND → REPORT
```

P5.1 includes confidence analysis, ruled-out hypotheses, counterfactual impact and diagnosis trace. Evidence uses `baselineValue` and `observedValue`. P5.2 `declineIntelligence` and `operationalOwnership` are optional additive fields.

Recommendations are advisory. The frontend executes no retries, rerouting or remediation.

## Data sources

```env
VITE_API_URL=http://localhost:3000
VITE_AGENT_DATA_SOURCE=sse
```

Mock mode must be explicit when a backend URL exists. Mock route health and simulated routing UI are restricted to mock mode.
