// Core voting types and interfaces for Cardano governance platform

export type VoteChoice = 'yes' | 'no' | 'abstain';
export type VoterType = 'drep' | 'spo' | 'constitutional-council';
export type ProposalStatus = 'pending' | 'active' | 'expired' | 'ratified' | 'rejected';
export type ProposalType = 'parameter-change' | 'hard-fork' | 'treasury-withdrawal' | 'constitutional-change';

export interface GovernanceAction {
  id: string;
  proposerId: string;
  type: ProposalType;
  title: string;
  description: string;
  rationale: string;
  submissionTxHash: string;
  submissionDate: Date;
  votingStartDate: Date;
  votingEndDate: Date;
  status: ProposalStatus;
  metadata: {
    category: string;
    tags: string[];
    estimatedImpact: 'low' | 'medium' | 'high';
    technicalSpecs?: Record<string, any>;
    budgetRequest?: number;
  };
  votes: {
    drep: { yes: number; no: number; abstain: number };
    spo: { yes: number; no: number; abstain: number };
    constitutionalCouncil: { yes: number; no: number; abstain: number };
  };
  thresholds: {
    drepThreshold: number;
    spoThreshold: number;
    ccThreshold: number;
  };
  outcome?: string;
  finalizedAt?: Date;
}

export interface Vote {
  id: string;
  proposalId: string;
  voterId: string;
  voterType: VoterType;
  vote: VoteChoice;
  votingPower: number;
  txHash: string;
  timestamp: Date;
  rationale?: string;
  blockHeight: number;
  epochNumber: number;
}

export interface VoteSubmission {
  proposalId: string;
  vote: VoteChoice;
  rationale?: string;
  walletAddress: string;
  voterType: VoterType;
}

export interface VotingTransaction {
  id: string;
  proposalId: string;
  vote: VoteChoice;
  fee: number;
  ttl: number;
  witnesses: string[];
  metadata: Record<string, any>;
}

export interface VotingState {
  isConnected: boolean;
  connectedWallet?: string;
  userVotes: Vote[];
  pendingVotes: VoteSubmission[];
  votingPower: number;
  userType: VoterType | null;
  canVote: boolean;
}

export interface VoteBreakdown {
  total: number;
  yes: number;
  no: number;
  abstain: number;
  percentage: {
    yes: number;
    no: number;
    abstain: number;
  };
  threshold: number;
  hasReachedThreshold: boolean;
}

export interface ProposalVotingInfo {
  proposal: GovernanceAction;
  userVote?: Vote;
  canUserVote: boolean;
  timeRemaining: number;
  votingPeriodActive: boolean;
  breakdown: {
    drep: VoteBreakdown;
    spo: VoteBreakdown;
    constitutionalCouncil: VoteBreakdown;
  };
}

export interface VotingError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Event types for real-time updates
export interface VotingEvent {
  type: 'VOTE_CAST' | 'VOTE_UPDATED' | 'PROPOSAL_STATUS_CHANGED' | 'VOTING_PERIOD_ENDED';
  proposalId: string;
  data: any;
  timestamp: Date;
}

// Wallet interaction types
export interface WalletVotingCapability {
  canVote: boolean;
  voterType: VoterType | null;
  votingPower: number;
  restrictions?: string[];
}

export interface TransactionPreview {
  fee: number;
  totalCost: number;
  inputs: Array<{
    txHash: string;
    outputIndex: number;
    amount: number;
  }>;
  outputs: Array<{
    address: string;
    amount: number;
    assets?: Record<string, number>;
  }>;
  metadata?: Record<string, any>;
}