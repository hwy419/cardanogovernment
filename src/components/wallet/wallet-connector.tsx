'use client';

import React, { useState } from 'react';
import { useWallet } from './wallet-context';
import { WalletSelector } from './wallet-selector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, Power, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { WALLET_CONFIG } from '../../types/wallet';

interface WalletConnectorProps {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showBalance?: boolean;
  showAddress?: boolean;
  className?: string;
}

export function WalletConnector({ 
  variant = 'default',
  size = 'md',
  showBalance = true,
  showAddress = true,
  className 
}: WalletConnectorProps) {
  const { 
    isConnected, 
    connection, 
    connectWallet, 
    disconnectWallet,
    availableWallets,
    formattedBalance,
    shortAddress
  } = useWallet();
  
  const [isSelectingWallet, setIsSelectingWallet] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (walletName: string) => {
    try {
      await connectWallet(walletName as any);
      setIsSelectingWallet(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsSelectingWallet(false);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied',
        description: `${label} copied to clipboard`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  // If connected, show wallet status in card format
  if (isConnected) {
    const walletConfig = WALLET_CONFIG[connection.walletName || 'nami'];
    const isMainnet = connection.networkId === 1;
    const isTestnet = connection.networkId === 0;

    return (
      <div className={`p-2 rounded-lg border bg-card border-border ${className || ''}`}>
        {/* Header with wallet info and disconnect button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-lg">{walletConfig.icon}</div>
            <span className="text-sm font-medium text-card-foreground">
              {walletConfig.displayName}
            </span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <Power className="h-4 w-4" />
                <span className="sr-only">Disconnect wallet</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">Disconnect Wallet</DialogTitle>
              </DialogHeader>
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Power className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-muted-foreground mt-2">
                    Are you sure you want to disconnect your wallet? You&apos;ll need to reconnect to perform governance actions.
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button 
                    variant="destructive" 
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Network Badge */}
        <div className="mb-2">
          {isMainnet && (
            <Badge variant="default" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Mainnet
            </Badge>
          )}
          {isTestnet && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Testnet
            </Badge>
          )}
          {!isMainnet && !isTestnet && connection.networkId !== null && (
            <Badge variant="outline" className="text-xs">
              Network {connection.networkId}
            </Badge>
          )}
        </div>

        {/* Balance */}
        {showBalance && formattedBalance && (
          <div className="mb-2">
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="text-sm font-medium text-card-foreground">
              {formattedBalance} ₳
            </div>
          </div>
        )}

        {/* Address */}
        {showAddress && shortAddress && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Address</div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground break-all">
                {shortAddress}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                onClick={() => copyToClipboard(shortAddress, 'Address')}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy address</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If connecting, show loading state
  if (connection.isConnecting) {
    return (
      <Button 
        variant={variant} 
        size={size === 'md' ? 'default' : size}
        disabled
        className={className}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        Connecting...
      </Button>
    );
  }

  // If not connected, show connect button
  return (
    <div className="space-y-2">
      {/* Error Display */}
      {connection.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connection.error}</AlertDescription>
        </Alert>
      )}
      
      {/* Connect Button */}
      <Dialog open={isSelectingWallet} onOpenChange={setIsSelectingWallet}>
        <DialogTrigger asChild>
          <Button 
            variant={variant} 
            size={size === 'md' ? 'default' : size}
            className={className}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <WalletSelector
            wallets={availableWallets}
            onSelect={handleConnect}
            onClose={() => setIsSelectingWallet(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 