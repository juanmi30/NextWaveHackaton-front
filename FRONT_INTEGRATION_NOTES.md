# Front integration notes

## Objetivo

Dejar una base frontend demostrable contra el backend actual sin volver a tocar backend y sin arrastrar dependencias innecesarias del proyecto Yuno anterior.

## Reutilizado conceptualmente del front anterior

- Organización por `features/*` para separar acceso a API por dominio.
- Dashboard shell con navegación lateral.
- Cards de estado/resumen.
- Tabla operativa de riesgos/incidentes.
- Pantallas separadas para overview, incidentes y transacciones.

## No copiado

- URLs hardcodeadas al Railway del hackathon anterior.
- MUI, Nivo, ReactFlow y DataGrid: son útiles si el reto final los necesita, pero añaden tiempo de instalación/customización ahora.
- APIs viejas (`/risk-notifications`, `/health-graph`, `/failure-prediction`) porque no corresponden al backend actual.
- Mocks/datos fijos del dashboard anterior.

## Endpoints ya conectados

- `GET /health`
- `GET /api/analytics/summary`
- `GET /api/analytics/risk`
- `POST /api/analytics/detect`
- `POST /api/demo/seed?reset=true`
- `GET /api/incidents`
- `PATCH /api/incidents/:id/acknowledge`
- `PATCH /api/incidents/:id/resolve`
- `GET /api/transactions`

## Flujo de demo

1. Entrar a Overview.
2. Pulsar **Seed demo**.
3. Ver el riesgo de `dLocal / CARD / CO / Bancolombia`.
4. Pulsar **Detect risk**.
5. Entrar a Incidents.
6. Acknowledge / Resolve.
7. Entrar a Transactions para mostrar los eventos base.

## Próximo trabajo de front recomendado

1. Branding final Yuno/Nauta y pulir Overview.
2. Filtros de análisis (`groupBy`, ventana, merchant/provider).
3. Detalle de incidente en drawer/modal.
4. Solo si sobra tiempo: gráficas de serie temporal o health graph.
5. Cuando se revele el challenge: reemplazar/renombrar pantallas sin tocar la capa `features/*`.

## Configuración

`VITE_API_URL` debe ser la raíz del backend, sin `/api`.

Local:

```env
VITE_API_URL=http://localhost:3000
```

Railway:

```env
VITE_API_URL=https://<tu-back>.up.railway.app
```
