'use client';

import React from 'react';
import { WalletProvider, useWallet } from '../components/wallet/wallet-context';
import { WalletConnector } from '../components/wallet/wallet-connector';

// Card component for demo
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-2xl font-semibold leading-none tracking-tight">
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">
    {children}
  </p>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-0">
    {children}
  </div>
);

// Demo content component
function WalletDemoContent() {
  const { 
    isConnected, 
    connection, 
    stakingInfo, 
    availableWallets, 
    formattedBalance,
    shortAddress,
    hasVotingPower,
    canVote 
  } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Cardano Governance Platform
          </h1>
          <p className="text-xl text-gray-600">
            Connect your wallet to participate in governance
          </p>
          
          {/* Wallet Connector */}
          <div className="flex justify-center">
            <WalletConnector />
          </div>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>
              Current wallet connection and status information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Connected:</span>
                  <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                    {isConnected ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {isConnected && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Wallet:</span>
                      <span>{connection.walletName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Network:</span>
                      <span>
                        {connection.networkId === 1 ? 'Mainnet' : 
                         connection.networkId === 0 ? 'Testnet' : 
                         `Network ${connection.networkId}`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Balance:</span>
                      <span>{formattedBalance} ₳</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Address:</span>
                      <span className="font-mono text-sm">{shortAddress}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Can Vote:</span>
                  <span className={canVote ? 'text-green-600' : 'text-red-600'}>
                    {canVote ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Has Voting Power:</span>
                  <span className={hasVotingPower ? 'text-green-600' : 'text-red-600'}>
                    {hasVotingPower ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {stakingInfo && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Stake Registered:</span>
                      <span className={stakingInfo.isStakeKeyRegistered ? 'text-green-600' : 'text-red-600'}>
                        {stakingInfo.isStakeKeyRegistered ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium">Delegated DRep:</span>
                      <span>{stakingInfo.delegatedDRepId || 'None'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Wallets */}
        <Card>
          <CardHeader>
            <CardTitle>Available Wallets</CardTitle>
            <CardDescription>
              Wallets detected in your browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableWallets.map((wallet) => (
                <div 
                  key={wallet.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{wallet.icon}</div>
                    <div>
                      <div className="font-medium">{wallet.displayName}</div>
                      <div className="text-sm text-gray-600">{wallet.description}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      wallet.isInstalled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {wallet.isInstalled ? 'Installed' : 'Not Installed'}
                    </span>
                    
                    {wallet.isInstalled && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        wallet.isEnabled ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {wallet.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {availableWallets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No wallets detected. Please install a Cardano wallet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Governance Actions Preview */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>Governance Actions</CardTitle>
              <CardDescription>
                Preview of governance features available to connected wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <h3 className="font-medium text-gray-900">Vote on Proposals</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Cast your vote on active governance proposals
                  </p>
                  <div className={`mt-3 text-sm ${canVote ? 'text-green-600' : 'text-red-600'}`}>
                    {canVote ? 'Available' : 'Requires stake delegation'}
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <h3 className="font-medium text-gray-900">Delegate to DRep</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Delegate your voting power to a representative
                  </p>
                  <div className="mt-3 text-sm text-blue-600">
                    Available
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg text-center">
                  <h3 className="font-medium text-gray-900">Create Proposal</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Submit new governance proposals
                  </p>
                  <div className="mt-3 text-sm text-blue-600">
                    Available
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Main demo component with provider
export default function WalletDemo() {
  return (
    <WalletProvider>
      <WalletDemoContent />
    </WalletProvider>
  );
} 