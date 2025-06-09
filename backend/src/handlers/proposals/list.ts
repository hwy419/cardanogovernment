import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import {
  ProposalListRequest,
  ProposalListResponse,
  ProposalListRequestSchema,
  ValidationError,
  NotFoundError,
} from '@/types/governance';
import { GovernanceDatabase } from '@/services/database';
import { logLambdaEvent, logLambdaResponse, logLambdaError, logger } from '@/utils/logger';

const database = new GovernanceDatabase();

/**
 * Lambda handler for listing governance proposals
 * GET /api/v1/proposals
 */
const proposalsListHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();

  try {
    logLambdaEvent('proposals-list', event, context);

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    const request: ProposalListRequest = {
      status: queryParams.status as any,
      type: queryParams.type,
      category: queryParams.category,
      proposerId: queryParams.proposerId,
      dateFrom: queryParams.dateFrom,
      dateTo: queryParams.dateTo,
      tags: queryParams.tags ? queryParams.tags.split(',') : undefined,
      limit: queryParams.limit ? parseInt(queryParams.limit, 10) : 20,
      cursor: queryParams.cursor,
      sortBy: (queryParams.sortBy as any) || 'date',
      sortOrder: (queryParams.sortOrder as any) || 'desc',
    };

    // Validate query parameters
    if (request.limit && (request.limit < 1 || request.limit > 100)) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    if (request.sortBy && !['date', 'votes', 'deadline', 'status'].includes(request.sortBy)) {
      throw new ValidationError('Invalid sortBy parameter');
    }

    if (request.sortOrder && !['asc', 'desc'].includes(request.sortOrder)) {
      throw new ValidationError('Invalid sortOrder parameter');
    }

    // Query proposals from database
    const result = await database.listProposals({
      status: request.status,
      type: request.type,
      proposerId: request.proposerId,
      limit: request.limit,
      cursor: request.cursor,
      sortOrder: request.sortOrder,
    });

    // Apply additional filtering
    let filteredProposals = result.proposals;

    if (request.category) {
      filteredProposals = filteredProposals.filter(
        proposal => proposal.metadata.category === request.category
      );
    }

    if (request.tags && request.tags.length > 0) {
      filteredProposals = filteredProposals.filter(
        proposal => request.tags!.some(tag => proposal.metadata.tags.includes(tag))
      );
    }

    if (request.dateFrom) {
      const fromDate = new Date(request.dateFrom);
      filteredProposals = filteredProposals.filter(
        proposal => new Date(proposal.submissionDate) >= fromDate
      );
    }

    if (request.dateTo) {
      const toDate = new Date(request.dateTo);
      filteredProposals = filteredProposals.filter(
        proposal => new Date(proposal.submissionDate) <= toDate
      );
    }

    // Calculate statistics for filters
    const allProposals = await database.listProposals({ limit: 1000 }); // Get more for stats
    const availableTypes = [...new Set(allProposals.proposals.map(p => p.type))];
    const availableCategories = [...new Set(allProposals.proposals.map(p => p.metadata.category))];
    const availableStatuses = [...new Set(allProposals.proposals.map(p => p.status))];
    
    const dates = allProposals.proposals.map(p => p.submissionDate).sort();
    const dateRange = {
      earliest: dates[0] || new Date().toISOString(),
      latest: dates[dates.length - 1] || new Date().toISOString(),
    };

    // Build response
    const response: ProposalListResponse = {
      proposals: filteredProposals.map(proposal => proposal),
      nextCursor: result.nextCursor,
      totalCount: filteredProposals.length,
      hasMore: !!result.nextCursor,
      filters: {
        availableTypes,
        availableCategories,
        availableStatuses: availableStatuses as any,
        dateRange,
      },
    };

    const executionTime = Date.now() - startTime;
    logLambdaResponse('proposals-list', 200, executionTime, context);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'X-Total-Count': response.totalCount.toString(),
        'X-Has-More': response.hasMore.toString(),
      },
      body: JSON.stringify({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    logLambdaError('proposals-list', error, event, context);

    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (error instanceof ValidationError) {
      statusCode = error.statusCode;
      errorMessage = error.message;
      errorCode = error.code;
    } else if (error instanceof NotFoundError) {
      statusCode = error.statusCode;
      errorMessage = error.message;
      errorCode = error.code;
    }

    logLambdaResponse('proposals-list', statusCode, executionTime, context);

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          timestamp: new Date().toISOString(),
        },
      }),
    };
  }
};

// Apply middleware
export const handler = middy(proposalsListHandler)
  .use(
    httpCors({
      origin: process.env.ALLOWED_ORIGINS || '*',
      credentials: true,
      methods: 'GET, OPTIONS',
      headers: 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
    })
  )
  .use(httpSecurityHeaders())
  .use(httpErrorHandler());