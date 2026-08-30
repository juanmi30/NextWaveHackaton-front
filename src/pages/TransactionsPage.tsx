import { useCallback, useEffect, useState } from 'react'
import { getTransactions } from '../features/transactions/transactionsApi'
import { getUserFacingError } from '../lib/api'
import type { PaymentStatus, Transaction } from '../types/domain'

const statuses: Array<PaymentStatus | 'ALL'> = ['ALL', 'APPROVED', 'DECLINED', 'ERROR', 'TIMEOUT']
const money = (cents: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [status, setStatus] = useState<PaymentStatus | 'ALL'>('ALL')
  const [providerDraft, setProviderDraft] = useState('')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTransactions({
        status: status === 'ALL' ? undefined : status,
        provider: provider.trim() || undefined,
        limit: 100,
      })
      setTransactions(data)
    } catch (err) {
      setError(getUserFacingError(err, 'Unable to load transactions. Please try again.'))
    } finally {
      setLoading(false)
    }
  }, [provider, status])

  useEffect(() => { void load() }, [load])

  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Raw data</p>
          <h2>Transactions</h2>
          <p>Inspect the events feeding risk analysis.</p>
        </div>
        <form className="filters" onSubmit={(event) => { event.preventDefault(); setProvider(providerDraft) }}>
          <input className="input" type="search" placeholder="Provider e.g. dLocal" value={providerDraft} onChange={(event) => setProviderDraft(event.target.value)} />
          <select className="select" value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus | 'ALL')}>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button className="button ghost" type="submit">Apply</button>
        </form>
      </div>

      {error ? <div className="notice error-notice">{error}</div> : null}

      {!loading && transactions.length > 0 ? <section className="latest-transactions" aria-label="Latest transactions"><div><p className="eyebrow">Latest transactions</p><span>Most recent real payment activity</span></div>{transactions.slice(0, 3).map((tx) => <article key={tx.id}><time dateTime={tx.occurredAt}>{new Date(tx.occurredAt).toLocaleTimeString([], { hour12: false })}</time><strong>{tx.provider}</strong><span>{tx.method} · {tx.country}</span><span className={`pill tx-${tx.status.toLowerCase()}`}>{tx.status}</span><b>{money(tx.amountCents, tx.currency)}</b></article>)}</section> : null}

      <article className="panel panel-wide">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Merchant</th><th>Route</th><th>Status</th><th>Amount</th><th>Latency</th><th>Time</th></tr></thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td><strong>{tx.merchant}</strong><span className="cell-subtitle">{tx.country} · {tx.issuingBank}</span></td>
                  <td>{tx.provider} / {tx.method}</td>
                  <td><span className={`pill tx-${tx.status.toLowerCase()}`}>{tx.status}</span>{tx.declineCode ? <span className="cell-subtitle">{tx.declineCode}</span> : null}</td>
                  <td>{money(tx.amountCents, tx.currency)}</td>
                  <td>{tx.latencyMs === null ? '—' : `${tx.latencyMs} ms`}</td>
                  <td>{new Date(tx.occurredAt).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && transactions.length === 0 ? <tr><td colSpan={6}><div className="empty-state">No transactions found.</div></td></tr> : null}
              {loading ? <tr><td colSpan={6}><div className="skeleton-stack" aria-label="Loading transactions"><i /><i /><i /></div></td></tr> : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
