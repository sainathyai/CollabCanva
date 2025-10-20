import Redis from 'ioredis'
import { logger } from '../utils/logger.js'

/**
 * Redis client for caching canvas state and presence
 * Provides high-speed, shared state across multiple backend instances
 */

let redisClient: Redis | null = null

/**
 * Initialize Redis connection
 */
export async function initializeRedis(url?: string): Promise<Redis> {
  try {
    const redisUrl = url || process.env.REDIS_URL || 'redis://localhost:6379'
    
    logger.info('🔴 Connecting to Redis...', { url: redisUrl.replace(/:[^:]*@/, ':****@') })
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`)
        return delay
      },
      reconnectOnError: (err) => {
        logger.error('Redis reconnect on error', { error: err.message })
        return true
      }
    })

    // Test connection
    await redisClient.ping()
    
    logger.info('✅ Redis connected successfully')
    
    // Handle connection events
    redisClient.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message })
    })
    
    redisClient.on('connect', () => {
      logger.info('🔴 Redis connected')
    })
    
    redisClient.on('ready', () => {
      logger.info('✅ Redis ready')
    })
    
    redisClient.on('close', () => {
      logger.warn('⚠️  Redis connection closed')
    })
    
    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...')
    })
    
    return redisClient
  } catch (error) {
    logger.error('❌ Failed to connect to Redis', { error })
    throw error
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.')
  }
  return redisClient
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisClient !== null && redisClient.status === 'ready'
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    logger.info('🔴 Redis connection closed')
  }
}

/**
 * Redis key helpers for organized key structure
 */
export const RedisKeys = {
  // Canvas objects: canvas:{projectId}:objects:{objectId}
  canvasObject: (projectId: string, objectId: string) => `canvas:${projectId}:objects:${objectId}`,
  
  // All object IDs for a project: canvas:{projectId}:object-ids (SET)
  canvasObjectIds: (projectId: string) => `canvas:${projectId}:object-ids`,
  
  // Presence: presence:{userId}
  presence: (userId: string) => `presence:${userId}`,
  
  // All active user IDs: presence:active-users (SET)
  activeUsers: () => 'presence:active-users',
  
  // Project metadata: project:{projectId}
  project: (projectId: string) => `project:${projectId}`,
  
  // All active project IDs: projects:active (SET)
  activeProjects: () => 'projects:active'
}

/**
 * Graceful fallback - returns false if Redis is not available
 */
export function canUseRedis(): boolean {
  try {
    return isRedisAvailable()
  } catch {
    return false
  }
}

