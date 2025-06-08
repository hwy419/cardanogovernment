'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DRepCard } from '@/components/governance/drep-card'
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
  Users, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  TrendingUp,
  Vote,
  Star,
  Clock,
  Shield
} from 'lucide-react'
import { cn, formatAda, formatPercentage } from '@/lib/utils'

const DREP_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'retired', label: 'Retired' }
]

const FOCUS_AREAS = [
  { value: 'all', label: 'All Focus Areas' },
  { value: 'technical', label: 'Technical' },
  { value: 'treasury', label: 'Treasury' },
  { value: 'community', label: 'Community' },
  { value: 'governance', label: 'Governance' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'education', label: 'Education' },
  { value: 'developer-tools', label: 'Developer Tools' }
]

const SORT_OPTIONS = [
  { value: 'voting-power', label: 'Voting Power (High to Low)' },
  { value: 'delegators', label: 'Most Delegators' },
  { value: 'reputation', label: 'Highest Reputation' },
  { value: 'participation', label: 'Participation Rate' },
  { value: 'newest', label: 'Recently Registered' },
  { value: 'response-time', label: 'Fastest Response' }
]

const MINIMUM_VOTING_POWER = [
  { value: '0', label: 'Any Amount' },
  { value: '10000', label: '10,000+ ADA' },
  { value: '100000', label: '100,000+ ADA' },
  { value: '1000000', label: '1,000,000+ ADA' },
  { value: '10000000', label: '10,000,000+ ADA' }
]

export default function DRepsPage() {
  const { 
    dreps, 
    isLoading, 
    fetchDReps 
  } = useGovernanceStore()
  
  const { isConnected } = useWalletStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [focusAreaFilter, setFocusAreaFilter] = useState('all')
  const [minVotingPower, setMinVotingPower] = useState('0')
  const [sortBy, setSortBy] = useState('voting-power')

  useEffect(() => {
    fetchDReps()
  }, [fetchDReps])

  // Filter and sort DReps
  const filteredDReps = dreps
    .filter(drep => {
      // Search filter
      if (searchTerm && !drep.address.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !drep.metadata.manifesto.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !drep.metadata.experience.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (statusFilter !== 'all' && drep.status !== statusFilter) {
        return false
      }
      
      // Focus area filter
      if (focusAreaFilter !== 'all' && !drep.metadata.focusAreas.includes(focusAreaFilter)) {
        return false
      }
      
      // Minimum voting power filter
      if (parseFloat(minVotingPower) > 0 && drep.votingPower < parseFloat(minVotingPower)) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'delegators':
          return b.delegatorCount - a.delegatorCount
        case 'reputation':
          return b.performance.reputation - a.performance.reputation
        case 'participation':
          return b.performance.participationRate - a.performance.participationRate
        case 'newest':
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
        case 'response-time':
          return a.performance.avgResponseTime - b.performance.avgResponseTime
        case 'voting-power':
        default:
          return b.votingPower - a.votingPower
      }
    })

  const activeDReps = dreps.filter(d => d.status === 'active')
  const totalVotingPower = dreps.reduce((sum, drep) => sum + drep.votingPower, 0)
  const averageParticipation = dreps.length > 0 
    ? dreps.reduce((sum, drep) => sum + drep.performance.participationRate, 0) / dreps.length 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Delegate Representatives</h1>
              <p className="text-muted-foreground">
                Find and delegate to DReps who align with your governance values
              </p>
            </div>
            
            {isConnected && (
              <Button asChild>
                <Link href="/register-drep">
                  <Shield className="h-4 w-4 mr-2" />
                  Register as DRep
                </Link>
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Active DReps</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {activeDReps.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Total Voting Power</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatAda(totalVotingPower)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Vote className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Avg Participation</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(averageParticipation)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-muted-foreground">Avg Response</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {dreps.length > 0 
                    ? (dreps.reduce((sum, drep) => sum + drep.performance.avgResponseTime, 0) / dreps.length).toFixed(1) + 'h'
                    : '0h'
                  }
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
                placeholder="Search by address, manifesto, or experience..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DREP_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Area</label>
                <Select value={focusAreaFilter} onValueChange={setFocusAreaFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOCUS_AREAS.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Voting Power</label>
                <Select value={minVotingPower} onValueChange={setMinVotingPower}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINIMUM_VOTING_POWER.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                    setFocusAreaFilter('all')
                    setMinVotingPower('0')
                    setSortBy('voting-power')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(searchTerm || statusFilter !== 'all' || focusAreaFilter !== 'all' || minVotingPower !== '0') && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary">
                    Status: {DREP_STATUSES.find(s => s.value === statusFilter)?.label}
                  </Badge>
                )}
                {focusAreaFilter !== 'all' && (
                  <Badge variant="secondary">
                    Focus: {FOCUS_AREAS.find(f => f.value === focusAreaFilter)?.label}
                  </Badge>
                )}
                {minVotingPower !== '0' && (
                  <Badge variant="secondary">
                    Min Power: {MINIMUM_VOTING_POWER.find(p => p.value === minVotingPower)?.label}
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
              {filteredDReps.length} DRep{filteredDReps.length !== 1 ? 's' : ''} Found
            </h2>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sorted by: {SORT_OPTIONS.find(s => s.value === sortBy)?.label}</span>
              {sortBy === 'response-time' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
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
          ) : filteredDReps.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDReps.map((drep) => (
                <DRepCard 
                  key={drep.id} 
                  drep={drep}
                  showDelegateButton={isConnected}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No DReps Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || focusAreaFilter !== 'all' || minVotingPower !== '0'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No Delegate Representatives are currently available.'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all' || focusAreaFilter !== 'all' || minVotingPower !== '0') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setFocusAreaFilter('all')
                      setMinVotingPower('0')
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delegation Info */}
        {isConnected && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                About Delegation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                By delegating your stake to a DRep, you give them the power to vote on your behalf in Cardano governance. 
                You maintain control of your ADA and can change delegation at any time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-green-600">✓ Keep your ADA</div>
                  <div className="text-muted-foreground">Your funds never leave your wallet</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">✓ Earn rewards</div>
                  <div className="text-muted-foreground">Continue earning staking rewards</div>
                </div>
                <div>
                  <div className="font-medium text-purple-600">✓ Change anytime</div>
                  <div className="text-muted-foreground">Switch delegation whenever you want</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination would go here */}
        {filteredDReps.length > 10 && (
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