'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { walletService } from '../../lib/wallet-service';
import { 
  WalletConnection, 
  StakingInfo, 
  WalletInfo, 
  WalletAction, 
  SupportedWalletName,
  WalletContextType,
  WalletError,
  UnsignedTransaction,
  DataSignature
} from '../../types/wallet';

// Initial wallet connection state
const initialConnection: WalletConnection = {
  isConnected: false,
  isConnecting: false,
  walletName: null,
  walletApi: null,
  networkId: null,
  addresses: {
    used: [],
    unused: [],
    change: '',
    reward: []
  },
  balance: {
    ada: '0',
    assets: []
  },
  error: null
};

// Wallet state reducer
function walletReducer(state: WalletConnection, action: WalletAction): WalletConnection {
  switch (action.type) {
    case 'CONNECT_START':
      return {
        ...state,
        isConnecting: true,
        error: null
      };
    
    case 'CONNECT_SUCCESS':
      return {
        ...action.connection,
        isConnecting: false,
        error: null
      };
    
    case 'CONNECT_ERROR':
      return {
        ...initialConnection,
        error: action.error
      };
    
    case 'DISCONNECT':
      return initialConnection;
    
    case 'UPDATE_BALANCE':
      return {
        ...state,
        balance: action.balance
      };
    
    case 'UPDATE_STAKING_INFO':
      return {
        ...state,
        // Note: StakingInfo would be stored separately in a full implementation
        error: null
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// Create context
const WalletContext = createContext<WalletContextType | null>(null);

// Context provider component
interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [connection, dispatch] = useReducer(walletReducer, initialConnection);
  const [stakingInfo, setStakingInfo] = React.useState<StakingInfo | null>(null);
  const [availableWallets, setAvailableWallets] = React.useState<WalletInfo[]>([]);

  // Detect available wallets on mount
  useEffect(() => {
    async function detectWallets() {
      try {
        const wallets = await walletService.detectAvailableWallets();
        setAvailableWallets(wallets);
      } catch (error) {
        console.warn('Failed to detect wallets:', error);
      }
    }

    detectWallets();
  }, []);

  // Auto-reconnect on mount
  useEffect(() => {
    async function autoReconnect() {
      try {
        const connection = await walletService.autoReconnect();
        if (connection) {
          dispatch({ type: 'CONNECT_SUCCESS', connection });
          
          // Also fetch staking info
          const stakingInfo = await walletService.getStakingInfo();
          setStakingInfo(stakingInfo);
        }
      } catch (error) {
        console.warn('Auto-reconnect failed:', error);
      }
    }

    autoReconnect();
  }, []);

  // Connect to a wallet
  const connectWallet = useCallback(async (walletName: SupportedWalletName) => {
    dispatch({ type: 'CONNECT_START', walletName });
    
    try {
      const connection = await walletService.connectWallet(walletName);
      dispatch({ type: 'CONNECT_SUCCESS', connection });
      
      // Fetch staking information
      try {
        const stakingInfo = await walletService.getStakingInfo();
        setStakingInfo(stakingInfo);
      } catch (stakingError) {
        console.warn('Failed to fetch staking info:', stakingError);
      }
    } catch (error) {
      const errorMessage = error instanceof WalletError 
        ? error.message 
        : 'Failed to connect wallet';
      dispatch({ type: 'CONNECT_ERROR', error: errorMessage });
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    walletService.disconnect();
    dispatch({ type: 'DISCONNECT' });
    setStakingInfo(null);
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!connection.isConnected) return;
    
    try {
      const balance = await walletService.refreshBalance();
      dispatch({ type: 'UPDATE_BALANCE', balance });
    } catch (error) {
      console.warn('Failed to refresh balance:', error);
    }
  }, [connection.isConnected]);

  // Refresh staking info
  const refreshStakingInfo = useCallback(async () => {
    if (!connection.isConnected) return;
    
    try {
      const stakingInfo = await walletService.getStakingInfo();
      setStakingInfo(stakingInfo);
    } catch (error) {
      console.warn('Failed to refresh staking info:', error);
    }
  }, [connection.isConnected]);

  // Sign transaction
  const signTransaction = useCallback(async (tx: UnsignedTransaction): Promise<string> => {
    if (!connection.isConnected) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }
    
    return await walletService.signTransaction(tx);
  }, [connection.isConnected]);

  // Submit transaction
  const submitTransaction = useCallback(async (signedTx: string): Promise<string> => {
    if (!connection.isConnected) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }
    
    return await walletService.submitTransaction(signedTx);
  }, [connection.isConnected]);

  // Sign data
  const signData = useCallback(async (address: string, payload: string): Promise<DataSignature> => {
    if (!connection.isConnected) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }
    
    return await walletService.signData(address, payload);
  }, [connection.isConnected]);

  // Utility methods
  const isWalletSupported = useCallback((walletName: string): boolean => {
    return availableWallets.some(wallet => 
      wallet.name === walletName && wallet.isInstalled
    );
  }, [availableWallets]);

  const getWalletInfo = useCallback((walletName: SupportedWalletName): WalletInfo => {
    const wallet = availableWallets.find(w => w.name === walletName);
    if (!wallet) {
      throw new Error(`Wallet ${walletName} not found`);
    }
    return wallet;
  }, [availableWallets]);

  // Context value
  const contextValue: WalletContextType = {
    // State
    connection,
    stakingInfo,
    availableWallets,
    
    // Actions
    connectWallet,
    disconnectWallet,
    refreshBalance,
    refreshStakingInfo,
    
    // Transaction methods
    signTransaction,
    submitTransaction,
    signData,
    
    // Utility methods
    isWalletSupported,
    getWalletInfo
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook to use wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return {
    ...context,
    // Additional computed properties
    isConnected: context.connection.isConnected,
    hasVotingPower: context.stakingInfo ? 
      parseInt(context.stakingInfo.votingPower) > 0 : false,
    canVote: context.connection.isConnected && context.stakingInfo?.isStakeKeyRegistered === true,
    formattedBalance: walletService.formatAdaAmount(context.connection.balance.ada),
    shortAddress: context.connection.addresses.change ? 
      walletService.shortenAddress(context.connection.addresses.change) : ''
  };
} 