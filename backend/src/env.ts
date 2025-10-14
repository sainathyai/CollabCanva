import { config } from 'dotenv'

// Load environment variables
config()

export interface EnvConfig {
  PORT: number
  ALLOWED_ORIGINS: string[]
  FIREBASE_PROJECT_ID?: string
  NODE_ENV: 'development' | 'production' | 'test'
}

function parseEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '8080', 10)
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173']
  
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID
  
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV']

  return {
    PORT: port,
    ALLOWED_ORIGINS: allowedOrigins,
    FIREBASE_PROJECT_ID: firebaseProjectId,
    NODE_ENV: nodeEnv
  }
}

export const env = parseEnv()

