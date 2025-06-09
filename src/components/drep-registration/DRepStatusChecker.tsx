'use client';

import React, { useState, useEffect } from 'react';
import { User, UserPlus, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DRepRegistrationWizard } from './DRepRegistrationWizard';

interface DRepStatusCheckerProps {
  walletAddress?: string;
  isWalletConnected: boolean;
  theme: {
    isDark: boolean;
    bg: string;
    cardBg: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  onRegistrationComplete?: (data: any) => void;
}

interface DRepStatus {
  isRegistered: boolean;
  drepId?: string;
  registrationDate?: Date;
  status?: 'active' | 'inactive' | 'retired';
  isLoading: boolean;
  error?: string;
}

export function DRepStatusChecker({
  walletAddress,
  isWalletConnected,
  theme,
  onRegistrationComplete,
}: DRepStatusCheckerProps) {
  const [drepStatus, setDRepStatus] = useState<DRepStatus>({
    isRegistered: false,
    isLoading: false,
  });
  const [showRegistrationWizard, setShowRegistrationWizard] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Check DRep registration status
  useEffect(() => {
    if (!isWalletConnected || !walletAddress) {
      setDRepStatus({ isRegistered: false, isLoading: false });
      return;
    }

    const checkDRepStatus = async () => {
      setDRepStatus(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Simulate API call to check DRep registration
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, randomly determine if wallet is registered
        // In production, this would query the Cardano blockchain
        const isRegistered = Math.random() > 0.7; // 30% chance of being registered
        
        if (isRegistered) {
          setDRepStatus({
            isRegistered: true,
            drepId: `drep1${walletAddress.slice(-8)}`,
            registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            status: 'active',
            isLoading: false,
          });
        } else {
          setDRepStatus({
            isRegistered: false,
            isLoading: false,
          });
        }
      } catch (error) {
        setDRepStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to check DRep status',
        }));
      }
    };

    checkDRepStatus();
  }, [walletAddress, isWalletConnected]);

  const handleRegistrationComplete = (data: any) => {
    setDRepStatus({
      isRegistered: true,
      drepId: `drep1${walletAddress?.slice(-8)}`,
      registrationDate: new Date(),
      status: 'active',
      isLoading: false,
    });
    
    setAnnouncement('DRep registration completed successfully! Your registration is being processed on-chain.');
    setTimeout(() => setAnnouncement(''), 5000);
    
    onRegistrationComplete?.(data);
  };

  const formatDRepId = (id: string) => {
    return `${id.slice(0, 8)}...${id.slice(-6)}`;
  };

  // Don't render if wallet not connected
  if (!isWalletConnected) {
    return null;
  }

  return (
    <>
      {/* Announcement */}
      {announcement && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={cn(
            'p-4 rounded-lg shadow-lg border border-green-200 bg-green-50 text-green-800',
            'animate-slide-in-right'
          )}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{announcement}</p>
            </div>
          </div>
        </div>
      )}

      {/* DRep Status Card */}
      <div className={cn(
        'p-4 rounded-lg border',
        theme.cardBg, theme.border
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              drepStatus.isRegistered 
                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            )}>
              {drepStatus.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : drepStatus.isRegistered ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            
            <div>
              <h3 className={cn('font-medium', theme.text)}>
                DRep Status
              </h3>
              
              {drepStatus.isLoading ? (
                <p className={cn('text-sm', theme.textSecondary)}>
                  Checking registration status...
                </p>
              ) : drepStatus.error ? (
                <p className="text-sm text-red-500">
                  {drepStatus.error}
                </p>
              ) : drepStatus.isRegistered ? (
                <div className="space-y-1">
                  <p className={cn('text-sm', theme.textSecondary)}>
                    Registered as DRep
                  </p>
                  <p className={cn('text-xs font-mono', theme.textSecondary)}>
                    ID: {formatDRepId(drepStatus.drepId!)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      drepStatus.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    )}>
                      {drepStatus.status}
                    </span>
                    <span className={cn('text-xs', theme.textSecondary)}>
                      Since {drepStatus.registrationDate?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p className={cn('text-sm', theme.textSecondary)}>
                  Not registered as DRep
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!drepStatus.isLoading && !drepStatus.isRegistered && (
              <button
                onClick={() => setShowRegistrationWizard(true)}
                className="btn-primary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Register as DRep
              </button>
            )}
            
            {drepStatus.isRegistered && (
              <button
                onClick={() => {
                  // Open DRep profile or management interface
                  window.open(`/drep/${drepStatus.drepId}`, '_blank');
                }}
                className="btn-outline flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Profile
              </button>
            )}
          </div>
        </div>

        {/* Registration Benefits */}
        {!drepStatus.isRegistered && !drepStatus.isLoading && (
          <div className={cn('mt-4 p-3 rounded-lg border-l-4 border-blue-500', theme.cardBg)}>
            <h4 className={cn('text-sm font-medium mb-2', theme.text)}>
              Benefits of becoming a DRep:
            </h4>
            <ul className={cn('text-sm space-y-1', theme.textSecondary)}>
              <li>• Vote on governance proposals that shape Cardano&apos;s future</li>
              <li>• Earn delegation rewards from ADA holders who trust your judgment</li>
              <li>• Participate in constitutional committee elections</li>
              <li>• Influence treasury fund allocations and protocol parameters</li>
            </ul>
          </div>
        )}

        {/* Current Delegation Info */}
        {drepStatus.isRegistered && (
          <div className={cn('mt-4 p-3 rounded-lg', 'bg-blue-50 dark:bg-blue-900/20')}>
            <div className="flex items-center justify-between">
              <div>
                <p className={cn('text-sm font-medium', theme.text)}>
                  Current Delegation
                </p>
                <p className={cn('text-sm', theme.textSecondary)}>
                  125 delegators • 2.4M ADA voting power
                </p>
              </div>
              <div className="text-right">
                <p className={cn('text-lg font-bold', theme.text)}>
                  98.5%
                </p>
                <p className={cn('text-xs', theme.textSecondary)}>
                  participation rate
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registration Wizard */}
      {showRegistrationWizard && walletAddress && (
        <DRepRegistrationWizard
          isOpen={showRegistrationWizard}
          onClose={() => setShowRegistrationWizard(false)}
          walletAddress={walletAddress}
          onRegistrationComplete={handleRegistrationComplete}
          theme={theme}
        />
      )}
    </>
  );
}