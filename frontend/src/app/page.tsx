'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProposalCard } from '@/components/governance/proposal-card'
import { DRepCard } from '@/components/governance/drep-card'
import { WalletConnector } from '@/components/wallet/wallet-connector'
import { useGovernanceStore } from '@/stores/governance-store'
import { useWalletStore } from '@/stores/wallet-store'
import { 
  FileText, 
  Users, 
  Vote, 
  TrendingUp, 
  Activity, 
  Wallet,
  ExternalLink,
  Plus,
  ArrowRight,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react'
import { formatAda, formatPercentage, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { 
    proposals, 
    dreps, 
    isLoading, 
    fetchProposals, 
    fetchDReps 
  } = useGovernanceStore()
  
  const { isConnected, address, balance } = useWalletStore()

  useEffect(() => {
    fetchProposals()
    fetchDReps()
  }, [fetchProposals, fetchDReps])

  // Calculate dashboard statistics
  const activeProposals = proposals.filter(p => p.status === 'active')
  const totalVotingPower = dreps.reduce((sum, drep) => sum + drep.votingPower, 0)
  const averageParticipation = dreps.length > 0 
    ? dreps.reduce((sum, drep) => sum + drep.performance.participationRate, 0) / dreps.length 
    : 0

  const dashboardStats = [
    {
      title: 'Active Proposals',
      value: activeProposals.length.toString(),
      description: 'Currently voting',
      icon: FileText,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Active DReps',
      value: dreps.filter(d => d.status === 'active').length.toString(),
      description: 'Delegate representatives',
      icon: Users,
      change: '+3%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Voting Power',
      value: formatAda(totalVotingPower),
      description: 'ADA delegated',
      icon: Vote,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Avg Participation',
      value: formatPercentage(averageParticipation),
      description: 'DRep participation rate',
      icon: Activity,
      change: '+2%',
      changeType: 'positive' as const
    }
  ]

  const quickActions = [
    {
      title: 'Browse Proposals',
      description: 'View and vote on active governance proposals',
      href: '/proposals',
      icon: FileText,
      badge: `${activeProposals.length} active`
    },
    {
      title: 'Find DReps',
      description: 'Discover and delegate to representatives',
      href: '/dreps',
      icon: Users,
      badge: `${dreps.length} available`
    },
    {
      title: 'Create Proposal',
      description: 'Submit a new governance proposal',
      href: '/create-proposal',
      icon: Plus,
      requiresWallet: true
    },
    {
      title: 'View Analytics',
      description: 'Explore governance metrics and trends',
      href: '/analytics',
      icon: BarChart3
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cardano Governance
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Participate in Cardano's decentralized governance ecosystem. Vote on proposals, 
              delegate to representatives, and help shape the future of the network.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isConnected ? (
              <WalletConnector>
                <Button size="lg" className="text-lg px-8">
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect Wallet to Start
                </Button>
              </WalletConnector>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/proposals">
                    <Vote className="h-5 w-5 mr-2" />
                    Vote on Proposals
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dreps">
                    <Users className="h-5 w-5 mr-2" />
                    Browse DReps
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Statistics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{stat.description}</span>
                    <Badge 
                      variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>

        {/* Connected Wallet Info */}
        {isConnected && (
          <section>
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Wallet Connected
                </CardTitle>
                <CardDescription>
                  You're ready to participate in Cardano governance
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Your Address</div>
                  <code className="text-sm bg-white/50 px-2 py-1 rounded">
                    {address?.slice(0, 12)}...{address?.slice(-8)}
                  </code>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="font-semibold">{formatAda(balance)} ADA</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Voting Power</div>
                  <div className="font-semibold">50,000 ADA</div> {/* This would come from actual delegation data */}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Actions */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              const canAccess = !action.requiresWallet || isConnected
              
              return (
                <Card 
                  key={action.title} 
                  className={`group transition-all hover:shadow-md ${!canAccess ? 'opacity-50' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-primary" />
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {canAccess ? (
                      <Button asChild className="w-full group-hover:bg-primary/90">
                        <Link href={action.href}>
                          Get Started
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Recent Proposals */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Active Proposals</h2>
            <Button variant="outline" asChild>
              <Link href="/proposals">
                View All
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeProposals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProposals.slice(0, 4).map((proposal) => (
                <ProposalCard 
                  key={proposal.id} 
                  proposal={proposal} 
                  compact={true}
                  showVoteButton={isConnected}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Proposals</h3>
                <p className="text-muted-foreground">
                  There are currently no active governance proposals. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Top DReps */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Top DReps</h2>
            <Button variant="outline" asChild>
              <Link href="/dreps">
                View All
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : dreps.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dreps
                .filter(d => d.status === 'active')
                .sort((a, b) => b.votingPower - a.votingPower)
                .slice(0, 4)
                .map((drep) => (
                  <DRepCard 
                    key={drep.id} 
                    drep={drep} 
                    compact={true}
                    showDelegateButton={isConnected}
                  />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No DReps Available</h3>
                <p className="text-muted-foreground">
                  No Delegate Representatives are currently registered.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
