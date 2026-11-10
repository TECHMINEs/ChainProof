"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { Case } from '@chainproof/types'

export default function RegisterEvidencePage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [formData, setFormData] = useState({
    caseId: '',
    type: 'PHYSICAL',
    description: '',
    quantity: '1',
    unit: 'item',
    collectionDate: new Date().toISOString().slice(0, 16),
    collectionLocation: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cases?pageSize=100').then(r => r.json()).then(d => {
      if (d.cases) setCases(d.cases)
    }).catch(() => setError('Could not load cases. Check your connection and reload.'))

    // D2: Real GPS geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGeoError('Location unavailable — enter manually')
      )
    } else {
      setGeoError('Geolocation not supported by this browser')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Please attach evidence photo'); return }

    setLoading(true)
    setError('')

    const data = new FormData()
    Object.entries(formData).forEach(([k, v]) => data.append(k, v))
    data.append('file', file)

    // D2: Pass actual device GPS (not hardcoded)
    if (coords) {
      data.append('collectionLatitude', String(coords.lat))
      data.append('collectionLongitude', String(coords.lng))
    }

    try {
      const res = await fetch('/api/evidence', { method: 'POST', body: data })
      if (res.ok) {
        const result = await res.json()
        router.push(`/evidence/${result.data.id}`)
      } else {
        const d = await res.json()
        setError(d.error || 'Failed to register evidence')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="page-title">Register New Evidence</h1>
          <p className="page-subtitle">All fields are cryptographically hashed and anchored to IPFS</p>
        </div>

        {error && (
          <div className="p-4 bg-brand-500/10 border border-brand-500/30 rounded-lg text-brand-400 text-sm">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Case</label>
            <select required className="select" value={formData.caseId} onChange={e => setFormData({ ...formData, caseId: e.target.value })}>
              <option value="">Select a case...</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.caseNumber} — {c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              required rows={3} className="input resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the evidence in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date Collected</label>
              <input type="datetime-local" required className="input"
                value={formData.collectionDate}
                onChange={e => setFormData({ ...formData, collectionDate: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Location Description</label>
              <input type="text" required className="input"
                placeholder="e.g. Crime scene, 5th Ave"
                value={formData.collectionLocation}
                onChange={e => setFormData({ ...formData, collectionLocation: e.target.value })}
              />
            </div>
          </div>

          {/* D2: GPS coordinates display */}
          <div className="p-3 bg-void-200 border border-red-900/40 rounded-lg text-xs">
            <p className="label mb-1">GPS Coordinates</p>
            {coords ? (
              <p className="font-mono text-emerald-400">
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                <span className="text-neutral-400 ml-2">— captured from device</span>
              </p>
            ) : (
              <p className="text-neutral-400">{geoError || 'Acquiring GPS…'}</p>
            )}
          </div>

          <div>
            <label className="label">Evidence Photo</label>
            <input
              type="file" required accept="image/*" className="input cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-brand-500/20 file:text-brand-400 file:text-xs file:font-semibold hover:file:bg-brand-500/30"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-neutral-400 mt-1">EXIF metadata will be extracted and verified against GPS coordinates</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Computing SHA-256 & Uploading to IPFS…
              </span>
            ) : '🔒 Register Evidence Securely'}
          </button>
        </form>
      </div>
    </ErrorBoundary>
  )
}
