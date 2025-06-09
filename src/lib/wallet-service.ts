/**
 * Cardano Wallet Service
 * Handles wallet detection, connection, and blockchain interactions
 */

import { 
  CardanoWallet, 
  CardanoWalletApi, 
  WalletInfo, 
  WalletConnection, 
  StakingInfo,
  SupportedWalletName, 
  SUPPORTED_WALLETS, 
  WALLET_CONFIG,
  WalletError,
  DataSignature,
  UnsignedTransaction,
  TokenBalance
} from '../types/wallet';

declare global {
  interface Window {
    cardano?: {
      [key: string]: CardanoWallet;
    };
  }
}

export class WalletService {
  private static instance: WalletService;
  private connectedWallet: CardanoWalletApi | null = null;
  private connectedWalletName: SupportedWalletName | null = null;

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  /**
   * Detect all available Cardano wallets in the browser
   */
  async detectAvailableWallets(): Promise<WalletInfo[]> {
    if (typeof window === 'undefined') {
      return [];
    }

    const wallets: WalletInfo[] = [];

    for (const walletName of SUPPORTED_WALLETS) {
      try {
        const walletConfig = WALLET_CONFIG[walletName];
        const cardanoWallet = window.cardano?.[walletName];

        let isInstalled = false;
        let isEnabled = false;
        let version = 'Unknown';

        if (cardanoWallet) {
          isInstalled = true;
          version = cardanoWallet.apiVersion || cardanoWallet.version || 'Unknown';
          
          try {
            isEnabled = await cardanoWallet.isEnabled();
          } catch (error) {
            console.warn(`Error checking if ${walletName} is enabled:`, error);
            isEnabled = false;
          }
        }

        wallets.push({
          ...walletConfig,
          version,
          isInstalled,
          isEnabled
        });
      } catch (error) {
        console.warn(`Error detecting wallet ${walletName}:`, error);
        
        // Still add the wallet info even if detection fails
        wallets.push({
          ...WALLET_CONFIG[walletName],
          version: 'Unknown',
          isInstalled: false,
          isEnabled: false
        });
      }
    }

    return wallets.sort((a, b) => {
      // Sort by: installed first, then enabled, then alphabetically
      if (a.isInstalled !== b.isInstalled) {
        return a.isInstalled ? -1 : 1;
      }
      if (a.isEnabled !== b.isEnabled) {
        return a.isEnabled ? -1 : 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }

  /**
   * Connect to a specific wallet
   */
  async connectWallet(walletName: SupportedWalletName): Promise<WalletConnection> {
    if (typeof window === 'undefined') {
      throw new WalletError(
        'Window object not available',
        'WALLET_NOT_FOUND',
        walletName
      );
    }

    const cardanoWallet = window.cardano?.[walletName];
    
    if (!cardanoWallet) {
      throw new WalletError(
        `Wallet ${walletName} not found. Please make sure it's installed.`,
        'WALLET_NOT_FOUND',
        walletName
      );
    }

    try {
      // Enable the wallet connection
      const walletApi = await cardanoWallet.enable();
      this.connectedWallet = walletApi;
      this.connectedWalletName = walletName;

      // Get wallet information
      const [networkId, balance, usedAddresses, unusedAddresses, changeAddress, rewardAddresses] = 
        await Promise.all([
          walletApi.getNetworkId(),
          walletApi.getBalance(),
          walletApi.getUsedAddresses(),
          walletApi.getUnusedAddresses(),
          walletApi.getChangeAddress(),
          walletApi.getRewardAddresses()
        ]);

      // Parse balance and assets
      const parsedBalance = await this.parseBalance(balance);

      const connection: WalletConnection = {
        isConnected: true,
        isConnecting: false,
        walletName,
        walletApi,
        networkId,
        addresses: {
          used: usedAddresses,
          unused: unusedAddresses,
          change: changeAddress,
          reward: rewardAddresses
        },
        balance: parsedBalance,
        error: null
      };

      // Store connection info in localStorage for auto-reconnect
      this.saveConnectionInfo(walletName);

      return connection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new WalletError(
        `Failed to connect to ${walletName}: ${errorMessage}`,
        'CONNECTION_FAILED',
        walletName
      );
    }
  }

  /**
   * Disconnect the current wallet
   */
  disconnect(): void {
    this.connectedWallet = null;
    this.connectedWalletName = null;
    this.clearConnectionInfo();
  }

  /**
   * Get the current wallet connection status
   */
  isConnected(): boolean {
    return this.connectedWallet !== null;
  }

  /**
   * Get current connected wallet name
   */
  getConnectedWalletName(): SupportedWalletName | null {
    return this.connectedWalletName;
  }

  /**
   * Refresh wallet balance
   */
  async refreshBalance(): Promise<WalletConnection['balance']> {
    if (!this.connectedWallet) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }

    try {
      const balance = await this.connectedWallet.getBalance();
      return await this.parseBalance(balance);
    } catch (error) {
      throw new WalletError(
        `Failed to refresh balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Get staking information for the connected wallet
   */
  async getStakingInfo(): Promise<StakingInfo> {
    if (!this.connectedWallet) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }

    try {
      const rewardAddresses = await this.connectedWallet.getRewardAddresses();
      
      if (rewardAddresses.length === 0) {
        return {
          isStakeKeyRegistered: false,
          delegatedPoolId: null,
          delegatedDRepId: null,
          votingPower: '0',
          rewards: '0'
        };
      }

      // Note: This would typically require querying a Cardano indexer/API
      // For now, return a basic structure - this would be enhanced with actual blockchain queries
      const stakingInfo: StakingInfo = {
        isStakeKeyRegistered: true,
        delegatedPoolId: null, // Would be fetched from blockchain
        delegatedDRepId: null, // Would be fetched from blockchain
        votingPower: '0', // Would be calculated from delegation
        rewards: '0' // Would be fetched from blockchain
      };

      return stakingInfo;
    } catch (error) {
      throw new WalletError(
        `Failed to get staking info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Sign a transaction
   */
  async signTransaction(tx: UnsignedTransaction): Promise<string> {
    if (!this.connectedWallet) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }

    try {
      const signedTx = await this.connectedWallet.signTx(tx.body, false);
      return signedTx;
    } catch (error) {
      if (error instanceof Error && error.message.includes('rejected')) {
        throw new WalletError('Transaction was rejected by user', 'TRANSACTION_REJECTED');
      }
      throw new WalletError(
        `Failed to sign transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SIGNING_FAILED'
      );
    }
  }

  /**
   * Submit a signed transaction
   */
  async submitTransaction(signedTx: string): Promise<string> {
    if (!this.connectedWallet) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }

    try {
      const txHash = await this.connectedWallet.submitTx(signedTx);
      return txHash;
    } catch (error) {
      throw new WalletError(
        `Failed to submit transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SUBMISSION_FAILED'
      );
    }
  }

  /**
   * Sign arbitrary data
   */
  async signData(address: string, payload: string): Promise<DataSignature> {
    if (!this.connectedWallet) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }

    try {
      const signature = await this.connectedWallet.signData(address, payload);
      return signature;
    } catch (error) {
      throw new WalletError(
        `Failed to sign data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SIGNING_FAILED'
      );
    }
  }

  /**
   * Get UTXOs from the connected wallet
   */
  async getUtxos(amount?: string): Promise<string[]> {
    if (!this.connectedWallet) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }

    try {
      return await this.connectedWallet.getUtxos(amount);
    } catch (error) {
      throw new WalletError(
        `Failed to get UTXOs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Get collateral UTXOs
   */
  async getCollateral(): Promise<string[]> {
    if (!this.connectedWallet) {
      throw new WalletError('No wallet connected', 'CONNECTION_FAILED');
    }

    try {
      return await this.connectedWallet.getCollateral();
    } catch (error) {
      throw new WalletError(
        `Failed to get collateral: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Auto-reconnect to previously connected wallet
   */
  async autoReconnect(): Promise<WalletConnection | null> {
    const savedWalletName = this.getSavedWalletName();
    
    if (!savedWalletName) {
      return null;
    }

    try {
      return await this.connectWallet(savedWalletName);
    } catch (error) {
      console.warn('Auto-reconnect failed:', error);
      this.clearConnectionInfo();
      return null;
    }
  }

  /**
   * Utility: Parse CBOR balance into structured format
   */
  private async parseBalance(cborBalance: string): Promise<WalletConnection['balance']> {
    // This is a simplified version - in a real implementation,
    // you would use a CBOR library to properly decode the balance
    
    try {
      // For now, assume the balance is just ADA amount in lovelace
      // This would be replaced with proper CBOR parsing
      const balance = {
        ada: cborBalance || '0',
        assets: [] as TokenBalance[]
      };

      return balance;
    } catch (error) {
      console.warn('Error parsing balance:', error);
      return {
        ada: '0',
        assets: []
      };
    }
  }

  /**
   * Utility: Format ADA amount
   */
  formatAdaAmount(lovelace: string): string {
    const ada = parseInt(lovelace) / 1_000_000;
    return ada.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  }

  /**
   * Utility: Shorten address for display
   */
  shortenAddress(address: string, length = 8): string {
    if (!address || address.length <= length * 2) {
      return address;
    }
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  }

  /**
   * Utility: Check if wallet supports specific features
   */
  async getWalletCapabilities(walletName: SupportedWalletName): Promise<string[]> {
    const cardanoWallet = window.cardano?.[walletName];
    
    if (!cardanoWallet) {
      return [];
    }

    try {
      const api = await cardanoWallet.enable();
      const capabilities = [];

      // Check for standard CIP-30 methods
      if (typeof api.signTx === 'function') capabilities.push('signTx');
      if (typeof api.signData === 'function') capabilities.push('signData');
      if (typeof api.submitTx === 'function') capabilities.push('submitTx');
      if (typeof api.getCollateral === 'function') capabilities.push('getCollateral');
      
      // Check for experimental features
      if (api.experimental) {
        if (typeof api.experimental.getCollateral === 'function') {
          capabilities.push('experimental.getCollateral');
        }
        if (typeof api.experimental.signTxs === 'function') {
          capabilities.push('experimental.signTxs');
        }
      }

      return capabilities;
    } catch (error) {
      console.warn(`Error checking capabilities for ${walletName}:`, error);
      return [];
    }
  }

  /**
   * Private: Save connection info to localStorage
   */
  private saveConnectionInfo(walletName: SupportedWalletName): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('cardano-wallet-connection', JSON.stringify({
        walletName,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save wallet connection info:', error);
    }
  }

  /**
   * Private: Get saved wallet name from localStorage
   */
  private getSavedWalletName(): SupportedWalletName | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const saved = localStorage.getItem('cardano-wallet-connection');
      if (saved) {
        const { walletName, timestamp } = JSON.parse(saved);
        
        // Only auto-reconnect if saved within last 24 hours
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (timestamp > oneDayAgo && SUPPORTED_WALLETS.includes(walletName)) {
          return walletName;
        }
      }
    } catch (error) {
      console.warn('Failed to get saved wallet info:', error);
    }
    
    return null;
  }

  /**
   * Private: Clear connection info from localStorage
   */
  private clearConnectionInfo(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('cardano-wallet-connection');
    } catch (error) {
      console.warn('Failed to clear wallet connection info:', error);
    }
  }
}

// Export singleton instance
export const walletService = WalletService.getInstance(); 