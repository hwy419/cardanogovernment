export interface User {
  address: string;
  publicKey: string;
  createdAt: Date;
  roles: string[];
  profile: {
    name: string;
    bio: string;
    avatar: string;
    website: string;
    social: {
      twitter: string;
      discord: string;
      telegram: string;
    };
  };
  isActive: boolean;
  totalStake: number;
}

export interface DRep {
  id: string;
  address: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'retired';
  votingPower: number;
  delegatorCount: number;
  metadata: {
    manifesto: string;
    experience: string;
    focusAreas: string[];
    votingPhilosophy: string;
  };
  performance: {
    totalVotes: number;
    participationRate: number;
    avgResponseTime: number;
    reputation: number;
  };
}

export interface GovernanceAction {
  id: string;
  proposerId: string;
  type: 'parameter-change' | 'hard-fork' | 'treasury-withdrawal' | 'constitutional-change';
  title: string;
  description: string;
  rationale: string;
  submissionDate: Date;
  votingStartDate: Date;
  votingEndDate: Date;
  status: 'pending' | 'active' | 'expired' | 'ratified' | 'rejected';
  votes: {
    drep: { yes: number; no: number; abstain: number };
    spo: { yes: number; no: number; abstain: number };
    constitutionalCouncil: { yes: number; no: number; abstain: number };
  };
  outcome: string | null;
}

export interface Vote {
  id: string;
  proposalId: string;
  voterId: string;
  voterType: 'drep' | 'spo' | 'constitutional-council';
  vote: 'yes' | 'no' | 'abstain';
  votingPower: number;
  txHash: string;
  timestamp: Date;
  rationale?: string;
}

export interface Delegation {
  id: string;
  delegatorAddress: string;
  drepId: string;
  stake: number;
  txHash: string;
  delegationDate: Date;
  status: 'active' | 'withdrawn';
  withdrawnAt?: Date;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  supportedWallets: string[];
  connectedWallet: string | null;
}

export interface ProposalFilters {
  status: string[];
  type: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchTerm: string;
}

export interface DRepFilters {
  status: string[];
  focusAreas: string[];
  minimumVotingPower: number;
  minimumParticipation: number;
  searchTerm: string;
}

export type UserRole = 'participant' | 'drep' | 'proposer' | 'delegator' | 'spo' | 'constitutional-council';