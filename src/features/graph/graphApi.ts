import {
  api,
  withQuery,
} from '../../lib/api'

import type {
  UnifiedGraphResponse,
} from './types'

export function getUnifiedGraph(
  incidentId?: string | null,
) {
  const path = withQuery(
    '/api/graph/unified',
    {
      incidentId:
        incidentId ?? undefined,
    },
  )

  return api<UnifiedGraphResponse>(
    path,
  )
}