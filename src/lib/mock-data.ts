/**
 * Cardano Governance Platform - Mock Data
 * Comprehensive test data for development and demo purposes
 */

import { 
  User, 
  DRep, 
  GovernanceAction, 
  Vote, 
  Delegation,
  SPO,
  ConstitutionalCouncil
} from '../types/governance';

// Mock Users
export const mockUsers: User[] = [
  {
    address: "addr1qxg5w9xzdtkcqr4h8hnnf8fqpnn6pgm5n8qpjgxnjey3",
    publicKey: "ed25519_pk1abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-12-20"),
    roles: ["participant", "drep"],
    profile: {
      name: "Maureen",
      bio: "Fullstack Developer | MERN Stack | Constitutional Delegate | Building bridges between communities in the Cardano ecosystem",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maureen",
      website: "https://maureen.dev",
      social: {
        twitter: "https://x.com/WepngongMaureen",
        discord: "maureen#1234",
        telegram: "@maureen_dev"
      }
    },
    isActive: true,
    totalStake: 252082000000
  },
  {
    address: "addr1v37n26k8060aq7k8m3nfhpxzqvu39kdwj6p26rysc5fd3vgm5",
    publicKey: "ed25519_pk1xyz789abc123def456ghi012jkl345mno678pqr901stu234vwx567",
    createdAt: new Date("2023-08-20"),
    updatedAt: new Date("2024-12-19"),
    roles: ["participant", "drep"],
    profile: {
      name: "Alex Chen",
      bio: "Blockchain Engineer with 8 years experience in distributed systems and cryptography. Focused on technical excellence and protocol security.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      website: "https://alexchen.tech",
      social: {
        twitter: "https://x.com/alexchendev",
        discord: "alexchen#5678",
        telegram: "@alexchen_cardano"
      }
    },
    isActive: true,
    totalStake: 481152000000
  },
  {
    address: "addr1q8m2h7n9p4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2",
    publicKey: "ed25519_pk1def456ghi789jkl012mno345pqr678stu901vwx234yz567abc123",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2024-12-18"),
    roles: ["participant", "proposer"],
    profile: {
      name: "Dr. Sarah Thompson",
      bio: "Economics professor and blockchain researcher. Specializing in tokenomics and governance mechanisms.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      website: "https://sarahthompson.edu",
      social: {
        twitter: "https://x.com/dr_sarah_eco",
        discord: "drsarah#9012",
        telegram: "@sarah_economics"
      }
    },
    isActive: true,
    totalStake: 125000000000
  }
];

// Mock DReps
export const mockDReps: DRep[] = [
  {
    id: "drep13g5w9xzdtkcqr4h8h",
    address: "addr1qxg5w9xzdtkcqr4h8hnnf8fqpnn6pgm5n8qpjgxnjey3",
    registrationTxHash: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    registrationDate: new Date("2023-06-15"),
    status: "active",
    votingPower: 252082000000,
    delegatorCount: 47,
    metadata: {
      manifesto: "My Top 3 Objectives: 1. Building Bridges. I'm a bridge between communities that rarely talk to each other. 2. Amplifying Voices. I want to ensure that smaller stakeholders have their voices heard in governance decisions. 3. Transparent Governance. Every vote I cast will be documented with clear reasoning and made publicly available.",
      experience: "Fullstack Developer | MERN Stack | Constitutional Delegate, Cameroon | Douala Workshop 2024. Active in the Cardano community for 3+ years with deep understanding of both technical and governance aspects.",
      focusAreas: ["technical", "community", "education"],
      votingPhilosophy: "I believe in transparent, data-driven governance that prioritizes community benefit over individual gain. Every decision should be made with long-term sustainability in mind."
    },
    performance: {
      totalVotes: 28,
      participationRate: 94.5,
      avgResponseTime: 4.2,
      reputation: 4.7
    }
  },
  {
    id: "drep24k8m3nfhpxzqvu39",
    address: "addr1v37n26k8060aq7k8m3nfhpxzqvu39kdwj6p26rysc5fd3vgm5",
    registrationTxHash: "z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1",
    registrationDate: new Date("2023-08-20"),
    status: "active",
    votingPower: 481152000000,
    delegatorCount: 125,
    metadata: {
      manifesto: "Focused on technical excellence and protocol security. Building the future of decentralized governance through careful analysis and evidence-based decision making.",
      experience: "Blockchain Engineer with 8 years experience in distributed systems and cryptography. Core contributor to multiple DeFi protocols.",
      focusAreas: ["technical", "security", "protocol"],
      votingPhilosophy: "Evidence-based decisions with long-term sustainability focus. Technical proposals require thorough security analysis."
    },
    performance: {
      totalVotes: 32,
      participationRate: 97.8,
      avgResponseTime: 2.1,
      reputation: 4.9
    }
  },
  {
    id: "drep35r7t2w9q8p1m5n3k",
    address: "addr1q8m2h7n9p4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2",
    registrationTxHash: "p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6",
    registrationDate: new Date("2024-02-12"),
    status: "active",
    votingPower: 342780000000,
    delegatorCount: 89,
    metadata: {
      manifesto: "Advocate for sustainable treasury management and responsible spending. Focus on proposals that demonstrate clear ROI and community benefit.",
      experience: "Former traditional finance executive turned blockchain advocate. CPA with expertise in financial auditing and treasury management.",
      focusAreas: ["treasury", "governance", "sustainability"],
      votingPhilosophy: "Conservative approach to treasury spending with emphasis on accountability and measurable outcomes."
    },
    performance: {
      totalVotes: 18,
      participationRate: 85.7,
      avgResponseTime: 6.8,
      reputation: 4.3
    }
  }
];

// Mock Governance Actions
export const mockGovernanceActions: GovernanceAction[] = [
  {
    id: "prop_001",
    proposerId: "addr1q8m2h7n9p4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2",
    type: "treasury-withdrawal",
    title: "Cardano Blockchain Ecosystem Budget – 275M ADA",
    description: "The Cardano 2025 on-chain budget process introduces a constitutionally-driven community model for transparent funding through delegated Representatives (DReps). This comprehensive budget allocation aims to fund critical infrastructure, research initiatives, and community development programs that will accelerate Cardano ecosystem growth.",
    rationale: "This proposal establishes the framework for community-driven treasury allocation, ensuring funds are distributed transparently and effectively across key areas including developer tools, educational programs, marketing initiatives, and technical research. The budget is designed to maximize ecosystem value while maintaining fiscal responsibility.",
    submissionTxHash: "tx1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
    submissionDate: new Date("2025-05-12"),
    votingStartDate: new Date("2025-05-12"),
    votingEndDate: new Date("2025-06-13"),
    status: "active",
    metadata: {
      category: "Treasury & Funding",
      tags: ["budget", "treasury", "ecosystem", "funding", "2025"],
      estimatedImpact: "high",
      technicalSpecs: {
        totalAmount: 275000000000000,
        duration: "12 months",
        milestones: 4,
        reportingFrequency: "quarterly"
      },
      budgetRequest: 275000000000000
    },
    votes: {
      drep: { yes: 11820000000000, no: 2940000000000, abstain: 6360000000000 },
      spo: { yes: 56412000000000, no: 21406000000000, abstain: 3000000000000 },
      constitutionalCouncil: { yes: 4, no: 1, abstain: 0 }
    },
    thresholds: {
      drepThreshold: 0.51,
      spoThreshold: 0.51,
      ccThreshold: 0.67
    },
    outcome: null
  },
  {
    id: "prop_002",
    proposerId: "addr1v37n26k8060aq7k8m3nfhpxzqvu39kdwj6p26rysc5fd3vgm5",
    type: "parameter-change",
    title: "Increase Block Size Limit to 80KB",
    description: "Proposal to increase the maximum block size from 72KB to 80KB to accommodate growing transaction volume while maintaining network stability and decentralization.",
    rationale: "Current block size limits are constraining network throughput during peak usage periods. This measured increase will provide immediate relief while research continues on more comprehensive scaling solutions.",
    submissionTxHash: "tx2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8",
    submissionDate: new Date("2025-04-25"),
    votingStartDate: new Date("2025-04-25"),
    votingEndDate: new Date("2025-05-25"),
    status: "ratified",
    metadata: {
      category: "Protocol Parameters",
      tags: ["scaling", "performance", "block-size", "throughput"],
      estimatedImpact: "medium",
      technicalSpecs: {
        currentLimit: "72KB",
        proposedLimit: "80KB",
        expectedThroughputIncrease: "11%"
      }
    },
    votes: {
      drep: { yes: 18500000000000, no: 3200000000000, abstain: 1100000000000 },
      spo: { yes: 67000000000000, no: 18000000000000, abstain: 2000000000000 },
      constitutionalCouncil: { yes: 4, no: 0, abstain: 1 }
    },
    thresholds: {
      drepThreshold: 0.51,
      spoThreshold: 0.51,
      ccThreshold: 0.67
    },
    outcome: "ratified",
    finalizedAt: new Date("2025-05-26")
  },
  {
    id: "prop_003",
    proposerId: "addr1qxg5w9xzdtkcqr4h8hnnf8fqpnn6pgm5n8qpjgxnjey3",
    type: "hard-fork",
    title: "Hard Fork to Protocol Version 10",
    description: "This proposal seeks to upgrade Cardano mainnet to Protocol Version 10, introducing enhanced smart contract capabilities, improved governance features, and optimized consensus mechanisms.",
    rationale: "Protocol Version 10 represents a significant advancement in Cardano's capabilities, bringing improvements that were identified through extensive research and community feedback. The upgrade includes critical security enhancements and performance optimizations.",
    submissionTxHash: "tx3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9",
    submissionDate: new Date("2025-03-10"),
    votingStartDate: new Date("2025-03-10"),
    votingEndDate: new Date("2025-04-10"),
    status: "ratified",
    metadata: {
      category: "Protocol Upgrade",
      tags: ["hard-fork", "protocol", "upgrade", "smart-contracts", "governance"],
      estimatedImpact: "high",
      technicalSpecs: {
        currentVersion: "9.1",
        targetVersion: "10.0",
        activationEpoch: 478,
        testnetValidation: "completed"
      }
    },
    votes: {
      drep: { yes: 25200000000000, no: 1800000000000, abstain: 500000000000 },
      spo: { yes: 78000000000000, no: 5000000000000, abstain: 1000000000000 },
      constitutionalCouncil: { yes: 5, no: 0, abstain: 0 }
    },
    thresholds: {
      drepThreshold: 0.51,
      spoThreshold: 0.51,
      ccThreshold: 0.67
    },
    outcome: "ratified",
    finalizedAt: new Date("2025-04-11")
  },
  {
    id: "prop_004",
    proposerId: "addr1q8m2h7n9p4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2",
    type: "constitutional-change",
    title: "Amendment to Article IV: Treasury Governance",
    description: "Proposed amendment to Article IV of the Cardano Constitution to clarify treasury withdrawal procedures and establish clearer guidelines for budget approval processes.",
    rationale: "Recent governance experience has highlighted ambiguities in the current constitutional language regarding treasury management. This amendment provides necessary clarity while maintaining democratic oversight.",
    submissionTxHash: "tx4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0",
    submissionDate: new Date("2025-04-01"),
    votingStartDate: new Date("2025-04-01"),
    votingEndDate: new Date("2025-05-15"),
    status: "active",
    metadata: {
      category: "Constitutional",
      tags: ["constitution", "treasury", "governance", "amendment"],
      estimatedImpact: "high",
      technicalSpecs: {
        articleAffected: "Article IV",
        sectionModified: "Section 3",
        legalReview: "completed"
      }
    },
    votes: {
      drep: { yes: 14200000000000, no: 8800000000000, abstain: 2100000000000 },
      spo: { yes: 45000000000000, no: 35000000000000, abstain: 4000000000000 },
      constitutionalCouncil: { yes: 3, no: 1, abstain: 1 }
    },
    thresholds: {
      drepThreshold: 0.67,
      spoThreshold: 0.67,
      ccThreshold: 0.75
    },
    outcome: null
  },
  {
    id: "prop_005",
    proposerId: "addr1v37n26k8060aq7k8m3nfhpxzqvu39kdwj6p26rysc5fd3vgm5",
    type: "treasury-withdrawal",
    title: "Community Marketing Initiative - 50K ADA",
    description: "Proposal to fund a comprehensive marketing campaign to increase Cardano awareness and adoption, focusing on developer outreach and educational content creation.",
    rationale: "The Cardano ecosystem needs increased visibility to compete with other blockchain platforms. This initiative will create high-quality content, sponsor developer events, and engage with key communities to drive adoption.",
    submissionTxHash: "tx5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1",
    submissionDate: new Date("2025-02-15"),
    votingStartDate: new Date("2025-02-15"),
    votingEndDate: new Date("2025-03-15"),
    status: "expired",
    metadata: {
      category: "Treasury & Funding",
      tags: ["marketing", "community", "outreach", "adoption"],
      estimatedImpact: "medium",
      technicalSpecs: {
        totalAmount: 50000000000,
        duration: "6 months",
        milestones: 3,
        reportingFrequency: "monthly"
      },
      budgetRequest: 50000000000
    },
    votes: {
      drep: { yes: 8500000000000, no: 12200000000000, abstain: 1800000000000 },
      spo: { yes: 24000000000000, no: 48000000000000, abstain: 5000000000000 },
      constitutionalCouncil: { yes: 2, no: 3, abstain: 0 }
    },
    thresholds: {
      drepThreshold: 0.60,
      spoThreshold: 0.60,
      ccThreshold: 0.67
    },
    outcome: "not-ratified",
    finalizedAt: new Date("2025-03-16")
  },
  {
    id: "prop_006",
    proposerId: "addr1qxg5w9xzdtkcqr4h8hnnf8fqpnn6pgm5n8qpjgxnjey3",
    type: "parameter-change",
    title: "Reduce Transaction Fees by 20%",
    description: "Proposal to reduce minimum transaction fees to make Cardano more competitive and accessible to users worldwide, particularly in regions with lower purchasing power.",
    rationale: "Current transaction fees create barriers to adoption. This reduction will make micro-transactions more viable while still maintaining network security through sufficient validator incentives.",
    submissionTxHash: "tx6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2",
    submissionDate: new Date("2025-01-20"),
    votingStartDate: new Date("2025-01-20"),
    votingEndDate: new Date("2025-02-20"),
    status: "expired",
    metadata: {
      category: "Protocol Parameters",
      tags: ["fees", "accessibility", "adoption", "economics"],
      estimatedImpact: "high",
      technicalSpecs: {
        currentMinFee: "44 ADA",
        proposedMinFee: "35.2 ADA",
        reductionPercentage: "20%"
      }
    },
    votes: {
      drep: { yes: 20800000000000, no: 4200000000000, abstain: 1500000000000 },
      spo: { yes: 72000000000000, no: 8000000000000, abstain: 3000000000000 },
      constitutionalCouncil: { yes: 4, no: 0, abstain: 1 }
    },
    thresholds: {
      drepThreshold: 0.51,
      spoThreshold: 0.51,
      ccThreshold: 0.67
    },
    outcome: "ratified",
    finalizedAt: new Date("2025-02-21")
  }
];

// Mock Votes
export const mockVotes: Vote[] = [
  {
    id: "vote_001",
    proposalId: "prop_001",
    voterId: "addr1qxg5w9xzdtkcqr4h8hnnf8fqpnn6pgm5n8qpjgxnjey3",
    voterType: "drep",
    vote: "yes",
    votingPower: 252082000000,
    txHash: "vtx1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
    timestamp: new Date("2025-05-13T10:30:00Z"),
    rationale: "This budget proposal demonstrates responsible treasury management with clear milestones and accountability measures. The allocation prioritizes ecosystem growth while maintaining fiscal responsibility."
  },
  {
    id: "vote_002",
    proposalId: "prop_002",
    voterId: "addr1v37n26k8060aq7k8m3nfhpxzqvu39kdwj6p26rysc5fd3vgm5",
    voterType: "drep",
    vote: "yes",
    votingPower: 481152000000,
    txHash: "vtx2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8",
    timestamp: new Date("2025-04-26T14:15:00Z"),
    rationale: "The proposed block size increase is technically sound and necessary for network scalability. The conservative 11% increase maintains decentralization while improving throughput."
  },
  {
    id: "vote_003",
    proposalId: "prop_003",
    voterId: "addr1q8m2h7n9p4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2",
    voterType: "drep",
    vote: "yes",
    votingPower: 342780000000,
    txHash: "vtx3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9",
    timestamp: new Date("2025-03-12T09:45:00Z"),
    rationale: "Protocol Version 10 has undergone thorough testing and community review. The enhancements will significantly benefit the ecosystem while maintaining security and stability."
  }
];

// Mock Delegations
export const mockDelegations: Delegation[] = [
  {
    id: "del_001",
    delegatorAddress: "addr1q9n8m7l6k5j4i3h2g1f0e9d8c7b6a5z4y3x2w1v0u9t8s7",
    drepId: "drep13g5w9xzdtkcqr4h8h",
    stake: 50000000000,
    txHash: "dtx1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7",
    delegationDate: new Date("2023-07-20"),
    status: "active"
  },
  {
    id: "del_002",
    delegatorAddress: "addr1q7r6t5y4u3i2o1p0a9s8d7f6g5h4j3k2l1z0x9c8v7b6n5",
    drepId: "drep24k8m3nfhpxzqvu39",
    stake: 125000000000,
    txHash: "dtx2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8",
    delegationDate: new Date("2024-01-15"),
    status: "active"
  },
  {
    id: "del_003",
    delegatorAddress: "addr1q5m4n3b2v1c0x9z8a7s6d5f4g3h2j1k0l9o8i7u6y5t4r3",
    drepId: "drep35r7t2w9q8p1m5n3k",
    stake: 75000000000,
    txHash: "dtx3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9",
    delegationDate: new Date("2024-03-10"),
    status: "active"
  }
];

// Mock SPOs
export const mockSPOs: SPO[] = [
  {
    poolId: "pool1qxg5w9xzdtkcqr4h8hnnf8fqpnn6pgm5n8qpjgxnjey3",
    operatorAddress: "addr1qxg5w9xzdtkcqr4h8hnnf8fqpnn6pgm5n8qpjgxnjey3",
    poolName: "Cardano Community Pool",
    ticker: "CCP",
    pledge: 500000000000,
    margin: 0.03,
    fixedCost: 340000000,
    stake: 25000000000000,
    delegatorCount: 1250,
    status: "active",
    metadata: {
      description: "Community-focused stake pool supporting Cardano ecosystem development",
      homepage: "https://cardanocommunitypools.org"
    }
  }
];

// Mock Constitutional Council
export const mockConstitutionalCouncil: ConstitutionalCouncil[] = [
  {
    id: "cc_001",
    memberAddress: "addr1qcc1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1",
    appointmentDate: new Date("2024-01-01"),
    termEnd: new Date("2026-12-31"),
    status: "active",
    keyHash: "cc_key_hash_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4"
  },
  {
    id: "cc_002",
    memberAddress: "addr1qcc2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2",
    appointmentDate: new Date("2024-01-01"),
    termEnd: new Date("2026-12-31"),
    status: "active",
    keyHash: "cc_key_hash_2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5"
  },
  {
    id: "cc_003",
    memberAddress: "addr1qcc3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3",
    appointmentDate: new Date("2024-01-01"),
    termEnd: new Date("2026-12-31"),
    status: "active",
    keyHash: "cc_key_hash_3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6"
  },
  {
    id: "cc_004",
    memberAddress: "addr1qcc4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4",
    appointmentDate: new Date("2024-01-01"),
    termEnd: new Date("2026-12-31"),
    status: "active",
    keyHash: "cc_key_hash_4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7"
  },
  {
    id: "cc_005",
    memberAddress: "addr1qcc5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5",
    appointmentDate: new Date("2024-01-01"),
    termEnd: new Date("2026-12-31"),
    status: "active",
    keyHash: "cc_key_hash_5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8"
  }
];

// Utility functions for mock data
export function getMockUser(address: string): User | undefined {
  return mockUsers.find(user => user.address === address);
}

export function getMockDRep(id: string): DRep | undefined {
  return mockDReps.find(drep => drep.id === id);
}

export function getMockProposal(id: string): GovernanceAction | undefined {
  return mockGovernanceActions.find(proposal => proposal.id === id);
}

export function getMockUserVotes(userAddress: string): Vote[] {
  return mockVotes.filter(vote => vote.voterId === userAddress);
}

export function getMockUserDelegations(userAddress: string): Delegation[] {
  return mockDelegations.filter(delegation => delegation.delegatorAddress === userAddress);
}

export function getMockProposalVotes(proposalId: string): Vote[] {
  return mockVotes.filter(vote => vote.proposalId === proposalId);
}

// Mock API response helpers
export function createMockApiResponse<T>(data: T) {
  return {
    data,
    success: true,
    timestamp: new Date()
  };
}

export function createMockPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  limit: number = 10
) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      hasNext: endIndex < data.length,
      hasPrev: page > 1
    }
  };
}

// Mock governance statistics
export const mockGovernanceStats = {
  totalProposals: mockGovernanceActions.length,
  activeProposals: mockGovernanceActions.filter(p => p.status === 'active').length,
  totalDReps: mockDReps.length,
  activeDReps: mockDReps.filter(d => d.status === 'active').length,
  totalDelegations: mockDelegations.length,
  totalVotingPower: mockDReps.reduce((sum, drep) => sum + drep.votingPower, 0),
  participationRate: 0.72, // 72%
  averageVotingTime: 3.2, // hours
  treasuryBalance: 1250000000000000, // 1.25B ADA in lovelace
  lastUpdated: new Date()
};

// Export the main user for easy access
export const currentMockUser = mockUsers[0];