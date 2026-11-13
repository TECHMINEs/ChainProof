'use client'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { Transfer, AuthUser } from '@chainproof/types'

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'badge-yellow',
  COMPLETED: 'badge-green',
  REJECTED:  'badge-red',
  FAILED:    'badge-red',
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [actionError, setActionError] = useState('')

  const fetchAll = useCallback(async () => {
    const [me, tr] = await Promise.all([
      fetch('/api/auth/me').then(r => r.json()).catch(() => ({})),
      fetch('/api/transfers').then(r => r.json()).catch(() => ({ data: [] })),
    ])
    if (me.user) setCurrentUser(me.user)
    if (tr.data) setTransfers(tr.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  /** Throws a user-facing message when the API rejects the request. */
  const ensureOk = async (res: Response) => {
    if (res.ok) return
    const body = await res.json().catch(() => ({}))
    throw new Error(typeof body.error === 'string' ? body.error : `Request failed (${res.status})`)
  }

  const handleAction = async (transferId: string, action: 'accept' | 'reject') => {
    setActionLoading(transferId)
    setActionError('')
    try {
      if (action === 'accept') {
        const res = await fetch(`/api/transfers/${transferId}/sign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signatureType: 'wallet',
            signature: `accepted-by-officer-${Date.now()}`,
          }),
        })
        await ensureOk(res)
      } else {
        const res = await fetch(`/api/transfers/${transferId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Rejected by receiving officer' }),
        })
        await ensureOk(res)
      }
      await fetchAll()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Action failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSyncToChain = async (transferId: string) => {
    setActionLoading(transferId)
    try {
      setActionError('')
      const res = await fetch(`/api/blockchain/sync-transfer/${transferId}`, { method: 'POST' })
      await ensureOk(res)
      await fetchAll()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Blockchain sync failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingIncoming = transfers.filter(
    t => t.status === 'PENDING' && t.toUserId === currentUser?.id
  )

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Chain of Custody Transfers</h1>
            <p className="page-subtitle">All custody movements for forensic evidence.</p>
          </div>
          <Link href="/transfers/new" className="btn-primary">+ Initiate Transfer</Link>
        </div>

        {actionError && (
          <div role="alert" className="border border-[#FF2626]/60 bg-red-950/30 px-4 py-3 text-sm text-[#FF3B3B]">
            {actionError}
          </div>
        )}

        {/* Pending incoming — action required */}
        {pendingIncoming.length > 0 && (
          <div className="card border-stroke bg-white/5">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span>⏳</span> {pendingIncoming.length} Incoming Transfer{pendingIncoming.length > 1 ? 's' : ''} Awaiting Your Action
            </h2>
            <div className="space-y-3">
              {pendingIncoming.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-[#050505]/60 rounded-lg border border-line">
                  <div>
                    <p className="text-white font-semibold text-sm">{t.evidence?.evidenceNumber || t.evidenceId}</p>
                    <p className="text-neutral-500 text-xs mt-0.5">From: {t.fromUser?.name} · Purpose: {t.purpose}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(t.id, 'accept')}
                      disabled={actionLoading === t.id}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      {actionLoading === t.id ? '...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleAction(t.id, 'reject')}
                      disabled={actionLoading === t.id}
                      className="btn-ghost text-xs px-3 py-1.5 text-brand-400 hover:border-brand-500/40"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All transfers table */}
        <div className="table-container">
          <table className="min-w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Evidence</th>
                <th className="table-th">From</th>
                <th className="table-th">To</th>
                <th className="table-th">Purpose</th>
                <th className="table-th">Status</th>
                <th className="table-th">Date</th>
                <th className="table-th text-right">Chain</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="table-td text-center py-12 text-neutral-500 animate-pulse">Loading transfer records...</td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan={7} className="table-td text-center py-12 text-neutral-400">No transfers recorded.</td></tr>
              ) : transfers.map((t) => (
                <tr key={t.id} className="table-row">
                  <td className="table-td font-mono text-brand-400 text-xs font-bold">
                    {t.evidence?.evidenceNumber || t.evidenceId.slice(0, 8)}
                  </td>
                  <td className="table-td text-neutral-300 text-sm">{t.fromUser?.name || '—'}</td>
                  <td className="table-td text-neutral-300 text-sm">{t.toUser?.name || '—'}</td>
                  <td className="table-td text-neutral-500 text-sm max-w-[160px] truncate">{t.purpose}</td>
                  <td className="table-td">
                    <span className={`badge ${STATUS_COLOR[t.status] || 'badge-gray'}`}>{t.status}</span>
                  </td>
                  <td className="table-td text-neutral-400 text-xs">
                    {new Date(t.transferredAt).toLocaleDateString()}
                  </td>
                  <td className="table-td text-right">
                    {t.blockchainTxHash ? (
                      <span className="text-green-400 text-xs font-mono" title={t.blockchainTxHash}>
                        ✓ On-chain
                      </span>
                    ) : t.status === 'COMPLETED' ? (
                      <button
                        onClick={() => handleSyncToChain(t.id)}
                        disabled={actionLoading === t.id}
                        className="text-xs text-brand-400 hover:text-brand-300 underline font-mono"
                      >
                        {actionLoading === t.id ? 'Syncing...' : 'Sync to Chain'}
                      </button>
                    ) : (
                      <span className="text-neutral-200 text-xs">Pending</span>
                    )}
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
