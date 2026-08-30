# Front integration notes

## Connected backend

The frontend uses `VITE_API_URL` as the backend root and integrates health, analytics, incidents, transactions, detection, live monitor controls, live degradations, and incident Agent SSE.

Overview polls live status, analytics and open incidents every 2.5 seconds while mounted. Polling is guarded against overlap and preserves the last successful data after transient failures.

## Demo flow

1. Start the live monitor and confirm transactions and automatic detection counters increase.
2. Confirm NORMAL traffic remains quiet.
3. Inject an arbitrary condition using Trial by Fire.
4. Wait for automatic detection without manually running detection.
5. Analyze the resulting incident and review evidence, impact and human-approved recommendation.

Mock Agent routes and routing recommendations remain available only when `VITE_AGENT_DATA_SOURCE=mock`. They are hidden in backend mode.

## Configuration

```env
VITE_API_URL=http://localhost:3000
VITE_AGENT_DATA_SOURCE=sse
```

If the source is omitted but `VITE_API_URL` exists, live SSE mode is selected.
