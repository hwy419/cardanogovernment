'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Settings,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown
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

  // DRep Directory Component with comprehensive features
  const DRepDirectory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [focusAreaFilter, setFocusAreaFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'votingPower' | 'delegatorCount' | 'participationRate' | 'reputation'>('votingPower');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Filter and sort DReps
    const filteredAndSortedDReps = useMemo(() => {
      let filtered = mockDReps.filter(drep => {
        const matchesSearch = drep.metadata.manifesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            drep.metadata.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (drep.id === 'drep13g5w9xzdtkcqr4h8h' ? currentUser.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);
        const matchesStatus = statusFilter === 'all' || drep.status === statusFilter;
        const matchesFocusArea = focusAreaFilter === 'all' || drep.metadata.focusAreas.includes(focusAreaFilter);
        
        return matchesSearch && matchesStatus && matchesFocusArea;
      });

      // Sort DReps
      filtered.sort((a, b) => {
        const aValue = a.performance[sortBy] || a[sortBy];
        const bValue = b.performance[sortBy] || b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });

      return filtered;
    }, [searchTerm, statusFilter, focusAreaFilter, sortBy, sortOrder]);

    const DRepCard = ({ drep }: { drep: DRep }) => {
      const isCurrentUser = drep.id === 'drep13g5w9xzdtkcqr4h8h';
      const displayName = isCurrentUser ? currentUser.profile.name : `DRep ${drep.id.slice(0, 12)}...`;
      const avatar = isCurrentUser ? currentUser.profile.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${drep.id}`;

      return (
        <div className={cn(
          'p-6 rounded-xl border hover:shadow-lg transition-all duration-200 cursor-pointer group',
          theme.cardBg, theme.border, 'hover:border-primary/50'
        )}
        onClick={() => setSelectedDRep(drep)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedDRep(drep);
          }
        }}
        aria-label={`View details for ${displayName}`}
        >
          <div className="flex items-start gap-4">
            <div className="relative">
              <img 
                src={avatar}
                alt={`${displayName} avatar`}
                className="w-16 h-16 rounded-full border-2 border-primary/20 group-hover:border-primary/40 transition-colors"
              />
              {drep.status === 'active' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={cn('text-lg font-semibold truncate', theme.text)}>
                  {displayName}
                </h3>
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  drep.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                )}>
                  {drep.status}
                </span>
              </div>
              
              <p className={cn('text-sm mb-4 line-clamp-2', theme.textSecondary)}>
                {drep.metadata.manifesto}
              </p>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className={cn('text-xl font-bold', theme.text)}>
                    {formatADA(drep.votingPower, { compact: true })}
                  </div>
                  <div className={cn('text-xs', theme.textSecondary)}>Voting Power</div>
                </div>
                <div>
                  <div className={cn('text-xl font-bold', theme.text)}>
                    {formatNumber(drep.delegatorCount)}
                  </div>
                  <div className={cn('text-xs', theme.textSecondary)}>Delegators</div>
                </div>
              </div>
              
              {/* Focus Areas */}
              <div className="flex flex-wrap gap-1 mb-4">
                {drep.metadata.focusAreas.slice(0, 3).map((area) => (
                  <span 
                    key={area}
                    className={cn(
                      'px-2 py-1 rounded text-xs',
                      'bg-primary/10 text-primary border border-primary/20'
                    )}
                  >
                    {area}
                  </span>
                ))}
                {drep.metadata.focusAreas.length > 3 && (
                  <span className={cn('text-xs', theme.textSecondary)}>
                    +{drep.metadata.focusAreas.length - 3} more
                  </span>
                )}
              </div>
              
              {/* Performance Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme.textSecondary}>Participation Rate</span>
                  <span className={theme.text}>{drep.performance.participationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{width: `${drep.performance.participationRate}%`}}
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDRep(drep);
                  }}
                  className="btn-outline flex-1 text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelegation(drep.id);
                  }}
                  className="btn-primary flex-1 text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delegate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };

    const DRepListItem = ({ drep }: { drep: DRep }) => {
      const isCurrentUser = drep.id === 'drep13g5w9xzdtkcqr4h8h';
      const displayName = isCurrentUser ? currentUser.profile.name : `DRep ${drep.id.slice(0, 12)}...`;
      const avatar = isCurrentUser ? currentUser.profile.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${drep.id}`;

      return (
        <div className={cn(
          'p-4 rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer',
          theme.cardBg, theme.border, 'hover:border-primary/50'
        )}
        onClick={() => setSelectedDRep(drep)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedDRep(drep);
          }
        }}
        >
          <div className="flex items-center gap-4">
            <img 
              src={avatar}
              alt={`${displayName} avatar`}
              className="w-12 h-12 rounded-full border border-primary/20"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn('font-semibold truncate', theme.text)}>
                  {displayName}
                </h3>
                <span className={cn(
                  'px-2 py-1 rounded text-xs',
                  drep.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                )}>
                  {drep.status}
                </span>
              </div>
              <p className={cn('text-sm line-clamp-1', theme.textSecondary)}>
                {drep.metadata.manifesto}
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className={cn('font-bold', theme.text)}>
                  {formatADA(drep.votingPower, { compact: true })}
                </div>
                <div className={cn('text-xs', theme.textSecondary)}>Voting Power</div>
              </div>
              <div className="text-center">
                <div className={cn('font-bold', theme.text)}>{drep.delegatorCount}</div>
                <div className={cn('text-xs', theme.textSecondary)}>Delegators</div>
              </div>
              <div className="text-center">
                <div className={cn('font-bold', theme.text)}>{drep.performance.participationRate}%</div>
                <div className={cn('text-xs', theme.textSecondary)}>Participation</div>
              </div>
              <div className="text-center">
                <div className={cn('font-bold', theme.text)}>⭐ {drep.performance.reputation}</div>
                <div className={cn('text-xs', theme.textSecondary)}>Reputation</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDRep(drep);
                }}
                className="btn-outline text-sm px-3 py-1"
              >
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelegation(drep.id);
                }}
                className="btn-primary text-sm px-3 py-1"
                disabled={isLoading}
              >
                Delegate
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className={cn('text-2xl font-bold mb-2', theme.text)}>
            DRep Directory
          </h2>
          <p className={cn('text-sm', theme.textSecondary)}>
            Browse and delegate to Delegate Representatives (DReps) who will vote on your behalf in Cardano governance.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search DReps by name, manifesto, or experience..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary',
                  theme.cardBg, theme.border, theme.text,
                  'placeholder:text-gray-400'
                )}
                aria-label="Search DReps"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg border',
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : cn(theme.cardBg, theme.border, theme.text),
                  'hover:bg-muted transition-colors'
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg border',
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : cn(theme.cardBg, theme.border, theme.text),
                  'hover:bg-muted transition-colors'
                )}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                showFilters ? 'bg-primary text-primary-foreground' : cn(theme.cardBg, theme.border, theme.text, 'hover:bg-muted')
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className={cn('p-4 rounded-lg border mb-4', theme.cardBg, theme.border)}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className={cn('block text-sm font-medium mb-2', theme.text)}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={cn(
                      'w-full p-2 rounded-lg border',
                      theme.cardBg, theme.border, theme.text
                    )}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                {/* Focus Area Filter */}
                <div>
                  <label className={cn('block text-sm font-medium mb-2', theme.text)}>
                    Focus Area
                  </label>
                  <select
                    value={focusAreaFilter}
                    onChange={(e) => setFocusAreaFilter(e.target.value)}
                    className={cn(
                      'w-full p-2 rounded-lg border',
                      theme.cardBg, theme.border, theme.text
                    )}
                  >
                    <option value="all">All Areas</option>
                    <option value="technical">Technical</option>
                    <option value="governance">Governance</option>
                    <option value="community">Community</option>
                    <option value="education">Education</option>
                    <option value="security">Security</option>
                    <option value="protocol">Protocol</option>
                    <option value="treasury">Treasury</option>
                    <option value="sustainability">Sustainability</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className={cn('block text-sm font-medium mb-2', theme.text)}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={cn(
                      'w-full p-2 rounded-lg border',
                      theme.cardBg, theme.border, theme.text
                    )}
                  >
                    <option value="votingPower">Voting Power</option>
                    <option value="delegatorCount">Delegator Count</option>
                    <option value="participationRate">Participation Rate</option>
                    <option value="reputation">Reputation</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className={cn('block text-sm font-medium mb-2', theme.text)}>
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className={cn(
                      'w-full p-2 rounded-lg border',
                      theme.cardBg, theme.border, theme.text
                    )}
                  >
                    <option value="desc">Highest First</option>
                    <option value="asc">Lowest First</option>
                  </select>
                </div>
              </div>
              
              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setFocusAreaFilter('all');
                    setSortBy('votingPower');
                    setSortOrder('desc');
                  }}
                  className="btn-outline text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className={cn('text-sm', theme.textSecondary)}>
            Showing {filteredAndSortedDReps.length} of {mockDReps.length} DReps
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className={cn('flex items-center gap-1', theme.textSecondary)}>
              <Users className="w-4 h-4" />
              <span>{mockDReps.filter(d => d.status === 'active').length} Active</span>
            </div>
            <div className={cn('flex items-center gap-1', theme.textSecondary)}>
              <TrendingUp className="w-4 h-4" />
              <span>{formatADA(mockDReps.reduce((sum, d) => sum + d.votingPower, 0), { compact: true })} Total Power</span>
            </div>
          </div>
        </div>

        {/* DRep List */}
        {filteredAndSortedDReps.length === 0 ? (
          <div className={cn('text-center py-12', theme.cardBg, 'rounded-xl border', theme.border)}>
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className={cn('text-lg font-semibold mb-2', theme.text)}>
              No DReps Found
            </h3>
            <p className={cn('text-sm', theme.textSecondary)}>
              Try adjusting your search terms or filters to find DReps.
            </p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredAndSortedDReps.map((drep) => (
              viewMode === 'grid' 
                ? <DRepCard key={drep.id} drep={drep} />
                : <DRepListItem key={drep.id} drep={drep} />
            ))}
          </div>
        )}
      </div>
    );
  };

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

  const DRepDetail = ({ drep, onBack }: { drep: DRep; onBack: () => void }) => {
    const isCurrentUser = drep.id === 'drep13g5w9xzdtkcqr4h8h';
    const displayName = isCurrentUser ? currentUser.profile.name : `DRep ${drep.id.slice(0, 12)}...`;
    const avatar = isCurrentUser ? currentUser.profile.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${drep.id}`;
    const userProfile = isCurrentUser ? currentUser.profile : null;

    // Calculate additional metrics
    const totalVotes = drep.performance.totalVotes;
    const avgResponseHours = drep.performance.avgResponseTime;
    const responseTimeText = avgResponseHours < 24 
      ? `${avgResponseHours.toFixed(1)} hours`
      : `${(avgResponseHours / 24).toFixed(1)} days`;

    return (
      <div className="p-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className={cn(
              'p-2 rounded-lg border focus-visible-ring',
              theme.cardBg, theme.border, theme.text,
              'hover:bg-muted transition-colors'
            )}
            aria-label="Go back to DRep directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className={cn('text-2xl font-bold', theme.text)}>
            DRep Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <img 
                    src={avatar}
                    alt={`${displayName} avatar`}
                    className="w-24 h-24 rounded-full border-4 border-primary/20"
                  />
                  {drep.status === 'active' && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className={cn('text-2xl font-bold', theme.text)}>
                      {displayName}
                    </h3>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      drep.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    )}>
                      {drep.status.charAt(0).toUpperCase() + drep.status.slice(1)}
                    </span>
                  </div>
                  
                  {userProfile && (
                    <p className={cn('text-lg mb-4', theme.textSecondary)}>
                      {userProfile.bio}
                    </p>
                  )}
                  
                  {/* Social Links */}
                  {userProfile?.social && (
                    <div className="flex items-center gap-4">
                      {userProfile.social.twitter && (
                        <a 
                          href={userProfile.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
                        >
                          <Twitter className="w-4 h-4" />
                          Twitter
                        </a>
                      )}
                      {userProfile.website && (
                        <a 
                          href={userProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      {userProfile.social.discord && (
                        <span className={cn('flex items-center gap-1 text-sm', theme.textSecondary)}>
                          <MessageCircle className="w-4 h-4" />
                          {userProfile.social.discord}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={cn('p-4 rounded-lg border text-center', theme.border)}>
                  <div className={cn('text-2xl font-bold mb-1', theme.text)}>
                    {formatADA(drep.votingPower, { compact: true })}
                  </div>
                  <div className={cn('text-sm', theme.textSecondary)}>Voting Power</div>
                </div>
                <div className={cn('p-4 rounded-lg border text-center', theme.border)}>
                  <div className={cn('text-2xl font-bold mb-1', theme.text)}>
                    {formatNumber(drep.delegatorCount)}
                  </div>
                  <div className={cn('text-sm', theme.textSecondary)}>Delegators</div>
                </div>
                <div className={cn('p-4 rounded-lg border text-center', theme.border)}>
                  <div className={cn('text-2xl font-bold mb-1', theme.text)}>
                    {drep.performance.participationRate}%
                  </div>
                  <div className={cn('text-sm', theme.textSecondary)}>Participation</div>
                </div>
                <div className={cn('p-4 rounded-lg border text-center', theme.border)}>
                  <div className={cn('text-2xl font-bold mb-1', theme.text)}>
                    ⭐ {drep.performance.reputation}
                  </div>
                  <div className={cn('text-sm', theme.textSecondary)}>Reputation</div>
                </div>
              </div>
            </div>

            {/* Objectives & Manifesto */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                Objectives & Manifesto
              </h4>
              <p className={cn('leading-relaxed', theme.textSecondary)}>
                {drep.metadata.manifesto}
              </p>
            </div>

            {/* Experience & Qualifications */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                Experience & Qualifications
              </h4>
              <p className={cn('leading-relaxed', theme.textSecondary)}>
                {drep.metadata.experience}
              </p>
            </div>

            {/* Voting Philosophy */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                Voting Philosophy
              </h4>
              <p className={cn('leading-relaxed', theme.textSecondary)}>
                {drep.metadata.votingPhilosophy}
              </p>
            </div>

            {/* Focus Areas */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                Focus Areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {drep.metadata.focusAreas.map((area) => (
                  <span 
                    key={area}
                    className={cn(
                      'px-3 py-2 rounded-lg border',
                      'bg-primary/10 text-primary border-primary/20'
                    )}
                  >
                    {area.charAt(0).toUpperCase() + area.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Voting History */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                Recent Voting History
              </h4>
              <div className="space-y-3">
                {mockVotes
                  .filter(vote => vote.voterId === drep.address)
                  .slice(0, 3)
                  .map((vote) => {
                    const proposal = mockGovernanceActions.find(p => p.id === vote.proposalId);
                    return (
                      <div key={vote.id} className={cn('p-3 rounded-lg border', theme.border)}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn('font-medium', theme.text)}>
                            {proposal?.title}
                          </span>
                          <span className={getVoteStyles(vote.vote as any)}>
                            {vote.vote.charAt(0).toUpperCase() + vote.vote.slice(1)}
                          </span>
                        </div>
                        <p className={cn('text-sm mb-2', theme.textSecondary)}>
                          {vote.rationale}
                        </p>
                        <p className={cn('text-xs', theme.textSecondary)}>
                          {formatDate(vote.timestamp, { relative: true })}
                        </p>
                      </div>
                    );
                  })}
                {mockVotes.filter(vote => vote.voterId === drep.address).length === 0 && (
                  <p className={cn('text-sm', theme.textSecondary)}>
                    No recent voting history available.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delegation Card */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                Delegate to this DRep
              </h4>
              <p className={cn('text-sm mb-4', theme.textSecondary)}>
                By delegating, you give this DRep the authority to vote on your behalf in governance actions.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => handleDelegation(drep.id)}
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Delegate Now'
                  )}
                </button>
                <button className="btn-outline w-full text-sm">
                  Learn More About Delegation
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                Performance Metrics
              </h4>
              <div className="space-y-4">
                {/* Participation Rate */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={theme.textSecondary}>Participation Rate</span>
                    <span className={theme.text}>{drep.performance.participationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{width: `${drep.performance.participationRate}%`}}
                    />
                  </div>
                </div>

                {/* Response Time */}
                <div className="flex justify-between">
                  <span className={cn('text-sm', theme.textSecondary)}>Avg Response Time</span>
                  <span className={cn('text-sm font-medium', theme.text)}>
                    {responseTimeText}
                  </span>
                </div>

                {/* Total Votes */}
                <div className="flex justify-between">
                  <span className={cn('text-sm', theme.textSecondary)}>Total Votes Cast</span>
                  <span className={cn('text-sm font-medium', theme.text)}>
                    {totalVotes}
                  </span>
                </div>

                {/* Registration Date */}
                <div className="flex justify-between">
                  <span className={cn('text-sm', theme.textSecondary)}>Registered Since</span>
                  <span className={cn('text-sm font-medium', theme.text)}>
                    {formatDate(drep.registrationDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* DRep IDs */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                DRep IDs
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('text-sm', theme.textSecondary)}>DRep ID</span>
                    <button
                      onClick={() => copyToClipboard(drep.id)}
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className={cn('text-xs break-all font-mono p-2 rounded border', theme.text, theme.border)}>
                    {drep.id}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('text-sm', theme.textSecondary)}>Cardano Address</span>
                    <button
                      onClick={() => copyToClipboard(drep.address)}
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className={cn('text-xs break-all font-mono p-2 rounded border', theme.text, theme.border)}>
                    {drep.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Delegation Statistics */}
            <div className={cn('p-6 rounded-xl border', theme.cardBg, theme.border)}>
              <h4 className={cn('text-lg font-semibold mb-4', theme.text)}>
                Delegation Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={cn('text-sm', theme.textSecondary)}>Current Delegators</span>
                  <span className={cn('text-sm font-bold', theme.text)}>
                    {formatNumber(drep.delegatorCount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={cn('text-sm', theme.textSecondary)}>Total Delegated Stake</span>
                  <span className={cn('text-sm font-bold', theme.text)}>
                    {formatADA(drep.votingPower, { compact: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={cn('text-sm', theme.textSecondary)}>Network Share</span>
                  <span className={cn('text-sm font-bold', theme.text)}>
                    {((drep.votingPower / mockGovernanceStats.totalVotingPower) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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