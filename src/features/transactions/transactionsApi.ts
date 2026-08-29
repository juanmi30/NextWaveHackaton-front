import { api, withQuery } from '../../lib/api'
import type { PaymentStatus, Transaction } from '../../types/domain'

export type TransactionFilters = {
  merchant?: string
  provider?: string
  method?: string
  country?: string
  issuingBank?: string
  status?: PaymentStatus
  limit?: number
}

export const getTransactions = (filters: TransactionFilters = {}) =>
  api<Transaction[]>(withQuery('/api/transactions', { limit: 100, ...filters }))
