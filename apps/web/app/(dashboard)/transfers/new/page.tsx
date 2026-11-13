"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { Evidence, UserSummary } from '@chainproof/types'

export default function InitiateTransferPage() {
  const router = useRouter()
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([])
  const [officers, setOfficers] = useState<UserSummary[]>([])
  const [formData, setFormData] = useState({ evidenceId: '', toUserId: '', purpose: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/evidence?pageSize=100').then(r => r.json()).then(d => {
      if (d.evidence) setEvidenceList(d.evidence.filter((e: Evidence) => !['ARCHIVED', 'IN_TRANSIT'].includes(e.status)))
    }).catch(() => setError('Could not load evidence. Check your connection and reload.'))
    // C3: Use non-admin officer endpoint
    fetch('/api/users/officers').then(r => r.json()).then(d => {
      if (d.data) setOfficers(d.data)
    }).catch(() => setError('Could not load officers. Check your connection and reload.'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        router.push('/transfers')
      } else {
        const d = await res.json()
        setError(d.error || 'Failed to initiate transfer')
        setLoading(false)
      }
    } catch {
      setError('Network error occurred')
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="page-title">Initiate Transfer</h1>
          <p className="page-subtitle">Transfer custody with Zero-Knowledge proof verification</p>
        </div>

        {error && (
          <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-lg text-brand-400 text-sm">⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Evidence Item</label>
            <select required className="select" value={formData.evidenceId} onChange={e => setFormData({ ...formData, evidenceId: e.target.value })}>
              <option value="">Select evidence...</option>
              {evidenceList.map((e) => (
                <option key={e.id} value={e.id}>{e.evidenceNumber} — {e.description?.slice(0, 40)}…</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Receiving Officer</label>
            <select required className="select" value={formData.toUserId} onChange={e => setFormData({ ...formData, toUserId: e.target.value })}>
              <option value="">Select officer...</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>{o.name} ({o.department}{o.badgeNumber ? ` · ${o.badgeNumber}` : ''})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Purpose of Transfer</label>
            <input type="text" required className="input"
              placeholder="e.g. Lab Analysis, Court Presentation, Forensic Review"
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <div className="p-4 bg-white/5 border border-stroke rounded-lg text-sm text-white">
            <p className="font-semibold mb-1">🔐 Zero-Knowledge Proof Generation</p>
            <p className="text-white/70 text-xs">This transfer will generate a Groth16 ZK-SNARK proof using Circom. The receiving officer must sign with their passkey or Ethereum wallet to complete the handoff.</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating ZK Proof…
              </span>
            ) : 'Initiate Transfer'}
          </button>
        </form>
      </div>
    </ErrorBoundary>
  )
}
