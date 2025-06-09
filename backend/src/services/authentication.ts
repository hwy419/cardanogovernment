import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import {
  WalletConnectRequest,
  WalletConnectResponse,
  AuthContext,
  UserEntity,
  AuthenticationError,
  ValidationError,
  UserRole,
} from '@/types/governance';
import { GovernanceDatabase } from './database';
import { CardanoService } from './cardano';
import { logger } from '@/utils/logger';

interface JWTPayload {
  sub: string;
  address: string;
  publicKey: string;
  roles: UserRole[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export class AuthenticationService {
  private cognitoClient: CognitoIdentityProviderClient;
  private secretsClient: SecretsManagerClient;
  private database: GovernanceDatabase;
  private cardanoService: CardanoService;
  private userPoolId: string;
  private userPoolClientId: string;
  private jwtSecret?: string;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    this.secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    
    this.database = new GovernanceDatabase();
    this.cardanoService = new CardanoService();
    
    this.userPoolId = process.env.USER_POOL_ID!;
    this.userPoolClientId = process.env.USER_POOL_CLIENT_ID!;
    
    if (!this.userPoolId || !this.userPoolClientId) {
      throw new Error('Missing required Cognito configuration');
    }
  }

  /**
   * Get JWT secret from AWS Secrets Manager
   */
  private async getJWTSecret(): Promise<string> {
    if (this.jwtSecret) {
      return this.jwtSecret;
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: process.env.JWT_SECRET_ARN || 'governance/jwt-secret',
      });
      
      const response = await this.secretsClient.send(command);
      const secret = JSON.parse(response.SecretString || '{}');
      
      this.jwtSecret = secret.jwtSecret || secret.JWT_SECRET;
      
      if (!this.jwtSecret) {
        throw new Error('JWT secret not found in secrets manager');
      }
      
      return this.jwtSecret;
    } catch (error) {
      logger.error('Failed to retrieve JWT secret', error);
      throw new AuthenticationError('Authentication service configuration error');
    }
  }

  /**
   * Verify Cardano wallet signature
   */
  private async verifyWalletSignature(request: WalletConnectRequest): Promise<boolean> {
    try {
      // Verify timestamp is within acceptable range (5 minutes)
      const now = Date.now();
      const timestampDiff = Math.abs(now - request.timestamp);
      const maxTimestampDiff = 5 * 60 * 1000; // 5 minutes in milliseconds

      if (timestampDiff > maxTimestampDiff) {
        logger.warn('Wallet signature timestamp too old', { 
          timestamp: request.timestamp, 
          now, 
          diff: timestampDiff 
        });
        return false;
      }

      // Use Cardano service to verify the signature
      const isValid = await this.cardanoService.verifySignature({
        address: request.address,
        publicKey: request.publicKey,
        signature: request.signature,
        message: request.message,
      });

      logger.info('Wallet signature verification result', { 
        address: request.address,
        isValid 
      });

      return isValid;
    } catch (error) {
      logger.error('Error verifying wallet signature', { error, address: request.address });
      return false;
    }
  }

  /**
   * Generate JWT token
   */
  private async generateJWT(user: UserEntity): Promise<{ token: string; refreshToken: string; expiresIn: number }> {
    const secret = await this.getJWTSecret();
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour
    const refreshExpiresIn = 86400 * 7; // 7 days

    const payload: JWTPayload = {
      sub: user.Data.address,
      address: user.Data.address,
      publicKey: user.Data.publicKey,
      roles: user.Data.roles,
      iat: now,
      exp: now + expiresIn,
      iss: 'cardano-governance',
      aud: 'governance-platform',
    };

    const refreshPayload = {
      sub: user.Data.address,
      type: 'refresh',
      iat: now,
      exp: now + refreshExpiresIn,
      iss: 'cardano-governance',
      aud: 'governance-platform',
    };

    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
    const refreshToken = jwt.sign(refreshPayload, secret, { algorithm: 'HS256' });

    return { token, refreshToken, expiresIn };
  }

  /**
   * Verify JWT token
   */
  async verifyJWT(token: string): Promise<JWTPayload> {
    try {
      const secret = await this.getJWTSecret();
      const payload = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: 'cardano-governance',
        audience: 'governance-platform',
      }) as JWTPayload;

      // Additional validation
      if (!payload.sub || !payload.address) {
        throw new AuthenticationError('Invalid token payload');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token expired');
      }
      logger.error('JWT verification error', error);
      throw new AuthenticationError('Token verification failed');
    }
  }

  /**
   * Create or update user in Cognito
   */
  private async upsertCognitoUser(address: string, publicKey: string, roles: UserRole[]): Promise<string> {
    try {
      // Try to get existing user
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: address,
      });

      try {
        const existingUser = await this.cognitoClient.send(getUserCommand);
        
        // Update user attributes
        const updateCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: this.userPoolId,
          Username: address,
          UserAttributes: [
            { Name: 'custom:publicKey', Value: publicKey },
            { Name: 'custom:roles', Value: JSON.stringify(roles) },
            { Name: 'custom:lastLogin', Value: new Date().toISOString() },
          ],
        });

        await this.cognitoClient.send(updateCommand);
        logger.info('Updated existing Cognito user', { address });
        
        return address;
      } catch (error: any) {
        if (error.name !== 'UserNotFoundException') {
          throw error;
        }
      }

      // Create new user
      const createCommand = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: address,
        UserAttributes: [
          { Name: 'custom:walletAddress', Value: address },
          { Name: 'custom:publicKey', Value: publicKey },
          { Name: 'custom:roles', Value: JSON.stringify(roles) },
        ],
        MessageAction: 'SUPPRESS', // Don't send welcome email
        TemporaryPassword: this.generateRandomPassword(),
      });

      await this.cognitoClient.send(createCommand);

      // Set permanent password
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: address,
        Password: this.generateRandomPassword(),
        Permanent: true,
      });

      await this.cognitoClient.send(setPasswordCommand);
      
      logger.info('Created new Cognito user', { address });
      return address;
    } catch (error) {
      logger.error('Error upserting Cognito user', { error, address });
      throw new AuthenticationError('Failed to create/update user account');
    }
  }

  /**
   * Generate random password for Cognito
   */
  private generateRandomPassword(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Main wallet connection authentication flow
   */
  async authenticateWallet(request: WalletConnectRequest): Promise<WalletConnectResponse> {
    logger.info('Starting wallet authentication', { address: request.address });

    try {
      // Verify wallet signature
      const isValidSignature = await this.verifyWalletSignature(request);
      if (!isValidSignature) {
        throw new AuthenticationError('Invalid wallet signature');
      }

      // Get or create user in database
      let user = await this.database.getUser(request.address);
      
      if (!user) {
        // Create new user
        const userData: UserEntity['Data'] = {
          address: request.address,
          publicKey: request.publicKey,
          roles: ['participant'], // Default role
          profile: {
            name: '',
            bio: '',
            avatar: '',
            website: '',
            social: {},
          },
          isActive: true,
          totalStake: 0,
          lastActiveAt: new Date().toISOString(),
          preferences: {
            notifications: {
              email: false,
              push: false,
              proposalUpdates: true,
              votingReminders: true,
            },
            privacy: {
              showVotingHistory: true,
              showDelegations: true,
            },
          },
        };

        user = await this.database.createUser(request.address, userData);
        logger.info('Created new user in database', { address: request.address });
      } else {
        // Update last active time and public key if changed
        const updates: Partial<UserEntity['Data']> = {
          lastActiveAt: new Date().toISOString(),
        };

        if (user.Data.publicKey !== request.publicKey) {
          updates.publicKey = request.publicKey;
        }

        user = await this.database.updateUser(request.address, updates);
        logger.info('Updated existing user', { address: request.address });
      }

      // Create/update Cognito user
      await this.upsertCognitoUser(request.address, request.publicKey, user.Data.roles);

      // Generate JWT tokens
      const { token, refreshToken, expiresIn } = await this.generateJWT(user);

      const response: WalletConnectResponse = {
        token,
        refreshToken,
        user: user.Data,
        expiresIn,
        tokenType: 'Bearer',
      };

      logger.info('Wallet authentication successful', { 
        address: request.address,
        roles: user.Data.roles 
      });

      return response;
    } catch (error) {
      logger.error('Wallet authentication failed', { error, address: request.address });
      
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      throw new AuthenticationError('Authentication failed');
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    try {
      const secret = await this.getJWTSecret();
      const payload = jwt.verify(refreshToken, secret, {
        algorithms: ['HS256'],
        issuer: 'cardano-governance',
        audience: 'governance-platform',
      }) as any;

      if (payload.type !== 'refresh') {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Get user from database
      const user = await this.database.getUser(payload.sub);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Generate new access token
      const { token, expiresIn } = await this.generateJWT(user);

      logger.info('Token refreshed successfully', { address: payload.sub });

      return { token, expiresIn };
    } catch (error) {
      logger.error('Token refresh failed', { error });
      
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      
      throw new AuthenticationError('Token refresh failed');
    }
  }

  /**
   * Create auth context from JWT token
   */
  async createAuthContext(token: string): Promise<AuthContext> {
    const payload = await this.verifyJWT(token);
    
    return {
      userId: payload.address,
      walletAddress: payload.address,
      roles: payload.roles,
      isAuthenticated: true,
      cognitoUsername: payload.address,
    };
  }

  /**
   * Validate user has required role
   */
  validateRole(authContext: AuthContext, requiredRole: UserRole): boolean {
    return authContext.roles.includes(requiredRole);
  }

  /**
   * Validate user has any of the required roles
   */
  validateAnyRole(authContext: AuthContext, requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(role => authContext.roles.includes(role));
  }

  /**
   * Add role to user
   */
  async addUserRole(address: string, role: UserRole): Promise<void> {
    const user = await this.database.getUser(address);
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (!user.Data.roles.includes(role)) {
      const updatedRoles = [...user.Data.roles, role];
      await this.database.updateUser(address, { roles: updatedRoles });
      
      // Update Cognito user attributes
      await this.upsertCognitoUser(address, user.Data.publicKey, updatedRoles);
      
      logger.info('Added role to user', { address, role, roles: updatedRoles });
    }
  }

  /**
   * Remove role from user
   */
  async removeUserRole(address: string, role: UserRole): Promise<void> {
    const user = await this.database.getUser(address);
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (user.Data.roles.includes(role)) {
      const updatedRoles = user.Data.roles.filter(r => r !== role);
      
      // Ensure user always has at least 'participant' role
      if (updatedRoles.length === 0) {
        updatedRoles.push('participant');
      }
      
      await this.database.updateUser(address, { roles: updatedRoles });
      
      // Update Cognito user attributes
      await this.upsertCognitoUser(address, user.Data.publicKey, updatedRoles);
      
      logger.info('Removed role from user', { address, role, roles: updatedRoles });
    }
  }
}