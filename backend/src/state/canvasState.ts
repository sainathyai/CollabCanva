// Canvas state management with Redis cache for multi-instance scalability
import { logger } from '../utils/logger.js'
import type { CanvasObject } from '../ws/messageTypes.js'
import * as objectService from '../services/objectService.js'
import { markDirty } from './dirtyFlags.js'
import { getRedisClient, RedisKeys, canUseRedis } from '../db/redis.js'

export type { CanvasObject }

// Default project ID for legacy support
export const DEFAULT_PROJECT_ID = 'default-project'

// FALLBACK: In-memory cache (only used if Redis is unavailable)
const projectCanvases = new Map<string, Map<string, CanvasObject>>()

/**
 * Get Redis client or fallback to in-memory
 */
function getProjectCanvas(projectId: string): Map<string, CanvasObject> {
  if (!projectCanvases.has(projectId)) {
    projectCanvases.set(projectId, new Map<string, CanvasObject>())
  }
  return projectCanvases.get(projectId)!
}

/**
 * Create a new canvas object
 * Saves to Redis (or memory fallback) immediately
 */
export async function createObject(projectId: string, object: CanvasObject): Promise<CanvasObject> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const key = RedisKeys.canvasObject(projectId, object.id)
      const setKey = RedisKeys.canvasObjectIds(projectId)
      
      // Store object in Redis
      await redis.set(key, JSON.stringify(object), 'EX', 3600) // 1 hour TTL
      await redis.sadd(setKey, object.id)
      await redis.sadd(RedisKeys.activeProjects(), projectId)
      
      logger.info('🟢 Object created in Redis', { id: object.id, projectId })
    } else {
      // Fallback to in-memory
      const canvas = getProjectCanvas(projectId)
      canvas.set(object.id, object)
      logger.info('🟡 Object created in memory (Redis unavailable)', { id: object.id, projectId })
    }
    
    // Mark project as dirty for database persistence
    markDirty(projectId)
    
    return object
  } catch (error) {
    logger.error('Failed to create object', { error, id: object.id, projectId })
    // Fallback to in-memory on error
    const canvas = getProjectCanvas(projectId)
    canvas.set(object.id, object)
    return object
  }
}

/**
 * Update an existing canvas object
 */
export async function updateObject(projectId: string, object: Partial<CanvasObject> & { id: string }): Promise<CanvasObject> {
  try {
    let existing: CanvasObject | undefined
    
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const key = RedisKeys.canvasObject(projectId, object.id)
      const existingStr = await redis.get(key)
      
      if (existingStr) {
        existing = JSON.parse(existingStr)
      }
    } else {
      // Fallback to in-memory
      const canvas = getProjectCanvas(projectId)
      existing = canvas.get(object.id)
    }
    
    // Create new object if doesn't exist
    if (!existing) {
      logger.warn('Object not found for update, creating new', { id: object.id, projectId })
      const newObject: CanvasObject = {
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        color: '#000000',
        zIndex: 0,
        createdBy: 'unknown',
        createdAt: new Date().toISOString(),
        ...object,
        updatedAt: new Date().toISOString(),
      } as CanvasObject
      return await createObject(projectId, newObject)
    }
    
    // Merge update
    const updated: CanvasObject = {
      ...existing,
      ...object,
      updatedAt: new Date().toISOString(),
    }
    
    // Save to Redis or memory
    if (canUseRedis()) {
      const redis = getRedisClient()
      const key = RedisKeys.canvasObject(projectId, object.id)
      await redis.set(key, JSON.stringify(updated), 'EX', 3600)
      logger.debug('Object updated in Redis', { id: object.id, projectId })
    } else {
      const canvas = getProjectCanvas(projectId)
      canvas.set(object.id, updated)
      logger.debug('Object updated in memory', { id: object.id, projectId })
    }
    
    markDirty(projectId)
    return updated
  } catch (error) {
    logger.error('Failed to update object', { error, id: object.id, projectId })
    throw error
  }
}

/**
 * Delete a canvas object
 */
export async function deleteObject(projectId: string, id: string): Promise<boolean> {
  try {
    let deleted = false
    
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const key = RedisKeys.canvasObject(projectId, id)
      const setKey = RedisKeys.canvasObjectIds(projectId)
      
      const result = await redis.del(key)
      await redis.srem(setKey, id)
      deleted = result > 0
      
      logger.debug('Object deleted from Redis', { id, projectId, deleted })
    } else {
      // Fallback to in-memory
      const canvas = getProjectCanvas(projectId)
      deleted = canvas.delete(id)
      logger.debug('Object deleted from memory', { id, projectId, deleted })
    }
    
    // Delete from database asynchronously
    if (deleted) {
      objectService.deleteObject(projectId, id).catch(err => {
        logger.error('Failed to delete object from database', { id, projectId, error: err })
      })
    }
    
    return deleted
  } catch (error) {
    logger.error('Failed to delete object', { error, id, projectId })
    return false
  }
}

/**
 * Get a single object by ID
 */
export async function getObject(projectId: string, id: string): Promise<CanvasObject | undefined> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const key = RedisKeys.canvasObject(projectId, id)
      const data = await redis.get(key)
      
      if (data) {
        return JSON.parse(data)
      }
    } else {
      // Fallback to in-memory
      const canvas = getProjectCanvas(projectId)
      return canvas.get(id)
    }
    
    return undefined
  } catch (error) {
    logger.error('Failed to get object', { error, id, projectId })
    return undefined
  }
}

/**
 * Get all canvas objects for a specific project
 */
export async function getAllObjects(projectId: string): Promise<CanvasObject[]> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const setKey = RedisKeys.canvasObjectIds(projectId)
      
      // Get all object IDs for this project
      const objectIds = await redis.smembers(setKey)
      
      if (objectIds.length === 0) {
        logger.info('📦 No objects in Redis for project', { projectId })
        return []
      }
      
      // Fetch all objects in parallel
      const keys = objectIds.map(id => RedisKeys.canvasObject(projectId, id))
      const results = await redis.mget(...keys)
      
      const objects: CanvasObject[] = []
      results.forEach((data, index) => {
        if (data) {
          try {
            objects.push(JSON.parse(data))
          } catch (err) {
            logger.error('Failed to parse object from Redis', { 
              error: err, 
              objectId: objectIds[index],
              projectId 
            })
          }
        }
      })
      
      logger.info('📦 getAllObjects from Redis', { projectId, count: objects.length })
      return objects
    } else {
      // Fallback to in-memory
      const canvas = getProjectCanvas(projectId)
      const objects = Array.from(canvas.values())
      logger.info('📦 getAllObjects from memory', { projectId, count: objects.length })
      return objects
    }
  } catch (error) {
    logger.error('Failed to get all objects', { error, projectId })
    // Fallback to in-memory on error
    const canvas = getProjectCanvas(projectId)
    return Array.from(canvas.values())
  }
}

/**
 * Clear all objects for a specific project
 */
export async function clearAllObjects(projectId: string): Promise<void> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const setKey = RedisKeys.canvasObjectIds(projectId)
      
      // Get all object IDs
      const objectIds = await redis.smembers(setKey)
      
      // Delete all object keys
      if (objectIds.length > 0) {
        const keys = objectIds.map(id => RedisKeys.canvasObject(projectId, id))
        await redis.del(...keys)
      }
      
      // Clear the set
      await redis.del(setKey)
      await redis.srem(RedisKeys.activeProjects(), projectId)
      
      logger.info('All objects cleared from Redis', { projectId })
    } else {
      // Fallback to in-memory
      const canvas = getProjectCanvas(projectId)
      canvas.clear()
      logger.info('All objects cleared from memory', { projectId })
    }
  } catch (error) {
    logger.error('Failed to clear objects', { error, projectId })
  }
}

/**
 * Get object count for a specific project
 */
export async function getObjectCount(projectId: string): Promise<number> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const setKey = RedisKeys.canvasObjectIds(projectId)
      return await redis.scard(setKey)
    } else {
      // Fallback to in-memory
      const canvas = getProjectCanvas(projectId)
      return canvas.size
    }
  } catch (error) {
    logger.error('Failed to get object count', { error, projectId })
    return 0
  }
}

/**
 * Get list of all active project IDs
 */
export async function getAllProjectIds(): Promise<string[]> {
  try {
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      return await redis.smembers(RedisKeys.activeProjects())
    } else {
      // Fallback to in-memory
      return Array.from(projectCanvases.keys())
    }
  } catch (error) {
    logger.error('Failed to get project IDs', { error })
    return []
  }
}

/**
 * Get all canvas objects for a specific project (for auto-save worker)
 */
export async function getAllObjectsForProject(projectId: string): Promise<Array<{
  objectId: string
  type: string
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  color?: string
  text?: string
  fontSize?: number
  fontFamily?: string
  createdBy: string
  zIndex?: number
}>> {
  const objects = await getAllObjects(projectId)
  
  return objects.map(obj => ({
    objectId: obj.id,
    type: obj.type,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation,
    color: obj.color,
    text: obj.text,
    fontSize: obj.fontSize,
    fontFamily: obj.fontFamily,
    createdBy: obj.createdBy,
    zIndex: obj.zIndex
  }))
}

/**
 * Load all objects from database into Redis/memory for a specific project
 */
export async function loadFromDatabase(projectId: string): Promise<number> {
  try {
    logger.info('Loading objects from database...', { projectId })
    const dbObjects = await objectService.loadObjects(projectId)
    
    let loaded = 0
    
    // Try Redis first
    if (canUseRedis()) {
      const redis = getRedisClient()
      const pipeline = redis.pipeline()
      
      for (const dbObj of dbObjects) {
        const canvasObj: CanvasObject = {
          id: dbObj.objectId,
          type: dbObj.type as any,
          x: dbObj.x,
          y: dbObj.y,
          width: dbObj.width || 100,
          height: dbObj.height || 100,
          rotation: dbObj.rotation || 0,
          color: dbObj.color || '#000000',
          zIndex: 0,
          text: dbObj.text,
          fontSize: dbObj.fontSize,
          fontFamily: dbObj.fontFamily,
          createdBy: dbObj.createdBy,
          createdAt: dbObj.createdAt,
          updatedAt: dbObj.updatedAt
        }
        
        const key = RedisKeys.canvasObject(projectId, canvasObj.id)
        const setKey = RedisKeys.canvasObjectIds(projectId)
        
        pipeline.set(key, JSON.stringify(canvasObj), 'EX', 3600)
        pipeline.sadd(setKey, canvasObj.id)
        loaded++
      }
      
      pipeline.sadd(RedisKeys.activeProjects(), projectId)
      await pipeline.exec()
      
      logger.info(`✅ Loaded ${loaded} objects from database to Redis for project ${projectId}`)
    } else {
      // Fallback to in-memory
      const canvas = getProjectCanvas(projectId)
      
      for (const dbObj of dbObjects) {
        const canvasObj: CanvasObject = {
          id: dbObj.objectId,
          type: dbObj.type as any,
          x: dbObj.x,
          y: dbObj.y,
          width: dbObj.width || 100,
          height: dbObj.height || 100,
          rotation: dbObj.rotation || 0,
          color: dbObj.color || '#000000',
          zIndex: 0,
          text: dbObj.text,
          fontSize: dbObj.fontSize,
          fontFamily: dbObj.fontFamily,
          createdBy: dbObj.createdBy,
          createdAt: dbObj.createdAt,
          updatedAt: dbObj.updatedAt
        }
        
        canvas.set(canvasObj.id, canvasObj)
        loaded++
      }
      
      logger.info(`✅ Loaded ${loaded} objects from database to memory for project ${projectId}`)
    }
    
    return loaded
  } catch (error) {
    logger.error('Failed to load objects from database', { projectId, error })
    return 0
  }
}
