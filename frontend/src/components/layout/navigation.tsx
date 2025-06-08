'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WalletConnector } from '@/components/wallet/wallet-connector'
import { useWalletStore } from '@/stores/wallet-store'
import { 
  Home, 
  FileText, 
  Users, 
  Vote, 
  Plus, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview of governance activity'
  },
  {
    name: 'Proposals',
    href: '/proposals',
    icon: FileText,
    description: 'Browse and vote on governance proposals',
    badge: 'active'
  },
  {
    name: 'DReps',
    href: '/dreps',
    icon: Users,
    description: 'Delegate Representative directory'
  },
  {
    name: 'Vote',
    href: '/vote',
    icon: Vote,
    description: 'Cast your vote on active proposals',
    requiresWallet: true
  },
  {
    name: 'Create Proposal',
    href: '/create-proposal',
    icon: Plus,
    description: 'Submit a new governance proposal',
    requiresWallet: true
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Governance metrics and insights'
  }
]

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  const { isConnected } = useWalletStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const filteredNavigation = navigation.filter(item => {
    if (item.requiresWallet && !isConnected) {
      return false
    }
    return true
  })

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-6 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-lg font-bold text-primary-foreground">₳</span>
          </div>
          <div className="hidden font-bold sm:inline-block">
            Cardano Governance
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground"
                )}
                aria-label={item.description}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {item.badge && (
                  <Badge variant="secondary" className="h-5 text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isActive && (
                  <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Wallet Connector */}
        <div className="flex items-center space-x-4">
          <WalletConnector />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4">
            <div className="grid gap-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-accent",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="h-5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export function MobileNavigation() {
  const pathname = usePathname()
  const { isConnected } = useWalletStore()

  const mobileNavItems = navigation.slice(0, 4).filter(item => {
    if (item.requiresWallet && !isConnected) {
      return false
    }
    return true
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="grid grid-cols-4 gap-1 p-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors hover:bg-accent",
                isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
              {item.badge && (
                <Badge variant="secondary" className="h-4 text-xs absolute -top-1 -right-1">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}