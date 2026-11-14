"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passkeyLoading, setPasskeyLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password })
      })

      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // D4: Functional passkey login
  const handlePasskeyLogin = async () => {
    if (!employeeId.trim()) {
      setError('Please enter your Employee ID first')
      return
    }
    setError('')
    setPasskeyLoading(true)

    try {
      // Step 1: Get authentication options (challenge stored server-side)
      const optRes = await fetch('/api/auth/passkey/auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      })

      if (!optRes.ok) {
        const d = await optRes.json()
        setError(d.error || 'No passkey found for this account')
        return
      }

      const options = await optRes.json()

      // Step 2: Browser prompts biometric/passkey
      const authResponse = await startAuthentication(options)

      // Step 3: Verify on server
      const verifyRes = await fetch('/api/auth/passkey/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, authResponse })
      })

      if (verifyRes.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        const d = await verifyRes.json()
        setError(d.error || 'Passkey authentication failed')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Passkey authentication was cancelled')
      } else {
        setError('Passkey authentication failed')
      }
    } finally {
      setPasskeyLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">

      <div className="w-full max-w-sm relative animate-glow-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/logo-mark.svg" alt="ChainProof logo" width={72} height={72} className="w-[72px] h-[72px] mx-auto mb-4" unoptimized priority />
          <h1 className="text-4xl font-bold text-white uppercase">Chain<span className="text-[#FF2626]">Proof</span></h1>
          <p className="tm-label mt-2">Forensic chain of custody</p>
        </div>

        <div className="card border-line">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Employee ID</label>
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                required
                placeholder="e.g. OFF-001"
                className="input"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 neon-line" />
            <span className="text-neutral-400 text-xs">OR</span>
            <div className="flex-1 neon-line" />
          </div>

          {/* D4: Functional passkey button */}
          <button
            id="passkeyLoginBtn"
            type="button"
            onClick={handlePasskeyLogin}
            disabled={passkeyLoading}
            className="btn-ghost w-full mt-4 gap-2"
          >
            {passkeyLoading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Authenticating with Passkey...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Sign in with Passkey
              </span>
            )}
          </button>

          <div className="mt-5 pt-4 border-t border-line">
            <button
              type="button"
              onClick={() => {
                setEmployeeId('ADMIN-001');
                setPassword('admin-password-2026');
                router.push('/dashboard');
              }}
              className="w-full py-2.5 px-3 text-xs font-mono uppercase tracking-wider bg-brand-500/10 text-[#FF2626] border border-brand-500/30 hover:bg-brand-500/20 transition-colors rounded font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              ✦ Quick Demo Access (Admin)
            </button>
            <p className="text-[11px] text-center text-neutral-400 mt-2 font-mono">
              Client-side interactive demo with bundled custody data
            </p>
          </div>
        </div>

        <p className="text-center text-neutral-200 text-xs mt-6">
          Secured by ChainProof Cryptographic Infrastructure
        </p>
      </div>
    </div>
  )
}
