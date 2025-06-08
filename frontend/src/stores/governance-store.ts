import { create } from 'zustand'
import { GovernanceAction, DRep, ProposalFilters, DRepFilters, Vote } from '@/types/governance'

interface GovernanceStore {
  // Proposals
  proposals: GovernanceAction[]
  selectedProposal: GovernanceAction | null
  proposalFilters: ProposalFilters
  
  // DReps
  dreps: DRep[]
  selectedDRep: DRep | null
  drepFilters: DRepFilters
  
  // Votes
  userVotes: Vote[]
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setProposals: (proposals: GovernanceAction[]) => void
  setSelectedProposal: (proposal: GovernanceAction | null) => void
  updateProposalFilters: (filters: Partial<ProposalFilters>) => void
  
  setDReps: (dreps: DRep[]) => void
  setSelectedDRep: (drep: DRep | null) => void
  updateDRepFilters: (filters: Partial<DRepFilters>) => void
  
  setUserVotes: (votes: Vote[]) => void
  addVote: (vote: Vote) => void
  
  setLoading: (loading: boolean) => void
  
  // API calls
  fetchProposals: () => Promise<void>
  fetchDReps: () => Promise<void>
  fetchUserVotes: (address: string) => Promise<void>
  submitVote: (proposalId: string, vote: 'yes' | 'no' | 'abstain', rationale?: string) => Promise<void>
}

export const useGovernanceStore = create<GovernanceStore>((set, get) => ({
  // Initial state
  proposals: [],
  selectedProposal: null,
  proposalFilters: {
    status: [],
    type: [],
    dateRange: { start: null, end: null },
    searchTerm: '',
  },
  
  dreps: [],
  selectedDRep: null,
  drepFilters: {
    status: [],
    focusAreas: [],
    minimumVotingPower: 0,
    minimumParticipation: 0,
    searchTerm: '',
  },
  
  userVotes: [],
  isLoading: false,

  // Actions
  setProposals: (proposals) => set({ proposals }),
  setSelectedProposal: (proposal) => set({ selectedProposal: proposal }),
  updateProposalFilters: (filters) => 
    set((state) => ({ 
      proposalFilters: { ...state.proposalFilters, ...filters } 
    })),

  setDReps: (dreps) => set({ dreps }),
  setSelectedDRep: (drep) => set({ selectedDRep: drep }),
  updateDRepFilters: (filters) => 
    set((state) => ({ 
      drepFilters: { ...state.drepFilters, ...filters } 
    })),

  setUserVotes: (votes) => set({ userVotes: votes }),
  addVote: (vote) => 
    set((state) => ({ 
      userVotes: [...state.userVotes, vote] 
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  // API calls (mock implementations - to be replaced with actual API calls)
  fetchProposals: async () => {
    set({ isLoading: true })
    try {
      // Mock API call - replace with actual API
      const mockProposals: GovernanceAction[] = [
        {
          id: '1',
          proposerId: 'addr_test1...',
          type: 'parameter-change',
          title: 'Increase Block Size Limit',
          description: 'Proposal to increase the maximum block size from 90KB to 100KB to improve network throughput.',
          rationale: 'Current network utilization is approaching the block size limit, causing transaction delays.',
          submissionDate: new Date('2024-01-15'),
          votingStartDate: new Date('2024-01-20'),
          votingEndDate: new Date('2024-02-20'),
          status: 'active',
          votes: {
            drep: { yes: 1250000, no: 450000, abstain: 300000 },
            spo: { yes: 800000, no: 200000, abstain: 100000 },
            constitutionalCouncil: { yes: 5, no: 1, abstain: 1 }
          },
          outcome: null
        },
        {
          id: '2',
          proposerId: 'addr_test2...',
          type: 'treasury-withdrawal',
          title: 'Fund Cardano Developer Tools',
          description: 'Proposal to allocate 500,000 ADA from the treasury to fund development of new developer tools.',
          rationale: 'Enhanced developer tools will accelerate ecosystem growth and attract more developers.',
          submissionDate: new Date('2024-01-10'),
          votingStartDate: new Date('2024-01-15'),
          votingEndDate: new Date('2024-02-15'),
          status: 'active',
          votes: {
            drep: { yes: 2100000, no: 300000, abstain: 600000 },
            spo: { yes: 950000, no: 150000, abstain: 0 },
            constitutionalCouncil: { yes: 6, no: 0, abstain: 1 }
          },
          outcome: null
        }
      ]
      
      setTimeout(() => {
        set({ proposals: mockProposals, isLoading: false })
      }, 1000)
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
      set({ isLoading: false })
    }
  },

  fetchDReps: async () => {
    set({ isLoading: true })
    try {
      // Mock API call - replace with actual API
      const mockDReps: DRep[] = [
        {
          id: 'drep_1',
          address: 'addr_test1qp8...',
          registrationDate: new Date('2023-12-01'),
          status: 'active',
          votingPower: 2500000,
          delegatorCount: 1250,
          metadata: {
            manifesto: 'I believe in sustainable development and community governance.',
            experience: '5 years in blockchain development, former Ethereum core contributor',
            focusAreas: ['technical', 'sustainability', 'developer-tools'],
            votingPhilosophy: 'Evidence-based decisions with community input'
          },
          performance: {
            totalVotes: 45,
            participationRate: 95.7,
            avgResponseTime: 12.5,
            reputation: 4.8
          }
        },
        {
          id: 'drep_2',
          address: 'addr_test1qx7...',
          registrationDate: new Date('2023-11-15'),
          status: 'active',
          votingPower: 1800000,
          delegatorCount: 890,
          metadata: {
            manifesto: 'Focused on treasury management and community growth.',
            experience: 'Finance background with 3 years in DeFi protocols',
            focusAreas: ['treasury', 'community', 'education'],
            votingPhilosophy: 'Conservative approach with focus on long-term value'
          },
          performance: {
            totalVotes: 43,
            participationRate: 91.5,
            avgResponseTime: 18.2,
            reputation: 4.6
          }
        }
      ]
      
      setTimeout(() => {
        set({ dreps: mockDReps, isLoading: false })
      }, 1000)
    } catch (error) {
      console.error('Failed to fetch DReps:', error)
      set({ isLoading: false })
    }
  },

  fetchUserVotes: async (address: string) => {
    try {
      // Mock API call - replace with actual API
      const mockVotes: Vote[] = [
        {
          id: 'vote_1',
          proposalId: '1',
          voterId: address,
          voterType: 'drep',
          vote: 'yes',
          votingPower: 50000,
          txHash: 'tx_hash_1',
          timestamp: new Date('2024-01-25'),
          rationale: 'This proposal will improve network performance'
        }
      ]
      
      set({ userVotes: mockVotes })
    } catch (error) {
      console.error('Failed to fetch user votes:', error)
    }
  },

  submitVote: async (proposalId: string, vote: 'yes' | 'no' | 'abstain', rationale?: string) => {
    try {
      // Mock vote submission - replace with actual wallet transaction
      const newVote: Vote = {
        id: `vote_${Date.now()}`,
        proposalId,
        voterId: 'user_address', // Get from wallet store
        voterType: 'drep',
        vote,
        votingPower: 50000, // Get from user's voting power
        txHash: `tx_${Date.now()}`,
        timestamp: new Date(),
        rationale
      }
      
      get().addVote(newVote)
      
      // Update proposal vote counts
      const proposals = get().proposals
      const updatedProposals = proposals.map(proposal => {
        if (proposal.id === proposalId) {
          const updatedVotes = { ...proposal.votes }
          updatedVotes.drep[vote] += newVote.votingPower
          return { ...proposal, votes: updatedVotes }
        }
        return proposal
      })
      
      set({ proposals: updatedProposals })
    } catch (error) {
      console.error('Failed to submit vote:', error)
      throw error
    }
  }
}))