# Cardano Governance Voting Interface

A comprehensive live voting system for Cardano governance proposals, built with React and TypeScript. This implementation provides a complete solution for viewing, interacting with, and voting on governance actions in the Cardano ecosystem.

## 🚀 Features

### Core Voting Functionality
- **Secure Wallet Integration**: CIP-30 compliant wallet connections for vote submission
- **Vote Options**: Support for Yes/No/Abstain voting with optional rationale
- **Transaction Preview**: Preview fees and transaction details before submission
- **Real-time Updates**: Live vote tallies and proposal status updates via WebSocket
- **Optimistic Updates**: Immediate UI feedback with blockchain confirmation

### Governance Visualization
- **Tricameral Display**: Visual breakdown of DRep, SPO, and Constitutional Council votes
- **Threshold Tracking**: Real-time monitoring of voting thresholds for each group
- **Progress Indicators**: Interactive progress bars with participation rates
- **Timeline View**: Complete proposal lifecycle from submission to resolution

### Accessibility & UX
- **WCAG 2.2 AA Compliant**: Full keyboard navigation and screen reader support
- **Mobile Responsive**: Optimized for all device sizes
- **Error Handling**: Comprehensive error states with recovery guidance
- **Loading States**: Skeleton components and loading indicators

## 📁 Component Architecture

```
voting/
├── VotingInterface.tsx      # Main voting form and transaction handling
├── VoteBreakdown.tsx        # Tricameral vote visualization
├── ProposalVotingPage.tsx   # Complete voting page with all components
├── index.ts                 # Component exports
└── README.md               # This documentation
```

## 🔧 Installation & Setup

### Prerequisites
```bash
# Required dependencies (to be installed in actual project)
npm install react @tanstack/react-query zustand
npm install @meshsdk/react lucide-react
npm install @radix-ui/react-radio-group @radix-ui/react-label
```

### Basic Usage

```tsx
import { ProposalVotingPage } from './components/voting';

function App() {
  return (
    <ProposalVotingPage
      proposalId="proposal-001"
      walletAddress="addr1qyy6nhfyks7wdu3dudslys..."
      voterType="drep"
      votingPower={125000000}
    />
  );
}
```

### Individual Components

```tsx
import { 
  VotingInterface, 
  VoteBreakdown,
  useProposalVoting 
} from './components/voting';

function CustomVotingPage({ proposalId }: { proposalId: string }) {
  const { data: votingInfo } = useProposalVoting(proposalId);
  
  if (!votingInfo) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <VotingInterface
        proposal={votingInfo.proposal}
        walletAddress="addr1..."
        voterType="drep"
        votingPower={125000000}
      />
      <VoteBreakdown 
        proposal={votingInfo.proposal}
        realTimeUpdates={true}
      />
    </div>
  );
}
```

## 🎯 Component API

### VotingInterface

Main component for casting votes on governance proposals.

```tsx
interface VotingInterfaceProps {
  proposal: GovernanceAction;
  walletAddress?: string;
  voterType?: 'drep' | 'spo' | 'constitutional-council';
  votingPower?: number;
  onVoteSuccess?: (vote: Vote) => void;
  onVoteError?: (error: Error) => void;
}
```

**Features:**
- Wallet connection verification
- Vote selection (Yes/No/Abstain) with descriptions
- Required rationale for "No" votes
- Transaction fee preview
- Blockchain submission with confirmation
- Success/error state handling

### VoteBreakdown

Comprehensive visualization of voting results across all three governance bodies.

```tsx
interface VoteBreakdownProps {
  proposal: GovernanceAction;
  className?: string;
  showDetails?: boolean;
  realTimeUpdates?: boolean;
}
```

**Features:**
- Tricameral vote distribution (DRep/SPO/Constitutional Council)
- Progress bars with threshold indicators
- Participation rate calculations
- Real-time vote tally updates
- Overall proposal status determination

### ProposalVotingPage

Complete voting page combining all components for a full governance experience.

```tsx
interface ProposalVotingPageProps {
  proposalId: string;
  walletAddress?: string;
  voterType?: 'drep' | 'spo' | 'constitutional-council';
  votingPower?: number;
}
```

**Features:**
- Proposal header with metadata
- Integrated voting interface
- Live vote breakdown
- Proposal timeline
- Recent votes history
- Educational information

## 🔌 Hooks & Data Management

### Core Voting Hooks

```tsx
// Vote submission with optimistic updates
const voteSubmission = useVoteSubmission();

// Real-time proposal voting information
const { data: votingInfo } = useProposalVoting(proposalId);

// User's voting history
const { data: userVotes } = useUserVotes(userId);

// Transaction preview before submission
const transactionPreview = useTransactionPreview();

// Real-time voting updates via WebSocket
const { lastEvent } = useVotingUpdates(proposalId);
```

### State Management

```tsx
// Global voting state
const { votingState, updateVotingState } = useVotingState();

// Wallet voting capabilities
const { data: capability } = useWalletVotingCapability(walletAddress);

// Vote validation
const validateVote = useVoteValidation();
```

## 📊 Data Types

### Core Types

```tsx
type VoteChoice = 'yes' | 'no' | 'abstain';
type VoterType = 'drep' | 'spo' | 'constitutional-council';
type ProposalStatus = 'pending' | 'active' | 'expired' | 'ratified' | 'rejected';

interface GovernanceAction {
  id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  votes: {
    drep: { yes: number; no: number; abstain: number };
    spo: { yes: number; no: number; abstain: number };
    constitutionalCouncil: { yes: number; no: number; abstain: number };
  };
  thresholds: {
    drepThreshold: number;
    spoThreshold: number;
    ccThreshold: number;
  };
  // ... additional fields
}
```

## 🎨 Styling & Theming

The components use Tailwind CSS classes and can be customized through:

### Theme Variables
```css
:root {
  --color-green-success: #10b981;
  --color-red-danger: #ef4444;
  --color-blue-primary: #3b82f6;
  --color-amber-warning: #f59e0b;
}
```

### Custom Styling
```tsx
<VoteBreakdown 
  proposal={proposal}
  className="custom-vote-breakdown"
/>
```

## 🔧 Development & Testing

### Mock Data

Comprehensive mock data is provided for development and testing:

```tsx
import { 
  mockGovernanceActions, 
  mockUserVotingState,
  generateMockVote 
} from './components/voting';

// Use mock proposal
const proposal = mockGovernanceActions[0];

// Generate test vote
const testVote = generateMockVote(
  'proposal-001', 
  'drep', 
  'yes', 
  100000000, 
  'Test rationale'
);
```

### Testing Scenarios

1. **Active Voting Period**: User can vote on active proposals
2. **Expired Proposals**: Show results for ended voting periods
3. **Already Voted**: Display user's existing vote
4. **Wallet Not Connected**: Show connection prompts
5. **Insufficient Permissions**: Handle non-eligible voters
6. **Network Errors**: Graceful error handling and recovery

## 🚀 Integration Examples

### Next.js Page

```tsx
// pages/proposals/[id]/vote.tsx
import { ProposalVotingPage } from '../../../components/voting';
import { useWallet } from '../../../hooks/useWallet';

export default function VotePage({ params }: { params: { id: string } }) {
  const { walletAddress, voterType, votingPower } = useWallet();
  
  return (
    <ProposalVotingPage
      proposalId={params.id}
      walletAddress={walletAddress}
      voterType={voterType}
      votingPower={votingPower}
    />
  );
}
```

### React Router

```tsx
import { Routes, Route } from 'react-router-dom';
import { ProposalVotingPage } from './components/voting';

function App() {
  return (
    <Routes>
      <Route 
        path="/proposals/:id/vote" 
        element={<ProposalVotingPage />} 
      />
    </Routes>
  );
}
```

## 🔒 Security Considerations

### Wallet Security
- Never store private keys
- Signature-based authentication only
- Transaction preview before submission
- Clear security warnings

### Vote Validation
- Server-side validation for all votes
- Duplicate vote prevention
- Rationale requirements for "No" votes
- Wallet ownership verification

### Data Integrity
- Real-time blockchain synchronization
- Multi-source data validation
- Optimistic updates with rollback capability
- Transaction confirmation tracking

## 📈 Performance Optimizations

### Code Splitting
```tsx
import { lazy, Suspense } from 'react';

const VotingInterface = lazy(() => 
  import('./components/voting').then(module => ({ 
    default: module.VotingInterface 
  }))
);

function App() {
  return (
    <Suspense fallback={<div>Loading voting interface...</div>}>
      <VotingInterface />
    </Suspense>
  );
}
```

### Caching Strategy
- TanStack Query for server state caching
- Stale-while-revalidate for real-time data
- Optimistic updates for immediate feedback
- Background data synchronization

## 🌐 Accessibility Features

### WCAG 2.2 AA Compliance
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ High contrast mode support
- ✅ Focus management
- ✅ Error announcement
- ✅ Text scaling up to 200%

### Implementation Examples

```tsx
// Accessible voting option
<RadioGroupItem
  value="yes"
  id="vote-yes"
  aria-describedby="yes-description"
/>
<Label htmlFor="vote-yes">
  Vote Yes
</Label>
<p id="yes-description">
  Support this proposal and its implementation
</p>

// Screen reader announcements
<span className="sr-only">
  Vote submission in progress...
</span>
```

## 🤝 Contributing

When contributing to the voting interface:

1. **Follow TypeScript strict mode**
2. **Add comprehensive tests for new features**
3. **Ensure WCAG 2.2 AA compliance**
4. **Update mock data for new scenarios**
5. **Document new component props and hooks**

## 📝 License

This voting interface implementation is part of the Cardano Governance Platform and follows the same licensing terms as the main project.

---

**Built with ❤️ for the Cardano community**

*Empowering decentralized governance through accessible, secure, and user-friendly voting interfaces.*