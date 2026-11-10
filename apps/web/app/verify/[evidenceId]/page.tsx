"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import type { PublicVerificationResult } from '@chainproof/types'

export default function VerificationPortalPage() {
  const { evidenceId } = useParams()
  const [data, setData] = useState<PublicVerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/verify/${evidenceId}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) setData(res.data)
        else setError(res.error || 'Verification Failed')
        setLoading(false)
      })
      .catch(() => {
        setError('Network error during verification')
        setLoading(false)
      })
  }, [evidenceId])

  return (
    <div className="flex-1 bg-[#050505] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#111111] rounded-2xl shadow-2xl overflow-hidden border border-red-900/40">
        <div className="p-8 text-center bg-[#050505] border-b border-red-900/40">
          <Image src="/techmines-logo.jpg" alt="TECHMINES logo" width={64} height={64} className="w-16 h-16 mx-auto mb-4 object-cover border-2 border-[#FF0000] shadow-neon-sm" />
          <h1 className="text-3xl font-bold tracking-tight">ChainProof Verification Portal</h1>
          <p className="text-neutral-400 mt-2">Public Chain of Custody Validation</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-neutral-400 font-mono">Querying Ethereum Network & IPFS...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-900/20 rounded-xl border border-red-500/30">
              <span className="text-4xl block mb-4">❌</span>
              <h2 className="text-xl font-bold text-red-400 mb-2">Verification Failed</h2>
              <p className="text-neutral-400">{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#050505] rounded-lg border border-red-900/40">
                <div>
                  <p className="text-sm text-neutral-400">Evidence ID</p>
                  <p className="text-xl font-mono font-bold">{data.evidenceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-400">Current Status</p>
                  <p className="text-lg font-bold text-cyan-400">{data.currentStatus}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${data.integrityScore === 100 ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                  <p className="text-sm text-neutral-400 mb-1">Integrity Score</p>
                  <div className="flex items-end">
                    <span className={`text-3xl font-bold ${data.integrityScore === 100 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.integrityScore}
                    </span>
                    <span className="text-neutral-500 ml-1 mb-1">/100</span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${data.blockchainVerified ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-yellow-900/20 border-yellow-500/50'}`}>
                  <p className="text-sm text-neutral-400 mb-1">Blockchain Sync</p>
                  <p className={`text-lg font-bold ${data.blockchainVerified ? 'text-cyan-400' : 'text-yellow-400'}`}>
                    {data.blockchainVerified ? 'VERIFIED ON EVM' : 'PENDING SYNC'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-red-900/40">
                <p className="text-xs text-neutral-500 mb-1">Cryptographic Token (SHA-256)</p>
                <p className="text-xs font-mono break-all text-neutral-300 bg-[#050505] p-3 rounded border border-red-900/40">
                  {data.verificationToken}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-8 text-sm text-neutral-500">Secured by ChainProof Cryptographic Architecture</p>
    </div>
  )
}
