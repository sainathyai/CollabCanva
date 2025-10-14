// In-memory canvas state management
import { logger } from '../utils/logger.js'

export interface CanvasObject {
  id: string
  type: 'rectangle' // Extensible for future shapes
  x: number
  y: number
  width: number
  height: number
  fill: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

// In-memory store for canvas objects
const canvasObjects = new Map<string, CanvasObject>()

/**
 * Create a new canvas object
 */
export function createObject(object: CanvasObject): CanvasObject {
  if (canvasObjects.has(object.id)) {
    logger.warn('Object already exists, updating instead', { id: object.id })
    return updateObject(object)
  }

  canvasObjects.set(object.id, object)
  logger.debug('Object created', { id: object.id, type: object.type })
  return object
}

/**
 * Update an existing canvas object (last-write-wins)
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
      fill: '#000000',
      createdBy: 'unknown',
      createdAt: new Date().toISOString(),
      ...object,
      updatedAt: new Date().toISOString(),
    } as CanvasObject
    canvasObjects.set(object.id, newObject)
    return newObject
  }

  const updated: CanvasObject = {
    ...existing,
    ...object,
    updatedAt: new Date().toISOString(),
  }

  canvasObjects.set(object.id, updated)
  logger.debug('Object updated', { id: object.id })
  return updated
}

/**
 * Delete a canvas object
 */
export function deleteObject(id: string): boolean {
  const deleted = canvasObjects.delete(id)
  if (deleted) {
    logger.debug('Object deleted', { id })
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
  return Array.from(canvasObjects.values())
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

