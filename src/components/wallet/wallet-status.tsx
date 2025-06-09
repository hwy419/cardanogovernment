'use client';

import React from 'react';
import { SupportedWalletName, WALLET_CONFIG } from '../../types/wallet';
import { Badge } from '../ui/badge';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

interface WalletStatusProps {
  walletName: SupportedWalletName | null;
  balance?: string;
  address?: string;
  networkId: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WalletStatus({ 
  walletName, 
  balance, 
  address, 
  networkId,
  size = 'md',
  className 
}: WalletStatusProps) {
  const { toast } = useToast();

  if (!walletName) {
    return null;
  }

  const walletConfig = WALLET_CONFIG[walletName];
  const isMainnet = networkId === 1;
  const isTestnet = networkId === 0;

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

  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-3 bg-card border border-border rounded-lg shadow-sm ${sizeClasses[size]} ${className || ''} w-full`}>
      {/* Wallet Icon & Name */}
      <div className="flex items-center gap-2 min-w-0 flex-shrink">
        <div className="text-lg flex-shrink-0">{walletConfig.icon}</div>
        <div className="min-w-0 flex-shrink">
          <div className="font-medium text-card-foreground truncate text-sm sm:text-base">
            {walletConfig.displayName}
          </div>
          {/* Network Badge */}
          <div className="flex items-center gap-1 mt-1">
            {isMainnet && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Mainnet</span>
                <span className="sm:hidden">Main</span>
              </Badge>
            )}
            {isTestnet && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Testnet</span>
                <span className="sm:hidden">Test</span>
              </Badge>
            )}
            {!isMainnet && !isTestnet && networkId !== null && (
              <Badge variant="outline" className="text-xs">
                Net {networkId}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Balance */}
      {balance && (
        <div className="text-right flex-shrink-0 hidden sm:block">
          <div className="text-xs text-muted-foreground">Balance</div>
          <div className="font-medium text-card-foreground">
            {balance} ₳
          </div>
        </div>
      )}

      {/* Address */}
      {address && (
        <div className="flex items-center gap-1 min-w-0 flex-shrink">
          <div className="text-right min-w-0">
            <div className="text-xs text-muted-foreground hidden sm:block">Address</div>
            <div className="font-mono text-xs sm:text-sm text-muted-foreground truncate max-w-16 sm:max-w-24">
              {address}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={() => copyToClipboard(address, 'Address')}
          >
            <Copy className="h-3 w-3" />
            <span className="sr-only">Copy address</span>
          </Button>
        </div>
      )}
    </div>
  );
} 