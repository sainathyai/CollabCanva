// In-memory canvas state management with DynamoDB persistence
import { logger } from '../utils/logger.js'
import type { CanvasObject } from '../ws/messageTypes.js'
import * as objectService from '../services/objectService.js'
import { markDirty } from './dirtyFlags.js'

export type { CanvasObject }

// Default project ID for legacy support
export const DEFAULT_PROJECT_ID = 'default-project'

// Multi-project canvas state: Map of projectId -> Map of objectId -> CanvasObject
const projectCanvases = new Map<string, Map<string, CanvasObject>>()

/**
 * Get or create the canvas for a specific project
 */
function getProjectCanvas(projectId: string): Map<string, CanvasObject> {
  if (!projectCanvases.has(projectId)) {
    const newCanvas = new Map<string, CanvasObject>()
    projectCanvases.set(projectId, newCanvas)
    logger.debug(`Created new canvas for project: ${projectId}`)
  }
  return projectCanvases.get(projectId)!
}

logger.info('🔵 Multi-project canvas state initialized', { projectCount: projectCanvases.size })

/**
 * Create a new canvas object
 * Saves to memory immediately, marks project dirty for batch save by auto-save worker
 *
 * @param projectId Project the object belongs to
 * @param object Canvas object to create
 */
export function createObject(projectId: string, object: CanvasObject): CanvasObject {
  const canvas = getProjectCanvas(projectId)

  if (canvas.has(object.id)) {
    logger.warn('Object already exists, updating instead', { id: object.id, projectId })
    return updateObject(projectId, object)
  }

  // Write to memory first (fast response)
  canvas.set(object.id, object)
  logger.info('🟢 Object created', {
    id: object.id,
    type: object.type,
    createdBy: object.createdBy,
    projectId,
    totalObjects: canvas.size,
    stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
  })

  // Mark project as dirty - auto-save worker will handle DB write
  markDirty(projectId)

  return object
}

/**
 * Update an existing canvas object (last-write-wins)
 * Updates memory immediately, marks project dirty for batch save by auto-save worker
 *
 * @param projectId Project the object belongs to
 * @param object Partial object with id and fields to update
 */
export function updateObject(projectId: string, object: Partial<CanvasObject> & { id: string }): CanvasObject {
  const canvas = getProjectCanvas(projectId)
  const existing = canvas.get(object.id)

  if (!existing) {
    logger.warn('Object not found for update, creating new', { id: object.id, projectId })
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
    canvas.set(object.id, newObject)

    // Mark project as dirty
    markDirty(projectId)

    return newObject
  }

  const updated: CanvasObject = {
    ...existing,
    ...object,
    updatedAt: new Date().toISOString(),
  }

  // Update memory first (fast response)
  canvas.set(object.id, updated)
  logger.debug('Object updated', { id: object.id, projectId })

  // Mark project as dirty - auto-save worker will handle DB write
  markDirty(projectId)

  return updated
}

/**
 * Delete a canvas object
 * Removes from memory immediately, deletes from database asynchronously
 *
 * @param projectId Project the object belongs to
 * @param id Object ID to delete
 */
export function deleteObject(projectId: string, id: string): boolean {
  const canvas = getProjectCanvas(projectId)

  // Delete from memory first (fast response)
  const deleted = canvas.delete(id)
  if (deleted) {
    logger.debug('Object deleted', { id, projectId })

    // Delete from database asynchronously (immediate, not batched)
    // Deletions are rare so we don't need to batch them
    objectService.deleteObject(projectId, id).catch(err => {
      logger.error('Failed to delete object from database', { id, projectId, error: err })
    })
  } else {
    logger.warn('Object not found for deletion', { id, projectId })
  }
  return deleted
}

/**
 * Get a single object by ID from a specific project
 *
 * @param projectId Project to search in
 * @param id Object ID
 */
export function getObject(projectId: string, id: string): CanvasObject | undefined {
  const canvas = getProjectCanvas(projectId)
  return canvas.get(id)
}

/**
 * Get all canvas objects for a specific project
 *
 * @param projectId Project to get objects from
 */
export function getAllObjects(projectId: string): CanvasObject[] {
  const canvas = getProjectCanvas(projectId)
  const objects = Array.from(canvas.values())
  logger.info('📦 getAllObjects called', {
    projectId,
    count: objects.length,
    objects: objects.map(o => ({ id: o.id, type: o.type, createdBy: o.createdBy }))
  })
  return objects
}

/**
 * Clear all objects for a specific project (useful for testing)
 *
 * @param projectId Project to clear
 */
export function clearAllObjects(projectId: string): void {
  const canvas = getProjectCanvas(projectId)
  canvas.clear()
  logger.info('All objects cleared for project', { projectId })
}

/**
 * Get object count for a specific project
 *
 * @param projectId Project to count objects in
 */
export function getObjectCount(projectId: string): number {
  const canvas = getProjectCanvas(projectId)
  return canvas.size
}

/**
 * Get list of all active project IDs
 */
export function getAllProjectIds(): string[] {
  return Array.from(projectCanvases.keys())
}

/**
 * Get all canvas objects for a specific project (for auto-save worker)
 * Used by auto-save worker to batch save all objects
 *
 * @param projectId Project ID to get objects for
 * @returns Array of canvas objects formatted for database
 */
export function getAllObjectsForProject(projectId: string): Array<{
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
}> {
  const canvas = getProjectCanvas(projectId)

  // Map WebSocket format to database format
  return Array.from(canvas.values()).map(obj => ({
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
 * Load all objects from database into memory for a specific project
 * Called on server startup or when user opens a project
 *
 * @param projectId Project to load objects for
 */
export async function loadFromDatabase(projectId: string): Promise<number> {
  try {
    logger.info('Loading objects from database...', { projectId })
    const dbObjects = await objectService.loadObjects(projectId)

    const canvas = getProjectCanvas(projectId)

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

      canvas.set(canvasObj.id, canvasObj)
    }

    logger.info(`✅ Loaded ${dbObjects.length} objects from database for project ${projectId}`)
    return dbObjects.length
  } catch (error) {
    logger.error('Failed to load objects from database', { projectId, error })
    return 0
  }
}

