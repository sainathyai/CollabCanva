/**
 * DynamoDB Client Configuration
 *
 * Initializes and configures the AWS DynamoDB client for the application.
 * Provides connection health check and error handling utilities.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { env } from '../env.js'
import { logger } from '../utils/logger.js'

/**
 * Initialize the base DynamoDB client
 */
const client = new DynamoDBClient({
  region: env.AWS_REGION,
  // If AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are not set,
  // the SDK will automatically use AWS CLI credentials or IAM role
  ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && {
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
  })
})

/**
 * Document client wrapper for easier data handling
 * Automatically marshals/unmarshals data to/from DynamoDB format
 */
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    // Convert empty strings to null
    convertEmptyValues: false,
    // Remove undefined values
    removeUndefinedValues: true,
    // Convert class instances to maps
    convertClassInstanceToMap: false
  },
  unmarshallOptions: {
    // Return numbers as JavaScript numbers (not strings)
    wrapNumbers: false
  }
})

/**
 * Health check function to verify DynamoDB connection
 *
 * @returns Promise that resolves to true if connection is healthy, false otherwise
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Try to list tables to verify connection
    const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb')
    await client.send(new ListTablesCommand({ Limit: 1 }))

    logger.info('DynamoDB connection healthy')
    return true
  } catch (error) {
    logger.error('DynamoDB connection failed:', error)
    return false
  }
}

/**
 * Initialize database connection and verify health
 * Called on server startup
 */
export async function initializeDatabase(): Promise<void> {
  logger.info('Initializing DynamoDB connection...')
  logger.info(`Region: ${env.AWS_REGION}`)
  logger.info(`Tables: ${env.DYNAMODB_PROJECTS_TABLE}, ${env.DYNAMODB_OBJECTS_TABLE}, ${env.DYNAMODB_COLLABORATORS_TABLE}, ${env.DYNAMODB_USERS_TABLE}`)

  const isHealthy = await checkDatabaseHealth()

  if (!isHealthy) {
    logger.warn('⚠️  DynamoDB connection failed - running in memory-only mode')
    logger.warn('Check AWS credentials and region configuration')
  } else {
    logger.info('✅ DynamoDB connected successfully')
  }
}

/**
 * Error handler for DynamoDB operations
 * Logs errors without throwing to prevent service disruption
 */
export function handleDatabaseError(operation: string, error: unknown): void {
  logger.error(`DynamoDB ${operation} failed:`, error)

  // Log specific error types
  if (error instanceof Error) {
    if (error.name === 'ResourceNotFoundException') {
      logger.error('Table not found - verify table names in configuration')
    } else if (error.name === 'ProvisionedThroughputExceededException') {
      logger.error('DynamoDB throughput exceeded - consider increasing capacity')
    } else if (error.name === 'ValidationException') {
      logger.error('Invalid request to DynamoDB - check data format')
    }
  }
}

export default docClient

