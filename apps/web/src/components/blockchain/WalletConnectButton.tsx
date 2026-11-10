"use client"
import React, { useState } from 'react'
import { ethers } from 'ethers'

export interface WalletConnectButtonProps {
  onConnect: (address: string) => void;
  currentAddress?: string | null;
}

export function WalletConnectButton({ onConnect, currentAddress }: WalletConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setError('');
    if (!window.ethereum) {
      setError('No Web3 wallet detected. Install MetaMask or a compatible wallet.');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts: string[] = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        onConnect(accounts[0]);
      }
    } catch {
      setError('Wallet connection was rejected or failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (currentAddress) {
    return (
      <div className="inline-flex items-center px-3 py-1.5 bg-black border border-red-900/40 text-sm text-white font-mono">
        <div className="w-2 h-2 bg-[#39FF14] shadow-[0_0_6px_#39FF14] mr-2" />
        {currentAddress.substring(0, 6)}...{currentAddress.substring(currentAddress.length - 4)}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="inline-flex items-center px-4 py-2 bg-black border border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black hover:shadow-cyber-cyan text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <p role="alert" className="text-xs text-[#FF5F1F]">{error}</p>}
    </div>
  )
}
