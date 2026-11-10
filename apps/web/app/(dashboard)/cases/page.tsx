'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { Case } from '@chainproof/types'

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'badge-blue',
  UNDER_REVIEW: 'badge-yellow',
  CLOSED: 'badge-gray',
  ARCHIVED: 'badge-gray',
}

function NewCaseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    caseNumber: '',
    title: '',
    description: '',
    incidentDate: new Date().toISOString().slice(0, 16),
    incidentLocation: '',
    priority: 'MEDIUM',
    courtName: '',
    prosecutorName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          incidentDate: new Date(form.incidentDate).toISOString(),
        }),
      })
      if (res.ok) {
        onCreated()
        onClose()
      } else {
        const d = await res.json()
        setError(d.error || 'Failed to create case')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg card border-red-900/40 shadow-void max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Open New Case</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Case Number</label>
              <input className="input" required value={form.caseNumber} placeholder="e.g. CASE-2026-001"
                onChange={e => setForm({ ...form, caseNumber: e.target.value })} />
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" required value={form.title} placeholder="Brief case title"
              onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} required value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Incident Date</label>
              <input className="input" type="datetime-local" required value={form.incidentDate}
                onChange={e => setForm({ ...form, incidentDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Incident Location</label>
              <input className="input" required value={form.incidentLocation} placeholder="City, District..."
                onChange={e => setForm({ ...form, incidentLocation: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Court (optional)</label>
              <input className="input" value={form.courtName}
                onChange={e => setForm({ ...form, courtName: e.target.value })} />
            </div>
            <div>
              <label className="label">Prosecutor (optional)</label>
              <input className="input" value={form.prosecutorName}
                onChange={e => setForm({ ...form, prosecutorName: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Open Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchCases = () => {
    setLoading(true)
    fetch('/api/cases').then(r => r.json()).then(res => {
      if (res.cases) setCases(res.cases)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchCases() }, [])

  return (
    <ErrorBoundary>
      {showModal && <NewCaseModal onClose={() => setShowModal(false)} onCreated={fetchCases} />}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Active Cases</h1>
            <p className="page-subtitle">Manage investigation files and related evidence items.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Case</button>
        </div>
        <div className="table-container">
          <table className="min-w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Case Number</th>
                <th className="table-th">Title</th>
                <th className="table-th">Priority</th>
                <th className="table-th">Status</th>
                <th className="table-th">Incident Date</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-td text-center py-12 text-neutral-500 animate-pulse">Synchronizing case ledger...</td></tr>
              ) : cases.length === 0 ? (
                <tr><td colSpan={6} className="table-td text-center py-12 text-neutral-400">No investigation cases found.</td></tr>
              ) : cases.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="table-td font-mono text-brand-400 font-bold text-xs">{c.caseNumber}</td>
                  <td className="table-td text-white font-medium">{c.title}</td>
                  <td className="table-td">
                    <span className={`badge ${
                      c.priority === 'CRITICAL' ? 'badge-red' :
                      c.priority === 'HIGH' ? 'badge-yellow' : 'badge-gray'
                    }`}>{c.priority}</span>
                  </td>
                  <td className="table-td">
                    <span className={`badge ${STATUS_COLORS[c.status] || 'badge-gray'}`}>{c.status}</span>
                  </td>
                  <td className="table-td text-neutral-500 text-xs">
                    {new Date(c.incidentDate).toLocaleDateString()}
                  </td>
                  <td className="table-td text-right">
                    <Link href={`/cases/${c.id}`} className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ErrorBoundary>
  )
}
