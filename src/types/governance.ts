/**
 * Cardano Governance Platform - Type Definitions
 * Based on the data structures specification for the governance platform
 */

import { z } from 'zod';

// Base utility types
export type Timestamp = Date;
export type CardanoAddress = string;
export type TransactionHash = string;
export type PublicKey = string;

// User/Address Entity Types
export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  website: string;
  social: {
    twitter: string;
    discord: string;
    telegram: string;
  };
}

export interface User {
  address: CardanoAddress;
  publicKey: PublicKey;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  roles: UserRole[];
  profile: UserProfile;
  isActive: boolean;
  totalStake: number; // For DReps and SPOs
}

export type UserRole = 
  | 'participant' 
  | 'drep' 
  | 'proposer' 
  | 'delegator' 
  | 'spo' 
  | 'constitutional-council';

// DRep (Delegate Representative) Types
export interface DRepMetadata {
  manifesto: string;
  experience: string;
  focusAreas: DRepFocusArea[];
  votingPhilosophy: string;
}

export interface DRepPerformance {
  totalVotes: number;
  participationRate: number;
  avgResponseTime: number; // Hours
  reputation: number; // 1-5 rating
}

export interface DRep {
  id: string;
  address: CardanoAddress;
  registrationTxHash: TransactionHash;
  registrationDate: Timestamp;
  status: DRepStatus;
  votingPower: number;
  delegatorCount: number;
  metadata: DRepMetadata;
  performance: DRepPerformance;
}

export type DRepStatus = 'active' | 'inactive' | 'retired';

export type DRepFocusArea = 
  | 'technical' 
  | 'governance' 
  | 'community' 
  | 'education' 
  | 'security' 
  | 'protocol' 
  | 'treasury'
  | 'sustainability';

// Governance Action/Proposal Types
export interface GovernanceActionMetadata {
  category: string;
  tags: string[];
  estimatedImpact: ImpactLevel;
  technicalSpecs: Record<string, unknown>;
  budgetRequest?: number; // For treasury proposals
}

export interface VoteBreakdown {
  yes: number;
  no: number;
  abstain: number;
}

export interface GovernanceVotes {
  drep: VoteBreakdown;
  spo: VoteBreakdown;
  constitutionalCouncil: VoteBreakdown;
}

export interface VoteThresholds {
  drepThreshold: number;
  spoThreshold: number;
  ccThreshold: number;
}

export interface GovernanceAction {
  id: string;
  proposerId: CardanoAddress;
  type: GovernanceActionType;
  title: string;
  description: string;
  rationale: string;
  submissionTxHash: TransactionHash;
  submissionDate: Timestamp;
  votingStartDate: Timestamp;
  votingEndDate: Timestamp;
  status: GovernanceActionStatus;
  metadata: GovernanceActionMetadata;
  votes: GovernanceVotes;
  thresholds: VoteThresholds;
  outcome: GovernanceOutcome | null;
  finalizedAt?: Timestamp;
}

export type GovernanceActionType = 
  | 'parameter-change'
  | 'hard-fork'
  | 'treasury-withdrawal'
  | 'constitutional-change'
  | 'new-committee'
  | 'no-confidence'
  | 'update-committee';

export type GovernanceActionStatus = 
  | 'pending'
  | 'active'
  | 'expired'
  | 'ratified'
  | 'rejected';

export type GovernanceOutcome = 'ratified' | 'not-ratified';

export type ImpactLevel = 'low' | 'medium' | 'high';

// Vote Entity Types
export interface Vote {
  id: string;
  proposalId: string;
  voterId: CardanoAddress;
  voterType: VoterType;
  vote: VoteChoice;
  votingPower: number;
  txHash: TransactionHash;
  timestamp: Timestamp;
  rationale?: string;
}

export type VoterType = 'drep' | 'spo' | 'constitutional-council';
export type VoteChoice = 'yes' | 'no' | 'abstain';

// Delegation Entity Types
export interface Delegation {
  id: string;
  delegatorAddress: CardanoAddress;
  drepId: string;
  stake: number;
  txHash: TransactionHash;
  delegationDate: Timestamp;
  status: DelegationStatus;
  withdrawnAt?: Timestamp;
}

export type DelegationStatus = 'active' | 'withdrawn';

// Stake Pool Operator (SPO) Types
export interface SPOMetadata {
  description: string;
  homepage: string;
}

export interface SPO {
  poolId: string;
  operatorAddress: CardanoAddress;
  poolName: string;
  ticker: string;
  pledge: number;
  margin: number;
  fixedCost: number;
  stake: number;
  delegatorCount: number;
  status: SPOStatus;
  metadata: SPOMetadata;
}

export type SPOStatus = 'active' | 'retiring' | 'retired';

// Constitutional Council Types
export interface ConstitutionalCouncil {
  id: string;
  memberAddress: CardanoAddress;
  appointmentDate: Timestamp;
  termEnd: Timestamp;
  status: CCStatus;
  keyHash: string;
}

export type CCStatus = 'active' | 'expired';

// Wallet Integration Types
export interface WalletInfo {
  name: string;
  icon: string;
  version: string;
  isEnabled: boolean;
  isConnected: boolean;
  supportedFeatures: WalletFeature[];
}

export type WalletFeature = 
  | 'signTx' 
  | 'signData' 
  | 'submitTx' 
  | 'getUtxos' 
  | 'getCollateral' 
  | 'getBalance' 
  | 'getUsedAddresses' 
  | 'getUnusedAddresses' 
  | 'getChangeAddress' 
  | 'getRewardAddresses' 
  | 'signTxs' 
  | 'experimental';

export interface WalletState {
  isConnecting: boolean;
  connectedWallet: string | null;
  availableWallets: WalletInfo[];
  address: CardanoAddress | null;
  balance: number;
  utxos: unknown[];
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Timestamp;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProposalListParams {
  page?: number;
  limit?: number;
  status?: GovernanceActionStatus[];
  type?: GovernanceActionType[];
  search?: string;
  sortBy?: 'date' | 'title' | 'votingPower';
  sortOrder?: 'asc' | 'desc';
}

export interface DRepListParams {
  page?: number;
  limit?: number;
  status?: DRepStatus[];
  focusAreas?: DRepFocusArea[];
  minVotingPower?: number;
  minParticipationRate?: number;
  search?: string;
  sortBy?: 'votingPower' | 'delegatorCount' | 'participationRate' | 'reputation';
  sortOrder?: 'asc' | 'desc';
}

// Form Types for Proposal Creation
export interface ProposalFormData {
  type: GovernanceActionType;
  title: string;
  summary: string;
  description: string;
  rationale: string;
  category: string;
  tags: string[];
  estimatedImpact: ImpactLevel;
  budgetRequest?: number;
  technicalSpecs?: Record<string, unknown>;
  attachments?: File[];
}

// State Management Types
export interface GovernanceStore {
  // Current state
  currentUser: User | null;
  isWalletConnected: boolean;
  selectedProposal: GovernanceAction | null;
  selectedDRep: DRep | null;
  
  // Data
  proposals: GovernanceAction[];
  dreps: DRep[];
  userVotes: Vote[];
  userDelegations: Delegation[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  currentPage: string;
  filters: {
    proposalFilters: Partial<ProposalListParams>;
    drepFilters: Partial<DRepListParams>;
  };
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setWalletConnected: (connected: boolean) => void;
  selectProposal: (proposal: GovernanceAction | null) => void;
  selectDRep: (drep: DRep | null) => void;
  updateProposals: (proposals: GovernanceAction[]) => void;
  updateDReps: (dreps: DRep[]) => void;
  addVote: (vote: Vote) => void;
  updateFilters: (type: 'proposal' | 'drep', filters: Partial<ProposalListParams> | Partial<DRepListParams>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: string) => void;
}

// Component Props Types
export interface ProposalCardProps {
  proposal: GovernanceAction;
  onClick?: (proposal: GovernanceAction) => void;
  showVoteBreakdown?: boolean;
  compact?: boolean;
}

export interface DRepCardProps {
  drep: DRep;
  onClick?: (drep: DRep) => void;
  showMetrics?: boolean;
  showDelegateButton?: boolean;
}

export interface VoteBreakdownProps {
  votes: GovernanceVotes;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export interface VotingInterfaceProps {
  proposal: GovernanceAction;
  onVoteSubmit: (vote: VoteChoice, rationale?: string) => Promise<void>;
  isSubmitting?: boolean;
  userVotingPower?: number;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Validation Schemas (using Zod)
export const cardanoAddressSchema = z.string().regex(
  /^addr1[a-z0-9]{98}$|^addr_test1[a-z0-9]{98}$/,
  'Invalid Cardano address format'
);

export const proposalFormSchema = z.object({
  type: z.enum(['parameter-change', 'hard-fork', 'treasury-withdrawal', 'constitutional-change']),
  title: z.string().min(10).max(100),
  summary: z.string().min(50).max(500),
  description: z.string().min(100).max(5000),
  rationale: z.string().min(100).max(3000),
  category: z.string().min(1),
  tags: z.array(z.string()).min(1).max(10),
  estimatedImpact: z.enum(['low', 'medium', 'high']),
  budgetRequest: z.number().positive().optional(),
});

export const drepRegistrationSchema = z.object({
  manifesto: z.string().min(100).max(2000),
  experience: z.string().min(50).max(1000),
  focusAreas: z.array(z.enum(['technical', 'governance', 'community', 'education', 'security', 'protocol', 'treasury', 'sustainability'])).min(1),
  votingPhilosophy: z.string().min(50).max(1000),
});

// Error Types
export class GovernanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'GovernanceError';
  }
}

export class WalletError extends Error {
  constructor(
    message: string,
    public code: string,
    public walletName?: string
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Constants
export const GOVERNANCE_ACTION_TYPES: GovernanceActionType[] = [
  'parameter-change',
  'hard-fork', 
  'treasury-withdrawal',
  'constitutional-change',
  'new-committee',
  'no-confidence',
  'update-committee'
];

export const DREP_FOCUS_AREAS: DRepFocusArea[] = [
  'technical',
  'governance',
  'community', 
  'education',
  'security',
  'protocol',
  'treasury',
  'sustainability'
];

export const SUPPORTED_WALLETS = [
  'nami',
  'eternl',
  'flint',
  'yoroi',
  'gerowallet',
  'nufi',
  'typhoncip30'
] as const;

export type SupportedWallet = typeof SUPPORTED_WALLETS[number];

// Event Types for Real-time Updates
export interface GovernanceEvent {
  type: 'PROPOSAL_UPDATE' | 'VOTE_CAST' | 'DELEGATION_UPDATE' | 'DREP_UPDATE';
  data: unknown;
  timestamp: Timestamp;
}

export interface ProposalUpdateEvent extends GovernanceEvent {
  type: 'PROPOSAL_UPDATE';
  data: {
    proposalId: string;
    updates: Partial<GovernanceAction>;
  };
}

export interface VoteCastEvent extends GovernanceEvent {
  type: 'VOTE_CAST';
  data: {
    proposalId: string;
    vote: Vote;
  };
}

export interface DelegationUpdateEvent extends GovernanceEvent {
  type: 'DELEGATION_UPDATE';
  data: {
    delegation: Delegation;
  };
}

export interface DRepUpdateEvent extends GovernanceEvent {
  type: 'DREP_UPDATE';
  data: {
    drepId: string;
    updates: Partial<DRep>;
  };
}