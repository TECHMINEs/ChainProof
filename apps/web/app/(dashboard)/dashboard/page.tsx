'use client'
import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import ErrorBoundary from '@/components/ErrorBoundary'
import CustomTooltip from '@/components/charts/ChartTooltip'
import type { AnalyticsOverview, TransfersByDayEntry, EvidenceByTypeEntry, Evidence, Transfer } from '@chainproof/types'

const NEON_RED = '#FF2626'
const COLORS = ['#FF2626', '#ff6b6b', '#ff9e9e', '#ffc8c8', '#A9A9A9', '#FFFFFF']

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="card relative">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500/60 via-brand-500/20 to-transparent rounded-b-xl" />
    </div>
  )
}


export default function DashboardPage() {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null)
  const [transfers, setTransfers] = useState<TransfersByDayEntry[]>([])
  const [byType, setByType] = useState<EvidenceByTypeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [myEvidence, setMyEvidence] = useState<Evidence[]>([])
  const [myTransfers, setMyTransfers] = useState<Transfer[]>([])

  useEffect(() => {
    // Always fetch user-scoped data
    Promise.all([
      fetch('/api/evidence').then(r => r.json()).catch(() => ({ evidence: [] })),
      fetch('/api/transfers').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([ev, tr]) => {
      if (ev.evidence) setMyEvidence(ev.evidence.slice(0, 5))
      if (tr.data) setMyTransfers(tr.data.slice(0, 5))
    })

    // Try admin analytics — only works for ADMIN/AUDITOR
    Promise.all([
      fetch('/api/analytics/overview').then(r => r.json()).catch(() => null),
      fetch('/api/analytics/transfers-by-day').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/analytics/evidence-by-type').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([overview, tbd, ebt]) => {
      if (overview?.data) {
        setStats(overview.data)
        setIsAdmin(true)
      }
      if (tbd?.data) setTransfers(tbd.data)
      if (ebt?.data) setByType(ebt.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-void-100 rounded-xl border border-line" />)}
        </div>
        <div className="h-64 bg-void-100 rounded-xl border border-line" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {isAdmin ? 'System-wide forensic infrastructure overview' : 'Your active cases and evidence overview'}
          </p>
        </div>

        {/* Admin stats */}
        {isAdmin && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Cases" value={stats.totalCases} icon="📁" />
            <StatCard title="Evidence" value={stats.totalEvidence} icon="🔬" />
            <StatCard title="Transfers" value={stats.totalTransfers} icon="🔄" />
            <StatCard title="Tamper Alerts" value={stats.tamperAlerts} icon="🚨" />
            <StatCard title="Avg Integrity" value={`${stats.avgIntegrityScore}%`} icon="🛡️" />
            <StatCard title="Active Officers" value={stats.activeOfficers} icon="👮" />
          </div>
        )}

        {/* Non-admin user summary */}
        {!isAdmin && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="My Evidence Items" value={myEvidence.length} icon="🔬" />
            <StatCard title="My Transfers" value={myTransfers.length} icon="🔄" />
          </div>
        )}

        {/* Charts — admin only */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4">Transfer Activity — 7 Days</h3>
              {transfers.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={transfers} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                    <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#555', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Transfers" fill={NEON_RED} radius={0}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,60,0.5))' }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-neutral-200 text-sm">No transfer data yet</div>
              )}
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4">Evidence by Type</h3>
              {byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={byType} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      dataKey="count" nameKey="type" paddingAngle={3}>
                      {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#777', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center text-neutral-200 text-sm">No evidence data yet</div>
              )}
            </div>
          </div>
        )}

        {/* Recent Evidence (all users) */}
        {myEvidence.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-neutral-300 mb-4">
              {isAdmin ? 'Recent Evidence' : 'My Recent Evidence'}
            </h3>
            <div className="space-y-2">
              {myEvidence.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-3 bg-[#050505]/60 rounded-lg border border-line">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-brand-400 text-xs font-bold">{ev.evidenceNumber}</span>
                    <span className="text-neutral-400 text-sm">{ev.description?.slice(0, 50)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs ${ev.integrityScore === 100 ? 'badge-green' : 'badge-red'}`}>
                      {ev.integrityScore}%
                    </span>
                    <span className="text-neutral-400 text-xs">{ev.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tamper alert banner */}
        {isAdmin && stats && stats.tamperAlerts > 0 && (
          <div className="card border-brand-500/40 bg-brand-500/5">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse-neon">🚨</span>
              <div>
                <p className="text-brand-400 font-bold">{stats.tamperAlerts} Tamper Alert{stats.tamperAlerts > 1 ? 's' : ''} Detected</p>
                <p className="text-neutral-500 text-sm">Evidence integrity has degraded. Immediate review required.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
