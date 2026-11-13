"use client"
import React from 'react'

export interface ZKProofBadgeProps {
  hasProof: boolean;
  onClick?: () => void;
}

export function ZKProofBadge({ hasProof, onClick }: ZKProofBadgeProps) {
  if (!hasProof) return null;

  return (
    <button 
      onClick={onClick}
      className="inline-flex items-center px-2.5 py-0.5 rounded border border-stroke bg-panel-2 dark:bg-panel-2 text-white dark:text-white text-xs font-semibold hover:bg-panel-2 dark:hover:bg-panel-2 transition-colors"
    >
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      zk-SNARK Validated
    </button>
  )
}
