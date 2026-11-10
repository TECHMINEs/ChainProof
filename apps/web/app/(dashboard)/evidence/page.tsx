"use client"
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { Evidence } from '@chainproof/types'

const STATUS_OPTIONS = ['', 'REGISTERED', 'IN_TRANSIT', 'STORED', 'VERIFIED', 'FLAGGED', 'ARCHIVED']
const TYPE_OPTIONS = ['', 'DOCUMENT', 'PHYSICAL', 'DIGITAL', 'BIOMETRIC', 'WEAPON', 'DRUG', 'OTHER']

const statusStyle: Record<string, string> = {
  REGISTERED: 'badge-gray',
  IN_TRANSIT: 'badge-blue',
  STORED: 'badge-purple',
  VERIFIED: 'badge-green',
  FLAGGED: 'badge-red',
  ARCHIVED: 'badge-gray',
}

export default function EvidenceListPage() {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(true)
  const pageSize = 15

  const fetchEvidence = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (submittedSearch) params.set('search', submittedSearch)
    if (status) params.set('status', status)
    if (type) params.set('type', type)

    fetch(`/api/evidence?${params}`).then(r => r.json()).then(d => {
      if (d.evidence) { setEvidence(d.evidence); setTotal(d.total) }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, submittedSearch, status, type])

  useEffect(() => { fetchEvidence() }, [fetchEvidence])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSubmittedSearch(search.trim())
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Evidence Registry</h1>
            <p className="page-subtitle">{total} items on record</p>
          </div>
          <Link href="/evidence/new" className="btn-primary">Register Evidence</Link>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search evidence number, description…"
            className="input flex-1 min-w-48"
          />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="select w-40">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1) }} className="select w-36">
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>

        <div className="table-container">
          <table className="min-w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Evidence #</th>
                <th className="table-th">Description</th>
                <th className="table-th">Type</th>
                <th className="table-th">Status</th>
                <th className="table-th">Integrity</th>
                <th className="table-th">Case</th>
                <th className="table-th">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="table-td text-center py-10 text-neutral-400 animate-pulse">Loading evidence...</td></tr>
              ) : evidence.length === 0 ? (
                <tr><td colSpan={7} className="table-td text-center py-10 text-neutral-400">No evidence found.</td></tr>
              ) : evidence.map((e) => (
                <tr key={e.id} className="table-row">
                  <td className="table-td">
                    <Link href={`/evidence/${e.id}`} className="font-mono text-brand-400 hover:text-brand-300 text-xs font-semibold">
                      {e.evidenceNumber}
                    </Link>
                  </td>
                  <td className="table-td text-neutral-400 max-w-xs truncate">{e.description}</td>
                  <td className="table-td"><span className="badge badge-gray">{e.type}</span></td>
                  <td className="table-td"><span className={`badge ${statusStyle[e.status] || 'badge-gray'}`}>{e.status}</span></td>
                  <td className="table-td">
                    <span className={`font-bold text-sm ${e.integrityScore === 100 ? 'text-emerald-400' : 'text-brand-400'}`}>
                      {e.integrityScore}/100
                    </span>
                  </td>
                  <td className="table-td font-mono text-xs text-neutral-500">{e.case?.caseNumber}</td>
                  <td className="table-td text-xs text-neutral-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
          <span className="text-xs text-neutral-500">Page {page} of {Math.ceil(total / pageSize) || 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= total} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
        </div>
      </div>
    </ErrorBoundary>
  )
}
