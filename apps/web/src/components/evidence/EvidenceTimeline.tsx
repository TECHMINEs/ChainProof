"use client"
import React from 'react'
import type { Transfer } from '@chainproof/types'

export interface EvidenceTimelineProps {
  transfers: Transfer[]
}

export function EvidenceTimeline({ transfers }: EvidenceTimelineProps) {
  return (
    <div className="flex flex-col space-y-4">
      {transfers.map((t, i) => (
        <div key={t.id || i} className="flex relative items-start dark:text-neutral-200">
          <div className="h-full w-px bg-[#141414] dark:bg-[#111111] absolute left-4 top-4" />
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white z-10 border-4 border-white dark:border-red-900/40">
            {i + 1}
          </div>
          <div className="ml-4 bg-[#0a0a0a] dark:bg-[#111111] p-4 rounded-lg flex-1 border border-red-900/40 dark:border-red-900/40 shadow-sm">
            <h4 className="font-semibold">{t.purpose || 'Transfer'}</h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">From: {t.fromUser?.name}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">To: {t.toUser?.name}</p>
            <p className="text-xs text-neutral-400 mt-2">{new Date(t.transferredAt).toLocaleString()}</p>
            {t.status === 'COMPLETED' && (
              <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 bg-green-950/40 text-green-400 dark:bg-green-900 dark:text-green-300 rounded">
                COMPLETED
              </span>
            )}
            {t.status === 'PENDING' && (
              <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 bg-yellow-950/40 text-yellow-400 dark:bg-yellow-900 dark:text-yellow-300 rounded">
                PENDING
              </span>
            )}
          </div>
        </div>
      ))}
      {transfers.length === 0 && (
        <div className="text-neutral-500 dark:text-neutral-400 italic">No transfers recorded yet.</div>
      )}
    </div>
  )
}
