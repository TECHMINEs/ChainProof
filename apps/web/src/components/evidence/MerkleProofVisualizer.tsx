"use client"
import React from 'react'

export interface MerkleProofVisualizerProps {
  batchId: string;
  root: string;
  txHash?: string;
  leavesCount: number;
}

export function MerkleProofVisualizer({ batchId, root, txHash, leavesCount }: MerkleProofVisualizerProps) {
  return (
    <div className="p-4 bg-[#050505] rounded-lg text-green-400 font-mono text-sm border border-red-900/40 shadow-inner">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-bold text-white">MERKLE CHECKPOINT</span>
      </div>
      <div>BATCH ID: {batchId}</div>
      <div className="truncate mt-1">ROOT: {root}</div>
      <div className="mt-1">LEAVES: {leavesCount}</div>
      {txHash && (
        <div className="truncate mt-2 pt-2 border-t border-red-900/40 text-cyan-400">
          TX: {txHash}
        </div>
      )}
    </div>
  )
}
