import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import httpSecurityHeaders from '@middy/http-security-headers';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import {
  WalletConnectRequest,
  WalletConnectResponse,
  WalletConnectRequestSchema,
  AuthenticationError,
  ValidationError,
} from '@/types/governance';
import { AuthenticationService } from '@/services/authentication';
import { logLambdaEvent, logLambdaResponse, logLambdaError, logger } from '@/utils/logger';

interface WalletConnectEvent extends APIGatewayProxyEvent {
  body: WalletConnectRequest;
}

const authService = new AuthenticationService();

/**
 * Lambda handler for wallet authentication
 * POST /api/v1/auth/wallet-connect
 */
const walletAuthHandler: APIGatewayProxyHandler = async (
  event: WalletConnectEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  try {
    logLambdaEvent('wallet-auth', event, context);

    const request: WalletConnectRequest = event.body;

    // Validate required fields
    if (!request.address || !request.publicKey || !request.signature || !request.message || !request.timestamp) {
      throw new ValidationError('Missing required authentication fields');
    }

    // Additional validation
    if (typeof request.timestamp !== 'number' || request.timestamp <= 0) {
      throw new ValidationError('Invalid timestamp format');
    }

    // Check if timestamp is not too old (5 minutes)
    const now = Date.now();
    const timestampAge = now - request.timestamp;
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (timestampAge > maxAge) {
      throw new ValidationError('Authentication request has expired');
    }

    // Authenticate the wallet
    const authResponse: WalletConnectResponse = await authService.authenticateWallet(request);

    const executionTime = Date.now() - startTime;
    logLambdaResponse('wallet-auth', 200, executionTime, context);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: JSON.stringify({
        success: true,
        data: authResponse,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    logLambdaError('wallet-auth', error, event, context);

    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (error instanceof AuthenticationError) {
      statusCode = error.statusCode;
      errorMessage = error.message;
      errorCode = error.code;
    } else if (error instanceof ValidationError) {
      statusCode = error.statusCode;
      errorMessage = error.message;
      errorCode = error.code;
    }

    logLambdaResponse('wallet-auth', statusCode, executionTime, context);

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
export const handler = middy(walletAuthHandler)
  .use(httpJsonBodyParser())
  .use(
    validator({
      eventSchema: transpileSchema({
        type: 'object',
        properties: {
          body: {
            type: 'object',
            properties: {
              address: { type: 'string', minLength: 1 },
              publicKey: { type: 'string', minLength: 1 },
              signature: { type: 'string', minLength: 1 },
              message: { type: 'string', minLength: 1 },
              timestamp: { type: 'number', minimum: 1 },
              nonce: { type: 'string' },
            },
            required: ['address', 'publicKey', 'signature', 'message', 'timestamp'],
            additionalProperties: false,
          },
        },
        required: ['body'],
      }),
    })
  )
  .use(
    httpCors({
      origin: process.env.ALLOWED_ORIGINS || '*',
      credentials: true,
      methods: 'POST, OPTIONS',
      headers: 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
    })
  )
  .use(httpSecurityHeaders())
  .use(httpErrorHandler());