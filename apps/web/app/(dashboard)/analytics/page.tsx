'use client'
import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import ErrorBoundary from '@/components/ErrorBoundary'
import CustomTooltip from '@/components/charts/ChartTooltip'
import type { AnalyticsOverview, TransfersByDayEntry, EvidenceByTypeEntry, OfficerActivity, AnomalyEntry } from '@chainproof/types'

const COLORS = ['#FF2626', '#ff6b6b', '#ff9e9e', '#A9A9A9', '#FFFFFF', '#39FF14']


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-neutral-300 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [transfersByDay, setTransfersByDay] = useState<TransfersByDayEntry[]>([])
  const [byType, setByType] = useState<EvidenceByTypeEntry[]>([])
  const [officerActivity, setOfficerActivity] = useState<OfficerActivity[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/overview').then(r => r.json()),
      fetch('/api/analytics/transfers-by-day').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/analytics/evidence-by-type').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/analytics/officer-activity').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/analytics/anomalies').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([ov, tbd, ebt, oa, an]) => {
      if (ov.error === 'Forbidden') { setUnauthorized(true); setLoading(false); return }
      if (ov.data) setOverview(ov.data)
      if (tbd.data) setTransfersByDay(tbd.data)
      if (ebt.data) setByType(ebt.data)
      if (oa.data) setOfficerActivity(oa.data)
      if (an.data) setAnomalies(an.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-72 bg-void-100 rounded-xl border border-line" />
        ))}
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="text-4xl mb-4">🔒</span>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-neutral-500">Analytics are available to ADMIN and AUDITOR roles only.</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">System-wide forensic evidence intelligence</p>
        </div>

        {/* Overview KPIs */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Cases', value: overview.totalCases ?? '—' },
              { label: 'Evidence', value: overview.totalEvidence ?? '—' },
              { label: 'Transfers', value: overview.totalTransfers ?? '—' },
              { label: 'Tamper Alerts', value: overview.tamperAlerts ?? 0 },
              { label: 'Avg Integrity', value: `${overview.avgIntegrityScore ?? 100}/100` },
              { label: 'Active Officers', value: overview.activeOfficers ?? '—' },
            ].map(stat => (
              <div key={stat.label} className="card text-center py-4">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Transfer Activity — Last 7 Days">
            {transfersByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={transfersByDay} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#555', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Transfers" fill="#FF2626" radius={0}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,60,0.5))' }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-neutral-400 text-sm text-center py-16">No transfer data available</p>
            )}
          </Section>

          <Section title="Evidence Distribution by Type">
            {byType.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byType} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="count" nameKey="type" paddingAngle={3}>
                    {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#777', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-neutral-400 text-sm text-center py-16">No evidence data available</p>
            )}
          </Section>
        </div>

        {/* Officer Activity */}
        {officerActivity.length > 0 && (
          <Section title="Officer Activity">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="table-th text-left">Officer</th>
                    <th className="table-th text-left">Department</th>
                    <th className="table-th text-right">Transfers Initiated</th>
                    <th className="table-th text-right">Transfers Received</th>
                    <th className="table-th text-right">Evidence Registered</th>
                    <th className="table-th text-right">Avg Response (hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {officerActivity.map((o) => (
                    <tr key={o.userId} className="table-row">
                      <td className="table-td text-white font-medium">{o.name}</td>
                      <td className="table-td text-neutral-500">{o.department}</td>
                      <td className="table-td text-right text-neutral-300">{o.transfersInitiated}</td>
                      <td className="table-td text-right text-neutral-300">{o.transfersReceived}</td>
                      <td className="table-td text-right text-neutral-300">{o.evidenceRegistered}</td>
                      <td className="table-td text-right text-neutral-300">{o.avgResponseHours?.toFixed(1) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Anomalies */}
        {anomalies.length > 0 && (
          <Section title="🚨 Integrity Anomalies">
            <div className="space-y-2">
              {anomalies.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-brand-500/5 border border-brand-500/20 rounded-lg">
                  <div>
                    <span className="font-mono text-brand-400 text-xs font-bold">{a.evidenceNumber}</span>
                    <span className="text-neutral-500 text-xs ml-3">{a.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`font-bold ${a.integrityScore < 66 ? 'text-brand-400' : 'text-white'}`}>
                      Score: {a.integrityScore}/100
                    </span>
                    <span className="text-neutral-400">{a.transferCount} transfers</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Empty state */}
        {!overview && !loading && (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-lg">No analytics data available yet.</p>
            <p className="text-sm mt-1">Create cases and register evidence to populate this dashboard.</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
