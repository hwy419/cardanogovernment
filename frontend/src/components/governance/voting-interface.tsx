'use client'

import React, { useState } from 'react'
import { GovernanceAction } from '@/types/governance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useWalletStore } from '@/stores/wallet-store'
import { useGovernanceStore } from '@/stores/governance-store'
import { 
  Vote, 
  CheckCircle, 
  XCircle, 
  Minus, 
  AlertTriangle, 
  Info,
  Loader2,
  Wallet,
  ExternalLink
} from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn, formatAda, getDaysRemaining } from '@/lib/utils'

interface VotingInterfaceProps {
  proposal: GovernanceAction
  className?: string
}

export function VotingInterface({ proposal, className }: VotingInterfaceProps) {
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | 'abstain' | null>(null)
  const [rationale, setRationale] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  const { isConnected, address, balance } = useWalletStore()
  const { submitVote } = useGovernanceStore()

  const daysRemaining = getDaysRemaining(proposal.votingEndDate)
  const isVotingActive = proposal.status === 'active' && daysRemaining > 0

  const voteOptions = [
    {
      value: 'yes' as const,
      label: 'Yes',
      description: 'Support this proposal',
      icon: CheckCircle,
      color: 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100',
      selectedColor: 'border-green-500 bg-green-100'
    },
    {
      value: 'no' as const,
      label: 'No',
      description: 'Oppose this proposal',
      icon: XCircle,
      color: 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100',
      selectedColor: 'border-red-500 bg-red-100'
    },
    {
      value: 'abstain' as const,
      label: 'Abstain',
      description: 'No preference on this proposal',
      icon: Minus,
      color: 'text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100',
      selectedColor: 'border-gray-500 bg-gray-100'
    }
  ]

  const handleVoteSubmit = async () => {
    if (!selectedVote || !isConnected) return

    setIsSubmitting(true)
    try {
      await submitVote(proposal.id, selectedVote, rationale)
      setShowConfirmation(false)
      // Show success message
    } catch (error) {
      console.error('Failed to submit vote:', error)
      // Show error message
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Cast Your Vote
          </CardTitle>
          <CardDescription>
            Connect your wallet to participate in governance voting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              You need to connect a Cardano wallet to vote on governance proposals.
              Your vote will be recorded on the blockchain with your wallet signature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!isVotingActive) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Voting Closed
          </CardTitle>
          <CardDescription>
            {proposal.status === 'expired' 
              ? 'This proposal has expired'
              : 'Voting is not currently active for this proposal'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Voting ended on {new Date(proposal.votingEndDate).toLocaleDateString()}.
              You can view the final results above.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Cast Your Vote
        </CardTitle>
        <CardDescription>
          Your vote will be recorded on the Cardano blockchain. {daysRemaining} days remaining.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Vote Options */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Select your vote</Label>
          <div className="grid gap-3">
            {voteOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedVote === option.value
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedVote(option.value)}
                  className={cn(
                    "flex items-center gap-3 p-4 border-2 rounded-lg transition-colors text-left w-full",
                    isSelected ? option.selectedColor : option.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm opacity-80">{option.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Rationale */}
        <div className="space-y-2">
          <Label htmlFor="rationale">
            Rationale <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="rationale"
            placeholder="Explain your reasoning for this vote..."
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="text-xs text-muted-foreground">
            Your rationale will be publicly visible and permanently recorded on the blockchain.
          </div>
        </div>

        {/* Voting Power Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Your voting power</span>
            <span className="font-medium">50,000 ADA</span> {/* This would come from actual data */}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Transaction fee</span>
            <span className="font-medium">~0.17 ADA</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Fees are used to process your vote transaction on the Cardano blockchain.
          </div>
        </div>

        {/* Submit Button */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="w-full"
              disabled={!selectedVote}
            >
              <Vote className="h-4 w-4 mr-2" />
              Submit Vote
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Your Vote</DialogTitle>
              <DialogDescription>
                Please review your vote before submitting to the blockchain.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Proposal</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {proposal.title}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Your Vote</div>
                <div className="flex items-center gap-2">
                  {selectedVote && (
                    <>
                      {voteOptions.find(opt => opt.value === selectedVote)?.icon && 
                        React.createElement(voteOptions.find(opt => opt.value === selectedVote)!.icon, {
                          className: "h-4 w-4"
                        })
                      }
                      <Badge 
                        className={cn(
                          voteOptions.find(opt => opt.value === selectedVote)?.selectedColor
                        )}
                      >
                        {voteOptions.find(opt => opt.value === selectedVote)?.label}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {rationale && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Rationale</div>
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {rationale}
                  </div>
                </div>
              )}
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Once submitted, your vote cannot be changed. This action will be 
                  permanently recorded on the Cardano blockchain.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleVoteSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Vote className="h-4 w-4 mr-2" />
                      Confirm Vote
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Warning */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your vote is final and cannot be changed once submitted. 
            Make sure you understand the proposal before voting.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}