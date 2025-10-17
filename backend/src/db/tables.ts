/**
 * DynamoDB Table Name Constants
 *
 * Centralizes all table names for easy reference and maintenance.
 * Table names are read from environment variables with fallback defaults.
 */

import { env } from '../env.js'

export const TABLES = {
  PROJECTS: env.DYNAMODB_PROJECTS_TABLE,
  OBJECTS: env.DYNAMODB_OBJECTS_TABLE,
  COLLABORATORS: env.DYNAMODB_COLLABORATORS_TABLE,
  USERS: env.DYNAMODB_USERS_TABLE
} as const

export type TableName = typeof TABLES[keyof typeof TABLES]

