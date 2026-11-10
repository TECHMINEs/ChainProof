"use client"
import React, { useCallback, useEffect, useState } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { AuditLog } from '@chainproof/types'

const SEVERITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [severity, setSeverity] = useState('')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  const fetchLogs = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (severity) params.set('severity', severity)
    if (flaggedOnly) params.set('flagged', 'true')

    fetch(`/api/admin/audit-logs?${params}`).then(r => r.json()).then(d => {
      if (d.logs) { setLogs(d.logs); setTotal(d.total) }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, severity, flaggedOnly])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const severityBadge = (s: string) => {
    const map: Record<string, string> = {
      LOW: 'badge-gray', MEDIUM: 'badge-yellow', HIGH: 'badge-red', CRITICAL: 'badge-red'
    }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Immutable system activity records</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <select value={severity} onChange={e => { setSeverity(e.target.value); setPage(1) }} className="select w-40">
            {SEVERITIES.map(s => <option key={s} value={s}>{s || 'All Severities'}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
            <input type="checkbox" checked={flaggedOnly} onChange={e => { setFlaggedOnly(e.target.checked); setPage(1) }} className="accent-brand-500" />
            Flagged only
          </label>
          <span className="text-xs text-neutral-400 ml-auto">{total} total entries</span>
        </div>

        <div className="table-container">
          <table className="min-w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Timestamp</th>
                <th className="table-th">User</th>
                <th className="table-th">Action</th>
                <th className="table-th">Entity</th>
                <th className="table-th">Severity</th>
                <th className="table-th">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-td text-center py-10 text-neutral-400 animate-pulse">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="table-td text-center py-10 text-neutral-400">No logs found.</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className={`table-row ${log.flagged ? 'bg-brand-500/5' : ''}`}>
                  <td className="table-td font-mono text-xs text-neutral-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="table-td text-neutral-300">{log.user?.name || 'System'}</td>
                  <td className="table-td font-mono text-xs text-neutral-300">{log.action}</td>
                  <td className="table-td text-xs text-neutral-500">{log.entityType}{log.entityId ? ` (${log.entityId.slice(0,8)}...)` : ''}</td>
                  <td className="table-td">{severityBadge(log.severity)}</td>
                  <td className="table-td">{log.flagged ? <span className="badge badge-red">⚑ Flagged</span> : <span className="text-neutral-200">—</span>}</td>
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
