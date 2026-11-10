"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { EvidenceStatusBadge } from '@/components/ui/EvidenceStatusBadge'
import type { Case, Evidence } from '@chainproof/types'

export default function CaseDetailsPage() {
  const { id } = useParams()
  const [caseData, setCaseData] = useState<(Case & { evidence: Evidence[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) setCaseData(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="animate-pulse text-neutral-500">Loading case details...</div>
  if (!caseData) return <div className="text-red-500">Case not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold dark:text-white mb-2">{caseData.caseNumber}: {caseData.title}</h1>
          <p className="text-neutral-500">{caseData.description}</p>
        </div>
        <span className="px-3 py-1 bg-green-950/40 text-green-400 dark:bg-green-900/30 dark:text-green-400 font-bold rounded">
          {caseData.status}
        </span>
      </div>

      <div className="bg-black dark:bg-[#050505] rounded-xl p-6 border border-red-900/40 dark:border-red-900/40 shadow-sm">
        <h2 className="text-lg font-bold dark:text-white mb-4">Evidence Registry</h2>
        {caseData.evidence?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseData.evidence.map((ev) => (
              <Link href={`/evidence/${ev.id}`} key={ev.id} className="block p-4 border border-red-900/40 dark:border-red-900/40 rounded-lg hover:border-cyan-500 transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="font-mono text-sm font-bold dark:text-neutral-300">{ev.evidenceNumber}</span>
                  <EvidenceStatusBadge status={ev.status} />
                </div>
                <p className="text-sm text-neutral-400 dark:text-neutral-400 line-clamp-2 mb-3">{ev.description}</p>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{ev.type}</span>
                  <span className={`font-bold ${ev.integrityScore === 100 ? 'text-green-500' : 'text-red-500'}`}>Score: {ev.integrityScore}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-neutral-500 italic">No evidence registered to this case yet.</div>
        )}
      </div>
    </div>
  )
}
