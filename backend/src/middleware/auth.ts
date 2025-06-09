import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MiddyMiddleware } from '@middy/core';
import {
  AuthContext,
  AuthenticationError,
  AuthorizationError,
  UserRole,
} from '@/types/governance';
import { AuthenticationService } from '@/services/authentication';
import { logger } from '@/utils/logger';

interface AuthenticatedEvent extends APIGatewayProxyEvent {
  auth?: AuthContext;
}

const authService = new AuthenticationService();

/**
 * Extract JWT token from Authorization header
 */
function extractToken(event: APIGatewayProxyEvent): string | null {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user context to the event
 */
export const authMiddleware = (options: {
  required?: boolean;
  roles?: UserRole[];
} = {}): MiddyMiddleware<AuthenticatedEvent, APIGatewayProxyResult> => {
  const { required = true, roles } = options;

  return {
    before: async (request) => {
      try {
        const token = extractToken(request.event);

        if (!token) {
          if (required) {
            logger.warn('Missing authentication token', {
              path: request.event.path,
              method: request.event.httpMethod,
            });
            throw new AuthenticationError('Authentication token required');
          }
          return; // Optional authentication, continue without auth context
        }

        // Verify token and create auth context
        const authContext = await authService.createAuthContext(token);
        
        // Attach auth context to event
        request.event.auth = authContext;

        logger.info('User authenticated', {
          userId: authContext.userId,
          roles: authContext.roles,
          path: request.event.path,
        });

        // Check role requirements
        if (roles && roles.length > 0) {
          const hasRequiredRole = authService.validateAnyRole(authContext, roles);
          
          if (!hasRequiredRole) {
            logger.warn('Insufficient permissions', {
              userId: authContext.userId,
              userRoles: authContext.roles,
              requiredRoles: roles,
              path: request.event.path,
            });
            throw new AuthorizationError(`Required roles: ${roles.join(', ')}`);
          }
        }
      } catch (error) {
        logger.error('Authentication middleware error', { error });

        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          // Return error response immediately
          const errorResponse: APIGatewayProxyResult = {
            statusCode: error.statusCode,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
            body: JSON.stringify({
              success: false,
              error: {
                code: error.code,
                message: error.message,
                timestamp: new Date().toISOString(),
              },
            }),
          };

          // Terminate the middleware chain early
          return errorResponse;
        }

        throw error; // Re-throw unexpected errors
      }
    },
  };
};

/**
 * DRep role requirement middleware
 */
export const requireDRepRole = (): MiddyMiddleware<AuthenticatedEvent, APIGatewayProxyResult> => {
  return authMiddleware({ required: true, roles: ['drep'] });
};

/**
 * Proposer role requirement middleware
 */
export const requireProposerRole = (): MiddyMiddleware<AuthenticatedEvent, APIGatewayProxyResult> => {
  return authMiddleware({ required: true, roles: ['proposer'] });
};

/**
 * Admin/Constitutional Council role requirement middleware
 */
export const requireAdminRole = (): MiddyMiddleware<AuthenticatedEvent, APIGatewayProxyResult> => {
  return authMiddleware({ required: true, roles: ['constitutional-council'] });
};

/**
 * Optional authentication middleware
 * Adds auth context if token is present but doesn't require it
 */
export const optionalAuth = (): MiddyMiddleware<AuthenticatedEvent, APIGatewayProxyResult> => {
  return authMiddleware({ required: false });
};

/**
 * Rate limiting middleware based on user
 */
export const rateLimitMiddleware = (options: {
  requestsPerMinute: number;
  keyGenerator?: (event: AuthenticatedEvent) => string;
} = { requestsPerMinute: 60 }): MiddyMiddleware<AuthenticatedEvent, APIGatewayProxyResult> => {
  const { requestsPerMinute, keyGenerator } = options;
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return {
    before: async (request) => {
      const now = Date.now();
      const windowDuration = 60 * 1000; // 1 minute in milliseconds

      // Generate rate limiting key
      let key: string;
      if (keyGenerator) {
        key = keyGenerator(request.event);
      } else if (request.event.auth) {
        key = `user:${request.event.auth.userId}`;
      } else {
        key = `ip:${request.event.requestContext.identity.sourceIp}`;
      }

      // Clean up expired entries
      const expiredKeys = Array.from(requestCounts.entries())
        .filter(([, data]) => now > data.resetTime)
        .map(([k]) => k);
      
      expiredKeys.forEach(k => requestCounts.delete(k));

      // Check rate limit
      const current = requestCounts.get(key);
      
      if (current) {
        if (current.count >= requestsPerMinute) {
          logger.warn('Rate limit exceeded', {
            key,
            count: current.count,
            limit: requestsPerMinute,
            resetTime: new Date(current.resetTime).toISOString(),
          });

          const errorResponse: APIGatewayProxyResult = {
            statusCode: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
              'X-RateLimit-Limit': requestsPerMinute.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': current.resetTime.toString(),
            },
            body: JSON.stringify({
              success: false,
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please try again later.',
                timestamp: new Date().toISOString(),
                retryAfter: Math.ceil((current.resetTime - now) / 1000),
              },
            }),
          };

          return errorResponse;
        }

        current.count++;
      } else {
        requestCounts.set(key, {
          count: 1,
          resetTime: now + windowDuration,
        });
      }

      // Add rate limit headers to response
      const remaining = Math.max(0, requestsPerMinute - (current?.count || 1));
      request.response = request.response || {} as APIGatewayProxyResult;
      request.response.headers = {
        ...request.response.headers,
        'X-RateLimit-Limit': requestsPerMinute.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': (current?.resetTime || (now + windowDuration)).toString(),
      };
    },
  };
};

/**
 * Governance-specific rate limits
 */
export const governanceRateLimit = (): MiddyMiddleware<AuthenticatedEvent, APIGatewayProxyResult> => {
  return rateLimitMiddleware({
    requestsPerMinute: 100, // Higher limit for authenticated governance operations
    keyGenerator: (event) => {
      if (event.auth) {
        // Different limits based on user roles
        if (event.auth.roles.includes('drep')) {
          return `drep:${event.auth.userId}`;
        }
        if (event.auth.roles.includes('proposer')) {
          return `proposer:${event.auth.userId}`;
        }
        return `user:${event.auth.userId}`;
      }
      return `ip:${event.requestContext.identity.sourceIp}`;
    },
  });
};

/**
 * Voting rate limit middleware
 * Stricter limits for voting operations
 */
export const votingRateLimit = (): MiddyMiddleware<AuthenticatedEvent, APIGatewayProxyResult> => {
  return rateLimitMiddleware({
    requestsPerMinute: 10, // Strict limit for voting
    keyGenerator: (event) => `voting:${event.auth?.userId || event.requestContext.identity.sourceIp}`,
  });
};