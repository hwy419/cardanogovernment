# Cardano Governance Platform - AWS Serverless Backend

A comprehensive, scalable AWS serverless backend for the Cardano blockchain governance platform, implementing CIP-1694 governance features with enterprise-grade security and performance.

## 🏗️ Architecture Overview

### Core Technologies
- **AWS Lambda** with Node.js 22 and native TypeScript
- **DynamoDB** with single-table design pattern for optimal performance
- **API Gateway** (REST + WebSocket) for comprehensive API management
- **AWS Cognito** for wallet-based authentication
- **EventBridge** for event-driven architecture
- **Cardano Integration** via Blockfrost API and native libraries

### Key Features
- ✅ **Wallet-Based Authentication** with CIP-8 signature verification
- ✅ **DRep Management** with registration, delegation, and performance tracking
- ✅ **Governance Proposals** with full CRUD operations and voting
- ✅ **Real-time Updates** via WebSocket API and DynamoDB Streams
- ✅ **Role-Based Access Control** for different user types
- ✅ **Comprehensive Logging** and monitoring
- ✅ **Auto-scaling** for high-traffic governance periods

## 📋 Prerequisites

### AWS Account Setup
1. AWS Account with appropriate permissions
2. AWS CLI configured with your credentials
3. Node.js 22+ installed locally
4. AWS CDK CLI installed globally

### Cardano Services
1. Blockfrost API account and project ID
2. Access to Cardano node (optional, for advanced features)
3. Cardano DB Sync instance (optional, for comprehensive data)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create AWS Secrets Manager entries for sensitive configuration:

```bash
# Create blockchain credentials secret
aws secretsmanager create-secret \
  --name "cardano-governance/blockchain" \
  --description "Cardano blockchain service credentials" \
  --secret-string '{
    "blockfrostProjectId": "your_blockfrost_project_id",
    "cardanoNodeEndpoint": "https://cardano-node-endpoint",
    "dbSyncConnectionString": "postgresql://user:pass@host:port/db",
    "network": "mainnet"
  }'

# Create JWT secret
aws secretsmanager create-secret \
  --name "cardano-governance/jwt-secret" \
  --description "JWT signing secret for authentication" \
  --secret-string '{
    "jwtSecret": "your-super-secure-jwt-secret-here"
  }'
```

### 3. Deploy Infrastructure

```bash
# Bootstrap CDK (first time only)
npm run bootstrap

# Deploy development stack
npm run deploy:dev

# Deploy production stack
npm run deploy:prod
```

### 4. Configure Frontend Integration

The deployment will output API endpoints and configuration values:

```bash
# Get deployment outputs
aws ssm get-parameter --name "/governance/api-endpoint"
aws ssm get-parameter --name "/governance/websocket-endpoint"
aws ssm get-parameter --name "/governance/user-pool-id"
aws ssm get-parameter --name "/governance/user-pool-client-id"
```

## 🔧 Configuration

### Environment Variables

The CDK stack automatically configures these environment variables for Lambda functions:

```typescript
GOVERNANCE_TABLE_NAME=cardano-governance-data
PROPOSALS_BUCKET_NAME=cardano-governance-proposals-{account}-{region}
USER_POOL_ID=us-east-1_xxxxxxxxx
USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
EVENT_BUS_NAME=cardano-governance-events
SECRETS_ARN=arn:aws:secretsmanager:region:account:secret:cardano-governance/blockchain
AWS_REGION=us-east-1
STAGE=dev|prod
```

### Security Configuration

The backend implements comprehensive security measures:

- **Wallet Authentication**: CIP-8 compliant Cardano wallet signature verification
- **JWT Tokens**: Secure token-based authentication with configurable expiration
- **Role-Based Access**: Different permissions for participants, DReps, proposers
- **Rate Limiting**: Configurable rate limits for different operations
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation using Zod schemas

## 📊 Database Schema

### Single-Table Design Pattern

The backend uses DynamoDB with a single-table design for optimal performance:

```typescript
// Primary Table Structure
{
  PK: string,           // Partition Key: USER#address, DREP#id, PROPOSAL#id
  SK: string,           // Sort Key: PROFILE, VOTE#id, DELEGATION#timestamp
  GSI1PK?: string,      // Global Secondary Index 1 PK
  GSI1SK?: string,      // Global Secondary Index 1 SK
  GSI2PK?: string,      // Global Secondary Index 2 PK
  GSI2SK?: string,      // Global Secondary Index 2 SK
  EntityType: string,   // USER, DREP, PROPOSAL, VOTE, DELEGATION
  Data: object,         // Entity-specific data
  CreatedAt: string,    // ISO timestamp
  UpdatedAt: string,    // ISO timestamp
  TTL?: number          // Time to live for temporary data
}
```

### Access Patterns

Optimized for common governance queries:

- **List DReps by voting power**: GSI2 on `VOTING_POWER#amount`
- **List proposals by status**: GSI1 on `STATUS#active`
- **User voting history**: GSI1 on `VOTER#address`
- **DRep delegations**: GSI1 on `DREP#drepId`
- **Proposal votes**: Query on `PROPOSAL#id` with `VOTE#` prefix

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/wallet-connect` - Authenticate with Cardano wallet
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Proposals
- `GET /api/v1/proposals` - List governance proposals (paginated, filtered)
- `POST /api/v1/proposals` - Create new proposal (requires auth)
- `GET /api/v1/proposals/{id}` - Get specific proposal details
- `POST /api/v1/proposals/{id}/vote` - Submit vote (requires DRep auth)

### DReps
- `GET /api/v1/dreps` - List DReps with performance metrics
- `POST /api/v1/dreps/register` - Register as DRep (requires auth)
- `GET /api/v1/dreps/{id}` - Get DRep details and statistics
- `POST /api/v1/dreps/{id}/delegate` - Delegate to DRep (requires auth)

### Users
- `GET /api/v1/users/profile` - Get user profile (requires auth)
- `PUT /api/v1/users/profile` - Update user profile (requires auth)
- `GET /api/v1/users/{address}/history` - Get user's governance history

### WebSocket
- `wss://api.domain.com/ws` - Real-time governance updates

## 🔄 Real-time Features

### WebSocket Subscriptions

```typescript
// Subscribe to proposal updates
{
  type: "SUBSCRIBE",
  topics: ["proposals", "proposal:123"],
  auth: "Bearer jwt_token"
}

// Receive real-time events
{
  type: "PROPOSAL_UPDATED",
  data: { /* proposal data */ },
  timestamp: "2024-01-01T12:00:00Z",
  messageId: "unique_id"
}
```

### Event Types

- `PROPOSAL_CREATED` - New governance proposal submitted
- `PROPOSAL_UPDATED` - Proposal status or vote counts changed
- `VOTE_CAST` - New vote submitted (includes verification status)
- `DELEGATION_CREATED` - New delegation to DRep
- `DREP_REGISTERED` - New DRep registration
- `GOVERNANCE_STATS_UPDATED` - Network governance statistics updated

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# Integration tests (requires AWS credentials)
npm run test:integration

# Coverage report
npm run test:coverage
```

### Load Testing

Included Artillery configuration for testing governance voting periods:

```bash
# Install Artillery
npm install -g artillery

# Run load tests
artillery run artillery.yml
```

## 📈 Monitoring & Observability

### CloudWatch Metrics

The backend automatically publishes custom metrics:

- `APILatency` - API response times by endpoint
- `VotesCast` - Number of votes processed
- `AuthenticationAttempts` - Authentication success/failure rates
- `BlockchainSync` - Blockchain synchronization status

### Logging

Structured JSON logging with different levels:

```typescript
// Request logging
logger.info('Processing governance request', {
  requestId: context.awsRequestId,
  userId: auth.userId,
  operation: 'listProposals',
  duration: 123
});

// Error logging with context
logger.error('Database operation failed', {
  error: error.message,
  stack: error.stack,
  userId: auth.userId,
  operation: 'createProposal'
});
```

### Alerts

Recommended CloudWatch alarms:

- API Gateway 4xx/5xx error rates > 5%
- Lambda function duration > 10 seconds
- DynamoDB throttling > 0
- Authentication failure rate > 10%

## 🔒 Security Best Practices

### Implemented Security Measures

1. **Authentication**: Cardano wallet signature verification
2. **Authorization**: Role-based access control with JWT tokens
3. **Input Validation**: Comprehensive request validation
4. **Rate Limiting**: Configurable per-user and per-IP limits
5. **CORS Protection**: Configurable allowed origins
6. **Encryption**: All data encrypted at rest and in transit
7. **Secrets Management**: AWS Secrets Manager for sensitive data
8. **Audit Logging**: Comprehensive logging of all operations

### Security Checklist

- [ ] Configure proper CORS origins for production
- [ ] Set up WAF rules for additional protection
- [ ] Enable AWS CloudTrail for API audit logging
- [ ] Configure VPC endpoints for internal communication
- [ ] Set up proper IAM roles with least privilege
- [ ] Enable GuardDuty for threat detection
- [ ] Configure backup and disaster recovery

## 🚀 Production Deployment

### Multi-Environment Strategy

```bash
# Development
npm run deploy:dev

# Staging  
npm run deploy:staging

# Production
npm run deploy:prod
```

### Performance Optimization

1. **Lambda Configuration**: ARM Graviton2 processors for cost efficiency
2. **DynamoDB**: On-demand billing with auto-scaling
3. **CloudFront**: Global CDN for static assets
4. **Connection Pooling**: Optimized database connections
5. **Caching**: Multi-layer caching strategy

### Scaling Considerations

- **Auto-scaling**: Automatic scaling based on traffic
- **Connection Limits**: Optimized for high concurrency
- **Cost Management**: Reserved capacity for predictable workloads
- **Geographic Distribution**: Multi-region deployment capability

## 🛠️ Development

### Local Development

```bash
# Start local development server
npm run dev

# Run type checking
npm run type-check

# Lint code
npm run lint

# Build for deployment
npm run build
```

### Project Structure

```
backend/
├── src/
│   ├── handlers/          # Lambda function handlers
│   │   ├── auth/         # Authentication endpoints
│   │   ├── proposals/    # Governance proposal endpoints
│   │   ├── dreps/        # DRep management endpoints
│   │   ├── users/        # User management endpoints
│   │   ├── websocket/    # WebSocket handlers
│   │   └── blockchain/   # Blockchain event processing
│   ├── services/         # Core business logic
│   │   ├── database.ts   # DynamoDB operations
│   │   ├── authentication.ts  # Auth service
│   │   └── cardano.ts    # Blockchain integration
│   ├── middleware/       # Lambda middleware
│   │   └── auth.ts      # Authentication middleware
│   ├── types/           # TypeScript type definitions
│   │   └── governance.ts # Core governance types
│   └── utils/           # Utility functions
│       └── logger.ts    # Logging configuration
├── infrastructure/      # AWS CDK infrastructure
│   └── governance-stack.ts
├── tests/              # Test files
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with comprehensive tests
4. Ensure all tests pass and code is properly formatted
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the [GitHub Issues](link) for common problems
2. Review the [API Documentation](link) for endpoint details
3. Contact the development team for urgent issues

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core governance features implementation
- ✅ Wallet-based authentication
- ✅ DRep management system
- ✅ Real-time WebSocket updates

### Phase 2 (Q2 2025)
- 🔄 Constitutional Committee features
- 🔄 Treasury management integration
- 🔄 Advanced analytics and reporting
- 🔄 Mobile application support

### Phase 3 (Q3 2025)
- 📋 Multi-chain governance support
- 📋 Advanced smart contract integration
- 📋 Governance automation features
- 📋 Enterprise SSO integration

---

**Built with ❤️ for the Cardano community**