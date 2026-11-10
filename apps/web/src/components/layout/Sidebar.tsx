'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const links = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  },
  {
    href: '/cases', label: 'Cases',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3l2 3h9a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
  },
  {
    href: '/evidence', label: 'Evidence',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },
  {
    href: '/evidence/new', label: 'Register Evidence',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  {
    href: '/transfers', label: 'Transfers',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
  },
  {
    href: '/scanner', label: 'Scanner',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H4a2 2 0 00-2 2v4a2 2 0 002 2h1m16-8h-1a2 2 0 00-2 2v4a2 2 0 002 2h1" /></svg>
  },
  {
    href: '/analytics', label: 'Analytics',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  },
  {
    href: '/admin/users', label: 'Admin',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  },
]

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname()
  return (
    <>
      {links.map(link => {
        // Exact match for /dashboard, prefix match for others
        const isActive = link.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname === link.href || pathname.startsWith(link.href + '/')
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
              isActive
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-neon-inner'
                : 'text-neutral-500 hover:text-neutral-200 hover:bg-[#050505]'
            }`}
          >
            <span className={`flex-shrink-0 ${isActive ? 'text-brand-500' : 'text-neutral-400 group-hover:text-neutral-400'}`}>
              {link.icon}
            </span>
            {link.label}
            {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shadow-neon-sm" />}
          </Link>
        )
      })}
    </>
  )
}

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-black border border-[#FF0000] p-1 flex items-center justify-center shadow-[0_0_12px_rgba(255,0,0,0.6)] flex-shrink-0">
      <Image src="/techmines-logo.jpg" alt="TECHMINES logo" width={40} height={40} className="w-full h-full object-cover" />
    </div>
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-white font-black tracking-wider text-sm font-mono block">Chain<span className="text-[#FF0000]">Proof</span></span>
        <span className="bg-[#FF0000] text-black text-[8px] font-black px-1 py-0.2 uppercase font-mono">PLASMA</span>
      </div>
      <span className="text-[#00FFFF] text-[10px] font-mono tracking-tight">Forensic Cryptographic CoC</span>
    </div>
  </div>
)

const SidebarFooter = () => (
  <div className="p-3 border-t border-red-900/40 bg-black space-y-2">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[#39FF14] shadow-[0_0_6px_#39FF14]" />
        <span className="text-[11px] font-mono text-neutral-400">Polygon Active</span>
      </div>
      <span className="text-[10px] font-mono text-[#FF5F1F]">v1.0.0</span>
    </div>
  </div>
)

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger — always visible on mobile, overlays header */}
      <button
        className="fixed top-[3.375rem] left-4 z-40 md:hidden w-9 h-9 flex items-center justify-center bg-void-100 border border-red-900/40 rounded-lg text-neutral-400 hover:text-white hover:border-brand-500/40 transition-all"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[65] bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-black border-r border-red-900/40 flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-red-900/40">
          <Logo />
          <button onClick={() => setMobileOpen(false)} className="text-neutral-500 hover:text-white text-2xl leading-none ml-2">
            &times;
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks onClick={() => setMobileOpen(false)} />
        </nav>
        <SidebarFooter />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex sticky top-11 w-64 h-[calc(100dvh-2.75rem)] bg-black border-r border-red-900/40 flex-col flex-shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-red-900/40">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
        <SidebarFooter />
      </aside>
    </>
  )
}
