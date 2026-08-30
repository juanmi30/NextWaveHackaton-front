import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { addLiveDegradation, removeLiveDegradation } from './liveApi'
import type { AddLiveDegradationInput, LiveDegradation } from './types'
import { getUserFacingError } from '../../lib/api'

const dimensionKeys = ['merchant', 'provider', 'method', 'country', 'issuingBank'] as const
const initial = { merchant: '', provider: '', method: '', country: '', issuingBank: '', failureReason: 'DO_NOT_HONOR', approvalRate: '0.30', durationSeconds: '90' }

type Props = { degradations: LiveDegradation[]; refreshedAt: number; onChanged: () => Promise<void>; demoTools?: ReactNode; triggerLabel?: string }

export function TrialByFire({ degradations, refreshedAt, onChanged, demoTools, triggerLabel = 'Trial by fire' }: Props) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])

  const change = (key: keyof typeof initial, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    const dimensions = Object.fromEntries(dimensionKeys.map((key) => [key, form[key].trim()]).filter((entry) => entry[1])) as AddLiveDegradationInput['dimensions']
    try {
      await addLiveDegradation({ dimensions, approvalRate: Number(form.approvalRate), durationSeconds: Number(form.durationSeconds), failureReason: form.failureReason.trim() || undefined })
      setMessage('Degradation active. Waiting for automatic detection.')
      await onChanged()
    } catch (err) { setMessage(getUserFacingError(err, 'Unable to inject the degradation. Please try again.')) }
    finally { setBusy(false) }
  }
  const remove = async (id: string) => {
    setBusy(true)
    setMessage(null)
    try {
      await removeLiveDegradation(id)
      await onChanged()
    } catch (err) {
      setMessage(getUserFacingError(err, 'Unable to remove the degradation. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return <>
    <div className="trial-launcher"><div><strong>{degradations.length} active degradation{degradations.length === 1 ? '' : 's'}</strong><span>Injected traffic conditions · detection remains automatic</span></div><button className="button secondary" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">{triggerLabel}</button></div>
    {open ? <div className="trial-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <aside className="trial-drawer" role="dialog" aria-modal="true" aria-labelledby="trial-title">
        <div className="panel-header"><div><p className="eyebrow">Demo tools</p><h3 id="trial-title">Simulation controls</h3><p>Development utilities. Automatic monitoring remains the standard workflow.</p></div><button className="drawer-close" type="button" onClick={() => setOpen(false)} aria-label="Close Demo tools">×</button></div>
        {demoTools}
        <div className="trial-layout">
          <form onSubmit={(event) => void submit(event)}><h4>Inject degradation</h4><div className="trial-fields">{dimensionKeys.map((key) => <label key={key}><span>{key === 'issuingBank' ? 'Issuer' : key}</span><input className="input" value={form[key]} onChange={(event) => change(key, event.target.value)} placeholder="Any" /></label>)}<label><span>Response code</span><input className="input" value={form.failureReason} onChange={(event) => change('failureReason', event.target.value)} /></label><label><span>Approval target</span><input className="input" type="number" min="0" max="1" step="0.01" required value={form.approvalRate} onChange={(event) => change('approvalRate', event.target.value)} /></label><label><span>Duration (seconds)</span><input className="input" type="number" min="1" required value={form.durationSeconds} onChange={(event) => change('durationSeconds', event.target.value)} /></label></div><button className="button primary" type="submit" disabled={busy}>Inject degradation</button><small className="trial-safety">Simulation affects generated traffic only. No remediation is executed.</small>{message ? <p className="trial-message" aria-live="polite">{message}</p> : null}</form>
          <section><h4>Active degradations</h4>{degradations.length === 0 ? <p className="empty-state compact">No active injected conditions.</p> : <div className="degradation-list">{degradations.map((item) => <div key={item.id}><strong>{Object.values(item.dimensions).filter(Boolean).join(' · ') || 'All traffic'}</strong><span>Approval {(item.approvalRate * 100).toFixed(0)}% · {item.failureReason}</span><span>Expires in {Math.max(0, Math.ceil((new Date(item.expiresAt).getTime() - refreshedAt) / 1000))}s</span><button className="button tiny ghost" type="button" disabled={busy} onClick={() => void remove(item.id)}>Remove</button></div>)}</div>}</section>
        </div>
      </aside>
    </div> : null}
  </>
}
