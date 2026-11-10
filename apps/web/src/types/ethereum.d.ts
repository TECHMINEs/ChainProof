import type { Eip1193Provider } from 'ethers'

type AccountsChangedHandler = (accounts: string[]) => void

/** Minimal typing for the EIP-1193 provider injected by MetaMask-compatible wallets. */
interface InjectedEthereumProvider extends Eip1193Provider {
  on(event: 'accountsChanged', handler: AccountsChangedHandler): void
  removeListener(event: 'accountsChanged', handler: AccountsChangedHandler): void
}

declare global {
  interface Window {
    ethereum?: InjectedEthereumProvider
  }
}

export {}
