/**
 * Object Service
 *
 * Handles canvas object persistence operations including
 * saving individual objects, batch operations, and loading.
 */

import {
  PutCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand
} from '@aws-sdk/lib-dynamodb'
import { docClient, handleDatabaseError } from '../db/dynamodb.js'
import { TABLES } from '../db/tables.js'
import { timedOperation } from '../utils/dbLogger.js'
import { logger } from '../utils/logger.js'

export interface CanvasObject {
  projectId: string
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
  createdAt: string
  updatedAt: string
  createdBy: string
}

/**
 * Save a single canvas object to the database
 *
 * @param projectId Project the object belongs to
 * @param object Canvas object data
 * @returns True if successful
 */
export async function saveObject(
  projectId: string,
  object: Omit<CanvasObject, 'projectId' | 'createdAt' | 'updatedAt'>
): Promise<boolean> {
  return timedOperation('saveObject', async () => {
    try {
      const now = new Date().toISOString()

      const canvasObject: CanvasObject = {
        projectId,
        ...object,
        createdAt: now,
        updatedAt: now
      }

      await docClient.send(new PutCommand({
        TableName: TABLES.OBJECTS,
        Item: canvasObject
      }))

      logger.debug(`Object saved: ${object.objectId} in project ${projectId}`)
      return true
    } catch (error) {
      handleDatabaseError('saveObject', error)
      return false
    }
  })
}

/**
 * Save multiple canvas objects in batches
 * DynamoDB batch write supports up to 25 items per request
 *
 * @param projectId Project the objects belong to
 * @param objects Array of canvas objects
 * @returns Number of successfully saved objects
 */
export async function saveObjects(
  projectId: string,
  objects: Omit<CanvasObject, 'projectId' | 'createdAt' | 'updatedAt'>[]
): Promise<number> {
  return timedOperation('saveObjects', async () => {
    if (objects.length === 0) {
      return 0
    }

    const now = new Date().toISOString()
    let savedCount = 0

    // Split into batches of 25 (DynamoDB limit)
    const BATCH_SIZE = 25
    const batches: typeof objects[] = []

    for (let i = 0; i < objects.length; i += BATCH_SIZE) {
      batches.push(objects.slice(i, i + BATCH_SIZE))
    }

    logger.info(`Saving ${objects.length} objects in ${batches.length} batches`)

    // Process each batch
    for (const batch of batches) {
      try {
        const writeRequests = batch.map(obj => ({
          PutRequest: {
            Item: {
              projectId,
              ...obj,
              createdAt: now,
              updatedAt: now
            } as CanvasObject
          }
        }))

        await docClient.send(new BatchWriteCommand({
          RequestItems: {
            [TABLES.OBJECTS]: writeRequests
          }
        }))

        savedCount += batch.length
        logger.debug(`Batch saved: ${batch.length} objects`)
      } catch (error) {
        handleDatabaseError('saveObjects batch', error)
        // Continue with next batch even if one fails
      }
    }

    logger.info(`Total objects saved: ${savedCount}/${objects.length}`)
    return savedCount
  })
}

/**
 * Load all canvas objects for a project
 *
 * @param projectId Project to load objects from
 * @returns Array of canvas objects
 */
export async function loadObjects(projectId: string): Promise<CanvasObject[]> {
  return timedOperation('loadObjects', async () => {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.OBJECTS,
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: {
          ':projectId': projectId
        }
      }))

      const objects = (result.Items || []) as CanvasObject[]
      logger.info(`Loaded ${objects.length} objects for project ${projectId}`)
      return objects
    } catch (error) {
      handleDatabaseError('loadObjects', error)
      return []
    }
  })
}

/**
 * Delete a single canvas object
 *
 * @param projectId Project the object belongs to
 * @param objectId Object to delete
 * @returns True if successful
 */
export async function deleteObject(
  projectId: string,
  objectId: string
): Promise<boolean> {
  return timedOperation('deleteObject', async () => {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.OBJECTS,
        Key: {
          projectId,
          objectId
        }
      }))

      logger.debug(`Object deleted: ${objectId} from project ${projectId}`)
      return true
    } catch (error) {
      handleDatabaseError('deleteObject', error)
      return false
    }
  })
}

/**
 * Delete all objects for a project (used when deleting a project)
 *
 * @param projectId Project to delete objects from
 * @returns Number of objects deleted
 */
export async function deleteAllObjects(projectId: string): Promise<number> {
  return timedOperation('deleteAllObjects', async () => {
    try {
      // First, query all objects
      const objects = await loadObjects(projectId)

      if (objects.length === 0) {
        return 0
      }

      // Delete in batches of 25
      const BATCH_SIZE = 25
      let deletedCount = 0

      for (let i = 0; i < objects.length; i += BATCH_SIZE) {
        const batch = objects.slice(i, i + BATCH_SIZE)

        try {
          const deleteRequests = batch.map(obj => ({
            DeleteRequest: {
              Key: {
                projectId: obj.projectId,
                objectId: obj.objectId
              }
            }
          }))

          await docClient.send(new BatchWriteCommand({
            RequestItems: {
              [TABLES.OBJECTS]: deleteRequests
            }
          }))

          deletedCount += batch.length
        } catch (error) {
          handleDatabaseError('deleteAllObjects batch', error)
        }
      }

      logger.info(`Deleted ${deletedCount}/${objects.length} objects from project ${projectId}`)
      return deletedCount
    } catch (error) {
      handleDatabaseError('deleteAllObjects', error)
      return 0
    }
  })
}

