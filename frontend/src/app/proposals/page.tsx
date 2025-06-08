'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProposalCard } from '@/components/governance/proposal-card'
import { useGovernanceStore } from '@/stores/governance-store'
import { useWalletStore } from '@/stores/wallet-store'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileText, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  Clock,
  TrendingUp,
  Vote,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const PROPOSAL_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'ratified', label: 'Ratified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' }
]

const PROPOSAL_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'parameter-change', label: 'Parameter Change' },
  { value: 'hard-fork', label: 'Hard Fork' },
  { value: 'treasury-withdrawal', label: 'Treasury Withdrawal' },
  { value: 'constitutional-change', label: 'Constitutional Change' }
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'most-votes', label: 'Most Votes' }
]

export default function ProposalsPage() {
  const { 
    proposals, 
    isLoading, 
    fetchProposals, 
    proposalFilters,
    updateProposalFilters 
  } = useGovernanceStore()
  
  const { isConnected } = useWalletStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  // Filter and sort proposals
  const filteredProposals = proposals
    .filter(proposal => {
      // Search filter
      if (searchTerm && !proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !proposal.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (statusFilter !== 'all' && proposal.status !== statusFilter) {
        return false
      }
      
      // Type filter
      if (typeFilter !== 'all' && proposal.type !== typeFilter) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime()
        case 'ending-soon':
          return new Date(a.votingEndDate).getTime() - new Date(b.votingEndDate).getTime()
        case 'most-votes':
          const aTotalVotes = a.votes.drep.yes + a.votes.drep.no + a.votes.drep.abstain
          const bTotalVotes = b.votes.drep.yes + b.votes.drep.no + b.votes.drep.abstain
          return bTotalVotes - aTotalVotes
        case 'newest':
        default:
          return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
      }
    })

  const activeProposals = proposals.filter(p => p.status === 'active')
  const pendingProposals = proposals.filter(p => p.status === 'pending')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Governance Proposals</h1>
              <p className="text-muted-foreground">
                Browse and vote on Cardano governance proposals
              </p>
            </div>
            
            {isConnected && (
              <Button asChild>
                <Link href="/create-proposal">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Proposal
                </Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Vote className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {activeProposals.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingProposals.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {proposals.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Participation</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  78%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search proposals by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setTypeFilter('all')
                    setSortBy('newest')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary">
                    Status: {PROPOSAL_STATUSES.find(s => s.value === statusFilter)?.label}
                  </Badge>
                )}
                {typeFilter !== 'all' && (
                  <Badge variant="secondary">
                    Type: {PROPOSAL_TYPES.find(t => t.value === typeFilter)?.label}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredProposals.length} Proposal{filteredProposals.length !== 1 ? 's' : ''} Found
            </h2>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sorted by: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}</span>
              {sortBy === 'newest' ? (
                <SortDesc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4" />
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                      <div className="h-8 bg-muted rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProposals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProposals.map((proposal) => (
                <ProposalCard 
                  key={proposal.id} 
                  proposal={proposal}
                  showVoteButton={isConnected}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Proposals Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No governance proposals are currently available.'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setTypeFilter('all')
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination would go here */}
        {filteredProposals.length > 10 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Badge variant="outline">Page 1 of 1</Badge>
              <Button variant="outline" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}