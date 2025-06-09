'use client';

import React from 'react';
import { WalletInfo } from '../../types/wallet';
import { Button } from '../ui/button';
import { DialogHeader, DialogTitle } from '../ui/dialog';
import { Download, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletSelectorProps {
  wallets: WalletInfo[];
  onSelect: (walletName: string) => void;
  onClose: () => void;
}

export function WalletSelector({ wallets, onSelect, onClose }: WalletSelectorProps) {
  const installedWallets = wallets.filter(wallet => wallet.isInstalled);
  const notInstalledWallets = wallets.filter(wallet => !wallet.isInstalled);

  const handleWalletSelect = (walletName: string) => {
    onSelect(walletName);
  };

  const openDownloadLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-center">
          Connect Your Cardano Wallet
        </DialogTitle>
        <p className="text-gray-600 text-center">
          Choose a wallet to connect and participate in governance
        </p>
      </DialogHeader>

      {/* Installed Wallets */}
      {installedWallets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Available Wallets
          </h3>
          <div className="grid gap-2">
            {installedWallets.map((wallet) => (
              <WalletCard
                key={wallet.name}
                wallet={wallet}
                onSelect={() => handleWalletSelect(wallet.name)}
                isInstalled={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Not Installed Wallets */}
      {notInstalledWallets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Not Installed
          </h3>
          <div className="grid gap-2">
            {notInstalledWallets.map((wallet) => (
              <WalletCard
                key={wallet.name}
                wallet={wallet}
                onSelect={() => openDownloadLink(wallet.downloadUrl)}
                isInstalled={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Wallets Found */}
      {wallets.length === 0 && (
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">No Wallets Found</h3>
            <p className="text-gray-600 mt-2">
              Please install a Cardano wallet to connect to the governance platform.
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Don&apos;t see your wallet? Make sure it supports CIP-30 standard.</p>
        <p>Refresh the page after installing a new wallet.</p>
      </div>
    </div>
  );
}

interface WalletCardProps {
  wallet: WalletInfo;
  onSelect: () => void;
  isInstalled: boolean;
}

function WalletCard({ wallet, onSelect, isInstalled }: WalletCardProps) {
  return (
    <Button
      variant="outline"
      className="h-auto p-4 justify-start hover:bg-gray-50 transition-colors"
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 w-full">
        {/* Wallet Icon */}
        <div className="text-2xl">{wallet.icon}</div>
        
        {/* Wallet Info */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{wallet.displayName}</h4>
            {isInstalled && wallet.isEnabled && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Ready
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{wallet.description}</p>
          {wallet.version !== 'Unknown' && (
            <p className="text-xs text-gray-500">Version: {wallet.version}</p>
          )}
        </div>

        {/* Action Icon */}
        <div className="text-gray-400">
          {isInstalled ? (
            <ExternalLink className="h-4 w-4" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </div>
      </div>
    </Button>
  );
} 