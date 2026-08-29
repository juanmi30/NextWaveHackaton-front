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
```

## Current screens

- `#/` — payment health overview and route-risk analysis.
- `#/incidents` — list, acknowledge and resolve incidents.
- `#/transactions` — inspect transaction events and filter by provider/status.

Hash navigation is intentional for the hackathon base: no extra routing dependency is needed and Vercel refreshes stay simple.

## Demo flow from the UI

1. **Seed demo** creates deterministic transaction history with a degraded route.
2. **Detect risk** runs backend analytics and creates HIGH/CRITICAL incidents.
3. Review the route on Overview, then manage it under Incidents.

The degraded seed route is `Nova Travel / dLocal / CARD / CO / Bancolombia`.

## What was reused from the previous Yuno front

The reusable ideas were retained: feature-oriented API modules, dashboard shell/navigation, operational tables, status cards and separation by screen. Old hardcoded API URLs, TypeORM-era response assumptions and heavy chart/UI dependencies were intentionally not copied.
