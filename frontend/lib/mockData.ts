// Mock data for Cardano governance platform development and testing

import { GovernanceAction, Vote, VoterType } from '../types/voting';

// Mock Governance Actions
export const mockGovernanceActions: GovernanceAction[] = [
  {
    id: 'proposal-001',
    proposerId: 'addr1qyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nft2v4v05vwjd3ku6spm9ka4pdhq2kf26w7wdkl0gv34mmxk8jkqvx0lfqmfh',
    type: 'parameter-change',
    title: 'Increase Block Size to 80KB',
    description: 'This proposal aims to increase the maximum block size from 72KB to 80KB to accommodate growing transaction volume and improve network throughput.',
    rationale: 'Current block size limits are causing congestion during peak usage periods. Analysis shows that increasing to 80KB will provide a 11% improvement in transaction capacity while maintaining network security and decentralization.',
    submissionTxHash: '2f23e4c8d9a1b5f6e3c7d4a9b2e8f1c6d3a7b9e4f2c8d5a1b7e9f3c6d2a8b4e1',
    submissionDate: new Date('2024-01-15T10:30:00Z'),
    votingStartDate: new Date('2024-01-20T00:00:00Z'),
    votingEndDate: new Date('2024-02-05T23:59:59Z'),
    status: 'active',
    metadata: {
      category: 'Protocol Parameters',
      tags: ['performance', 'scalability', 'network'],
      estimatedImpact: 'medium',
      technicalSpecs: {
        currentBlockSize: '72KB',
        proposedBlockSize: '80KB',
        estimatedThroughputIncrease: '11%'
      }
    },
    votes: {
      drep: { yes: 2450000000, no: 120000000, abstain: 85000000 },
      spo: { yes: 1200000000, no: 45000000, abstain: 30000000 },
      constitutionalCouncil: { yes: 5, no: 1, abstain: 1 }
    },
    thresholds: {
      drepThreshold: 51,
      spoThreshold: 51,
      ccThreshold: 67
    }
  },
  {
    id: 'proposal-002',
    proposerId: 'addr1qxj8dmp5w9azfcgv6rtk2ml9dxv8vkhc3h3w5sjzl2q4n6e8k2a7b9c3d5e1f7',
    type: 'treasury-withdrawal',
    title: 'Fund Cardano Education Initiative',
    description: 'Proposal to allocate 500,000 ADA from the treasury to fund educational programs, developer training, and community outreach initiatives.',
    rationale: 'Education and developer adoption are critical for Cardano\'s long-term success. This initiative will provide structured learning paths, certification programs, and developer tools to accelerate ecosystem growth.',
    submissionTxHash: '3a45e7c9d2b6f8e1c4a7d9b3e6f2c8d5a1b7e9f4c6d3a8b5e2f9c7d4a1b8e6',
    submissionDate: new Date('2024-01-18T14:15:00Z'),
    votingStartDate: new Date('2024-01-25T00:00:00Z'),
    votingEndDate: new Date('2024-02-10T23:59:59Z'),
    status: 'active',
    metadata: {
      category: 'Treasury',
      tags: ['education', 'development', 'community'],
      estimatedImpact: 'high',
      budgetRequest: 500000,
      technicalSpecs: {
        requestedAmount: '500,000 ADA',
        duration: '12 months',
        expectedOutcomes: ['1000 trained developers', '50 educational courses', '20 community events']
      }
    },
    votes: {
      drep: { yes: 1800000000, no: 650000000, abstain: 200000000 },
      spo: { yes: 950000000, no: 280000000, abstain: 120000000 },
      constitutionalCouncil: { yes: 4, no: 2, abstain: 1 }
    },
    thresholds: {
      drepThreshold: 60,
      spoThreshold: 60,
      ccThreshold: 67
    }
  },
  {
    id: 'proposal-003',
    proposerId: 'addr1qxm9w2v8n3b6c4e7f9a2d5g8h1j4k7m9p2q5r8s1t4v7x0z3c6e9f2h5k8n1',
    type: 'hard-fork',
    title: 'Conway Era Upgrade - Enhanced Smart Contracts',
    description: 'Implementation of Conway era hard fork bringing enhanced smart contract capabilities, improved reference scripts, and optimized transaction processing.',
    rationale: 'The Conway era represents a significant advancement in Cardano\'s smart contract capabilities. This upgrade will enable more complex dApps while reducing transaction costs and improving performance.',
    submissionTxHash: '4b56e8d0c3a7f9e2d5b8c1f4a7e0d3b6c9f2e5a8d1b4e7f0c3a6d9b2e5f8',
    submissionDate: new Date('2024-01-10T09:00:00Z'),
    votingStartDate: new Date('2024-01-15T00:00:00Z'),
    votingEndDate: new Date('2024-01-30T23:59:59Z'),
    status: 'ratified',
    metadata: {
      category: 'Protocol Upgrade',
      tags: ['hard-fork', 'smart-contracts', 'optimization'],
      estimatedImpact: 'high',
      technicalSpecs: {
        eraName: 'Conway',
        features: ['Enhanced Plutus', 'Reference Scripts v2', 'Optimized UTxO'],
        activationEpoch: 512
      }
    },
    votes: {
      drep: { yes: 3200000000, no: 180000000, abstain: 120000000 },
      spo: { yes: 1600000000, no: 85000000, abstain: 45000000 },
      constitutionalCouncil: { yes: 6, no: 0, abstain: 1 }
    },
    thresholds: {
      drepThreshold: 75,
      spoThreshold: 75,
      ccThreshold: 67
    },
    outcome: 'ratified',
    finalizedAt: new Date('2024-01-31T12:00:00Z')
  }
];

// Mock Votes
export const mockVotes: Vote[] = [
  {
    id: 'vote-001',
    proposalId: 'proposal-001',
    voterId: 'drep1qy4k7n8m2p5s9v3x6z1c4f7j0l3o6r9u2w5a8d1e4g7',
    voterType: 'drep',
    vote: 'yes',
    votingPower: 125000000,
    txHash: '5c67f9e1d4a7b0c3e6f9a2d5b8c1e4f7a0d3b6c9e2f5a8d1b4e7f0c3a6d9',
    timestamp: new Date('2024-01-22T15:30:00Z'),
    rationale: 'This parameter change is necessary for network scalability and has been thoroughly tested.',
    blockHeight: 8945672,
    epochNumber: 456
  },
  {
    id: 'vote-002',
    proposalId: 'proposal-001',
    voterId: 'pool1qxj3m6k9n2p5s8v1x4z7c0f3i6l9o2r5u8w1a4d7g0j3',
    voterType: 'spo',
    vote: 'yes',
    votingPower: 85000000,
    txHash: '6d78g0f2e5b8c1d4f7a0c3e6f9b2d5a8c1e4f7a0d3b6c9e2f5a8d1b4e7f0',
    timestamp: new Date('2024-01-23T09:45:00Z'),
    rationale: 'As an SPO, I support this change as it will reduce block propagation delays.',
    blockHeight: 8946851,
    epochNumber: 456
  },
  {
    id: 'vote-003',
    proposalId: 'proposal-002',
    voterId: 'cc1qx2b5e8h1k4n7q0t3w6z9c2f5i8l1o4r7u0x3a6d9g2',
    voterType: 'constitutional-council',
    vote: 'yes',
    votingPower: 1,
    txHash: '7e89h1g3f6c9d2e5g8a1d4f7a0c3e6f9b2d5a8c1e4f7a0d3b6c9e2f5a8d1',
    timestamp: new Date('2024-01-26T11:20:00Z'),
    rationale: 'Educational initiatives are constitutional and beneficial for the ecosystem.',
    blockHeight: 8952143,
    epochNumber: 457
  }
];

// Mock DReps for voting context
export const mockDReps = [
  {
    id: 'drep-001',
    address: 'drep1qy4k7n8m2p5s9v3x6z1c4f7j0l3o6r9u2w5a8d1e4g7',
    name: 'Cardano Builder',
    bio: 'Experienced blockchain developer focused on sustainable protocol development.',
    votingPower: 125000000,
    delegatorCount: 847,
    recentVotes: ['yes', 'yes', 'abstain', 'yes', 'no']
  },
  {
    id: 'drep-002',
    address: 'drep1qx3h6k9l2o5r8u1w4z7b0e3h6k9n2q5t8w1a4d7g0j3',
    name: 'Ecosystem Advocate',
    bio: 'Community-focused representative advocating for inclusive governance.',
    votingPower: 98000000,
    delegatorCount: 623,
    recentVotes: ['yes', 'abstain', 'yes', 'yes', 'yes']
  }
];

// Mock user voting state
export const mockUserVotingState = {
  isConnected: true,
  connectedWallet: 'addr1qyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nft2v4v05vwjd3ku6spm9ka4pdhq2kf26w7wdkl0gv34mmxk8jkqvx0lfqmfh',
  userVotes: [mockVotes[0]],
  pendingVotes: [],
  votingPower: 125000000,
  userType: 'drep' as VoterType,
  canVote: true
};

// Mock transaction preview
export const mockTransactionPreview = {
  fee: 180000, // 0.18 ADA
  totalCost: 180000,
  inputs: [
    {
      txHash: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
      outputIndex: 0,
      amount: 5000000 // 5 ADA
    }
  ],
  outputs: [
    {
      address: 'addr1qyy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nft2v4v05vwjd3ku6spm9ka4pdhq2kf26w7wdkl0gv34mmxk8jkqvx0lfqmfh',
      amount: 4820000 // 4.82 ADA (5 - 0.18 fee)
    }
  ],
  metadata: {
    674: {
      vote: 'yes',
      proposalId: 'proposal-001',
      voterType: 'drep'
    }
  }
};

// Helper functions for mock data
export const getMockProposal = (id: string): GovernanceAction | undefined => {
  return mockGovernanceActions.find(proposal => proposal.id === id);
};

export const getMockVotesForProposal = (proposalId: string): Vote[] => {
  return mockVotes.filter(vote => vote.proposalId === proposalId);
};

export const generateMockVote = (
  proposalId: string,
  voterType: VoterType,
  vote: 'yes' | 'no' | 'abstain',
  votingPower: number,
  rationale?: string
): Vote => {
  return {
    id: `vote-${Date.now()}`,
    proposalId,
    voterId: `${voterType}1q${Math.random().toString(36).substring(2, 42)}`,
    voterType,
    vote,
    votingPower,
    txHash: `${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
    timestamp: new Date(),
    rationale,
    blockHeight: Math.floor(Math.random() * 1000000) + 8000000,
    epochNumber: Math.floor(Math.random() * 100) + 400
  };
};

// Mock real-time events
export const mockVotingEvents = [
  {
    type: 'VOTE_CAST' as const,
    proposalId: 'proposal-001',
    data: {
      vote: generateMockVote('proposal-001', 'drep', 'yes', 50000000, 'Supporting this proposal for better network performance.')
    },
    timestamp: new Date()
  },
  {
    type: 'PROPOSAL_STATUS_CHANGED' as const,
    proposalId: 'proposal-003',
    data: {
      oldStatus: 'active',
      newStatus: 'ratified'
    },
    timestamp: new Date()
  }
];

// Export all mock data
export default {
  governanceActions: mockGovernanceActions,
  votes: mockVotes,
  dreps: mockDReps,
  userVotingState: mockUserVotingState,
  transactionPreview: mockTransactionPreview,
  votingEvents: mockVotingEvents,
  getMockProposal,
  getMockVotesForProposal,
  generateMockVote
};