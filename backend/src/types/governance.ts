import { z } from 'zod';

// Base Entity Types
export interface BaseEntity {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  EntityType: string;
  CreatedAt: string;
  UpdatedAt: string;
  TTL?: number;
}

// User Entity
export interface UserEntity extends BaseEntity {
  PK: `USER#${string}`; // USER#addr1...
  SK: 'PROFILE';
  EntityType: 'USER';
  Data: {
    address: string;
    publicKey: string;
    roles: UserRole[];
    profile: {
      name: string;
      bio: string;
      avatar: string;
      website: string;
      social: {
        twitter?: string;
        discord?: string;
        telegram?: string;
        github?: string;
      };
    };
    isActive: boolean;
    totalStake: number;
    lastActiveAt: string;
    preferences: {
      notifications: {
        email: boolean;
        push: boolean;
        proposalUpdates: boolean;
        votingReminders: boolean;
      };
      privacy: {
        showVotingHistory: boolean;
        showDelegations: boolean;
      };
    };
  };
}

// DRep Entity
export interface DRepEntity extends BaseEntity {
  PK: `DREP#${string}`; // DREP#drep1...
  SK: 'PROFILE';
  GSI1PK: `STATUS#${DRepStatus}`;
  GSI1SK: `PERFORMANCE#${string}`; // For sorting by performance
  GSI2PK: `VOTING_POWER#${string}`;
  GSI2SK: `DREP#${string}`;
  EntityType: 'DREP';
  Data: {
    address: string;
    registrationTxHash: string;
    registrationDate: string;
    status: DRepStatus;
    votingPower: number;
    delegatorCount: number;
    metadata: {
      manifesto: string;
      experience: string;
      focusAreas: string[];
      votingPhilosophy: string;
      qualifications: string[];
      commitments: string[];
    };
    performance: {
      totalVotes: number;
      participationRate: number; // Percentage
      avgResponseTime: number; // Hours
      reputation: number; // 0-100 score
      consistencyScore: number; // 0-100 score
      transparencyScore: number; // 0-100 score
    };
    contact: {
      email?: string;
      website?: string;
      social: {
        twitter?: string;
        discord?: string;
        telegram?: string;
      };
    };
  };
}

// Governance Proposal Entity
export interface ProposalEntity extends BaseEntity {
  PK: `PROPOSAL#${string}`; // PROPOSAL#prop1...
  SK: 'METADATA';
  GSI1PK: `STATUS#${ProposalStatus}`;
  GSI1SK: `TYPE#${string}#${string}`; // For filtering by type and date
  GSI2PK: `PROPOSER#${string}`;
  GSI2SK: `DATE#${string}`;
  EntityType: 'PROPOSAL';
  Data: {
    proposerId: string;
    type: ProposalType;
    title: string;
    description: string;
    rationale: string;
    submissionTxHash: string;
    submissionDate: string;
    votingStartDate: string;
    votingEndDate: string;
    status: ProposalStatus;
    metadata: {
      category: string;
      tags: string[];
      estimatedImpact: 'low' | 'medium' | 'high';
      technicalSpecs?: Record<string, any>;
      budgetRequest?: number;
      documentUrls?: string[];
    };
    votes: {
      drep: VoteTally;
      spo: VoteTally;
      constitutionalCouncil: VoteTally;
    };
    thresholds: {
      drepThreshold: number;
      spoThreshold: number;
      ccThreshold: number;
    };
    outcome?: 'ratified' | 'not-ratified';
    finalizedAt?: string;
    statistics: {
      totalVoters: number;
      participationRate: number;
      discussionCount: number;
      viewCount: number;
    };
  };
}

// Vote Entity
export interface VoteEntity extends BaseEntity {
  PK: `PROPOSAL#${string}`; // PROPOSAL#prop1...
  SK: `VOTE#${string}#${string}`; // VOTE#voterId#timestamp
  GSI1PK: `VOTER#${string}`;
  GSI1SK: `DATE#${string}`;
  GSI2PK: `PROPOSAL#${string}`;
  GSI2SK: `VOTING_POWER#${string}`;
  EntityType: 'VOTE';
  Data: {
    proposalId: string;
    voterId: string;
    voterType: VoterType;
    vote: VoteChoice;
    votingPower: number;
    txHash: string;
    timestamp: string;
    rationale?: string;
    blockHeight: number;
    epochNumber: number;
    metadata: {
      walletType: string;
      version: string;
      confidence: number; // 1-10 scale
    };
  };
}

// Delegation Entity
export interface DelegationEntity extends BaseEntity {
  PK: `DELEGATOR#${string}`; // DELEGATOR#addr1...
  SK: `DELEGATION#${string}`; // DELEGATION#timestamp
  GSI1PK: `DREP#${string}`;
  GSI1SK: `DELEGATOR#${string}`;
  GSI2PK: `STATUS#${string}`;
  GSI2SK: `DATE#${string}`;
  EntityType: 'DELEGATION';
  Data: {
    delegatorAddress: string;
    drepId: string;
    stake: number;
    txHash: string;
    delegationDate: string;
    status: 'active' | 'withdrawn' | 'expired';
    withdrawnAt?: string;
    withdrawnTxHash?: string;
    metadata: {
      reason?: string;
      expectedDuration?: string;
    };
  };
}

// SPO Entity
export interface SPOEntity extends BaseEntity {
  PK: `SPO#${string}`; // SPO#poolId
  SK: 'PROFILE';
  GSI1PK: `STATUS#${string}`;
  GSI1SK: `STAKE#${string}`;
  EntityType: 'SPO';
  Data: {
    poolId: string;
    operatorAddress: string;
    poolName: string;
    ticker: string;
    pledge: number;
    margin: number;
    fixedCost: number;
    stake: number;
    delegatorCount: number;
    status: 'active' | 'retiring' | 'retired';
    metadata: {
      description: string;
      homepage?: string;
      extendedMetadata?: string;
    };
    performance: {
      blocks: number;
      lifetimeBlocks: number;
      epochBlocks: number;
      pledge: number;
      livePledge: number;
      activeStake: number;
      liveStake: number;
      roa: number; // Return on ADA
    };
  };
}

// Constitutional Council Entity
export interface ConstitutionalCouncilEntity extends BaseEntity {
  PK: `CC#${string}`; // CC#memberId
  SK: 'PROFILE';
  GSI1PK: `STATUS#${string}`;
  GSI1SK: `TERM_END#${string}`;
  EntityType: 'CONSTITUTIONAL_COUNCIL';
  Data: {
    memberAddress: string;
    appointmentDate: string;
    termEnd: string;
    status: 'active' | 'expired' | 'resigned';
    keyHash: string;
    coldKeyHash?: string;
    metadata: {
      name: string;
      bio: string;
      qualifications: string[];
      expertise: string[];
    };
    voting: {
      totalVotes: number;
      participationRate: number;
      avgResponseTime: number;
    };
  };
}

// Enums and Types
export type UserRole = 'participant' | 'drep' | 'proposer' | 'delegator' | 'spo' | 'constitutional-council';

export type DRepStatus = 'active' | 'inactive' | 'retired' | 'pending';

export type ProposalType = 
  | 'parameter-change'
  | 'hard-fork'
  | 'treasury-withdrawal'
  | 'constitutional-change'
  | 'no-confidence'
  | 'update-committee'
  | 'new-constitution';

export type ProposalStatus = 
  | 'pending'
  | 'active'
  | 'expired'
  | 'ratified'
  | 'rejected'
  | 'withdrawn';

export type VoterType = 'drep' | 'spo' | 'constitutional-council';

export type VoteChoice = 'yes' | 'no' | 'abstain';

export interface VoteTally {
  yes: number;
  no: number;
  abstain: number;
  total?: number;
}

// API Request/Response Types
export interface AuthContext {
  userId: string;
  walletAddress: string;
  roles: UserRole[];
  isAuthenticated: boolean;
  cognitoUsername?: string;
}

// Wallet Authentication
export const WalletConnectRequestSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  publicKey: z.string().min(1, 'Public key is required'),
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required'),
  timestamp: z.number().int().positive('Timestamp must be positive'),
  nonce: z.string().optional(),
});

export type WalletConnectRequest = z.infer<typeof WalletConnectRequestSchema>;

export interface WalletConnectResponse {
  token: string;
  refreshToken: string;
  user: UserEntity['Data'];
  expiresIn: number;
  tokenType: 'Bearer';
}

// Proposal Operations
export const ProposalListRequestSchema = z.object({
  status: z.enum(['pending', 'active', 'expired', 'ratified', 'rejected']).optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  proposerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  sortBy: z.enum(['date', 'votes', 'deadline', 'status']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ProposalListRequest = z.infer<typeof ProposalListRequestSchema>;

export interface ProposalListResponse {
  proposals: ProposalEntity['Data'][];
  nextCursor?: string;
  totalCount: number;
  hasMore: boolean;
  filters: {
    availableTypes: string[];
    availableCategories: string[];
    availableStatuses: ProposalStatus[];
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
}

export const CreateProposalRequestSchema = z.object({
  type: z.enum(['parameter-change', 'hard-fork', 'treasury-withdrawal', 'constitutional-change', 'no-confidence', 'update-committee', 'new-constitution']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  rationale: z.string().min(1).max(5000),
  category: z.string().min(1).max(100),
  tags: z.array(z.string()).max(10),
  estimatedImpact: z.enum(['low', 'medium', 'high']),
  budgetRequest: z.number().optional(),
  documentUrls: z.array(z.string().url()).optional(),
  technicalSpecs: z.record(z.any()).optional(),
  signature: z.string().min(1),
});

export type CreateProposalRequest = z.infer<typeof CreateProposalRequestSchema>;

// DRep Operations
export const DRepListRequestSchema = z.object({
  status: z.enum(['active', 'inactive', 'retired']).optional(),
  focusAreas: z.array(z.string()).optional(),
  minVotingPower: z.number().min(0).optional(),
  minParticipationRate: z.number().min(0).max(100).optional(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  sortBy: z.enum(['votingPower', 'participationRate', 'reputation', 'delegatorCount', 'registrationDate']).default('votingPower'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type DRepListRequest = z.infer<typeof DRepListRequestSchema>;

export interface DRepListResponse {
  dreps: DRepEntity['Data'][];
  nextCursor?: string;
  totalCount: number;
  hasMore: boolean;
  aggregates: {
    totalVotingPower: number;
    averageParticipationRate: number;
    totalDelegators: number;
  };
}

export const DRepRegistrationRequestSchema = z.object({
  metadata: z.object({
    manifesto: z.string().min(1).max(5000),
    experience: z.string().min(1).max(2000),
    focusAreas: z.array(z.string()).min(1).max(10),
    votingPhilosophy: z.string().min(1).max(2000),
    qualifications: z.array(z.string()).max(10),
    commitments: z.array(z.string()).max(10),
  }),
  contact: z.object({
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    social: z.object({
      twitter: z.string().optional(),
      discord: z.string().optional(),
      telegram: z.string().optional(),
    }).optional(),
  }),
  signature: z.string().min(1),
  txHash: z.string().min(1),
});

export type DRepRegistrationRequest = z.infer<typeof DRepRegistrationRequestSchema>;

// Voting Operations
export const SubmitVoteRequestSchema = z.object({
  proposalId: z.string().min(1),
  vote: z.enum(['yes', 'no', 'abstain']),
  rationale: z.string().max(1000).optional(),
  confidence: z.number().int().min(1).max(10).default(5),
  signature: z.string().min(1),
  txHash: z.string().min(1),
});

export type SubmitVoteRequest = z.infer<typeof SubmitVoteRequestSchema>;

export interface SubmitVoteResponse {
  voteId: string;
  status: 'submitted' | 'confirmed' | 'failed';
  txHash: string;
  blockHeight?: number;
  timestamp: string;
  votingPower: number;
}

// Delegation Operations
export const DelegateRequestSchema = z.object({
  drepId: z.string().min(1),
  stake: z.number().min(0),
  reason: z.string().max(500).optional(),
  expectedDuration: z.string().optional(),
  signature: z.string().min(1),
  txHash: z.string().min(1),
});

export type DelegateRequest = z.infer<typeof DelegateRequestSchema>;

// WebSocket Messages
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
  messageId: string;
}

export interface SubscriptionMessage {
  type: 'SUBSCRIBE' | 'UNSUBSCRIBE';
  topics: string[];
  auth?: string;
}

export type EventTypes = 
  | 'PROPOSAL_CREATED'
  | 'PROPOSAL_UPDATED'
  | 'PROPOSAL_STATUS_CHANGED'
  | 'VOTE_CAST'
  | 'VOTE_CONFIRMED'
  | 'DELEGATION_CREATED'
  | 'DELEGATION_UPDATED'
  | 'DREP_REGISTERED'
  | 'DREP_STATUS_CHANGED'
  | 'GOVERNANCE_STATS_UPDATED'
  | 'EPOCH_TRANSITION'
  | 'TREASURY_UPDATE';

// Error Types
export class GovernanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'GovernanceError';
  }
}

export class ValidationError extends GovernanceError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends GovernanceError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends GovernanceError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends GovernanceError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends GovernanceError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class BlockchainError extends GovernanceError {
  constructor(message: string, details?: any) {
    super(message, 'BLOCKCHAIN_ERROR', 502, details);
    this.name = 'BlockchainError';
  }
}