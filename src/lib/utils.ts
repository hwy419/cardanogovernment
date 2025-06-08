/**
 * Cardano Governance Platform - Utility Functions
 * Core utilities for formatting, validation, accessibility, and common operations
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  GovernanceActionStatus, 
  VoteChoice, 
  DRepStatus,
  ImpactLevel,
  CardanoAddress,
  GovernanceAction,
  VoteBreakdown,
  Timestamp
} from "@/types/governance";

/**
 * Combines and merges Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format ADA amounts from lovelace to human-readable format
 */
export function formatADA(lovelace: number, options: {
  showSymbol?: boolean;
  precision?: number;
  compact?: boolean;
} = {}): string {
  const { showSymbol = true, precision = 2, compact = false } = options;
  const ada = lovelace / 1_000_000;
  
  let formatted: string;
  
  if (compact && ada >= 1_000_000) {
    formatted = (ada / 1_000_000).toFixed(1) + 'M';
  } else if (compact && ada >= 1_000) {
    formatted = (ada / 1_000).toFixed(1) + 'K';
  } else {
    formatted = ada.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
    });
  }
  
  return showSymbol ? `₳ ${formatted}` : formatted;
}

/**
 * Format numbers with appropriate suffixes (K, M, B)
 */
export function formatNumber(num: number, precision: number = 1): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(precision) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(precision) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(precision) + 'K';
  }
  return num.toString();
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, precision: number = 1): string {
  return `${value.toFixed(precision)}%`;
}

/**
 * Calculate percentage from a value and total
 */
export function calculatePercentage(value: number, total: number): number {
  return total === 0 ? 0 : (value / total) * 100;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const absDiffInMs = Math.abs(diffInMs);
  const isFuture = diffInMs > 0;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  let value: number;
  let unit: string;
  
  if (absDiffInMs < minute) {
    return 'just now';
  } else if (absDiffInMs < hour) {
    value = Math.floor(absDiffInMs / minute);
    unit = value === 1 ? 'minute' : 'minutes';
  } else if (absDiffInMs < day) {
    value = Math.floor(absDiffInMs / hour);
    unit = value === 1 ? 'hour' : 'hours';
  } else if (absDiffInMs < week) {
    value = Math.floor(absDiffInMs / day);
    unit = value === 1 ? 'day' : 'days';
  } else if (absDiffInMs < month) {
    value = Math.floor(absDiffInMs / week);
    unit = value === 1 ? 'week' : 'weeks';
  } else if (absDiffInMs < year) {
    value = Math.floor(absDiffInMs / month);
    unit = value === 1 ? 'month' : 'months';
  } else {
    value = Math.floor(absDiffInMs / year);
    unit = value === 1 ? 'year' : 'years';
  }
  
  return isFuture ? `in ${value} ${unit}` : `${value} ${unit} ago`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, options: {
  includeTime?: boolean;
  relative?: boolean;
} = {}): string {
  const { includeTime = false, relative = false } = options;
  
  if (relative) {
    return formatRelativeTime(date);
  }
  
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  if (includeTime) {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} at ${timeStr}`;
  }
  
  return dateStr;
}

/**
 * Truncate Cardano address for display
 */
export function truncateAddress(address: CardanoAddress, options: {
  prefixLength?: number;
  suffixLength?: number;
} = {}): string {
  const { prefixLength = 8, suffixLength = 8 } = options;
  
  if (address.length <= prefixLength + suffixLength + 3) {
    return address;
  }
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Get status-specific styling classes
 */
export function getStatusStyles(status: GovernanceActionStatus | DRepStatus) {
  const statusClasses = {
    // Governance Action Status
    active: 'bg-governance-active/10 text-governance-active border-governance-active/20',
    pending: 'bg-governance-pending/10 text-governance-pending border-governance-pending/20',
    expired: 'bg-governance-expired/10 text-governance-expired border-governance-expired/20',
    ratified: 'bg-governance-ratified/10 text-governance-ratified border-governance-ratified/20',
    rejected: 'bg-governance-rejected/10 text-governance-rejected border-governance-rejected/20',
    
    // DRep Status
    inactive: 'bg-gray-100 text-gray-600 border-gray-200',
    retired: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  
  return cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
    statusClasses[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  );
}

/**
 * Get vote choice styling
 */
export function getVoteStyles(vote: VoteChoice) {
  const voteClasses = {
    yes: 'text-vote-yes bg-vote-yes/10 border-vote-yes/20',
    no: 'text-vote-no bg-vote-no/10 border-vote-no/20',
    abstain: 'text-vote-abstain bg-vote-abstain/10 border-vote-abstain/20',
  };
  
  return cn(
    'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
    voteClasses[vote]
  );
}

/**
 * Get impact level styling
 */
export function getImpactStyles(impact: ImpactLevel) {
  const impactClasses = {
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  };
  
  return cn(
    'inline-flex items-center px-2 py-1 rounded text-xs font-medium border',
    impactClasses[impact]
  );
}

/**
 * Calculate vote totals from vote breakdown
 */
export function calculateVoteTotal(votes: VoteBreakdown): number {
  return votes.yes + votes.no + votes.abstain;
}

/**
 * Calculate overall vote percentages across all governance bodies
 */
export function calculateOverallVotePercentages(proposal: GovernanceAction) {
  const drepTotal = calculateVoteTotal(proposal.votes.drep);
  const spoTotal = calculateVoteTotal(proposal.votes.spo);
  const ccTotal = calculateVoteTotal(proposal.votes.constitutionalCouncil);
  
  const totalYes = proposal.votes.drep.yes + proposal.votes.spo.yes + proposal.votes.constitutionalCouncil.yes;
  const totalNo = proposal.votes.drep.no + proposal.votes.spo.no + proposal.votes.constitutionalCouncil.no;
  const totalAbstain = proposal.votes.drep.abstain + proposal.votes.spo.abstain + proposal.votes.constitutionalCouncil.abstain;
  const grandTotal = totalYes + totalNo + totalAbstain;
  
  return {
    yes: calculatePercentage(totalYes, grandTotal),
    no: calculatePercentage(totalNo, grandTotal),
    abstain: calculatePercentage(totalAbstain, grandTotal),
    totals: {
      drep: drepTotal,
      spo: spoTotal,
      cc: ccTotal,
      overall: grandTotal,
    },
  };
}

/**
 * Determine if a proposal is close to deadline
 */
export function isCloseToDeadline(endDate: Date, hoursThreshold: number = 24): boolean {
  const now = new Date();
  const timeUntilEnd = endDate.getTime() - now.getTime();
  const hoursUntilEnd = timeUntilEnd / (1000 * 60 * 60);
  
  return hoursUntilEnd > 0 && hoursUntilEnd <= hoursThreshold;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Generate a deterministic color from a string (for avatars, etc.)
 */
export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate Cardano address format
 */
export function isValidCardanoAddress(address: string): boolean {
  const mainnetRegex = /^addr1[a-z0-9]{98}$/;
  const testnetRegex = /^addr_test1[a-z0-9]{98}$/;
  
  return mainnetRegex.test(address) || testnetRegex.test(address);
}

/**
 * Generate accessible announcement text for screen readers
 */
export function generateAccessibleAnnouncement(
  action: string,
  details: string
): string {
  return `${action}. ${details}`;
}

/**
 * Create ARIA label for vote breakdown
 */
export function createVoteBreakdownAriaLabel(votes: VoteBreakdown, category: string): string {
  const total = calculateVoteTotal(votes);
  const yesPercent = calculatePercentage(votes.yes, total);
  const noPercent = calculatePercentage(votes.no, total);
  const abstainPercent = calculatePercentage(votes.abstain, total);
  
  return `${category} votes: ${yesPercent.toFixed(1)}% yes, ${noPercent.toFixed(1)}% no, ${abstainPercent.toFixed(1)}% abstain`;
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (err) {
    return false;
  }
}

/**
 * Focus management utility for accessibility
 */
export function focusElement(selector: string, delay: number = 0): void {
  setTimeout(() => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, delay);
}

/**
 * Trap focus within a container (for modals, dropdowns)
 */
export function trapFocus(containerElement: HTMLElement): () => void {
  const focusableElements = containerElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
  
  containerElement.addEventListener('keydown', handleTabKey);
  firstElement.focus();
  
  // Return cleanup function
  return () => {
    containerElement.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Generate unique ID for form elements
 */
export function generateId(prefix: string = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate time remaining until a date
 */
export function getTimeRemaining(endDate: Date): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date().getTime();
  const end = endDate.getTime();
  const total = end - now;
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  
  return { total, days, hours, minutes, seconds };
}

/**
 * Create a readable duration string
 */
export function formatDuration(endDate: Date): string {
  const timeRemaining = getTimeRemaining(endDate);
  
  if (timeRemaining.total <= 0) {
    return 'Expired';
  }
  
  if (timeRemaining.days > 0) {
    return `${timeRemaining.days} day${timeRemaining.days !== 1 ? 's' : ''} remaining`;
  }
  
  if (timeRemaining.hours > 0) {
    return `${timeRemaining.hours} hour${timeRemaining.hours !== 1 ? 's' : ''} remaining`;
  }
  
  if (timeRemaining.minutes > 0) {
    return `${timeRemaining.minutes} minute${timeRemaining.minutes !== 1 ? 's' : ''} remaining`;
  }
  
  return 'Less than a minute remaining';
}

/**
 * Sort array by multiple criteria
 */
export function multiSort<T>(
  array: T[],
  sortCriteria: Array<{
    key: keyof T;
    direction: 'asc' | 'desc';
  }>
): T[] {
  return [...array].sort((a, b) => {
    for (const criterion of sortCriteria) {
      const aVal = a[criterion.key];
      const bVal = b[criterion.key];
      
      if (aVal < bVal) {
        return criterion.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return criterion.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Create URL-safe slug from string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}