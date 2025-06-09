import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Table,
  AttributeType,
  BillingMode,
  StreamViewType,
  ProjectionType,
} from 'aws-cdk-lib/aws-dynamodb';
import {
  RestApi,
  LambdaIntegration,
  Cors,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  RequestAuthorizer,
  IdentitySource,
} from 'aws-cdk-lib/aws-apigateway';
import {
  Function as LambdaFunction,
  Runtime,
  Architecture,
  Code,
  LayerVersion,
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  UserPool,
  UserPoolClient,
  AccountRecovery,
  Mfa,
} from 'aws-cdk-lib/aws-cognito';
import {
  Bucket,
  BucketEncryption,
  BlockPublicAccess,
} from 'aws-cdk-lib/aws-s3';
import {
  EventBus,
  Rule,
  EventPattern,
} from 'aws-cdk-lib/aws-events';
import { LambdaFunction as EventTarget } from 'aws-cdk-lib/aws-events-targets';
import {
  WebSocketApi,
  WebSocketStage,
} from 'aws-cdk-lib/aws-apigatewayv2';
import {
  WebSocketLambdaIntegration,
} from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import {
  PolicyStatement,
  Effect,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class GovernanceStack extends Stack {
  public readonly governanceTable: Table;
  public readonly api: RestApi;
  public readonly webSocketApi: WebSocketApi;
  public readonly eventBus: EventBus;
  public readonly userPool: UserPool;
  public readonly proposalsBucket: Bucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB Table with Single-Table Design
    this.governanceTable = new Table(this, 'GovernanceTable', {
      tableName: 'cardano-governance-data',
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Global Secondary Indexes for efficient querying
    this.governanceTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.governanceTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    this.governanceTable.addGlobalSecondaryIndex({
      indexName: 'GSI3',
      partitionKey: { name: 'EntityType', type: AttributeType.STRING },
      sortKey: { name: 'CreatedAt', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    // S3 Bucket for proposal documents and metadata
    this.proposalsBucket = new Bucket(this, 'ProposalsBucket', {
      bucketName: `cardano-governance-proposals-${this.account}-${this.region}`,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // CloudFront Distribution for global content delivery
    const originAccessIdentity = new OriginAccessIdentity(this, 'ProposalsOAI');
    this.proposalsBucket.grantRead(originAccessIdentity);

    const distribution = new Distribution(this, 'ProposalsDistribution', {
      defaultBehavior: {
        origin: new S3Origin(this.proposalsBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    // Cognito User Pool for wallet-based authentication
    this.userPool = new UserPool(this, 'GovernanceUserPool', {
      userPoolName: 'cardano-governance-users',
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      mfa: Mfa.OPTIONAL,
      customAttributes: {
        walletAddress: {
          dataType: 'String',
          required: true,
        },
        publicKey: {
          dataType: 'String',
          required: true,
        },
        roles: {
          dataType: 'String',
          required: false,
        },
      },
    });

    const userPoolClient = new UserPoolClient(this, 'GovernanceUserPoolClient', {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
    });

    // EventBridge for event-driven architecture
    this.eventBus = new EventBus(this, 'GovernanceEventBus', {
      eventBusName: 'cardano-governance-events',
    });

    // Secrets Manager for blockchain credentials
    const blockchainSecrets = new Secret(this, 'BlockchainSecrets', {
      secretName: 'cardano-governance/blockchain',
      description: 'Cardano blockchain connection credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          cardanoNodeEndpoint: '',
          blockfrostProjectId: '',
          dbSyncConnectionString: '',
        }),
        generateStringKey: 'tempKey',
      },
    });

    // Lambda Layers for shared dependencies
    const utilsLayer = new LayerVersion(this, 'UtilsLayer', {
      layerVersionName: 'governance-utils',
      code: Code.fromAsset('src/layers/utils'),
      compatibleRuntimes: [Runtime.NODEJS_22_X],
      description: 'Shared utilities for governance functions',
    });

    const blockchainLayer = new LayerVersion(this, 'BlockchainLayer', {
      layerVersionName: 'governance-blockchain',
      code: Code.fromAsset('src/layers/blockchain'),
      compatibleRuntimes: [Runtime.NODEJS_22_X],
      description: 'Cardano blockchain integration utilities',
    });

    // Lambda Functions
    const commonLambdaProps = {
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(30),
      memorySize: 1024,
      environment: {
        GOVERNANCE_TABLE_NAME: this.governanceTable.tableName,
        PROPOSALS_BUCKET_NAME: this.proposalsBucket.bucketName,
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        EVENT_BUS_NAME: this.eventBus.eventBusName,
        SECRETS_ARN: blockchainSecrets.secretArn,
        CLOUDFRONT_DOMAIN: distribution.distributionDomainName,
        STAGE: props?.stackName?.includes('prod') ? 'prod' : 'dev',
      },
      layers: [utilsLayer, blockchainLayer],
    };

    // Authentication Functions
    const walletAuthFunction = new NodejsFunction(this, 'WalletAuthFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/auth/wallet.ts',
      functionName: 'governance-wallet-auth',
    });

    const refreshTokenFunction = new NodejsFunction(this, 'RefreshTokenFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/auth/refresh.ts',
      functionName: 'governance-refresh-token',
    });

    // Governance Proposal Functions
    const proposalsListFunction = new NodejsFunction(this, 'ProposalsListFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/proposals/list.ts',
      functionName: 'governance-proposals-list',
    });

    const proposalsGetFunction = new NodejsFunction(this, 'ProposalsGetFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/proposals/get.ts',
      functionName: 'governance-proposals-get',
    });

    const proposalsCreateFunction = new NodejsFunction(this, 'ProposalsCreateFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/proposals/create.ts',
      functionName: 'governance-proposals-create',
      timeout: Duration.seconds(60),
    });

    const proposalsVoteFunction = new NodejsFunction(this, 'ProposalsVoteFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/proposals/vote.ts',
      functionName: 'governance-proposals-vote',
      timeout: Duration.seconds(45),
    });

    // DRep Functions
    const drepsListFunction = new NodejsFunction(this, 'DrepsListFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/dreps/list.ts',
      functionName: 'governance-dreps-list',
    });

    const drepsGetFunction = new NodejsFunction(this, 'DrepsGetFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/dreps/get.ts',
      functionName: 'governance-dreps-get',
    });

    const drepsRegisterFunction = new NodejsFunction(this, 'DrepsRegisterFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/dreps/register.ts',
      functionName: 'governance-dreps-register',
      timeout: Duration.seconds(60),
    });

    const drepsDelegateFunction = new NodejsFunction(this, 'DrepsDelegateFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/dreps/delegate.ts',
      functionName: 'governance-dreps-delegate',
      timeout: Duration.seconds(45),
    });

    // User Management Functions
    const usersProfileFunction = new NodejsFunction(this, 'UsersProfileFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/users/profile.ts',
      functionName: 'governance-users-profile',
    });

    const usersHistoryFunction = new NodejsFunction(this, 'UsersHistoryFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/users/history.ts',
      functionName: 'governance-users-history',
    });

    // WebSocket Functions
    const wsConnectFunction = new NodejsFunction(this, 'WSConnectFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/websocket/connect.ts',
      functionName: 'governance-ws-connect',
    });

    const wsDisconnectFunction = new NodejsFunction(this, 'WSDisconnectFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/websocket/disconnect.ts',
      functionName: 'governance-ws-disconnect',
    });

    const wsMessageFunction = new NodejsFunction(this, 'WSMessageFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/websocket/message.ts',
      functionName: 'governance-ws-message',
    });

    // Blockchain Event Processing Functions
    const blockchainSyncFunction = new NodejsFunction(this, 'BlockchainSyncFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/blockchain/sync.ts',
      functionName: 'governance-blockchain-sync',
      timeout: Duration.minutes(5),
      memorySize: 2048,
    });

    const blockchainEventsFunction = new NodejsFunction(this, 'BlockchainEventsFunction', {
      ...commonLambdaProps,
      entry: 'src/handlers/blockchain/events.ts',
      functionName: 'governance-blockchain-events',
      timeout: Duration.minutes(2),
    });

    // Grant permissions
    const functions = [
      walletAuthFunction,
      refreshTokenFunction,
      proposalsListFunction,
      proposalsGetFunction,
      proposalsCreateFunction,
      proposalsVoteFunction,
      drepsListFunction,
      drepsGetFunction,
      drepsRegisterFunction,
      drepsDelegateFunction,
      usersProfileFunction,
      usersHistoryFunction,
      wsConnectFunction,
      wsDisconnectFunction,
      wsMessageFunction,
      blockchainSyncFunction,
      blockchainEventsFunction,
    ];

    functions.forEach(func => {
      this.governanceTable.grantReadWriteData(func);
      this.proposalsBucket.grantReadWrite(func);
      blockchainSecrets.grantRead(func);
      this.eventBus.grantPutEventsTo(func);

      func.addToRolePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'cognito-idp:AdminGetUser',
            'cognito-idp:AdminCreateUser',
            'cognito-idp:AdminUpdateUserAttributes',
            'cognito-idp:AdminInitiateAuth',
          ],
          resources: [this.userPool.userPoolArn],
        })
      );
    });

    // Cognito Authorizer for API Gateway
    const cognitoAuthorizer = new CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [this.userPool],
      identitySource: 'method.request.header.Authorization',
      authorizerName: 'GovernanceCognitoAuthorizer',
    });

    // REST API Gateway
    this.api = new RestApi(this, 'GovernanceAPI', {
      restApiName: 'cardano-governance-api',
      description: 'Cardano Governance Platform REST API',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
    });

    // API Routes
    const apiV1 = this.api.root.addResource('api').addResource('v1');

    // Auth routes
    const auth = apiV1.addResource('auth');
    auth.addResource('wallet-connect').addMethod('POST', new LambdaIntegration(walletAuthFunction));
    auth.addResource('refresh').addMethod('POST', new LambdaIntegration(refreshTokenFunction));

    // Proposals routes
    const proposals = apiV1.addResource('proposals');
    proposals.addMethod('GET', new LambdaIntegration(proposalsListFunction));
    proposals.addMethod('POST', new LambdaIntegration(proposalsCreateFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuthorizer,
    });

    const proposalById = proposals.addResource('{proposalId}');
    proposalById.addMethod('GET', new LambdaIntegration(proposalsGetFunction));
    proposalById.addResource('vote').addMethod('POST', new LambdaIntegration(proposalsVoteFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuthorizer,
    });

    // DReps routes
    const dreps = apiV1.addResource('dreps');
    dreps.addMethod('GET', new LambdaIntegration(drepsListFunction));
    dreps.addResource('register').addMethod('POST', new LambdaIntegration(drepsRegisterFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuthorizer,
    });

    const drepById = dreps.addResource('{drepId}');
    drepById.addMethod('GET', new LambdaIntegration(drepsGetFunction));
    drepById.addResource('delegate').addMethod('POST', new LambdaIntegration(drepsDelegateFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuthorizer,
    });

    // Users routes
    const users = apiV1.addResource('users');
    users.addResource('profile').addMethod('GET', new LambdaIntegration(usersProfileFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuthorizer,
    });
    users.addResource('profile').addMethod('PUT', new LambdaIntegration(usersProfileFunction), {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: cognitoAuthorizer,
    });

    const userByAddress = users.addResource('{address}');
    userByAddress.addResource('history').addMethod('GET', new LambdaIntegration(usersHistoryFunction));

    // WebSocket API
    this.webSocketApi = new WebSocketApi(this, 'GovernanceWebSocketAPI', {
      apiName: 'cardano-governance-websocket',
      description: 'Real-time governance updates WebSocket API',
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration('ConnectIntegration', wsConnectFunction),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration('DisconnectIntegration', wsDisconnectFunction),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration('DefaultIntegration', wsMessageFunction),
      },
    });

    new WebSocketStage(this, 'GovernanceWebSocketStage', {
      webSocketApi: this.webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    // Grant WebSocket permissions
    const wsApiArn = `arn:aws:execute-api:${this.region}:${this.account}:${this.webSocketApi.apiId}/*`;
    [wsConnectFunction, wsDisconnectFunction, wsMessageFunction, blockchainEventsFunction].forEach(func => {
      func.addToRolePolicy(
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['execute-api:ManageConnections'],
          resources: [wsApiArn],
        })
      );
    });

    // EventBridge Rules for blockchain events
    new Rule(this, 'GovernanceActionRule', {
      eventBus: this.eventBus,
      eventPattern: {
        source: ['governance.blockchain'],
        detailType: ['Governance Action Detected'],
      } as EventPattern,
      targets: [new EventTarget(blockchainEventsFunction)],
    });

    new Rule(this, 'VoteCastRule', {
      eventBus: this.eventBus,
      eventPattern: {
        source: ['governance.blockchain'],
        detailType: ['Vote Cast'],
      } as EventPattern,
      targets: [new EventTarget(blockchainEventsFunction)],
    });

    // DynamoDB Stream trigger for real-time updates
    blockchainEventsFunction.addEventSourceMapping('GovernanceTableStream', {
      eventSourceArn: this.governanceTable.tableStreamArn!,
      startingPosition: 'LATEST',
      batchSize: 10,
      parallelizationFactor: 2,
    });

    // SSM Parameters for easy access
    new StringParameter(this, 'APIEndpointParameter', {
      parameterName: '/governance/api-endpoint',
      stringValue: this.api.url,
    });

    new StringParameter(this, 'WebSocketEndpointParameter', {
      parameterName: '/governance/websocket-endpoint',
      stringValue: this.webSocketApi.apiEndpoint,
    });

    new StringParameter(this, 'UserPoolIdParameter', {
      parameterName: '/governance/user-pool-id',
      stringValue: this.userPool.userPoolId,
    });

    new StringParameter(this, 'UserPoolClientIdParameter', {
      parameterName: '/governance/user-pool-client-id',
      stringValue: userPoolClient.userPoolClientId,
    });
  }
}