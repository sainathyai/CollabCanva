// User presence state management with Redis cache
import { logger } from '../utils/logger.js'
import { getRedisClient, RedisKeys, canUseRedis } from '../db/redis.js'

export interface Presence {
  userId: string
  name: string
  x: number
  y: number
  lastUpdate: string
}

// FALLBACK: In-memory storage (only used if Redis is unavailable)
const presences = new Map<string, Presence>()

/**
 * Update user presence (cursor position)
 */
export async function updatePresence(
  userId: string,
  name: string,
  x: number,
  y: number
): Promise<Presence> {
  const presence: Presence = {
    userId,
    name,
    x,
    y,
    lastUpdate: new Date().toISOString()
  }
  
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const key = RedisKeys.presence(userId)
      
      await redis.set(key, JSON.stringify(presence), 'EX', 300) // 5 minutes TTL
      await redis.sadd(RedisKeys.activeUsers(), userId)
      
      logger.debug('Presence updated in Redis', { userId, name })
    } else {
      // Fallback to in-memory
      presences.set(userId, presence)
      logger.debug('Presence updated in memory', { userId, name })
    }
  } catch (error) {
    logger.error('Failed to update presence', { error, userId })
    // Fallback to in-memory on error
    presences.set(userId, presence)
  }
  
  return presence
}

/**
 * Get presence for a specific user
 */
export async function getPresence(userId: string): Promise<Presence | undefined> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const key = RedisKeys.presence(userId)
      const data = await redis.get(key)
      
      if (data) {
        return JSON.parse(data)
      }
    } else {
      // Fallback to in-memory
      return presences.get(userId)
    }
    
    return undefined
  } catch (error) {
    logger.error('Failed to get presence', { error, userId })
    return presences.get(userId)
  }
}

/**
 * Get all active user presences
 */
export async function getAllPresence(): Promise<Presence[]> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      
      // Get all active user IDs
      const userIds = await redis.smembers(RedisKeys.activeUsers())
      
      if (userIds.length === 0) {
        return []
      }
      
      // Fetch all presences in parallel
      const keys = userIds.map(userId => RedisKeys.presence(userId))
      const results = await redis.mget(...keys)
      
      const allPresence: Presence[] = []
      results.forEach((data, index) => {
        if (data) {
          try {
            allPresence.push(JSON.parse(data))
          } catch (err) {
            logger.error('Failed to parse presence from Redis', { 
              error: err, 
              userId: userIds[index] 
            })
          }
        }
      })
      
      return allPresence
    } else {
      // Fallback to in-memory
      return Array.from(presences.values())
    }
  } catch (error) {
    logger.error('Failed to get all presence', { error })
    return Array.from(presences.values())
  }
}

/**
 * Remove user presence (on disconnect)
 */
export async function removePresence(userId: string): Promise<boolean> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const key = RedisKeys.presence(userId)
      
      const result = await redis.del(key)
      await redis.srem(RedisKeys.activeUsers(), userId)
      
      logger.debug('Presence removed from Redis', { userId, deleted: result > 0 })
      return result > 0
    } else {
      // Fallback to in-memory
      const deleted = presences.delete(userId)
      logger.debug('Presence removed from memory', { userId, deleted })
      return deleted
    }
  } catch (error) {
    logger.error('Failed to remove presence', { error, userId })
    return presences.delete(userId)
  }
}

/**
 * Clear all presences (for testing)
 */
export async function clearAllPresence(): Promise<void> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      
      // Get all active user IDs
      const userIds = await redis.smembers(RedisKeys.activeUsers())
      
      // Delete all presence keys
      if (userIds.length > 0) {
        const keys = userIds.map(userId => RedisKeys.presence(userId))
        await redis.del(...keys)
      }
      
      // Clear the active users set
      await redis.del(RedisKeys.activeUsers())
      
      logger.info('All presence cleared from Redis')
    } else {
      // Fallback to in-memory
      presences.clear()
      logger.info('All presence cleared from memory')
    }
  } catch (error) {
    logger.error('Failed to clear all presence', { error })
  }
}

/**
 * Get count of active users
 */
export async function getActiveUserCount(): Promise<number> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      return await redis.scard(RedisKeys.activeUsers())
    } else {
      // Fallback to in-memory
      return presences.size
    }
  } catch (error) {
    logger.error('Failed to get active user count', { error })
    return presences.size
  }
}
