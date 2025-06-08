import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  VoteSubmission, 
  Vote, 
  VotingState, 
  ProposalVotingInfo, 
  VotingError,
  WalletVotingCapability,
  TransactionPreview,
  VotingEvent
} from '../types/voting';

// Hook for managing overall voting state
export function useVotingState() {
  const [votingState, setVotingState] = useState<VotingState>({
    isConnected: false,
    userVotes: [],
    pendingVotes: [],
    votingPower: 0,
    userType: null,
    canVote: false,
  });

  const updateVotingState = useCallback((updates: Partial<VotingState>) => {
    setVotingState(prev => ({ ...prev, ...updates }));
  }, []);

  return { votingState, updateVotingState };
}

// Hook for submitting votes with optimistic updates
export function useVoteSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (voteData: VoteSubmission): Promise<Vote> => {
      // Optimistic update - create properly typed temporary vote
      const tempVote: Vote = {
        id: `temp-${Date.now()}`,
        proposalId: voteData.proposalId,
        voterId: voteData.walletAddress,
        voterType: voteData.voterType,
        vote: voteData.vote,
        votingPower: 0, // Will be updated with actual response
        txHash: '',
        timestamp: new Date(),
        rationale: voteData.rationale,
        blockHeight: 0,
        epochNumber: 0,
      };

      queryClient.setQueryData(['user-votes'], (old: Vote[] = []) => [
        ...old,
        tempVote
      ]);
      
      // Submit vote to blockchain
      const response = await fetch('/api/voting/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      return response.json();
    },
    onError: (error: Error) => {
      // Revert optimistic update
      queryClient.invalidateQueries(['user-votes']);
      console.error('Vote submission failed:', error);
    },
    onSuccess: (result: Vote) => {
      // Update with confirmed transaction data
      queryClient.setQueryData(['user-votes'], (old: Vote[] = []) =>
        old.map(vote => 
          vote.id.startsWith('temp-') && vote.proposalId === result.proposalId
            ? result
            : vote
        )
      );
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries(['proposal-votes', result.proposalId]);
      queryClient.invalidateQueries(['proposal-details', result.proposalId]);
    }
  });
}

// Hook for getting voting information for a specific proposal
export function useProposalVoting(proposalId: string) {
  return useQuery({
    queryKey: ['proposal-voting-info', proposalId],
    queryFn: async (): Promise<ProposalVotingInfo> => {
      const response = await fetch(`/api/proposals/${proposalId}/voting`);
      if (!response.ok) {
        throw new Error('Failed to fetch voting information');
      }
      return response.json();
    },
    enabled: !!proposalId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for live updates
  });
}

// Hook for getting user's voting history
export function useUserVotes(userId?: string) {
  return useQuery({
    queryKey: ['user-votes', userId],
    queryFn: async (): Promise<Vote[]> => {
      const url = userId ? `/api/votes/user/${userId}` : '/api/votes/me';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch user votes');
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

// Hook for wallet voting capability check
export function useWalletVotingCapability(walletAddress?: string) {
  return useQuery({
    queryKey: ['wallet-voting-capability', walletAddress],
    queryFn: async (): Promise<WalletVotingCapability> => {
      const response = await fetch(`/api/wallet/${walletAddress}/voting-capability`);
      if (!response.ok) {
        throw new Error('Failed to check voting capability');
      }
      return response.json();
    },
    enabled: !!walletAddress,
    staleTime: 300000, // 5 minutes
  });
}

// Hook for transaction preview before voting
export function useTransactionPreview() {
  return useMutation({
    mutationFn: async (voteData: VoteSubmission): Promise<TransactionPreview> => {
      const response = await fetch('/api/voting/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate transaction preview');
      }

      return response.json();
    },
  });
}

// Hook for real-time voting updates via WebSocket
export function useVotingUpdates(proposalId?: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastEvent, setLastEvent] = useState<VotingEvent | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!proposalId) return;

    // Use environment variable with fallback
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/voting?proposalId=${proposalId}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to voting updates');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const votingEvent: VotingEvent = JSON.parse(event.data);
        setLastEvent(votingEvent);
        
        // Handle different event types
        switch (votingEvent.type) {
          case 'VOTE_CAST':
            queryClient.invalidateQueries(['proposal-voting-info', proposalId]);
            queryClient.invalidateQueries(['proposal-votes', proposalId]);
            break;
          case 'VOTE_UPDATED':
            queryClient.invalidateQueries(['proposal-voting-info', proposalId]);
            break;
          case 'PROPOSAL_STATUS_CHANGED':
            queryClient.invalidateQueries(['proposal-voting-info', proposalId]);
            queryClient.invalidateQueries(['proposals']);
            break;
          case 'VOTING_PERIOD_ENDED':
            queryClient.invalidateQueries(['proposal-voting-info', proposalId]);
            break;
        }
      } catch (error) {
        console.error('Error parsing voting event:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from voting updates');
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [proposalId, queryClient]);

  return { socket, lastEvent, isConnected: !!socket };
}

// Hook for checking if user has already voted on a proposal
export function useUserVoteStatus(proposalId: string, userId?: string) {
  return useQuery({
    queryKey: ['user-vote-status', proposalId, userId],
    queryFn: async (): Promise<Vote | null> => {
      if (!userId) return null;
      
      const response = await fetch(`/api/proposals/${proposalId}/votes/user/${userId}`);
      if (response.status === 404) {
        return null; // User hasn't voted
      }
      if (!response.ok) {
        throw new Error('Failed to check vote status');
      }
      return response.json();
    },
    enabled: !!proposalId && !!userId,
  });
}

// Hook for vote validation before submission
export function useVoteValidation() {
  return useCallback(async (voteData: VoteSubmission): Promise<{ valid: boolean; errors: VotingError[] }> => {
    const errors: VotingError[] = [];

    // Basic validation
    if (!voteData.proposalId) {
      errors.push({ code: 'MISSING_PROPOSAL', message: 'Proposal ID is required' });
    }

    if (!voteData.vote) {
      errors.push({ code: 'MISSING_VOTE', message: 'Vote choice is required' });
    }

    if (!voteData.walletAddress) {
      errors.push({ code: 'MISSING_WALLET', message: 'Wallet address is required' });
    }

    // Rationale validation for certain vote types
    if (voteData.vote === 'no' && !voteData.rationale) {
      errors.push({ 
        code: 'MISSING_RATIONALE', 
        message: 'Rationale is required for "No" votes',
        details: { voteType: voteData.vote }
      });
    }

    // Server-side validation
    if (errors.length === 0) {
      try {
        const response = await fetch('/api/voting/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(voteData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          errors.push(...(errorData.errors || [{ code: 'VALIDATION_FAILED', message: 'Server validation failed' }]));
        }
      } catch (error) {
        errors.push({ code: 'NETWORK_ERROR', message: 'Failed to validate vote' });
      }
    }

    return { valid: errors.length === 0, errors };
  }, []);
}

// Hook for calculating time remaining in voting period
export function useVotingTimeRemaining(endDate: Date) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const remaining = Math.max(0, end - now);
      
      setTimeRemaining(remaining);
      setIsActive(remaining > 0);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const formatTimeRemaining = useCallback(() => {
    if (timeRemaining <= 0) return 'Voting ended';

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }, [timeRemaining]);

  return { 
    timeRemaining, 
    isActive, 
    formatTimeRemaining,
    daysRemaining: Math.floor(timeRemaining / (1000 * 60 * 60 * 24)),
    hoursRemaining: Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutesRemaining: Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  };
}