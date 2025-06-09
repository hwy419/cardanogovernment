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
    <div className={`inline-flex items-center gap-3 bg-white border rounded-lg shadow-sm ${sizeClasses[size]} ${className || ''}`}>
      {/* Wallet Icon & Name */}
      <div className="flex items-center gap-2">
        <div className="text-lg">{walletConfig.icon}</div>
        <div>
          <div className="font-medium text-gray-900">
            {walletConfig.displayName}
          </div>
          {/* Network Badge */}
          <div className="flex items-center gap-1 mt-1">
            {isMainnet && (
              <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Mainnet
              </Badge>
            )}
            {isTestnet && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                <AlertCircle className="h-3 w-3 mr-1" />
                Testnet
              </Badge>
            )}
            {!isMainnet && !isTestnet && networkId !== null && (
              <Badge variant="outline" className="text-xs">
                Network {networkId}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Balance */}
      {balance && (
        <div className="text-right">
          <div className="text-xs text-gray-500">Balance</div>
          <div className="font-medium text-gray-900">
            {balance} ₳
          </div>
        </div>
      )}

      {/* Address */}
      {address && (
        <div className="flex items-center gap-1">
          <div className="text-right">
            <div className="text-xs text-gray-500">Address</div>
            <div className="font-mono text-sm text-gray-700">
              {address}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
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