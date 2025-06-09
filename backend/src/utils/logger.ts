import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Define log transports based on environment
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

// Add CloudWatch transport for production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: '/tmp/governance-error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: '/tmp/governance-combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export specific log functions for convenience
export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: any, meta?: any) => {
  logger.error(message, { error: error?.stack || error, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Lambda-specific logging helper
export const logLambdaEvent = (functionName: string, event: any, context?: any) => {
  logger.info(`Lambda function started: ${functionName}`, {
    requestId: context?.awsRequestId,
    functionName,
    functionVersion: context?.functionVersion,
    memoryLimitInMB: context?.memoryLimitInMB,
    remainingTimeInMillis: context?.getRemainingTimeInMillis?.(),
    eventType: event?.httpMethod || event?.Records?.[0]?.eventName || 'unknown',
  });
};

export const logLambdaResponse = (
  functionName: string,
  statusCode: number,
  executionTime: number,
  context?: any
) => {
  logger.info(`Lambda function completed: ${functionName}`, {
    requestId: context?.awsRequestId,
    functionName,
    statusCode,
    executionTime,
    remainingTimeInMillis: context?.getRemainingTimeInMillis?.(),
  });
};

export const logLambdaError = (
  functionName: string,
  error: any,
  event?: any,
  context?: any
) => {
  logger.error(`Lambda function error: ${functionName}`, {
    requestId: context?.awsRequestId,
    functionName,
    error: error?.stack || error,
    event: event ? JSON.stringify(event, null, 2) : undefined,
  });
};