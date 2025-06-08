'use client';

import React, { useState, useEffect } from 'react';
import { VotingInterface } from './VotingInterface';
import { VoteBreakdown } from './VoteBreakdown';
import { 
  useProposalVoting, 
  useVotingUpdates,
  useVotingTimeRemaining 
} from '../../hooks/useVoting';
import { GovernanceAction } from '../../types/voting';

interface ProposalVotingPageProps {
  proposalId: string;
  walletAddress?: string;
  voterType?: 'drep' | 'spo' | 'constitutional-council';
  votingPower?: number;
}

// Proposal Timeline Component
function ProposalTimeline({ proposal }: { proposal: GovernanceAction }) {
  const { formatTimeRemaining, isActive } = useVotingTimeRemaining(proposal.votingEndDate);
  
  const timelineEvents = [
    {
      title: 'Proposal Submitted',
      date: proposal.submissionDate,
      status: 'completed',
      description: 'Proposal submitted to blockchain with required deposit'
    },
    {
      title: 'Voting Period Started',
      date: proposal.votingStartDate,
      status: new Date() >= proposal.votingStartDate ? 'completed' : 'pending',
      description: 'Community voting period begins'
    },
    {
      title: 'Voting Period Ends',
      date: proposal.votingEndDate,
      status: !isActive ? 'completed' : 'active',
      description: isActive ? formatTimeRemaining() : 'Voting period has ended'
    },
    {
      title: 'Proposal Resolution',
      date: proposal.finalizedAt || new Date(proposal.votingEndDate.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 days after voting ends
      status: proposal.outcome ? 'completed' : 'pending',
      description: proposal.outcome || 'Awaiting final resolution'
    }
  ];

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Proposal Timeline</h3>
      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
              event.status === 'completed' 
                ? 'bg-green-500' 
                : event.status === 'active'
                ? 'bg-blue-500 animate-pulse'
                : 'bg-gray-300'
            }`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${
                  event.status === 'active' ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {event.title}
                </h4>
                <span className="text-sm text-gray-500">
                  {event.date.toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Proposal Header Component
function ProposalHeader({ proposal }: { proposal: GovernanceAction }) {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'active': 'bg-green-100 text-green-800 border-green-300',
      'expired': 'bg-gray-100 text-gray-800 border-gray-300',
      'ratified': 'bg-blue-100 text-blue-800 border-blue-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
        statusColors[status as keyof typeof statusColors] || statusColors.pending
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'parameter-change': '⚙️',
      'hard-fork': '🔄',
      'treasury-withdrawal': '💰',
      'constitutional-change': '📜'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{getTypeIcon(proposal.type)}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
              <p className="text-sm text-gray-600">
                Proposal ID: {proposal.id} • Type: {proposal.type.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(proposal.status)}
          <div className="text-sm text-gray-500">
            Impact: {proposal.metadata.estimatedImpact.charAt(0).toUpperCase() + proposal.metadata.estimatedImpact.slice(1)}
          </div>
        </div>
      </div>

      <div className="prose max-w-none">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-gray-700 mb-4">{proposal.description}</p>
        
        <h3 className="text-lg font-semibold mb-2">Rationale</h3>
        <p className="text-gray-700">{proposal.rationale}</p>
      </div>

      {proposal.metadata.tags && proposal.metadata.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Tags:</span>
            {proposal.metadata.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Vote History Component
function VoteHistory({ proposalId }: { proposalId: string }) {
  // This would fetch recent votes from the API
  const [recentVotes, setRecentVotes] = useState([]);
  
  // Mock data for demonstration
  const mockVotes = [
    {
      id: '1',
      voterType: 'drep',
      vote: 'yes',
      votingPower: 150000,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      rationale: 'This proposal aligns with the long-term vision of the ecosystem.'
    },
    {
      id: '2',
      voterType: 'spo',
      vote: 'no',
      votingPower: 75000,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      rationale: 'The implementation timeline is too aggressive for our infrastructure.'
    },
    {
      id: '3',
      voterType: 'constitutional-council',
      vote: 'yes',
      votingPower: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      rationale: 'Constitutional compliance review passed.'
    }
  ];

  const getVoterTypeLabel = (type: string) => {
    const labels = {
      'drep': 'DRep',
      'spo': 'SPO',
      'constitutional-council': 'Constitutional Council'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getVoteIcon = (vote: string) => {
    const icons = {
      'yes': '✅',
      'no': '❌',
      'abstain': '⚪'
    };
    return icons[vote as keyof typeof icons] || '•';
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Votes</h3>
      <div className="space-y-3">
        {mockVotes.map((vote) => (
          <div key={vote.id} className="border-l-4 border-gray-200 pl-4 py-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span>{getVoteIcon(vote.vote)}</span>
                <span className="font-medium">{getVoterTypeLabel(vote.voterType)}</span>
                <span className="text-sm text-gray-600">
                  voted {vote.vote.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {vote.votingPower.toLocaleString()} voting power
              </div>
            </div>
            {vote.rationale && (
              <p className="text-sm text-gray-600 italic">"{vote.rationale}"</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {vote.timestamp.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <button className="text-sm text-blue-600 hover:text-blue-800">
          View all votes →
        </button>
      </div>
    </div>
  );
}

// Main Proposal Voting Page Component
export function ProposalVotingPage({
  proposalId,
  walletAddress,
  voterType,
  votingPower = 0
}: ProposalVotingPageProps) {
  const [voteSuccessMessage, setVoteSuccessMessage] = useState<string | null>(null);
  const [voteErrorMessage, setVoteErrorMessage] = useState<string | null>(null);

  // Hooks
  const { data: votingInfo, isLoading, error } = useProposalVoting(proposalId);
  const { lastEvent } = useVotingUpdates(proposalId);

  // Handle real-time updates
  useEffect(() => {
    if (lastEvent) {
      console.log('Received voting update:', lastEvent);
      // Show notification or update UI based on event type
    }
  }, [lastEvent]);

  const handleVoteSuccess = (vote: any) => {
    setVoteSuccessMessage(`Vote successfully submitted! Transaction hash: ${vote.txHash}`);
    setVoteErrorMessage(null);
    
    // Clear success message after 10 seconds
    setTimeout(() => setVoteSuccessMessage(null), 10000);
  };

  const handleVoteError = (error: any) => {
    setVoteErrorMessage(`Vote submission failed: ${error.message}`);
    setVoteSuccessMessage(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !votingInfo) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Proposal</h2>
          <p className="text-red-600">
            {error?.message || 'Failed to load proposal voting information'}
          </p>
        </div>
      </div>
    );
  }

  const { proposal } = votingInfo;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Success/Error Messages */}
      {voteSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <p className="text-green-800">{voteSuccessMessage}</p>
          </div>
        </div>
      )}

      {voteErrorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">❌</span>
            <p className="text-red-800">{voteErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Proposal Header */}
      <ProposalHeader proposal={proposal} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Voting Interface */}
        <div className="space-y-6">
          <VotingInterface
            proposal={proposal}
            walletAddress={walletAddress}
            voterType={voterType}
            votingPower={votingPower}
            onVoteSuccess={handleVoteSuccess}
            onVoteError={handleVoteError}
          />
          
          <ProposalTimeline proposal={proposal} />
        </div>

        {/* Right Column - Vote Breakdown */}
        <div className="space-y-6">
          <VoteBreakdown 
            proposal={proposal}
            showDetails={true}
            realTimeUpdates={true}
          />
          
          <VoteHistory proposalId={proposalId} />
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          About Cardano Governance Voting
        </h3>
        <div className="text-blue-700 space-y-2">
          <p>
            • <strong>DReps (Delegate Representatives):</strong> Vote on behalf of delegated ADA holders
          </p>
          <p>
            • <strong>SPOs (Stake Pool Operators):</strong> Vote with their operational stake
          </p>
          <p>
            • <strong>Constitutional Council:</strong> Ensures proposals comply with the Cardano Constitution
          </p>
          <p className="mt-3 text-sm">
            All three groups must meet their respective thresholds for a proposal to pass.
            Votes are recorded permanently on the Cardano blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}