'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWalletStore } from '@/stores/wallet-store'
import { Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { formatAda, truncateAddress } from '@/lib/utils'

const WALLET_INFO = {
  nami: {
    name: 'Nami',
    icon: '🦊',
    description: 'A browser extension wallet for Cardano',
    downloadUrl: 'https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo'
  },
  eternl: {
    name: 'Eternl',
    icon: '♾️',
    description: 'Feature-rich Cardano wallet',
    downloadUrl: 'https://eternl.io/'
  },
  flint: {
    name: 'Flint',
    icon: '🔥',
    description: 'Simple and secure Cardano wallet',
    downloadUrl: 'https://flint-wallet.com/'
  },
  yoroi: {
    name: 'Yoroi',
    icon: '🛡️',
    description: 'Official IOHK Cardano wallet',
    downloadUrl: 'https://yoroi-wallet.com/'
  },
  gerowallet: {
    name: 'Gero',
    icon: '💎',
    description: 'Multi-chain wallet with Cardano support',
    downloadUrl: 'https://gerowallet.io/'
  }
}

interface WalletConnectorProps {
  children?: React.ReactNode
}

export function WalletConnector({ children }: WalletConnectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [availableWallets, setAvailableWallets] = useState<string[]>([])
  
  const { 
    isConnected, 
    address, 
    balance, 
    connectedWallet, 
    supportedWallets,
    connect, 
    disconnect 
  } = useWalletStore()

  useEffect(() => {
    // Check which wallets are available
    const checkWallets = () => {
      if (typeof window !== 'undefined' && window.cardano) {
        const available = supportedWallets.filter(wallet => 
          window.cardano && window.cardano[wallet]
        )
        setAvailableWallets(available)
      }
    }

    checkWallets()
    
    // Check periodically for wallet installation
    const interval = setInterval(checkWallets, 2000)
    return () => clearInterval(interval)
  }, [supportedWallets])

  const handleConnect = async (walletName: string) => {
    setConnecting(walletName)
    try {
      await connect(walletName)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      // Handle error (show toast, etc.)
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setIsOpen(false)
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatAda(balance)} ADA
          </span>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {truncateAddress(address, 4, 4)}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Wallet Connected</DialogTitle>
              <DialogDescription>
                Your {WALLET_INFO[connectedWallet as keyof typeof WALLET_INFO]?.name} wallet is connected
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address:</span>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {truncateAddress(address, 8, 8)}
                </code>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance:</span>
                <span className="font-medium">{formatAda(balance)} ADA</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wallet:</span>
                <span className="flex items-center gap-1">
                  {WALLET_INFO[connectedWallet as keyof typeof WALLET_INFO]?.icon}
                  {WALLET_INFO[connectedWallet as keyof typeof WALLET_INFO]?.name}
                </span>
              </div>
              
              <Button 
                onClick={handleDisconnect} 
                variant="destructive" 
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect Your Cardano Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the Cardano Governance Platform
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3">
          {supportedWallets.map((walletName) => {
            const wallet = WALLET_INFO[walletName as keyof typeof WALLET_INFO]
            const isAvailable = availableWallets.includes(walletName)
            const isConnecting = connecting === walletName
            
            return (
              <Card 
                key={walletName}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  !isAvailable ? 'opacity-50' : ''
                }`}
                onClick={() => isAvailable && !isConnecting && handleConnect(walletName)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div>
                        <div className="font-medium">{wallet.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {wallet.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isAvailable ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Not Installed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {!isAvailable && (
                    <div className="mt-2 pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(wallet.downloadUrl, '_blank')
                        }}
                      >
                        Install {wallet.name}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          By connecting a wallet, you agree to the Terms of Service and Privacy Policy.
          Your private keys are never shared or stored.
        </div>
      </DialogContent>
    </Dialog>
  )
}