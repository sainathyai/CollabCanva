/**
 * Project Service
 *
 * Handles all project-related database operations including
 * creation, retrieval, updates, and deletion.
 */

import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { docClient, handleDatabaseError } from '../db/dynamodb.js'
import { TABLES } from '../db/tables.js'
import { timedOperation } from '../utils/dbLogger.js'
import { logger } from '../utils/logger.js'
import { randomUUID } from 'crypto'

export interface Project {
  projectId: string
  ownerId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
  isPublic: boolean
  deletedAt?: string
}

/**
 * Create a new project
 *
 * @param ownerId User ID of the project owner
 * @param name Project name
 * @param description Optional project description
 * @returns Newly created project object
 */
export async function createProject(
  ownerId: string,
  name: string,
  description?: string
): Promise<Project> {
  return timedOperation('createProject', async () => {
    const projectId = randomUUID()
    const now = new Date().toISOString()

    const project: Project = {
      projectId,
      ownerId,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      isPublic: false
    }

    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.PROJECTS,
        Item: project
      }))

      logger.info(`Project created: ${projectId} by ${ownerId}`)
      return project
    } catch (error) {
      handleDatabaseError('createProject', error)
      throw error
    }
  })
}

/**
 * Get a project by ID
 *
 * @param projectId Unique project identifier
 * @returns Project object or null if not found
 */
export async function getProject(projectId: string): Promise<Project | null> {
  return timedOperation('getProject', async () => {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.PROJECTS,
        Key: { projectId }
      }))

      if (!result.Item) {
        return null
      }

      const project = result.Item as Project

      // Don't return deleted projects
      if (project.deletedAt) {
        return null
      }

      return project
    } catch (error) {
      handleDatabaseError('getProject', error)
      return null
    }
  })
}

/**
 * Get all projects for a user (as owner or collaborator)
 *
 * @param userId User ID to query projects for
 * @returns Array of project objects
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  return timedOperation('getUserProjects', async () => {
    try {
      // Query projects where user is the owner
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.PROJECTS,
        IndexName: 'ownerId-createdAt-index',
        KeyConditionExpression: 'ownerId = :ownerId',
        ExpressionAttributeValues: {
          ':ownerId': userId
        },
        ScanIndexForward: false // Sort by most recent first
      }))

      const projects = (result.Items || []) as Project[]

      // Filter out deleted projects
      return projects.filter(p => !p.deletedAt)
    } catch (error) {
      handleDatabaseError('getUserProjects', error)
      return []
    }
  })
}

/**
 * Update a project's name or description
 *
 * @param projectId Project to update
 * @param updates Fields to update
 * @returns Updated project object
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'isPublic' | 'thumbnailUrl'>>
): Promise<Project | null> {
  return timedOperation('updateProject', async () => {
    try {
      const now = new Date().toISOString()

      // Build update expression dynamically
      // Use ExpressionAttributeNames to avoid reserved keywords (like 'name')
      const updateExpressions: string[] = ['updatedAt = :updatedAt']
      const expressionAttributeValues: Record<string, any> = {
        ':updatedAt': now
      }
      const expressionAttributeNames: Record<string, string> = {}

      if (updates.name !== undefined) {
        updateExpressions.push('#name = :name')
        expressionAttributeValues[':name'] = updates.name
        expressionAttributeNames['#name'] = 'name'
      }

      if (updates.description !== undefined) {
        updateExpressions.push('#description = :description')
        expressionAttributeValues[':description'] = updates.description
        expressionAttributeNames['#description'] = 'description'
      }

      if (updates.isPublic !== undefined) {
        updateExpressions.push('isPublic = :isPublic')
        expressionAttributeValues[':isPublic'] = updates.isPublic
      }

      if (updates.thumbnailUrl !== undefined) {
        updateExpressions.push('thumbnailUrl = :thumbnailUrl')
        expressionAttributeValues[':thumbnailUrl'] = updates.thumbnailUrl
      }

      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.PROJECTS,
        Key: { projectId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ReturnValues: 'ALL_NEW'
      }))

      logger.info(`Project updated: ${projectId}`)
      return result.Attributes as Project
    } catch (error) {
      handleDatabaseError('updateProject', error)
      return null
    }
  })
}

/**
 * Soft delete a project (sets deletedAt timestamp)
 *
 * @param projectId Project to delete
 * @returns True if successful
 */
export async function deleteProject(projectId: string): Promise<boolean> {
  return timedOperation('deleteProject', async () => {
    try {
      const now = new Date().toISOString()

      await docClient.send(new UpdateCommand({
        TableName: TABLES.PROJECTS,
        Key: { projectId },
        UpdateExpression: 'SET deletedAt = :deletedAt, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':deletedAt': now,
          ':updatedAt': now
        }
      }))

      logger.info(`Project soft deleted: ${projectId}`)
      return true
    } catch (error) {
      handleDatabaseError('deleteProject', error)
      return false
    }
  })
}

