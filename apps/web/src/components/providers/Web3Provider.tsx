"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'

interface Web3ContextType {
  address: string | null;
  setAddress: (addr: string | null) => void;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  setAddress: () => {},
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already connected and permitted
    const ethereum = window.ethereum;
    if (!ethereum) return;

    ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) setAddress(accounts[0]);
      })
      .catch(() => setAddress(null));

    const handleAccountsChanged = (accounts: string[]) => setAddress(accounts[0] ?? null);
    ethereum.on('accountsChanged', handleAccountsChanged);
    return () => ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  return (
    <Web3Context.Provider value={{ address, setAddress }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context);
