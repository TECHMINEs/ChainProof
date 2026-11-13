"use client"
import React from 'react'
import type { IntegrityVerificationResult } from '@chainproof/types'

export interface ThreeLayerVerificationProps {
  result?: IntegrityVerificationResult
  isLoading?: boolean
}

export function ThreeLayerVerification({ result, isLoading }: ThreeLayerVerificationProps) {
  if (isLoading) {
    return <div className="p-4 rounded-lg bg-[#0a0a0a] dark:bg-[#111111] animate-pulse h-32" />
  }
  if (!result) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* DB Layer */}
      <div className={`p-4 rounded-lg border ${result.dbStatus.matches ? 'border-green-500 bg-green-950/40 dark:bg-green-900/20' : 'border-red-500 bg-red-950/40 dark:bg-red-900/20'}`}>
        <h3 className="font-bold mb-2 dark:text-white flex items-center">
          <span className="mr-2">{result.dbStatus.matches ? '✅' : '❌'}</span>
          Database Layer
        </h3>
        <p className="text-xs truncate text-neutral-400 dark:text-neutral-300">Hash: {result.dbStatus.hash || 'N/A'}</p>
      </div>

      {/* IPFS Layer */}
      <div className={`p-4 rounded-lg border ${!result.ipfsStatus.checked ? 'border-line dark:border-line' : result.ipfsStatus.matches ? 'border-green-500 bg-green-950/40 dark:bg-green-900/20' : 'border-red-500 bg-red-950/40 dark:bg-red-900/20'}`}>
        <h3 className="font-bold mb-2 dark:text-white flex items-center">
          <span className="mr-2">{!result.ipfsStatus.checked ? '⏳' : result.ipfsStatus.matches ? '✅' : '❌'}</span>
          IPFS Layer
        </h3>
        <p className="text-xs truncate text-neutral-400 dark:text-neutral-300">Hash: {result.ipfsStatus.hash || 'N/A'}</p>
      </div>

      {/* Contract Layer */}
      <div className={`p-4 rounded-lg border ${!result.chainStatus.checked ? 'border-line dark:border-line' : result.chainStatus.matches ? 'border-green-500 bg-green-950/40 dark:bg-green-900/20' : 'border-red-500 bg-red-950/40 dark:bg-red-900/20'}`}>
        <h3 className="font-bold mb-2 dark:text-white flex items-center">
          <span className="mr-2">{!result.chainStatus.checked ? '⏳' : result.chainStatus.matches ? '✅' : '❌'}</span>
          Blockchain Layer
        </h3>
        <p className="text-xs truncate text-neutral-400 dark:text-neutral-300">Hash: {result.chainStatus.hash || 'N/A'}</p>
      </div>
    </div>
  )
}
