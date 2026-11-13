"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRScanner } from '@/components/scanner/QRScanner'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function ScannerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScan = async (data: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: data })
      })

      if (res.ok) {
        const result = await res.json()
        router.push(`/evidence/${result.data.evidenceId}`)
      } else {
        const errData = await res.json()
        setError(errData.error || 'Invalid QR code')
        setLoading(false)
      }
    } catch {
      setError('Failed to process scan')
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto space-y-8 animate-glow-in">
        <div className="text-center">
          <h1 className="page-title">Evidence Scanner</h1>
          <p className="page-subtitle">Scan an evidence tag to verify authenticity or initiate handoff.</p>
        </div>

        {error && (
          <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-lg text-brand-400 text-sm text-center">
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="card text-center p-12 border-brand-500/30">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4 shadow-neon-sm"></div>
            <p className="text-neutral-400 font-medium">Verifying Evidence Payload...</p>
          </div>
        ) : (
          <div className="card border-line">
            <div className="relative rounded-lg overflow-hidden border border-line">
               <QRScanner onScan={handleScan} />
               {/* Scanner Overlay Visuals */}
               <div className="scanner-corner scanner-corner-tl" />
               <div className="scanner-corner scanner-corner-tr" />
               <div className="scanner-corner scanner-corner-bl" />
               <div className="scanner-corner scanner-corner-br" />
            </div>
            
            <div className="mt-8 pt-6 border-t border-line text-center">
              <h3 className="font-semibold text-xs text-neutral-300 uppercase tracking-widest mb-2">Offline-First Engine</h3>
              <p className="text-xs text-neutral-400">
                If disconnected, scans are cached locally and synchronized with the Polygon mainnet once a secure connection is re-established.
              </p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
