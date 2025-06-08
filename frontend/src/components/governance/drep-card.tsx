'use client'

import React from 'react'
import Link from 'next/link'
import { DRep } from '@/types/governance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Star, 
  Vote,
  ExternalLink,
  Calendar,
  Shield
} from 'lucide-react'
import { 
  formatDate, 
  formatAda,
  formatPercentage,
  truncateAddress
} from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DRepCardProps {
  drep: DRep
  className?: string
  showDelegateButton?: boolean
  compact?: boolean
}

export function DRepCard({ 
  drep, 
  className, 
  showDelegateButton = true,
  compact = false 
}: DRepCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'inactive':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'retired':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getReputationColor = (reputation: number) => {
    if (reputation >= 4.5) return 'text-green-600'
    if (reputation >= 4.0) return 'text-blue-600'
    if (reputation >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFocusAreaBadgeColor = (area: string) => {
    const colors = {
      'technical': 'bg-blue-100 text-blue-800',
      'treasury': 'bg-green-100 text-green-800',
      'community': 'bg-purple-100 text-purple-800',
      'governance': 'bg-orange-100 text-orange-800',
      'sustainability': 'bg-emerald-100 text-emerald-800',
      'education': 'bg-pink-100 text-pink-800',
      'developer-tools': 'bg-indigo-100 text-indigo-800',
    }
    return colors[area as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getInitials = (address: string) => {
    return address.slice(0, 2).toUpperCase()
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className={cn("pb-4", compact && "pb-2")}>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-muted">
            <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${drep.address}`} />
            <AvatarFallback className="text-sm font-semibold">
              {getInitials(drep.address)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-xs", getStatusColor(drep.status))}>
                {drep.status.charAt(0).toUpperCase() + drep.status.slice(1)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                DRep
              </Badge>
            </div>
            
            <CardTitle className={cn("text-lg", compact && "text-base")}>
              <Link 
                href={`/dreps/${drep.id}`}
                className="hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                DRep {truncateAddress(drep.address, 8, 6)}
              </Link>
            </CardTitle>
            
            <div className="text-sm text-muted-foreground">
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {truncateAddress(drep.address, 12, 8)}
              </code>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">Voting Power</div>
            <div className="font-semibold text-lg">
              {formatAda(drep.votingPower)}
            </div>
            <div className="text-xs text-muted-foreground">ADA</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("pt-0", compact && "pt-0")}>
        <div className="space-y-4">
          {/* Focus Areas */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Focus Areas</div>
            <div className="flex flex-wrap gap-1">
              {drep.metadata.focusAreas.map((area) => (
                <Badge 
                  key={area} 
                  variant="secondary" 
                  className={cn("text-xs", getFocusAreaBadgeColor(area))}
                >
                  {area.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Manifesto Preview */}
          {!compact && drep.metadata.manifesto && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Manifesto</div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {drep.metadata.manifesto}
              </p>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4" />
                <span>Delegators</span>
              </div>
              <div className="text-lg font-semibold">
                {drep.delegatorCount.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm">
                <Vote className="h-4 w-4" />
                <span>Participation</span>
              </div>
              <div className="text-lg font-semibold">
                {formatPercentage(drep.performance.participationRate)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span>Avg Response</span>
              </div>
              <div className="text-lg font-semibold">
                {drep.performance.avgResponseTime.toFixed(1)}h
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4" />
                <span>Reputation</span>
              </div>
              <div className={cn("text-lg font-semibold", getReputationColor(drep.performance.reputation))}>
                {drep.performance.reputation.toFixed(1)}/5
              </div>
            </div>
          </div>

          {/* Participation Rate Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Participation Rate</span>
              <span className="text-muted-foreground">
                {drep.performance.totalVotes} votes cast
              </span>
            </div>
            <Progress 
              value={drep.performance.participationRate} 
              className="h-2"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              Registered {formatDate(drep.registrationDate)}
            </div>
            
            <div className="flex items-center gap-2">
              {showDelegateButton && drep.status === 'active' && (
                <Button size="sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Delegate
                </Button>
              )}
              
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dreps/${drep.id}`}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}