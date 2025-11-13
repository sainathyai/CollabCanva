import { config } from 'dotenv'

// Load environment variables
config()

export interface EnvConfig {
  PORT: number
  ALLOWED_ORIGINS: string[]
  FIREBASE_PROJECT_ID?: string
  NODE_ENV: 'development' | 'production' | 'test'
  // Redis Configuration
  REDIS_URL?: string
  // AWS Configuration
  AWS_REGION: string
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  // DynamoDB Table Names
  DYNAMODB_PROJECTS_TABLE: string
  DYNAMODB_OBJECTS_TABLE: string
  DYNAMODB_COLLABORATORS_TABLE: string
  DYNAMODB_USERS_TABLE: string
  // OpenAI Configuration
  OPENAI_API_KEY?: string
}

function parseEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '8080', 10)

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173']

  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID

  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV']

  // Redis Configuration
  const redisUrl = process.env.REDIS_URL

  // AWS Configuration
  const awsRegion = process.env.AWS_REGION || 'us-east-1'
  const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
  const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  // DynamoDB Table Names
  const dynamodbProjectsTable = process.env.DYNAMODB_PROJECTS_TABLE || 'collabcanvas-projects'
  const dynamodbObjectsTable = process.env.DYNAMODB_OBJECTS_TABLE || 'collabcanvas-objects'
  const dynamodbCollaboratorsTable = process.env.DYNAMODB_COLLABORATORS_TABLE || 'collabcanvas-collaborators'
  const dynamodbUsersTable = process.env.DYNAMODB_USERS_TABLE || 'collabcanvas-users'

  // OpenAI Configuration
  // Handle both plain string and JSON object formats from Secrets Manager
  let openaiApiKey = process.env.OPENAI_API_KEY
  if (openaiApiKey) {
    try {
      // Try to parse as JSON (in case secret is stored as JSON object)
      const parsed = JSON.parse(openaiApiKey)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        // Extract apiKey, api_key1, or api_key2 (in that order of preference)
        const extractedKey = parsed.apiKey || parsed.api_key1 || parsed.api_key2
        if (extractedKey && typeof extractedKey === 'string') {
          openaiApiKey = extractedKey
        }
      }
    } catch (e) {
      // Not JSON, use as-is (plain string)
      // This is expected if the secret is stored as a plain string
    }
  }

  return {
    PORT: port,
    ALLOWED_ORIGINS: allowedOrigins,
    FIREBASE_PROJECT_ID: firebaseProjectId,
    NODE_ENV: nodeEnv,
    REDIS_URL: redisUrl,
    AWS_REGION: awsRegion,
    AWS_ACCESS_KEY_ID: awsAccessKeyId,
    AWS_SECRET_ACCESS_KEY: awsSecretAccessKey,
    DYNAMODB_PROJECTS_TABLE: dynamodbProjectsTable,
    DYNAMODB_OBJECTS_TABLE: dynamodbObjectsTable,
    DYNAMODB_COLLABORATORS_TABLE: dynamodbCollaboratorsTable,
    DYNAMODB_USERS_TABLE: dynamodbUsersTable,
    OPENAI_API_KEY: openaiApiKey
  }
}

export const env = parseEnv()

