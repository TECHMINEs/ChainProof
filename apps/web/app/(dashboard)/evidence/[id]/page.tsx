"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { EvidenceTimeline } from '@/components/evidence/EvidenceTimeline'
import { IntegrityScoreRing } from '@/components/evidence/IntegrityScoreRing'
import { ThreeLayerVerification } from '@/components/evidence/ThreeLayerVerification'
import { BlockchainStatusBadge } from '@/components/blockchain/BlockchainStatusBadge'
import { EvidenceStatusBadge } from '@/components/ui/EvidenceStatusBadge'
import type { Evidence, Transfer, IntegrityVerificationResult } from '@chainproof/types'
import Image from 'next/image'

export default function EvidenceDetailsPage() {
  const { id } = useParams()
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [timeline, setTimeline] = useState<Transfer[]>([])
  const [integrity, setIntegrity] = useState<IntegrityVerificationResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/evidence/${id}`).then(r => r.json()),
      fetch(`/api/evidence/${id}/timeline`).then(r => r.json()),
      fetch(`/api/evidence/${id}/verify-integrity`).then(r => r.json())
    ]).then(([evData, tlData, intData]) => {
      if(evData.data) setEvidence(evData.data)
      if(tlData.data) setTimeline(tlData.data)
      if(!intData.error) setIntegrity(intData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="animate-pulse">Loading evidence secure envelope...</div>
  if (!evidence) return <div>Evidence not found.</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white font-mono">{evidence.evidenceNumber}</h1>
          <p className="text-neutral-500 mt-1">Case: {evidence.case?.caseNumber}</p>
        </div>
        <EvidenceStatusBadge status={evidence.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-black dark:bg-[#050505] rounded-xl p-6 border border-red-900/40 dark:border-red-900/40 shadow-sm">
            <h2 className="text-lg font-bold mb-4 dark:text-white border-b border-red-900/40 dark:border-red-900/40 pb-2">Details</h2>
            <p className="dark:text-neutral-300">{evidence.description}</p>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="text-neutral-500">Collection Date:</span>
                <p className="font-medium dark:text-white">{new Date(evidence.collectionDate).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-neutral-500">Location:</span>
                <p className="font-medium dark:text-white">{evidence.collectionLocation}</p>
              </div>
            </div>
            {evidence.imageUrls?.[0] && (
              <div className="mt-6">
                <Image src={evidence.imageUrls[0]} alt={`Evidence photo for ${evidence.evidenceNumber}`} width={512} height={256} className="max-h-64 w-auto object-cover border border-red-900/40" />
              </div>
            )}
          </div>

          <div className="bg-black dark:bg-[#050505] rounded-xl p-6 border border-red-900/40 dark:border-red-900/40 shadow-sm">
            <h2 className="text-lg font-bold mb-4 dark:text-white border-b border-red-900/40 dark:border-red-900/40 pb-2">Tamper-Evident Verification</h2>
            <ThreeLayerVerification result={integrity ?? undefined} isLoading={!integrity} />
          </div>

          <div className="bg-black dark:bg-[#050505] rounded-xl p-6 border border-red-900/40 dark:border-red-900/40 shadow-sm">
            <h2 className="text-lg font-bold mb-4 dark:text-white border-b border-red-900/40 dark:border-red-900/40 pb-2">Chain of Custody</h2>
            <EvidenceTimeline transfers={timeline} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black dark:bg-[#050505] rounded-xl p-6 border border-red-900/40 dark:border-red-900/40 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-bold mb-4 dark:text-white">Integrity Score</h3>
            <IntegrityScoreRing score={evidence.integrityScore} size={160} />
            <p className="text-xs text-center text-neutral-500 mt-4">Calculated across 3 storage layers</p>
          </div>

          <div className="bg-black dark:bg-[#050505] rounded-xl p-6 border border-red-900/40 dark:border-red-900/40 shadow-sm">
            <h3 className="font-bold mb-4 dark:text-white">Crypto Anchors</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 mb-1">SHA-256 Hash</p>
                <p className="text-xs font-mono break-all bg-[#0a0a0a] dark:bg-[#111111] p-2 rounded text-neutral-200 dark:text-neutral-300 border border-red-900/40 dark:border-red-900/40">{evidence.sha256Hash}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">IPFS CID</p>
                <p className="text-xs font-mono break-all bg-[#0a0a0a] dark:bg-[#111111] p-2 rounded text-neutral-200 dark:text-neutral-300 border border-red-900/40 dark:border-red-900/40">{evidence.ipfsCid}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 mb-1">Blockchain Sync</p>
                <BlockchainStatusBadge status={evidence.chainSyncStatus} txHash={evidence.blockchainTxHash} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
