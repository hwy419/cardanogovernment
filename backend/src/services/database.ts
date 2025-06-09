import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommandInput,
  GetCommandInput,
  PutCommandInput,
  UpdateCommandInput,
  DeleteCommandInput,
  BatchGetCommandInput,
  BatchWriteCommandInput,
  ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import {
  BaseEntity,
  UserEntity,
  DRepEntity,
  ProposalEntity,
  VoteEntity,
  DelegationEntity,
  SPOEntity,
  ConstitutionalCouncilEntity,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '@/types/governance';
import { logger } from '@/utils/logger';

export class GovernanceDatabase {
  private client: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    this.client = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        convertEmptyValues: false,
        removeUndefinedValues: true,
        convertClassInstanceToMap: false,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
    
    this.tableName = process.env.GOVERNANCE_TABLE_NAME || 'cardano-governance-data';
  }

  // Generic CRUD Operations
  async put<T extends BaseEntity>(item: T): Promise<T> {
    const now = new Date().toISOString();
    const itemWithTimestamps = {
      ...item,
      CreatedAt: item.CreatedAt || now,
      UpdatedAt: now,
    };

    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: itemWithTimestamps,
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    };

    try {
      await this.client.put(params);
      logger.info('Item created successfully', { PK: item.PK, SK: item.SK, EntityType: item.EntityType });
      return itemWithTimestamps;
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new ConflictError(`Item with PK=${item.PK} and SK=${item.SK} already exists`);
      }
      logger.error('Error creating item', { error, PK: item.PK, SK: item.SK });
      throw error;
    }
  }

  async get<T extends BaseEntity>(PK: string, SK: string): Promise<T | null> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: { PK, SK },
    };

    try {
      const result = await this.client.get(params);
      return result.Item as T || null;
    } catch (error) {
      logger.error('Error getting item', { error, PK, SK });
      throw error;
    }
  }

  async update<T extends BaseEntity>(PK: string, SK: string, updates: Partial<T>): Promise<T> {
    const now = new Date().toISOString();
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build update expression
    Object.entries(updates).forEach(([key, value], index) => {
      if (key !== 'PK' && key !== 'SK' && key !== 'CreatedAt' && value !== undefined) {
        const nameKey = `#attr${index}`;
        const valueKey = `:val${index}`;
        updateExpressions.push(`${nameKey} = ${valueKey}`);
        expressionAttributeNames[nameKey] = key;
        expressionAttributeValues[valueKey] = value;
      }
    });

    // Always update UpdatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'UpdatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: { PK, SK },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
      ReturnValues: 'ALL_NEW',
    };

    try {
      const result = await this.client.update(params);
      logger.info('Item updated successfully', { PK, SK });
      return result.Attributes as T;
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new NotFoundError(`Item with PK=${PK} and SK=${SK}`);
      }
      logger.error('Error updating item', { error, PK, SK });
      throw error;
    }
  }

  async delete(PK: string, SK: string): Promise<void> {
    const params: DeleteCommandInput = {
      TableName: this.tableName,
      Key: { PK, SK },
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
    };

    try {
      await this.client.delete(params);
      logger.info('Item deleted successfully', { PK, SK });
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new NotFoundError(`Item with PK=${PK} and SK=${SK}`);
      }
      logger.error('Error deleting item', { error, PK, SK });
      throw error;
    }
  }

  async query<T extends BaseEntity>(params: Partial<QueryCommandInput>): Promise<{
    items: T[];
    lastEvaluatedKey?: Record<string, any>;
    count: number;
  }> {
    const queryParams: QueryCommandInput = {
      TableName: this.tableName,
      ...params,
    };

    try {
      const result = await this.client.query(queryParams);
      return {
        items: (result.Items || []) as T[],
        lastEvaluatedKey: result.LastEvaluatedKey,
        count: result.Count || 0,
      };
    } catch (error) {
      logger.error('Error querying items', { error, params });
      throw error;
    }
  }

  async batchGet<T extends BaseEntity>(keys: Array<{ PK: string; SK: string }>): Promise<T[]> {
    if (keys.length === 0) return [];
    
    const params: BatchGetCommandInput = {
      RequestItems: {
        [this.tableName]: {
          Keys: keys,
        },
      },
    };

    try {
      const result = await this.client.batchGet(params);
      return result.Responses?.[this.tableName] as T[] || [];
    } catch (error) {
      logger.error('Error batch getting items', { error, keys });
      throw error;
    }
  }

  // User Operations
  async createUser(address: string, userData: UserEntity['Data']): Promise<UserEntity> {
    const user: UserEntity = {
      PK: `USER#${address}`,
      SK: 'PROFILE',
      EntityType: 'USER',
      Data: userData,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    return await this.put(user);
  }

  async getUser(address: string): Promise<UserEntity | null> {
    return await this.get<UserEntity>(`USER#${address}`, 'PROFILE');
  }

  async updateUser(address: string, updates: Partial<UserEntity['Data']>): Promise<UserEntity> {
    return await this.update<UserEntity>(`USER#${address}`, 'PROFILE', { Data: updates });
  }

  // DRep Operations
  async createDRep(drepId: string, drepData: DRepEntity['Data']): Promise<DRepEntity> {
    const drep: DRepEntity = {
      PK: `DREP#${drepId}`,
      SK: 'PROFILE',
      GSI1PK: `STATUS#${drepData.status}`,
      GSI1SK: `PERFORMANCE#${drepData.performance.participationRate.toString().padStart(3, '0')}`,
      GSI2PK: `VOTING_POWER#${drepData.votingPower.toString().padStart(15, '0')}`,
      GSI2SK: `DREP#${drepId}`,
      EntityType: 'DREP',
      Data: drepData,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    return await this.put(drep);
  }

  async getDRep(drepId: string): Promise<DRepEntity | null> {
    return await this.get<DRepEntity>(`DREP#${drepId}`, 'PROFILE');
  }

  async updateDRep(drepId: string, updates: Partial<DRepEntity['Data']>): Promise<DRepEntity> {
    const existing = await this.getDRep(drepId);
    if (!existing) {
      throw new NotFoundError(`DRep ${drepId}`);
    }

    const updatedData = { ...existing.Data, ...updates };
    
    return await this.update<DRepEntity>(`DREP#${drepId}`, 'PROFILE', {
      Data: updatedData,
      GSI1PK: `STATUS#${updatedData.status}`,
      GSI1SK: `PERFORMANCE#${updatedData.performance.participationRate.toString().padStart(3, '0')}`,
      GSI2PK: `VOTING_POWER#${updatedData.votingPower.toString().padStart(15, '0')}`,
    });
  }

  async listDReps(params: {
    status?: string;
    limit?: number;
    cursor?: string;
    sortBy?: 'votingPower' | 'participationRate' | 'registrationDate';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    dreps: DRepEntity[];
    nextCursor?: string;
    count: number;
  }> {
    const { status, limit = 20, cursor, sortBy = 'votingPower', sortOrder = 'desc' } = params;

    let queryParams: Partial<QueryCommandInput>;

    if (status) {
      // Query by status
      queryParams = {
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :status',
        ExpressionAttributeValues: {
          ':status': `STATUS#${status}`,
        },
        ScanIndexForward: sortOrder === 'asc',
        Limit: limit,
      };
    } else if (sortBy === 'votingPower') {
      // Query by voting power (requires scanning)
      queryParams = {
        IndexName: 'GSI2',
        KeyConditionExpression: 'begins_with(GSI2PK, :prefix)',
        ExpressionAttributeValues: {
          ':prefix': 'VOTING_POWER#',
        },
        ScanIndexForward: sortOrder === 'asc',
        Limit: limit,
      };
    } else {
      // General query by entity type
      queryParams = {
        IndexName: 'GSI3',
        KeyConditionExpression: 'EntityType = :entityType',
        ExpressionAttributeValues: {
          ':entityType': 'DREP',
        },
        ScanIndexForward: sortOrder === 'asc',
        Limit: limit,
      };
    }

    if (cursor) {
      queryParams.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    const result = await this.query<DRepEntity>(queryParams);

    return {
      dreps: result.items,
      nextCursor: result.lastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64')
        : undefined,
      count: result.count,
    };
  }

  // Proposal Operations
  async createProposal(proposalId: string, proposalData: ProposalEntity['Data']): Promise<ProposalEntity> {
    const proposal: ProposalEntity = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'METADATA',
      GSI1PK: `STATUS#${proposalData.status}`,
      GSI1SK: `TYPE#${proposalData.type}#${proposalData.submissionDate}`,
      GSI2PK: `PROPOSER#${proposalData.proposerId}`,
      GSI2SK: `DATE#${proposalData.submissionDate}`,
      EntityType: 'PROPOSAL',
      Data: proposalData,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    return await this.put(proposal);
  }

  async getProposal(proposalId: string): Promise<ProposalEntity | null> {
    return await this.get<ProposalEntity>(`PROPOSAL#${proposalId}`, 'METADATA');
  }

  async updateProposal(proposalId: string, updates: Partial<ProposalEntity['Data']>): Promise<ProposalEntity> {
    const existing = await this.getProposal(proposalId);
    if (!existing) {
      throw new NotFoundError(`Proposal ${proposalId}`);
    }

    const updatedData = { ...existing.Data, ...updates };

    return await this.update<ProposalEntity>(`PROPOSAL#${proposalId}`, 'METADATA', {
      Data: updatedData,
      GSI1PK: `STATUS#${updatedData.status}`,
      GSI1SK: `TYPE#${updatedData.type}#${updatedData.submissionDate}`,
    });
  }

  async listProposals(params: {
    status?: string;
    type?: string;
    proposerId?: string;
    limit?: number;
    cursor?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    proposals: ProposalEntity[];
    nextCursor?: string;
    count: number;
  }> {
    const { status, type, proposerId, limit = 20, cursor, sortOrder = 'desc' } = params;

    let queryParams: Partial<QueryCommandInput>;

    if (proposerId) {
      // Query by proposer
      queryParams = {
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :proposer',
        ExpressionAttributeValues: {
          ':proposer': `PROPOSER#${proposerId}`,
        },
        ScanIndexForward: sortOrder === 'asc',
        Limit: limit,
      };
    } else if (status) {
      // Query by status
      queryParams = {
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :status',
        ExpressionAttributeValues: {
          ':status': `STATUS#${status}`,
        },
        ScanIndexForward: sortOrder === 'asc',
        Limit: limit,
      };

      if (type) {
        queryParams.FilterExpression = 'contains(GSI1SK, :type)';
        queryParams.ExpressionAttributeValues = {
          ...queryParams.ExpressionAttributeValues,
          ':type': `TYPE#${type}`,
        };
      }
    } else {
      // General query by entity type
      queryParams = {
        IndexName: 'GSI3',
        KeyConditionExpression: 'EntityType = :entityType',
        ExpressionAttributeValues: {
          ':entityType': 'PROPOSAL',
        },
        ScanIndexForward: sortOrder === 'asc',
        Limit: limit,
      };
    }

    if (cursor) {
      queryParams.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    const result = await this.query<ProposalEntity>(queryParams);

    return {
      proposals: result.items,
      nextCursor: result.lastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64')
        : undefined,
      count: result.count,
    };
  }

  // Vote Operations
  async createVote(proposalId: string, voterId: string, voteData: VoteEntity['Data']): Promise<VoteEntity> {
    const timestamp = new Date().toISOString();
    const vote: VoteEntity = {
      PK: `PROPOSAL#${proposalId}`,
      SK: `VOTE#${voterId}#${timestamp}`,
      GSI1PK: `VOTER#${voterId}`,
      GSI1SK: `DATE#${timestamp}`,
      GSI2PK: `PROPOSAL#${proposalId}`,
      GSI2SK: `VOTING_POWER#${voteData.votingPower.toString().padStart(15, '0')}`,
      EntityType: 'VOTE',
      Data: voteData,
      CreatedAt: timestamp,
      UpdatedAt: timestamp,
    };

    return await this.put(vote);
  }

  async getVote(proposalId: string, voterId: string): Promise<VoteEntity | null> {
    // Query to find existing vote by this voter on this proposal
    const result = await this.query<VoteEntity>({
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `PROPOSAL#${proposalId}`,
        ':sk': `VOTE#${voterId}#`,
      },
      Limit: 1,
    });

    return result.items.length > 0 ? result.items[0] : null;
  }

  async getProposalVotes(proposalId: string, params: {
    limit?: number;
    cursor?: string;
  } = {}): Promise<{
    votes: VoteEntity[];
    nextCursor?: string;
    count: number;
  }> {
    const { limit = 50, cursor } = params;

    const queryParams: Partial<QueryCommandInput> = {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `PROPOSAL#${proposalId}`,
        ':sk': 'VOTE#',
      },
      ScanIndexForward: false, // Latest votes first
      Limit: limit,
    };

    if (cursor) {
      queryParams.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    const result = await this.query<VoteEntity>(queryParams);

    return {
      votes: result.items,
      nextCursor: result.lastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64')
        : undefined,
      count: result.count,
    };
  }

  async getUserVotes(userId: string, params: {
    limit?: number;
    cursor?: string;
  } = {}): Promise<{
    votes: VoteEntity[];
    nextCursor?: string;
    count: number;
  }> {
    const { limit = 20, cursor } = params;

    const queryParams: Partial<QueryCommandInput> = {
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :voter',
      ExpressionAttributeValues: {
        ':voter': `VOTER#${userId}`,
      },
      ScanIndexForward: false, // Latest votes first
      Limit: limit,
    };

    if (cursor) {
      queryParams.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    const result = await this.query<VoteEntity>(queryParams);

    return {
      votes: result.items,
      nextCursor: result.lastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64')
        : undefined,
      count: result.count,
    };
  }

  // Delegation Operations
  async createDelegation(delegationData: DelegationEntity['Data']): Promise<DelegationEntity> {
    const delegationId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const delegation: DelegationEntity = {
      PK: `DELEGATOR#${delegationData.delegatorAddress}`,
      SK: `DELEGATION#${timestamp}`,
      GSI1PK: `DREP#${delegationData.drepId}`,
      GSI1SK: `DELEGATOR#${delegationData.delegatorAddress}`,
      GSI2PK: `STATUS#${delegationData.status}`,
      GSI2SK: `DATE#${timestamp}`,
      EntityType: 'DELEGATION',
      Data: delegationData,
      CreatedAt: timestamp,
      UpdatedAt: timestamp,
    };

    return await this.put(delegation);
  }

  async getUserDelegations(address: string, params: {
    limit?: number;
    cursor?: string;
  } = {}): Promise<{
    delegations: DelegationEntity[];
    nextCursor?: string;
    count: number;
  }> {
    const { limit = 20, cursor } = params;

    const queryParams: Partial<QueryCommandInput> = {
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `DELEGATOR#${address}`,
        ':sk': 'DELEGATION#',
      },
      ScanIndexForward: false, // Latest delegations first
      Limit: limit,
    };

    if (cursor) {
      queryParams.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    const result = await this.query<DelegationEntity>(queryParams);

    return {
      delegations: result.items,
      nextCursor: result.lastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64')
        : undefined,
      count: result.count,
    };
  }

  async getDRepDelegations(drepId: string, params: {
    limit?: number;
    cursor?: string;
  } = {}): Promise<{
    delegations: DelegationEntity[];
    nextCursor?: string;
    count: number;
  }> {
    const { limit = 50, cursor } = params;

    const queryParams: Partial<QueryCommandInput> = {
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :drep',
      ExpressionAttributeValues: {
        ':drep': `DREP#${drepId}`,
      },
      ScanIndexForward: false, // Latest delegations first
      Limit: limit,
    };

    if (cursor) {
      queryParams.ExclusiveStartKey = JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    const result = await this.query<DelegationEntity>(queryParams);

    return {
      delegations: result.items,
      nextCursor: result.lastEvaluatedKey 
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64')
        : undefined,
      count: result.count,
    };
  }

  // Analytics and Statistics
  async getGovernanceStatistics(): Promise<{
    totalProposals: number;
    activeProposals: number;
    totalDReps: number;
    activeDReps: number;
    totalVotes: number;
    totalDelegations: number;
    totalVotingPower: number;
  }> {
    // This would typically be implemented with DynamoDB aggregation
    // For now, we'll use multiple queries to get the statistics
    
    const [proposalsResult, drepsResult] = await Promise.all([
      this.query<ProposalEntity>({
        IndexName: 'GSI3',
        KeyConditionExpression: 'EntityType = :entityType',
        ExpressionAttributeValues: { ':entityType': 'PROPOSAL' },
        Select: 'COUNT',
      }),
      this.query<DRepEntity>({
        IndexName: 'GSI3',
        KeyConditionExpression: 'EntityType = :entityType',
        ExpressionAttributeValues: { ':entityType': 'DREP' },
        Select: 'COUNT',
      }),
    ]);

    // Additional queries would be needed for accurate statistics
    // This is a simplified implementation
    return {
      totalProposals: proposalsResult.count,
      activeProposals: 0, // Would need additional query
      totalDReps: drepsResult.count,
      activeDReps: 0, // Would need additional query
      totalVotes: 0, // Would need additional query
      totalDelegations: 0, // Would need additional query
      totalVotingPower: 0, // Would need additional calculation
    };
  }
}