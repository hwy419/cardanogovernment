'use client'

import React from 'react'
import Link from 'next/link'
import { GovernanceAction } from '@/types/governance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ExternalLink,
  Vote
} from 'lucide-react'
import { 
  formatDate, 
  formatDateTime, 
  getDaysRemaining, 
  getProposalStatusColor,
  formatAda,
  formatPercentage
} from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProposalCardProps {
  proposal: GovernanceAction
  className?: string
  showVoteButton?: boolean
  compact?: boolean
}

export function ProposalCard({ 
  proposal, 
  className, 
  showVoteButton = true,
  compact = false 
}: ProposalCardProps) {
  const daysRemaining = getDaysRemaining(proposal.votingEndDate)
  const isVotingActive = proposal.status === 'active' && daysRemaining > 0
  
  // Calculate total votes and percentages
  const totalDRepVotes = proposal.votes.drep.yes + proposal.votes.drep.no + proposal.votes.drep.abstain
  const totalSPOVotes = proposal.votes.spo.yes + proposal.votes.spo.no + proposal.votes.spo.abstain
  const totalCCVotes = proposal.votes.constitutionalCouncil.yes + proposal.votes.constitutionalCouncil.no + proposal.votes.constitutionalCouncil.abstain
  
  const drepYesPercentage = totalDRepVotes > 0 ? (proposal.votes.drep.yes / totalDRepVotes) * 100 : 0
  const spoYesPercentage = totalSPOVotes > 0 ? (proposal.votes.spo.yes / totalSPOVotes) * 100 : 0
  const ccYesPercentage = totalCCVotes > 0 ? (proposal.votes.constitutionalCouncil.yes / totalCCVotes) * 100 : 0

  const getProposalTypeIcon = (type: string) => {
    switch (type) {
      case 'parameter-change':
        return '⚙️'
      case 'hard-fork':
        return '🔄'
      case 'treasury-withdrawal':
        return '💰'
      case 'constitutional-change':
        return '📜'
      default:
        return '📄'
    }
  }

  const getProposalTypeName = (type: string) => {
    switch (type) {
      case 'parameter-change':
        return 'Parameter Change'
      case 'hard-fork':
        return 'Hard Fork'
      case 'treasury-withdrawal':
        return 'Treasury Withdrawal'
      case 'constitutional-change':
        return 'Constitutional Change'
      default:
        return 'Governance Action'
    }
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className={cn("pb-4", compact && "pb-2")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getProposalTypeIcon(proposal.type)}</span>
              <Badge variant="outline" className="text-xs">
                {getProposalTypeName(proposal.type)}
              </Badge>
              <Badge 
                className={cn("text-xs", getProposalStatusColor(proposal.status))}
              >
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
            </div>
            
            <CardTitle className={cn("line-clamp-2", compact ? "text-lg" : "text-xl")}>
              <Link 
                href={`/proposals/${proposal.id}`}
                className="hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                {proposal.title}
              </Link>
            </CardTitle>
            
            {!compact && (
              <CardDescription className="line-clamp-2 mt-2">
                {proposal.description}
              </CardDescription>
            )}
          </div>
          
          {isVotingActive && (
            <div className="text-right text-sm">
              <div className="text-muted-foreground">Time left</div>
              <div className="font-semibold text-orange-600">
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn("pt-0", compact && "pt-0")}>
        {/* Voting Progress */}
        <div className="space-y-4">
          <div className="space-y-3">
            {/* DRep Voting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">DRep Votes</span>
                <span className="text-muted-foreground">
                  {formatAda(totalDRepVotes)} ADA
                </span>
              </div>
              <div className="flex gap-1 h-2">
                <div 
                  className="bg-green-500 rounded-l"
                  style={{ width: `${drepYesPercentage}%` }}
                  title={`Yes: ${formatPercentage(drepYesPercentage)}`}
                />
                <div 
                  className="bg-red-500"
                  style={{ width: `${(proposal.votes.drep.no / totalDRepVotes) * 100}%` }}
                  title={`No: ${formatPercentage((proposal.votes.drep.no / totalDRepVotes) * 100)}`}
                />
                <div 
                  className="bg-gray-400 rounded-r"
                  style={{ width: `${(proposal.votes.drep.abstain / totalDRepVotes) * 100}%` }}
                  title={`Abstain: ${formatPercentage((proposal.votes.drep.abstain / totalDRepVotes) * 100)}`}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {formatPercentage(drepYesPercentage)}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  {formatPercentage((proposal.votes.drep.no / totalDRepVotes) * 100)}
                </span>
                <span className="flex items-center gap-1">
                  <Minus className="h-3 w-3 text-gray-600" />
                  {formatPercentage((proposal.votes.drep.abstain / totalDRepVotes) * 100)}
                </span>
              </div>
            </div>

            {/* SPO Voting - Compact */}
            {!compact && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">SPO Votes</span>
                  <span className="text-muted-foreground">
                    {formatAda(totalSPOVotes)} ADA
                  </span>
                </div>
                <div className="flex gap-1 h-2">
                  <div 
                    className="bg-green-500 rounded-l"
                    style={{ width: `${spoYesPercentage}%` }}
                  />
                  <div 
                    className="bg-red-500"
                    style={{ width: `${(proposal.votes.spo.no / totalSPOVotes) * 100}%` }}
                  />
                  <div 
                    className="bg-gray-400 rounded-r"
                    style={{ width: `${(proposal.votes.spo.abstain / totalSPOVotes) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatPercentage(spoYesPercentage)}</span>
                  <span>{formatPercentage((proposal.votes.spo.no / totalSPOVotes) * 100)}</span>
                  <span>{formatPercentage((proposal.votes.spo.abstain / totalSPOVotes) * 100)}</span>
                </div>
              </div>
            )}

            {/* Constitutional Council Voting - Compact */}
            {!compact && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Constitutional Council</span>
                  <span className="text-muted-foreground">
                    {totalCCVotes} members
                  </span>
                </div>
                <div className="flex gap-1 h-2">
                  <div 
                    className="bg-green-500 rounded-l"
                    style={{ width: `${ccYesPercentage}%` }}
                  />
                  <div 
                    className="bg-red-500"
                    style={{ width: `${(proposal.votes.constitutionalCouncil.no / totalCCVotes) * 100}%` }}
                  />
                  <div 
                    className="bg-gray-400 rounded-r"
                    style={{ width: `${(proposal.votes.constitutionalCouncil.abstain / totalCCVotes) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{proposal.votes.constitutionalCouncil.yes}</span>
                  <span>{proposal.votes.constitutionalCouncil.no}</span>
                  <span>{proposal.votes.constitutionalCouncil.abstain}</span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Submitted {formatDate(proposal.submissionDate)}</span>
              </div>
              {isVotingActive && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Ends {formatDate(proposal.votingEndDate)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {showVoteButton && isVotingActive && (
                <Button size="sm" asChild>
                  <Link href={`/vote/${proposal.id}`}>
                    <Vote className="h-4 w-4 mr-1" />
                    Vote
                  </Link>
                </Button>
              )}
              
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/proposals/${proposal.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}