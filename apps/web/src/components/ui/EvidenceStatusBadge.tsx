"use client"
import React from 'react'
import type { EvidenceStatus } from '@chainproof/types'

export function EvidenceStatusBadge({ status }: { status: EvidenceStatus | string }) {
  const styles: Record<string, string> = {
    REGISTERED: 'bg-[#0a0a0a] text-white dark:bg-[#111111] dark:text-neutral-300',
    IN_TRANSIT: 'bg-panel-2 text-white dark:bg-panel-2 dark:text-white',
    STORED: 'bg-panel-2 text-white dark:bg-panel-2 dark:text-white',
    VERIFIED: 'bg-green-950/40 text-green-400 dark:bg-green-900/30 dark:text-green-300',
    FLAGGED: 'bg-red-950/40 text-red-400 dark:bg-red-900/30 dark:text-red-300 animate-pulse',
    ARCHIVED: 'bg-[#0a0a0a] text-white dark:bg-[#111111] dark:text-neutral-400',
  }

  const defaultStyle = 'bg-[#0a0a0a] text-white dark:bg-[#111111] dark:text-neutral-300'

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${styles[status] || defaultStyle}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
