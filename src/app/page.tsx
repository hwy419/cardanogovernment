'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Vote, 
  TrendingUp, 
  Moon, 
  Sun, 
  Wallet, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  BarChart3,
  PlusCircle,
  User,
  ExternalLink,
  Copy,
  ArrowLeft,
  Calendar,
  Zap,
  CheckSquare,
  Square,
  Menu,
  X,
  ArrowUp,
  ArrowDown,
  Loader2,
  Shield,
  Target,
  Globe,
  Github,
  Twitter,
  MessageCircle,
  Bell,
  Settings
} from 'lucide-react';

// Import mock data and utilities
import { 
  mockUsers, 
  mockDReps, 
  mockGovernanceActions, 
  mockVotes,
  mockDelegations,
  mockGovernanceStats,
  currentMockUser
} from '@/lib/mock-data';

import {
  formatADA,
  formatNumber,
  formatDate,
  formatDuration,
  truncateAddress,
  getStatusStyles,
  getVoteStyles,
  calculatePercentage,
  calculateVoteTotal,
  calculateOverallVotePercentages,
  isCloseToDeadline,
  copyToClipboard,
  cn
} from '@/lib/utils';

// Types
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface Theme {
  isDark: boolean;
  bg: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentHover: string;
}

interface User {
  address: string;
  publicKey: string;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  profile: {
    name: string;
    bio: string;
    avatar: string;
    website: string;
    social: {
      twitter: string;
      discord: string;
      telegram: string;
    };
  };
  isActive: boolean;
  totalStake: number;
}

interface DRep {
  id: string;
  address: string;
  registrationDate: Date;
  status: string;
  votingPower: number;
  delegatorCount: number;
  metadata: {
    manifesto: string;
    experience: string;
    focusAreas: string[];
    votingPhilosophy: string;
  };
  performance: {
    totalVotes: number;
    participationRate: number;
    avgResponseTime: number;
    reputation: number;
  };
}

interface GovernanceAction {
  id: string;
  proposerId: string;
  type: string;
  title: string;
  description: string;
  rationale: string;
  submissionDate: Date;
  votingStartDate: Date;
  votingEndDate: Date;
  status: string;
  metadata: {
    category: string;
    tags: string[];
    estimatedImpact: string;
    budgetRequest?: number;
  };
  votes: {
    drep: { yes: number; no: number; abstain: number };
    spo: { yes: number; no: number; abstain: number };
    constitutionalCouncil: { yes: number; no: number; abstain: number };
  };
  outcome: string | null;
}

export default function CardanoGovernancePlatform() {
  // State management
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProposal, setSelectedProposal] = useState<GovernanceAction | null>(null);
  const [selectedDRep, setSelectedDRep] = useState<DRep | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(true);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Current user (from mock data)
  const currentUser = currentMockUser;

  // Theme configuration
  const theme: Theme = {
    isDark: isDarkMode,
    bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    accent: 'bg-cardano-500',
    accentHover: 'hover:bg-cardano-600'
  };

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'proposals', label: 'Governance Actions', icon: FileText, badge: mockGovernanceStats.activeProposals },
    { id: 'dreps', label: 'DRep Directory', icon: Users },
    { id: 'voting', label: 'Live Voting', icon: Vote },
    { id: 'outcomes', label: 'Outcomes', icon: TrendingUp },
    { id: 'create-proposal', label: 'Create Proposal', icon: PlusCircle }
  ];

  // Event handlers
  const handleWalletConnect = async () => {
    setIsWalletConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      setIsWalletConnected(true);
      setIsWalletConnecting(false);
      setAnnouncement('Wallet connected successfully');
      setTimeout(() => setAnnouncement(''), 3000);
    }, 2000);
  };

  const handleVoteSubmit = async (proposalId: string, vote: string, rationale?: string) => {
    setIsLoading(true);
    // Simulate vote submission
    setTimeout(() => {
      setIsLoading(false);
      setAnnouncement(`Vote "${vote}" submitted successfully`);
      setTimeout(() => setAnnouncement(''), 3000);
    }, 1500);
  };

  const handleDelegation = async (drepId: string) => {
    setIsLoading(true);
    // Simulate delegation
    setTimeout(() => {
      setIsLoading(false);
      setAnnouncement('Delegation submitted successfully');
      setTimeout(() => setAnnouncement(''), 3000);
    }, 1500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProposal(null);
        setSelectedDRep(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Skip Link Component for Accessibility
  const SkipLink = () => (
    <a
      href="#main-content"
      className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
    >
      Skip to main content
    </a>
  );

  // Announcement Component for Screen Readers
  const AnnouncementBar = () => announcement && (
    <div 
      role="status" 
      aria-live="polite"
      className={cn(
        'fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg',
        'bg-green-600 text-white animate-slide-in-right'
      )}
    >
      {announcement}
    </div>
  );

  // Loading Overlay
  const LoadingOverlay = () => isLoading && (
    <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center">
      <div className={cn('p-6 rounded-lg shadow-xl', theme.cardBg)}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className={theme.text}>Processing transaction...</span>
        </div>
      </div>
    </div>
  );

  // Navigation Component
  const Navigation = () => (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={cn(
          'md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg',
          theme.cardBg, theme.border, 'border shadow-lg'
        )}
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Navigation sidebar */}
      <nav 
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-40 w-64 h-full flex flex-col transition-transform',
          theme.cardBg, theme.border, 'border-r',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className={cn('text-xl font-bold', theme.text)}>
            Cardano Gov Tool
          </h1>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2" role="list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      'focus-visible-ring min-h-touch',
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : cn(theme.text, 'hover:bg-muted')
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span 
                        className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full"
                        aria-label={`${item.badge} items`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User info section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={cn('p-3 rounded-lg border', theme.cardBg, theme.border)}>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" aria-hidden="true" />
              <span className={cn('text-sm font-medium', theme.text)}>
                My DRep ID
              </span>
            </div>
            <p className={cn('text-xs break-all', theme.textSecondary)}>
              {truncateAddress('drep13g5w9xzdtkcqr4h8h', { prefixLength: 12, suffixLength: 8 })}
            </p>
            <button
              onClick={() => copyToClipboard('drep13g5w9xzdtkcqr4h8h')}
              className="mt-1 text-xs text-primary hover:underline focus-visible-ring"
            >
              Copy full ID
            </button>
          </div>
          
          {isWalletConnected ? (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></div>
              <span className={cn('text-sm', theme.textSecondary)}>
                Wallet Connected
              </span>
            </div>
          ) : (
            <button 
              onClick={handleWalletConnect}
              disabled={isWalletConnecting}
              className={cn(
                'mt-3 w-full px-3 py-2 rounded-lg text-sm font-medium',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isWalletConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );

  // Header Component
  const Header = () => (
    <header className={cn(
      'flex items-center justify-between px-6 py-4 border-b',
      theme.cardBg, theme.border
    )}>
      <div className="flex items-center gap-4">
        <h2 className={cn('text-2xl font-bold capitalize', theme.text)}>
          {currentPage.replace('-', ' ')}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Voting power display */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border',
          theme.cardBg, theme.border
        )}>
          <Zap className="w-4 h-4 text-cardano-500" aria-hidden="true" />
          <span className={cn('text-sm', theme.text)}>Voting power:</span>
          <span className={cn('text-sm font-bold', theme.text)}>
            {formatADA(currentUser.totalStake, { compact: true })}
          </span>
        </div>
        
        {/* Notifications */}
        <button
          className={cn(
            'p-2 rounded-lg border focus-visible-ring',
            theme.cardBg, theme.border, theme.text,
            'hover:bg-muted'
          )}
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        
        {/* Settings */}
        <button
          className={cn(
            'p-2 rounded-lg border focus-visible-ring',
            theme.cardBg, theme.border, theme.text,
            'hover:bg-muted'
          )}
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        {/* Theme toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cn(
            'p-2 rounded-lg border focus-visible-ring',
            theme.cardBg, theme.border, theme.text,
            'hover:bg-muted'
          )}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );

  // Dashboard Component
  const Dashboard = () => (
    <div className="p-6">
      <div className="mb-8">
        <h3 className={cn('text-lg font-semibold mb-4', theme.text)}>
          Welcome back, {currentUser.profile.name}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              title: "Delegate your Voting Power",
              description: "Find a DRep to vote on your behalf.",
              icon: "🗳️",
              action: "View DRep Directory",
              onClick: () => setCurrentPage('dreps'),
              stats: `${mockDReps.length} Active DReps`
            },
            {
              title: "You are Registered as a DRep", 
              description: "Vote using your own power combined with delegated power.",
              icon: "👤",
              action: "View your DRep details",
              onClick: () => setSelectedDRep(mockDReps[0]),
              stats: `${formatADA(currentUser.totalStake)} Voting Power`
            },
            {
              title: "Become a Direct Voter",
              description: "Register to Vote on Governance Actions.",
              icon: "🎯", 
              action: "Register",
              onClick: () => {},
              stats: "Not Registered"
            },
            {
              title: "View Governance Actions",
              description: "Review governance actions submitted on-chain.",
              icon: "📋",
              action: "View Governance Actions", 
              onClick: () => setCurrentPage('proposals'),
              stats: `${mockGovernanceStats.activeProposals} Active`
            }
          ].map((card, index) => (
            <div 
              key={index} 
              className={cn(
                'p-6 rounded-xl border hover:shadow-lg transition-shadow',
                theme.cardBg, theme.border
              )}
            >
              <div className="text-2xl mb-3" aria-hidden="true">{card.icon}</div>
              <h4 className={cn('text-lg font-semibold mb-2', theme.text)}>
                {card.title}
              </h4>
              <p className={cn('text-sm mb-3', theme.textSecondary)}>
                {card.description}
              </p>
              <p className={cn('text-xs mb-4 font-medium', theme.text)}>
                {card.stats}
              </p>
              <button 
                onClick={card.onClick}
                className="btn-primary"
              >
                {card.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
          <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
            Governance Overview
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={cn('text-2xl font-bold', theme.text)}>
                {mockGovernanceStats.totalProposals}
              </div>
              <div className={cn('text-sm', theme.textSecondary)}>
                Total Proposals
              </div>
            </div>
            <div>
              <div className={cn('text-2xl font-bold', theme.text)}>
                {mockGovernanceStats.activeProposals}
              </div>
              <div className={cn('text-sm', theme.textSecondary)}>
                Active Proposals
              </div>
            </div>
            <div>
              <div className={cn('text-2xl font-bold', theme.text)}>
                {formatNumber(mockGovernanceStats.participationRate * 100)}%
              </div>
              <div className={cn('text-sm', theme.textSecondary)}>
                Participation Rate
              </div>
            </div>
            <div>
              <div className={cn('text-2xl font-bold', theme.text)}>
                {formatADA(mockGovernanceStats.treasuryBalance, { compact: true })}
              </div>
              <div className={cn('text-sm', theme.textSecondary)}>
                Treasury Balance
              </div>
            </div>
          </div>
        </div>

        <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
          <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
            Recent Activity
          </h4>
          <div className="space-y-3">
            {mockVotes.slice(0, 3).map((vote) => {
              const proposal = mockGovernanceActions.find(p => p.id === vote.proposalId);
              return (
                <div key={vote.id} className={cn('p-3 rounded-lg border', theme.border)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-sm font-medium', theme.text)}>
                      Voted {vote.vote} on {proposal?.title}
                    </span>
                    <span className={getVoteStyles(vote.vote as any)}>
                      {vote.vote}
                    </span>
                  </div>
                  <p className={cn('text-xs', theme.textSecondary)}>
                    {formatDate(vote.timestamp, { relative: true })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Proposals */}
      <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={cn('text-lg font-semibold', theme.text)}>
            Recent Governance Actions
          </h4>
          <button
            onClick={() => setCurrentPage('proposals')}
            className="text-primary hover:underline text-sm font-medium focus-visible-ring"
          >
            View all
          </button>
        </div>
        <div className="space-y-3">
          {mockGovernanceActions.slice(0, 3).map((proposal) => (
            <div 
              key={proposal.id} 
              className={cn(
                'p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors',
                theme.border
              )}
              onClick={() => setSelectedProposal(proposal)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={cn('text-sm font-medium', theme.text)}>
                  {proposal.title}
                </span>
                <span className={getStatusStyles(proposal.status as any)}>
                  {proposal.status}
                </span>
              </div>
              <p className={cn('text-xs', theme.textSecondary)}>
                Expires: {formatDate(proposal.votingEndDate)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Main content router
  const renderCurrentPage = () => {
    if (selectedProposal) {
      return <ProposalDetail proposal={selectedProposal} onBack={() => setSelectedProposal(null)} />;
    }
    
    if (selectedDRep) {
      return <DRepDetail drep={selectedDRep} onBack={() => setSelectedDRep(null)} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'proposals':
        return <ProposalsList />;
      case 'dreps':
        return <DRepDirectory />;
      case 'voting':
        return <ProposalsList />;
      case 'outcomes':
        return <ProposalsList />;
      case 'create-proposal':
        return <CreateProposal />;
      default:
        return <Dashboard />;
    }
  };

  // Placeholder components for other pages
  const ProposalsList = () => (
    <div className="p-6">
      <h3 className={cn('text-xl font-bold mb-6', theme.text)}>Governance Actions</h3>
      <p className={theme.textSecondary}>Proposals list implementation...</p>
    </div>
  );

  const DRepDirectory = () => (
    <div className="p-6">
      <h3 className={cn('text-xl font-bold mb-6', theme.text)}>DRep Directory</h3>
      <p className={theme.textSecondary}>DRep directory implementation...</p>
    </div>
  );

  const ProposalDetail = ({ proposal, onBack }: { proposal: GovernanceAction; onBack: () => void }) => (
    <div className="p-6">
      <button onClick={onBack} className="btn-outline mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>
      <h3 className={cn('text-xl font-bold mb-6', theme.text)}>{proposal.title}</h3>
      <p className={theme.textSecondary}>Proposal detail implementation...</p>
    </div>
  );

  const DRepDetail = ({ drep, onBack }: { drep: DRep; onBack: () => void }) => (
    <div className="p-6">
      <button onClick={onBack} className="btn-outline mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>
      <h3 className={cn('text-xl font-bold mb-6', theme.text)}>DRep: {drep.id}</h3>
      <p className={theme.textSecondary}>DRep detail implementation...</p>
    </div>
  );

  const CreateProposal = () => (
    <div className="p-6">
      <h3 className={cn('text-xl font-bold mb-6', theme.text)}>Create Governance Proposal</h3>
      <p className={theme.textSecondary}>Proposal creation form implementation...</p>
    </div>
  );

  return (
    <div className={cn('min-h-screen transition-colors duration-200', theme.bg, theme.text)}>
      <SkipLink />
      <AnnouncementBar />
      <LoadingOverlay />
      
      <div className="flex h-screen">
        <Navigation />
        
        <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
          <Header />
          
          <main 
            id="main-content"
            className="flex-1 overflow-auto focus:outline-none"
            tabIndex={-1}
          >
            {renderCurrentPage()}
          </main>
        </div>
      </div>
    </div>
  );
}