# Cardano Wallet Connector Implementation

## Overview

This implementation provides a comprehensive Cardano wallet integration solution following CIP-30 standards. It includes wallet detection, connection management, transaction signing, and a clean React interface.

## Features

### ✅ Implemented Features

- **Multi-wallet Support**: Supports 8 major Cardano wallets (Nami, Eternl, Flint, Yoroi, Lace, Typhon, GeroWallet, Vespr)
- **CIP-30 Compliance**: Full CIP-30 standard interface implementation
- **Auto-detection**: Automatically detects installed wallets in browser
- **Auto-reconnect**: Remembers last connected wallet and reconnects on page load
- **Real-time State**: React context with real-time wallet state management
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **TypeScript**: Full TypeScript support with strict typing
- **Accessibility**: WCAG 2.2 AA compliant components
- **Responsive UI**: Mobile-friendly responsive design

### 🔄 Core Components

1. **WalletProvider**: React context provider for wallet state
2. **WalletConnector**: Main UI component for wallet connection
3. **WalletSelector**: Modal for choosing available wallets
4. **WalletStatus**: Displays connected wallet information
5. **WalletService**: Core service for wallet operations

## Quick Start

### 1. Add Wallet Provider to App

```tsx
// src/app/layout.tsx
import { WalletProvider } from '@/components/wallet';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
```

### 2. Use Wallet Connector Component

```tsx
// Any component
import { WalletConnector } from '@/components/wallet';

export function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>Cardano Governance</h1>
      <WalletConnector />
    </header>
  );
}
```

### 3. Access Wallet State

```tsx
import { useWallet } from '@/components/wallet';

export function GovernanceActions() {
  const { 
    isConnected, 
    connection, 
    canVote, 
    signTransaction,
    submitTransaction 
  } = useWallet();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  const handleVote = async () => {
    try {
      // Build transaction (would use actual transaction builder)
      const tx = { body: 'transaction_cbor_hex' };
      
      // Sign and submit
      const signedTx = await signTransaction(tx);
      const txHash = await submitTransaction(signedTx);
      
      console.log('Vote submitted:', txHash);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  return (
    <div>
      <h2>Governance Actions</h2>
      <p>Connected: {connection.walletName}</p>
      <p>Can Vote: {canVote ? 'Yes' : 'No'}</p>
      <button onClick={handleVote} disabled={!canVote}>
        Cast Vote
      </button>
    </div>
  );
}
```

## Wallet Operations

### Connection Management

```tsx
const { 
  connectWallet, 
  disconnectWallet, 
  isConnected,
  availableWallets 
} = useWallet();

// Connect to specific wallet
await connectWallet('nami');

// Disconnect current wallet
disconnectWallet();

// Check available wallets
console.log('Available wallets:', availableWallets);
```

### Transaction Operations

```tsx
const { 
  signTransaction, 
  submitTransaction, 
  signData 
} = useWallet();

// Sign transaction
const signedTx = await signTransaction({
  body: 'cbor_hex_string',
  witnessSet: 'optional_witness_set',
  metadata: { 721: { /* metadata */ } }
});

// Submit signed transaction
const txHash = await submitTransaction(signedTx);

// Sign arbitrary data
const signature = await signData(address, 'data_to_sign');
```

### Balance and Address Info

```tsx
const { 
  connection, 
  formattedBalance, 
  shortAddress,
  refreshBalance 
} = useWallet();

// Current balance
console.log('Balance:', formattedBalance); // "1,234.567890 ₳"

// Shortened address for display
console.log('Address:', shortAddress); // "addr1qxy...123abc"

// Full address info
console.log('Addresses:', connection.addresses);

// Refresh balance
await refreshBalance();
```

## Component Props

### WalletConnector Props

```tsx
interface WalletConnectorProps {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showBalance?: boolean;
  showAddress?: boolean;
  className?: string;
}
```

### WalletStatus Props

```tsx
interface WalletStatusProps {
  walletName: SupportedWalletName | null;
  balance?: string;
  address?: string;
  networkId: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

## Error Handling

The wallet system includes comprehensive error handling:

```tsx
import { WalletError } from '@/components/wallet';

try {
  await connectWallet('nami');
} catch (error) {
  if (error instanceof WalletError) {
    switch (error.code) {
      case 'WALLET_NOT_FOUND':
        // Wallet not installed
        break;
      case 'CONNECTION_FAILED':
        // Connection failed
        break;
      case 'TRANSACTION_REJECTED':
        // User rejected transaction
        break;
      // ... handle other error codes
    }
  }
}
```

## Supported Wallets

| Wallet | Status | Features |
|--------|--------|----------|
| Nami | ✅ | Full CIP-30 support |
| Eternl | ✅ | Full CIP-30 support |
| Flint | ✅ | Full CIP-30 support |
| Yoroi | ✅ | Full CIP-30 support |
| Lace | ✅ | Full CIP-30 support |
| Typhon | ✅ | Full CIP-30 support |
| GeroWallet | ✅ | Full CIP-30 support |
| Vespr | ✅ | Full CIP-30 support |

## Network Support

- **Mainnet** (networkId: 1)
- **Testnet** (networkId: 0)
- **Preview/Preprod** (auto-detected)

## File Structure

```
src/
├── components/wallet/
│   ├── wallet-context.tsx       # React context provider
│   ├── wallet-connector.tsx     # Main connector component
│   ├── wallet-selector.tsx      # Wallet selection modal
│   ├── wallet-status.tsx        # Connected wallet display
│   └── index.ts                 # Exports
├── lib/
│   └── wallet-service.ts        # Core wallet service
├── types/
│   └── wallet.ts               # TypeScript definitions
└── app/
    └── wallet-demo.tsx         # Demo page
```

## Testing the Implementation

### 1. Run the Demo

```bash
npm run dev
```

Navigate to the demo page to test wallet connection:
- Shows all available wallets
- Displays connection status
- Shows wallet information when connected

### 2. Manual Testing

1. **Install a Cardano wallet** (Nami recommended for testing)
2. **Open the application** in browser
3. **Click "Connect Wallet"** button
4. **Select your wallet** from the modal
5. **Approve connection** in wallet popup
6. **Verify wallet information** is displayed correctly

### 3. Test Features

- ✅ Wallet detection
- ✅ Connection/disconnection
- ✅ Auto-reconnect on page refresh
- ✅ Balance display
- ✅ Address display and copying
- ✅ Network detection
- ✅ Error handling

## Integration with Governance Features

### Voting Interface

```tsx
export function VotingInterface({ proposalId }: { proposalId: string }) {
  const { isConnected, canVote, signTransaction } = useWallet();

  const castVote = async (vote: 'yes' | 'no' | 'abstain') => {
    if (!canVote) return;

    try {
      // Build vote transaction
      const voteTx = await buildVoteTransaction(proposalId, vote);
      
      // Sign and submit
      const signedTx = await signTransaction(voteTx);
      const txHash = await submitTransaction(signedTx);
      
      // Handle success
      onVoteSuccess(txHash);
    } catch (error) {
      // Handle error
      onVoteError(error);
    }
  };

  if (!isConnected) {
    return <WalletConnector />;
  }

  if (!canVote) {
    return (
      <div>
        <p>You need to delegate your stake to vote</p>
        <Button onClick={() => showDelegationInterface()}>
          Delegate Stake
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3>Cast Your Vote</h3>
      <div className="flex gap-2">
        <Button onClick={() => castVote('yes')}>Vote Yes</Button>
        <Button onClick={() => castVote('no')}>Vote No</Button>
        <Button onClick={() => castVote('abstain')}>Abstain</Button>
      </div>
    </div>
  );
}
```

### DRep Registration

```tsx
export function DRepRegistration() {
  const { isConnected, signTransaction } = useWallet();

  const registerAsDRep = async (metadata: DRepMetadata) => {
    if (!isConnected) return;

    try {
      // Build DRep registration transaction
      const regTx = await buildDRepRegistrationTransaction(metadata);
      
      // Sign and submit
      const signedTx = await signTransaction(regTx);
      const txHash = await submitTransaction(signedTx);
      
      // Handle success
      onRegistrationSuccess(txHash);
    } catch (error) {
      // Handle error
      onRegistrationError(error);
    }
  };

  // Component implementation...
}
```

## Next Steps

### 1. Add Cardano Dependencies

When Node.js is updated to v20+, install the full Cardano libraries:

```bash
npm install @meshsdk/core @meshsdk/react lucid-cardano @emurgo/cardano-serialization-lib-browser
```

### 2. Enhance Transaction Building

Integrate with proper transaction builders:
- Parameter change proposals
- Treasury withdrawal proposals
- Hard fork initiation
- Constitutional changes

### 3. Add Real Blockchain Integration

Connect to actual Cardano infrastructure:
- Cardano Node integration
- DB Sync for governance data
- Blockfrost API integration
- Real-time blockchain monitoring

### 4. Improve UI/UX

- Add loading animations
- Improve error states
- Add transaction status tracking
- Implement toast notifications

## Security Considerations

- ✅ **CIP-30 Compliance**: Following standard wallet interface
- ✅ **No Private Key Handling**: Wallets handle all cryptography
- ✅ **Transaction Preview**: Users see transactions before signing
- ✅ **Error Boundaries**: Graceful error handling
- ⚠️ **Input Validation**: Validate all user inputs
- ⚠️ **Rate Limiting**: Implement API rate limiting
- ⚠️ **Network Verification**: Verify network ID matches expected

## Troubleshooting

### Common Issues

1. **Wallet Not Detected**
   - Ensure wallet is installed and enabled
   - Refresh page after wallet installation
   - Check browser compatibility

2. **Connection Failed**
   - Wallet might be locked
   - Check wallet permissions
   - Try different wallet

3. **Transaction Rejected**
   - User rejected in wallet
   - Insufficient funds
   - Invalid transaction format

### Debug Tools

```tsx
// Add to component for debugging
const walletDebugInfo = {
  isConnected,
  connection,
  stakingInfo,
  availableWallets,
  hasVotingPower,
  canVote
};

console.log('Wallet Debug Info:', walletDebugInfo);
```

## Conclusion

This wallet connector implementation provides a solid foundation for Cardano governance participation. It's built with modern React patterns, comprehensive TypeScript support, and follows accessibility best practices.

The modular design allows for easy extension and customization while maintaining a clean, user-friendly interface. Once the proper Cardano dependencies are added, it will provide full blockchain integration capabilities for the governance platform. 