"use client"
import React from 'react'
import type { UserRole } from '@chainproof/types'

export function RoleBadge({ role }: { role: UserRole | string }) {
  const styles: Record<string, string> = {
    ADMIN: 'bg-red-950/40 text-red-400 dark:bg-red-900/30 dark:text-red-300 border border-red-500/40 dark:border-red-800/50',
    OFFICER: 'bg-cyan-950/40 text-cyan-400 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-500/40 dark:border-cyan-800/50',
    REGISTRAR: 'bg-orange-950/40 text-orange-400 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-500/40 dark:border-orange-800/50',
    AUDITOR: 'bg-emerald-950/40 text-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-500/40 dark:border-emerald-800/50',
  }

  const defaultStyle = 'bg-[#0a0a0a] text-white dark:bg-[#111111] dark:text-neutral-300 border border-red-900/40 dark:border-red-900/40'

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[role] || defaultStyle}`}>
      {role}
    </span>
  )
}
