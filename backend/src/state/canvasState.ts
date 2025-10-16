// In-memory canvas state management with DynamoDB persistence
import { logger } from '../utils/logger.js'
import type { CanvasObject } from '../ws/messageTypes.js'
import * as objectService from '../services/objectService.js'

export type { CanvasObject }

// Default project ID for now (will be per-project in future PRs)
const DEFAULT_PROJECT_ID = 'default-project'

// In-memory store for canvas objects
const canvasObjects = new Map<string, CanvasObject>()
logger.info('🔵 Canvas state initialized', { objectCount: canvasObjects.size })

/**
 * Create a new canvas object
 * Uses dual-write: saves to memory (fast) and database (persistent)
 */
export function createObject(object: CanvasObject): CanvasObject {
  if (canvasObjects.has(object.id)) {
    logger.warn('Object already exists, updating instead', { id: object.id })
    return updateObject(object)
  }

  // Write to memory first (fast response)
  canvasObjects.set(object.id, object)
  logger.info('🟢 Object created', {
    id: object.id,
    type: object.type,
    createdBy: object.createdBy,
    totalObjects: canvasObjects.size,
    stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
  })

  // Write to database asynchronously (don't block the response)
  saveToDatabaseAsync(object).catch(err => {
    logger.error('Failed to save object to database', { id: object.id, error: err })
  })

  return object
}

/**
 * Update an existing canvas object (last-write-wins)
 * Uses dual-write: updates memory (fast) and database (persistent)
 */
export function updateObject(object: Partial<CanvasObject> & { id: string }): CanvasObject {
  const existing = canvasObjects.get(object.id)

  if (!existing) {
    logger.warn('Object not found for update, creating new', { id: object.id })
    // If object doesn't exist, treat as create (eventually consistent)
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
    canvasObjects.set(object.id, newObject)

    // Save new object to database
    saveToDatabaseAsync(newObject).catch(err => {
      logger.error('Failed to save new object to database', { id: object.id, error: err })
    })

    return newObject
  }

  const updated: CanvasObject = {
    ...existing,
    ...object,
    updatedAt: new Date().toISOString(),
  }

  // Update memory first (fast response)
  canvasObjects.set(object.id, updated)
  logger.debug('Object updated', { id: object.id })

  // Update database asynchronously
  saveToDatabaseAsync(updated).catch(err => {
    logger.error('Failed to update object in database', { id: object.id, error: err })
  })

  return updated
}

/**
 * Delete a canvas object
 * Uses dual-write: removes from memory (fast) and database (persistent)
 */
export function deleteObject(id: string): boolean {
  // Delete from memory first (fast response)
  const deleted = canvasObjects.delete(id)
  if (deleted) {
    logger.debug('Object deleted', { id })

    // Delete from database asynchronously
    objectService.deleteObject(DEFAULT_PROJECT_ID, id).catch(err => {
      logger.error('Failed to delete object from database', { id, error: err })
    })
  } else {
    logger.warn('Object not found for deletion', { id })
  }
  return deleted
}

/**
 * Get a single object by ID
 */
export function getObject(id: string): CanvasObject | undefined {
  return canvasObjects.get(id)
}

/**
 * Get all canvas objects
 */
export function getAllObjects(): CanvasObject[] {
  const objects = Array.from(canvasObjects.values())
  logger.info('📦 getAllObjects called', {
    count: objects.length,
    objects: objects.map(o => ({ id: o.id, type: o.type, createdBy: o.createdBy }))
  })
  return objects
}

/**
 * Clear all objects (useful for testing)
 */
export function clearAllObjects(): void {
  canvasObjects.clear()
  logger.info('All objects cleared')
}

/**
 * Get object count
 */
export function getObjectCount(): number {
  return canvasObjects.size
}

/**
 * Helper function to save a canvas object to database
 * Maps the WebSocket CanvasObject to database format
 */
async function saveToDatabaseAsync(object: CanvasObject): Promise<void> {
  try {
    // Map WebSocket format to database format
    const dbObject = {
      objectId: object.id,
      type: object.type,
      x: object.x,
      y: object.y,
      width: object.width,
      height: object.height,
      rotation: object.rotation,
      color: object.color,
      text: object.text,
      fontSize: object.fontSize,
      fontFamily: object.fontFamily,
      createdBy: object.createdBy
    }

    await objectService.saveObject(DEFAULT_PROJECT_ID, dbObject)
  } catch (error) {
    logger.error('Database save failed', { error })
    // Don't throw - we don't want DB failures to break the user experience
  }
}

/**
 * Load all objects from database into memory
 * Called on server startup to restore state
 */
export async function loadFromDatabase(projectId: string = DEFAULT_PROJECT_ID): Promise<number> {
  try {
    logger.info('Loading objects from database...', { projectId })
    const dbObjects = await objectService.loadObjects(projectId)

    // Map database objects to WebSocket format and load into memory
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
        zIndex: 0, // Default zIndex
        text: dbObj.text,
        fontSize: dbObj.fontSize,
        fontFamily: dbObj.fontFamily,
        createdBy: dbObj.createdBy,
        createdAt: dbObj.createdAt,
        updatedAt: dbObj.updatedAt
      }

      canvasObjects.set(canvasObj.id, canvasObj)
    }

    logger.info(`✅ Loaded ${dbObjects.length} objects from database into memory`)
    return dbObjects.length
  } catch (error) {
    logger.error('Failed to load objects from database', { error })
    return 0
  }
}

