'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CheckCircle2, 
  XCircle, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  Shield, 
  Wallet,
  ExternalLink,
  Info
} from 'lucide-react';

import { 
  useVoteSubmission, 
  useTransactionPreview, 
  useVoteValidation,
  useUserVoteStatus,
  useVotingTimeRemaining 
} from '../../hooks/useVoting';
import { VoteChoice, GovernanceAction, VoteSubmission } from '../../types/voting';

interface VotingInterfaceProps {
  proposal: GovernanceAction;
  walletAddress?: string;
  voterType?: 'drep' | 'spo' | 'constitutional-council';
  votingPower?: number;
  onVoteSuccess?: (vote: any) => void;
  onVoteError?: (error: any) => void;
}

export function VotingInterface({
  proposal,
  walletAddress,
  voterType,
  votingPower = 0,
  onVoteSuccess,
  onVoteError
}: VotingInterfaceProps) {
  const [selectedVote, setSelectedVote] = useState<VoteChoice | null>(null);
  const [rationale, setRationale] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const voteSubmission = useVoteSubmission();
  const transactionPreview = useTransactionPreview();
  const validateVote = useVoteValidation();
  const { data: existingVote } = useUserVoteStatus(proposal.id, walletAddress);
  const { timeRemaining, isActive, formatTimeRemaining } = useVotingTimeRemaining(proposal.votingEndDate);

  // Check if user can vote
  const canVote = walletAddress && voterType && isActive && !existingVote;
  const hasVoted = !!existingVote;

  // Reset form when proposal changes
  useEffect(() => {
    setSelectedVote(null);
    setRationale('');
    setShowPreview(false);
  }, [proposal.id]);

  const handleVoteSelection = (vote: VoteChoice) => {
    setSelectedVote(vote);
    setShowPreview(false);
  };

  const handlePreview = async () => {
    if (!selectedVote || !walletAddress || !voterType) return;

    const voteData: VoteSubmission = {
      proposalId: proposal.id,
      vote: selectedVote,
      rationale: rationale.trim() || undefined,
      walletAddress,
      voterType,
    };

    // Validate vote
    const validation = await validateVote(voteData);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        console.error('Validation error:', error.message);
      });
      return;
    }

    // Generate transaction preview
    transactionPreview.mutate(voteData, {
      onSuccess: () => setShowPreview(true),
      onError: (error) => {
        console.error('Preview failed:', error);
        onVoteError?.(error);
      }
    });
  };

  const handleSubmitVote = async () => {
    if (!selectedVote || !walletAddress || !voterType) return;

    setIsSubmitting(true);

    const voteData: VoteSubmission = {
      proposalId: proposal.id,
      vote: selectedVote,
      rationale: rationale.trim() || undefined,
      walletAddress,
      voterType,
    };

    voteSubmission.mutate(voteData, {
      onSuccess: (result) => {
        setIsSubmitting(false);
        setShowPreview(false);
        onVoteSuccess?.(result);
      },
      onError: (error) => {
        setIsSubmitting(false);
        onVoteError?.(error);
      }
    });
  };

  const getVoteOptionIcon = (vote: VoteChoice) => {
    switch (vote) {
      case 'yes':
        return <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />;
      case 'no':
        return <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />;
      case 'abstain':
        return <Circle className="h-5 w-5 text-gray-500" aria-hidden="true" />;
    }
  };

  const getVoteOptionDescription = (vote: VoteChoice) => {
    switch (vote) {
      case 'yes':
        return 'Support this proposal and its implementation';
      case 'no':
        return 'Oppose this proposal and prevent its implementation';
      case 'abstain':
        return 'Neither support nor oppose, but participate in governance';
    }
  };

  // If voting period has ended
  if (!isActive) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" aria-hidden="true" />
            Voting Period Ended
          </CardTitle>
          <CardDescription>
            This proposal's voting period ended on {proposal.votingEndDate.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        {hasVoted && existingVote && (
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              {getVoteOptionIcon(existingVote.vote)}
              <span className="font-medium">Your vote: {existingVote.vote.toUpperCase()}</span>
              {existingVote.rationale && (
                <span className="text-sm text-gray-600">- {existingVote.rationale}</span>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // If user has already voted
  if (hasVoted && existingVote) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Vote Submitted
          </CardTitle>
          <CardDescription className="text-green-700">
            You have successfully voted on this proposal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                {getVoteOptionIcon(existingVote.vote)}
                <span className="font-medium">Your vote: {existingVote.vote.toUpperCase()}</span>
              </div>
              <Badge variant="secondary">
                {existingVote.votingPower.toLocaleString()} voting power
              </Badge>
            </div>
            {existingVote.rationale && (
              <div className="p-3 bg-white rounded-lg border">
                <Label className="text-sm font-medium text-gray-700">Rationale</Label>
                <p className="text-sm text-gray-600 mt-1">{existingVote.rationale}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-green-700">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <a 
                href={`https://cardanoscan.io/transaction/${existingVote.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                View transaction on blockchain
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user cannot vote
  if (!canVote) {
    const getRestrictionMessage = () => {
      if (!walletAddress) return 'Connect your wallet to vote on governance proposals';
      if (!voterType) return 'Your wallet is not registered for voting. Register as a DRep or SPO to participate.';
      if (!isActive) return 'Voting period has ended for this proposal';
      return 'You are not eligible to vote on this proposal';
    };

    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            Voting Restricted
          </CardTitle>
          <CardDescription className="text-amber-700">
            {getRestrictionMessage()}
          </CardDescription>
        </CardHeader>
        {!walletAddress && (
          <CardContent>
            <Button className="w-full" variant="outline">
              <Wallet className="mr-2 h-4 w-4" aria-hidden="true" />
              Connect Wallet
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
            Cast Your Vote
          </span>
          <Badge variant="outline" className="text-sm">
            {formatTimeRemaining()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Vote as a {voterType?.toUpperCase()} with {votingPower.toLocaleString()} voting power
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Voting Options */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Select your vote
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          </Label>
          <RadioGroup
            value={selectedVote || ''}
            onValueChange={(value) => handleVoteSelection(value as VoteChoice)}
            className="space-y-3"
          >
            {(['yes', 'no', 'abstain'] as VoteChoice[]).map((voteOption) => (
              <div key={voteOption} className="flex items-start space-x-3">
                <RadioGroupItem
                  value={voteOption}
                  id={voteOption}
                  className="mt-1"
                  aria-describedby={`${voteOption}-description`}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={voteOption}
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    {getVoteOptionIcon(voteOption)}
                    {voteOption.toUpperCase()}
                  </Label>
                  <p 
                    id={`${voteOption}-description`}
                    className="text-sm text-gray-600 mt-1"
                  >
                    {getVoteOptionDescription(voteOption)}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Rationale */}
        <div>
          <Label htmlFor="rationale" className="text-base font-medium mb-2 block">
            Rationale 
            {selectedVote === 'no' && (
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            )}
            <span className="text-sm font-normal text-gray-500 ml-2">
              {selectedVote === 'no' ? 'Required for "No" votes' : 'Optional'}
            </span>
          </Label>
          <Textarea
            id="rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Explain your reasoning for this vote (recommended for transparency)..."
            className="min-h-[100px] resize-none"
            maxLength={500}
            aria-describedby="rationale-help"
          />
          <div id="rationale-help" className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Help others understand your decision</span>
            <span>{rationale.length}/500</span>
          </div>
        </div>

        {/* Validation Errors */}
        {selectedVote === 'no' && !rationale.trim() && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              A rationale is required when voting "No" to help the community understand your concerns.
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction Preview */}
        {showPreview && transactionPreview.data && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Transaction Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Vote:</span>
                <span className="font-medium">{selectedVote?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction Fee:</span>
                <span>{(transactionPreview.data.fee / 1000000).toFixed(6)} ADA</span>
              </div>
              <div className="flex justify-between">
                <span>Voting Power:</span>
                <span>{votingPower.toLocaleString()}</span>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitVote}
                disabled={isSubmitting}
                className="flex-1"
                aria-describedby="submit-help"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    <span className="sr-only">Submitting vote...</span>
                    Submitting...
                  </>
                ) : (
                  'Confirm & Submit Vote'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
            <p id="submit-help" className="text-xs text-gray-500 mt-2">
              This action will submit your vote to the Cardano blockchain and cannot be undone.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!showPreview && (
          <Button
            onClick={handlePreview}
            disabled={!selectedVote || (selectedVote === 'no' && !rationale.trim()) || transactionPreview.isPending}
            className="w-full"
            size="lg"
          >
            {transactionPreview.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">Generating preview...</span>
                Generating Preview...
              </>
            ) : (
              'Preview Transaction'
            )}
          </Button>
        )}

        {/* Error Handling */}
        {(voteSubmission.error || transactionPreview.error) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {voteSubmission.error?.message || transactionPreview.error?.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}