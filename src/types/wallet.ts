/**
 * Cardano Wallet Integration Types
 * CIP-30 compliant wallet interface definitions
 */

// CIP-30 Standard Types
export interface CardanoWalletApi {
  // Core wallet methods
  getNetworkId(): Promise<number>;
  getUtxos(amount?: string, paginate?: PaginateObject): Promise<string[]>;
  getCollateral(params?: { amount?: string }): Promise<string[]>;
  getBalance(): Promise<string>;
  getUsedAddresses(paginate?: PaginateObject): Promise<string[]>;
  getUnusedAddresses(): Promise<string[]>;
  getChangeAddress(): Promise<string>;
  getRewardAddresses(): Promise<string[]>;
  
  // Transaction methods
  signTx(tx: string, partialSign?: boolean): Promise<string>;
  signData(addr: string, payload: string): Promise<DataSignature>;
  submitTx(tx: string): Promise<string>;
  
  // Extension methods (if supported)
  getExtensions?(): Promise<{ cip: number }[]>;
  experimental?: {
    getCollateral?(): Promise<string[]>;
    signTxs?(txs: string[], partialSign?: boolean): Promise<string[]>;
  };
}

export interface PaginateObject {
  page: number;
  limit: number;
}

export interface DataSignature {
  signature: string;
  key: string;
}

// Wallet Detection Interface
export interface CardanoWallet {
  name: string;
  icon: string;
  version: string;
  enable(): Promise<CardanoWalletApi>;
  isEnabled(): Promise<boolean>;
  apiVersion: string;
  supportedExtensions?: { cip: number }[];
}

// Supported Wallet Types
export const SUPPORTED_WALLETS = [
  'nami',
  'eternl', 
  'flint',
  'yoroi',
  'lace',
  'typhon',
  'gerowallet',
  'vespr'
] as const;

export type SupportedWalletName = typeof SUPPORTED_WALLETS[number];

// Wallet Information
export interface WalletInfo {
  name: SupportedWalletName;
  displayName: string;
  icon: string;
  version: string;
  isInstalled: boolean;
  isEnabled: boolean;
  downloadUrl: string;
  description: string;
}

// Wallet Connection State
export interface WalletConnection {
  isConnected: boolean;
  isConnecting: boolean;
  walletName: SupportedWalletName | null;
  walletApi: CardanoWalletApi | null;
  networkId: number | null;
  addresses: {
    used: string[];
    unused: string[];
    change: string;
    reward: string[];
  };
  balance: {
    ada: string; // In lovelace
    assets: TokenBalance[];
  };
  error: string | null;
}

export interface TokenBalance {
  policyId: string;
  assetName: string;
  fingerprint: string;
  amount: string;
  metadata?: {
    name?: string;
    description?: string;
    ticker?: string;
    decimals?: number;
  };
}

// Staking Information
export interface StakingInfo {
  isStakeKeyRegistered: boolean;
  delegatedPoolId: string | null;
  delegatedDRepId: string | null;
  votingPower: string; // In lovelace
  rewards: string; // Available rewards in lovelace
  poolInfo?: {
    poolId: string;
    name: string;
    ticker: string;
  };
  drepInfo?: {
    drepId: string;
    name: string;
    votingPower: string;
  };
}

// Transaction Building Types
export interface TransactionInput {
  txHash: string;
  outputIndex: number;
  amount: {
    coin: string;
    multiasset?: Record<string, Record<string, string>>;
  };
  address: string;
}

export interface TransactionOutput {
  address: string;
  amount: {
    coin: string;
    multiasset?: Record<string, Record<string, string>>;
  };
  plutusData?: string;
  scriptRef?: string;
}

export interface TransactionMetadata {
  [key: number]: any;
}

export interface UnsignedTransaction {
  body: string; // CBOR hex
  witnessSet?: string; // CBOR hex  
  metadata?: TransactionMetadata;
  auxiliary?: string; // CBOR hex
}

// Wallet Action Types
export type WalletAction = 
  | { type: 'CONNECT_START'; walletName: SupportedWalletName }
  | { type: 'CONNECT_SUCCESS'; connection: WalletConnection }
  | { type: 'CONNECT_ERROR'; error: string }
  | { type: 'DISCONNECT' }
  | { type: 'UPDATE_BALANCE'; balance: WalletConnection['balance'] }
  | { type: 'UPDATE_STAKING_INFO'; stakingInfo: StakingInfo }
  | { type: 'CLEAR_ERROR' };

// Wallet Context Type
export interface WalletContextType {
  // State
  connection: WalletConnection;
  stakingInfo: StakingInfo | null;
  availableWallets: WalletInfo[];
  
  // Actions
  connectWallet: (walletName: SupportedWalletName) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  refreshStakingInfo: () => Promise<void>;
  
  // Transaction methods
  signTransaction: (tx: UnsignedTransaction) => Promise<string>;
  submitTransaction: (signedTx: string) => Promise<string>;
  signData: (address: string, payload: string) => Promise<DataSignature>;
  
  // Utility methods
  isWalletSupported: (walletName: string) => boolean;
  getWalletInfo: (walletName: SupportedWalletName) => WalletInfo;
}

// Wallet Hook Return Type
export interface UseWalletReturn extends WalletContextType {
  // Additional computed properties
  isConnected: boolean;
  hasVotingPower: boolean;
  canVote: boolean;
  formattedBalance: string;
  shortAddress: string;
}

// Error Types
export class WalletError extends Error {
  constructor(
    message: string,
    public code: WalletErrorCode,
    public walletName?: SupportedWalletName
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

export type WalletErrorCode =
  | 'WALLET_NOT_FOUND'
  | 'WALLET_NOT_ENABLED'
  | 'CONNECTION_FAILED'
  | 'TRANSACTION_REJECTED'
  | 'INSUFFICIENT_FUNDS'
  | 'NETWORK_ERROR'
  | 'SIGNING_FAILED'
  | 'SUBMISSION_FAILED'
  | 'UNSUPPORTED_FEATURE';

// Wallet Constants
export const WALLET_CONFIG: Record<SupportedWalletName, Omit<WalletInfo, 'isInstalled' | 'isEnabled' | 'version'>> = {
  nami: {
    name: 'nami',
    displayName: 'Nami',
    icon: '🌊',
    downloadUrl: 'https://www.namiwallet.io/',
    description: 'Light wallet for Cardano'
  },
  eternl: {
    name: 'eternl',
    displayName: 'Eternl',
    icon: '⚡',
    downloadUrl: 'https://eternl.io/',
    description: 'Feature-rich Cardano wallet'
  },
  flint: {
    name: 'flint',
    displayName: 'Flint',
    icon: '🔥',
    downloadUrl: 'https://flint-wallet.com/',
    description: 'Mobile-first Cardano wallet'
  },
  yoroi: {
    name: 'yoroi',
    displayName: 'Yoroi',
    icon: '🏛️',
    downloadUrl: 'https://yoroi-wallet.com/',
    description: 'EMURGO official wallet'
  },
  lace: {
    name: 'lace',
    displayName: 'Lace',
    icon: '🪢',
    downloadUrl: 'https://www.lace.io/',
    description: 'IOG developed wallet'
  },
  typhon: {
    name: 'typhon',
    displayName: 'Typhon',
    icon: '🌪️',
    downloadUrl: 'https://typhonwallet.io/',
    description: 'Advanced features wallet'
  },
  gerowallet: {
    name: 'gerowallet',
    displayName: 'GeroWallet',
    icon: '🦎',
    downloadUrl: 'https://gerowallet.io/',
    description: 'European focused wallet'
  },
  vespr: {
    name: 'vespr',
    displayName: 'Vespr',
    icon: '🔒',
    downloadUrl: 'https://vespr.xyz/',
    description: 'Privacy focused wallet'
  }
};

// Network Configuration
export const NETWORK_CONFIG = {
  mainnet: {
    id: 1,
    name: 'Mainnet',
    magic: 764824073
  },
  testnet: {
    id: 0,
    name: 'Testnet',
    magic: 1097911063
  }
} as const;

// Utility Types
export type NetworkId = keyof typeof NETWORK_CONFIG;

export interface WalletStorage {
  lastConnectedWallet: SupportedWalletName | null;
  autoReconnect: boolean;
  preferences: {
    showTestnet: boolean;
    defaultNetwork: NetworkId;
  };
} 