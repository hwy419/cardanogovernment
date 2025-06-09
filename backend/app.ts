#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GovernanceStack } from './infrastructure/governance-stack';

const app = new cdk.App();

// Development environment
new GovernanceStack(app, 'CardanoGovernanceDev', {
  stackName: 'cardano-governance-dev',
  description: 'Cardano Governance Platform - Development Environment',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  tags: {
    Environment: 'development',
    Project: 'cardano-governance',
    Owner: 'governance-team',
    CostCenter: 'development',
  },
});

// Production environment
new GovernanceStack(app, 'CardanoGovernanceProd', {
  stackName: 'cardano-governance-prod',
  description: 'Cardano Governance Platform - Production Environment',
  env: {
    account: process.env.CDK_PROD_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_PROD_REGION || 'us-east-1',
  },
  tags: {
    Environment: 'production',
    Project: 'cardano-governance',
    Owner: 'governance-team',
    CostCenter: 'production',
  },
});

// Staging environment (optional)
if (process.env.DEPLOY_STAGING === 'true') {
  new GovernanceStack(app, 'CardanoGovernanceStaging', {
    stackName: 'cardano-governance-staging',
    description: 'Cardano Governance Platform - Staging Environment',
    env: {
      account: process.env.CDK_STAGING_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_STAGING_REGION || 'us-east-1',
    },
    tags: {
      Environment: 'staging',
      Project: 'cardano-governance',
      Owner: 'governance-team',
      CostCenter: 'staging',
    },
  });
}