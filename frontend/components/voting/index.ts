// Export all voting-related components and utilities

// Main Components
export { VotingInterface } from './VotingInterface';
export { VoteBreakdown } from './VoteBreakdown';
export { ProposalVotingPage } from './ProposalVotingPage';

// Hooks
export {
  useVotingState,
  useVoteSubmission,
  useProposalVoting,
  useUserVotes,
  useWalletVotingCapability,
  useTransactionPreview,
  useVotingUpdates,
  useUserVoteStatus,
  useVoteValidation,
  useVotingTimeRemaining
} from '../../hooks/useVoting';

// Types
export type {
  VoteChoice,
  VoterType,
  ProposalStatus,
  ProposalType,
  GovernanceAction,
  Vote,
  VoteSubmission,
  VotingTransaction,
  VotingState,
  VoteBreakdown as VoteBreakdownType,
  ProposalVotingInfo,
  VotingError,
  VotingEvent,
  WalletVotingCapability,
  TransactionPreview
} from '../../types/voting';

// Mock Data (for development and testing)
export {
  mockGovernanceActions,
  mockVotes,
  mockDReps,
  mockUserVotingState,
  mockTransactionPreview,
  mockVotingEvents,
  getMockProposal,
  getMockVotesForProposal,
  generateMockVote
} from '../../lib/mockData';

// Re-export default from mockData for convenience
export { default as mockData } from '../../lib/mockData';