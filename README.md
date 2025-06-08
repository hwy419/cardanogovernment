# Cardano Governance Platform

A comprehensive, accessible blockchain governance platform built for the Cardano ecosystem. This platform enables DReps, delegators, proposers, and participants to engage with on-chain governance through an intuitive, WCAG 2.2 AA compliant interface.

## � Features

### Core Functionality
- **Governance Action Browser** - Browse active/past proposals with advanced filtering and search
- **DRep Directory** - Searchable directory with performance metrics and detailed profiles
- **Voting Interface** - Secure wallet-connected voting with transaction previews
- **Delegation Management** - Delegate stake to DReps with clear consequence explanations
- **Proposal Creation** - Structured forms for creating different types of governance proposals
- **Real-time Updates** - Live updates on voting progress and governance state changes

### User Types Supported
1. **Cardano Ecosystem Participants** - View governance actions, register as DReps, track voting history
2. **DReps (Delegate Representatives)** - Vote on proposals, manage delegations, maintain public profiles
3. **Delegators** - Browse and delegate to DReps, monitor delegation status
4. **Proposers** - Create and submit governance proposals, track proposal lifecycle

### Accessibility & Performance
- **WCAG 2.2 AA Compliance** - Full accessibility support with screen reader compatibility
- **Core Web Vitals Optimized** - LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Mobile-First Design** - Responsive across all device sizes
- **Dark/Light Mode** - Automatic theme detection with manual override
- **Keyboard Navigation** - Complete keyboard accessibility throughout the platform

## 🛠 Technology Stack

### Frontend
- **Next.js 15** with App Router and React 19 Server Components
- **TypeScript 5.0+** for enhanced maintainability and developer experience
- **Tailwind CSS** with custom design system and accessibility utilities
- **shadcn/ui + Radix UI** for component library with built-in accessibility
- **Zustand** for global state management with TanStack Query for server state

### Cardano Integration
- **@meshsdk/react** for wallet connections and CIP-30 compliance
- **Multi-wallet Support** - Nami, Eternl, Flint, Yoroi, and more
- **Real-time Blockchain Data** - Live governance action monitoring
- **Signature Verification** - Secure wallet-based authentication

### Performance & Accessibility
- **Core Web Vitals Optimization** - Lighthouse score 95+ desktop, 90+ mobile
- **Accessibility-First Design** - Screen reader support, keyboard navigation
- **Progressive Web App** capabilities with offline functionality
- **Advanced Caching** strategies for optimal performance

## � Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (or **yarn** 1.22.0+)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/cardano-governance-platform.git
cd cardano-governance-platform
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CARDANO_NETWORK=mainnet

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws

# Cardano Network Configuration
NEXT_PUBLIC_BLOCKFROST_PROJECT_ID=your_blockfrost_project_id
NEXT_PUBLIC_KOIOS_API_URL=https://api.koios.rest/api/v1

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the platform.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── globals.css        # Global styles and design tokens
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main application component
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── governance/       # Governance-specific components
│   ├── wallet/           # Wallet integration components
│   └── charts/           # Data visualization components
├── lib/                  # Utility functions and configurations
│   ├── utils.ts          # Core utility functions
│   ├── mock-data.ts      # Development mock data
│   └── api.ts            # API client configuration
├── hooks/                # Custom React hooks
│   ├── useWallet.ts      # Wallet management
│   ├── useGovernance.ts  # Governance data management
│   └── useAccessibility.ts # Accessibility helpers
├── store/                # State management (Zustand)
│   ├── governanceStore.ts # Governance state
│   ├── walletStore.ts    # Wallet state
│   └── uiStore.ts        # UI preferences and state
└── types/                # TypeScript type definitions
    ├── governance.ts     # Governance data types
    ├── wallet.ts         # Wallet integration types
    └── api.ts            # API response types
```

## 🎯 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report

# Quality Assurance
npm run accessibility   # Run accessibility tests
npm run lighthouse      # Run Lighthouse performance audit
npm run bundle-analyzer # Analyze bundle size
```

## 🎨 Design System

The platform uses a comprehensive design system with:

### Color Palette
- **Primary**: Cardano blue (#0ea5e9) with WCAG AA compliant variations
- **Governance Status**: Active (#10b981), Pending (#f59e0b), Expired (#ef4444)
- **Vote Colors**: Yes (#059669), No (#dc2626), Abstain (#6b7280)

### Typography
- **Primary Font**: Inter (sans-serif) for optimal readability
- **Monospace Font**: JetBrains Mono for addresses and technical data
- **Responsive Scale**: 12px - 48px with consistent line heights

### Accessibility Features
- **Touch Targets**: Minimum 44px for all interactive elements
- **Focus Indicators**: High-contrast focus rings for keyboard navigation
- **Color Contrast**: 4.5:1 minimum ratio for normal text, 3:1 for large text
- **Screen Reader Support**: Comprehensive ARIA labels and semantic HTML

## 🔗 Wallet Integration

The platform supports multiple Cardano wallets:

### Supported Wallets
- **Nami** - Full governance feature support
- **Eternl** - Advanced DRep functionality
- **Flint** - Basic voting and delegation
- **Yoroi** - Standard governance operations
- **GeroWallet** - Multi-signature support
- **NuFi** - Hardware wallet integration

### Integration Features
- **CIP-30 Compliance** - Universal wallet adapter pattern
- **Automatic Detection** - Detect available wallets on user device
- **Secure Authentication** - Signature-based verification
- **Transaction Signing** - Multi-step transaction preview and signing
- **Error Handling** - Comprehensive error messages and recovery flows

## 📊 Governance Features

### Proposal Types Supported
1. **Parameter Changes** - Protocol parameter adjustments
2. **Hard Forks** - Protocol version upgrades
3. **Treasury Withdrawals** - Community fund allocations
4. **Constitutional Changes** - Governance framework updates
5. **Committee Updates** - Constitutional committee management

### Voting Mechanism
- **Three-Chamber System** - DReps, SPOs, Constitutional Committee
- **Threshold Validation** - Automatic threshold checking
- **Real-time Results** - Live vote counting and progress
- **Vote Rationale** - Optional explanations for voting decisions

### DRep Features
- **Profile Management** - Comprehensive DRep profiles with manifesto
- **Performance Metrics** - Participation rate, response time, reputation
- **Delegation Tracking** - Real-time delegation monitoring
- **Communication Tools** - Direct channels to delegators

## 🔒 Security & Privacy

### Security Measures
- **Wallet Security** - No private key storage, signature-based authentication
- **Data Protection** - Encryption at rest and in transit
- **Rate Limiting** - API endpoint protection against abuse
- **Input Validation** - Comprehensive sanitization of user inputs
- **Content Security Policy** - XSS protection and secure resource loading

### Privacy Features
- **Minimal Data Collection** - Only necessary governance data
- **User Control** - Full control over profile information
- **Transparent Operations** - Open-source codebase
- **GDPR Compliance** - European privacy regulation compliance

## 🌐 Deployment

### Environment Requirements
- **Node.js** 18+ runtime environment
- **AWS Account** for serverless deployment (recommended)
- **Custom Domain** with SSL certificate
- **CDN** for global content delivery

### Deployment Options

#### Vercel (Recommended for MVP)
```bash
npm install -g vercel
vercel --prod
```

#### AWS Amplify
```bash
amplify init
amplify add hosting
amplify publish
```

#### Docker
```bash
docker build -t cardano-governance .
docker run -p 3000:3000 cardano-governance
```

## 🧪 Testing

### Testing Strategy
- **Unit Tests** - Component and utility function testing
- **Integration Tests** - API and wallet integration testing
- **Accessibility Tests** - WCAG compliance validation
- **Performance Tests** - Core Web Vitals monitoring
- **E2E Tests** - Complete user journey validation

### Running Tests
```bash
# Unit tests
npm run test

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:lighthouse

# End-to-end tests
npm run test:e2e
```

## 📈 Performance Monitoring

### Metrics Tracked
- **Core Web Vitals** - LCP, FID, CLS measurements
- **Custom Metrics** - Governance action load time, vote submission time
- **User Experience** - Error rates, success rates, user satisfaction
- **Accessibility** - Screen reader usage, keyboard navigation patterns

### Monitoring Tools
- **Lighthouse CI** - Automated performance audits
- **Web Vitals** - Real user monitoring
- **Sentry** - Error tracking and performance monitoring
- **Google Analytics** - User behavior analytics (privacy-compliant)

## 🤝 Contributing

We welcome contributions from the Cardano community! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript** - Strict type checking required
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Accessibility** - WCAG 2.2 AA compliance required
- **Testing** - Minimum 80% code coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Acknowledgments

- **Cardano Foundation** - For the governance framework and ecosystem support
- **IOG (Input Output Global)** - For the technical infrastructure and CIP standards
- **Cardano Community** - For feedback, testing, and continuous improvement
- **Accessibility Community** - For guidance on inclusive design practices

## 📞 Support & Community

### Get Help
- **Documentation** - [https://docs.cardano-governance.org](https://docs.cardano-governance.org)
- **Discord** - [https://discord.gg/cardano-governance](https://discord.gg/cardano-governance)
- **GitHub Issues** - [Report bugs or request features](https://github.com/your-org/cardano-governance-platform/issues)

### Community Links
- **Twitter** - [@CardanoGov](https://twitter.com/CardanoGov)
- **Telegram** - [Cardano Governance Discussion](https://t.me/cardano_governance)
- **Reddit** - [r/CardanoGovernance](https://reddit.com/r/CardanoGovernance)

## � Roadmap

### Phase 1: Foundation (Q1 2025) ✅
- Core governance interface
- Basic wallet integration
- DRep directory and voting
- Accessibility compliance

### Phase 2: Enhancement (Q2 2025)
- Advanced analytics dashboard
- Mobile application (React Native)
- Multi-language support
- Enhanced proposal creation tools

### Phase 3: Advanced Features (Q3 2025)
- AI-powered proposal analysis
- Advanced notification system
- Governance simulation tools
- Cross-chain governance integration

### Phase 4: Ecosystem Integration (Q4 2025)
- Third-party tool integration
- API marketplace
- Governance automation tools
- Enterprise dashboard

---

Built with ❤️ for the Cardano community by the Cardano Governance Platform Team. 