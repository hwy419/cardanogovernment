'use client';

import React, { useState } from 'react';
import { useWallet } from './wallet-context';
import { WalletSelector } from './wallet-selector';
import { WalletStatus } from './wallet-status';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, Power, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // If connected, show wallet status
  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        {/* Wallet Status Display */}
        <WalletStatus 
          walletName={connection.walletName}
          networkId={connection.networkId}
          size={size}
          {...(showBalance && formattedBalance && { balance: formattedBalance })}
          {...(showAddress && shortAddress && { address: shortAddress })}
        />
        
        {/* Disconnect Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
              className="h-10 px-3"
            >
              <Power className="h-4 w-4" />
              <span className="sr-only">Disconnect wallet</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Power className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Disconnect Wallet</h3>
                <p className="text-gray-600 mt-2">
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