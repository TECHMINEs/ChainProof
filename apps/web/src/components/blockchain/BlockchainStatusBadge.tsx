"use client"
import React from 'react'

export interface BlockchainStatusBadgeProps {
  status: string;
  txHash?: string;
}

export function BlockchainStatusBadge({ status, txHash }: BlockchainStatusBadgeProps) {
  let bgColor = 'bg-[#0a0a0a] text-neutral-200 dark:bg-[#111111] dark:text-neutral-300';
  let dotColor = 'bg-neutral-700';
  let label = status;

  if (status === 'SYNCED') {
    bgColor = 'bg-green-950/40 text-green-400 dark:bg-green-900/30 dark:text-green-400 border border-green-500/20';
    dotColor = 'bg-green-500 animate-pulse';
    label = 'Secured on EVM';
  } else if (status === 'PENDING') {
    bgColor = 'bg-yellow-950/40 text-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-500/20';
    dotColor = 'bg-yellow-500';
  } else if (status === 'FAILED') {
    bgColor = 'bg-red-950/40 text-red-400 dark:bg-red-900/30 dark:text-red-400 border border-red-500/20';
    dotColor = 'bg-red-500';
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} />
      {label}
      {txHash && (
        <a 
          href={`https://polygonscan.com/tx/${txHash}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-2 underline opacity-75 hover:opacity-100 truncate max-w-[100px]"
          title={txHash}
        >
          {txHash.substring(0, 8)}...
        </a>
      )}
    </div>
  )
}
