"use client"
import React from 'react'
import type { UserRole } from '@chainproof/types'

export function RoleBadge({ role }: { role: UserRole | string }) {
  const styles: Record<string, string> = {
    ADMIN: 'bg-red-950/40 text-red-400 dark:bg-red-900/30 dark:text-red-300 border border-red-500/40 dark:border-line',
    OFFICER: 'bg-panel-2 text-white dark:bg-panel-2 dark:text-white border border-stroke dark:border-stroke',
    REGISTRAR: 'bg-panel-2 text-white dark:bg-panel-2 dark:text-white border border-stroke dark:border-stroke',
    AUDITOR: 'bg-green-950/40 text-green-400 dark:bg-green-900/30 dark:text-green-300 border border-green-500/40 dark:border-green-800/50',
  }

  const defaultStyle = 'bg-[#0a0a0a] text-white dark:bg-[#111111] dark:text-neutral-300 border border-line dark:border-line'

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${styles[role] || defaultStyle}`}>
      {role}
    </span>
  )
}
