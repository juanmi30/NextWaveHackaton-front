# NextWave Hackathon Front

React + TypeScript + Vite frontend aligned with the current NestJS backend.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_URL` to the backend root, **without** `/api` at the end:

```env
VITE_API_URL=http://localhost:3000
VITE_AGENT_DATA_SOURCE=sse
```

## Current screens

- `#/` — payment health overview and route-risk analysis.
- `#/incidents` — list, acknowledge and resolve incidents.
- `#/transactions` — inspect transaction events and filter by provider/status.

Hash navigation is intentional for the hackathon base: no extra routing dependency is needed and Vercel refreshes stay simple.

## Live demo flow from the UI

1. Start the live monitor and show generated transactions and detection runs increasing.
2. Confirm NORMAL traffic remains quiet.
3. Inject an arbitrary degradation through **Trial by fire**.
4. Wait for automatic detection and open the independently prioritized incident.
5. Analyze it through Agent SSE and review evidence, impact and recommended human action.

Use `VITE_AGENT_DATA_SOURCE=mock` explicitly only for isolated visual work. When `VITE_API_URL` exists, the frontend otherwise prefers live backend mode.

## What was reused from the previous Yuno front

The reusable ideas were retained: feature-oriented API modules, dashboard shell/navigation, operational tables, status cards and separation by screen. Old hardcoded API URLs, TypeORM-era response assumptions and heavy chart/UI dependencies were intentionally not copied.
