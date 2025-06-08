import { create } from 'zustand'
import { WalletState } from '@/types/governance'

interface WalletStore extends WalletState {
  connect: (walletName: string) => Promise<void>
  disconnect: () => void
  updateBalance: () => Promise<void>
  setAddress: (address: string) => void
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  isConnected: false,
  address: null,
  balance: 0,
  supportedWallets: ['nami', 'eternl', 'flint', 'yoroi', 'gerowallet'],
  connectedWallet: null,

  connect: async (walletName: string) => {
    try {
      // Check if wallet is available
      if (typeof window !== 'undefined' && window.cardano && window.cardano[walletName]) {
        const api = await window.cardano[walletName].enable()
        const addresses = await api.getUsedAddresses()
        
        if (addresses.length > 0) {
          // Convert address from hex if needed
          const address = addresses[0]
          
          // Get balance
          const balance = await api.getBalance()
          const balanceValue = parseInt(balance, 16) / 1000000 // Convert from lovelace to ADA
          
          set({
            isConnected: true,
            address,
            balance: balanceValue,
            connectedWallet: walletName,
          })
        }
      } else {
        throw new Error(`${walletName} wallet not found`)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      address: null,
      balance: 0,
      connectedWallet: null,
    })
  },

  updateBalance: async () => {
    const { connectedWallet } = get()
    if (connectedWallet && typeof window !== 'undefined' && window.cardano) {
      try {
        const api = await window.cardano[connectedWallet].enable()
        const balance = await api.getBalance()
        const balanceValue = parseInt(balance, 16) / 1000000
        set({ balance: balanceValue })
      } catch (error) {
        console.error('Failed to update balance:', error)
      }
    }
  },

  setAddress: (address: string) => {
    set({ address })
  },
}))

// Type declarations for Cardano wallets
declare global {
  interface Window {
    cardano?: {
      [key: string]: {
        enable: () => Promise<{
          getUsedAddresses: () => Promise<string[]>
          getBalance: () => Promise<string>
          signTx: (tx: string) => Promise<string>
          signData: (address: string, payload: string) => Promise<{
            signature: string
            key: string
          }>
        }>
        isEnabled: () => Promise<boolean>
        name: string
        icon: string
      }
    }
  }
}