'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Web3Provider } from '@/components/providers/Web3Provider'
import ErrorBoundary from '@/components/ErrorBoundary'
import './dashboard.css'
import type { AuthUser } from '@chainproof/types'

function DashboardHeader() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user)
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    // Always leave the dashboard, even if the network call fails — the cookie expires anyway
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined)
    router.push('/login')
    router.refresh()
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const roleColor: Record<string, string> = {
    ADMIN: 'text-brand-400',
    OFFICER: 'text-white',
    REGISTRAR: 'text-white',
    AUDITOR: 'text-green-400',
  }

  return (
    <header className="sticky top-11 z-30 h-14 flex items-center justify-between px-6 border-b border-line bg-black/80 backdrop-blur-sm flex-shrink-0 pl-16 md:pl-6">
      <div className="text-sm text-neutral-400 font-mono hidden sm:block">
        Forensic Infrastructure v1.0
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          <span className="text-xs text-neutral-500 hidden sm:inline">Connected</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-neutral-300 font-medium leading-none">{user.name}</span>
              <span className={`text-xs font-semibold leading-none mt-0.5 ${roleColor[user.role] || 'text-neutral-500'}`}>
                {user.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-void-100 border border-line flex items-center justify-center text-xs font-bold text-neutral-300">
              {initials}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="btn-ghost text-xs px-3 py-1.5 text-neutral-500 hover:text-brand-400 hover:border-brand-500/40"
          title="Sign out"
        >
          {loggingOut ? (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Web3Provider>
        {/* Single page scroll: sidebar and header stick beneath the 44px brand bar */}
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-6">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </Web3Provider>
    </QueryProvider>
  )
}
