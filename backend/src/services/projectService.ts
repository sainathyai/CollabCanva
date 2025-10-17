/**
 * Project Service
 *
 * Handles all project-related database operations including
 * creation, retrieval, updates, and deletion.
 */

import { PutCommand, GetCommand, QueryCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { docClient, handleDatabaseError } from '../db/dynamodb.js'
import { TABLES } from '../db/tables.js'
import { timedOperation } from '../utils/dbLogger.js'
import { logger } from '../utils/logger.js'
import { randomUUID } from 'crypto'

export type UserRole = 'owner' | 'editor' | 'viewer'

export interface Collaborator {
  email: string
  role: UserRole  // 'editor' or 'viewer' (owner is implicit via ownerId)
}

/**
 * Normalize collaborators to new format (backward compatibility)
 * Old format: string[] (just emails)
 * New format: Collaborator[] (objects with email and role)
 */
function normalizeCollaborators(collaborators: any): Collaborator[] {
  if (!collaborators || !Array.isArray(collaborators)) {
    return []
  }

  // Check if already in new format (first item is an object with email property)
  if (collaborators.length > 0 && typeof collaborators[0] === 'object' && 'email' in collaborators[0]) {
    return collaborators as Collaborator[]
  }

  // Old format - convert strings to Collaborator objects (default to editor)
  if (collaborators.length > 0 && typeof collaborators[0] === 'string') {
    return (collaborators as string[]).map(email => ({
      email,
      role: 'editor' as UserRole
    }))
  }

  return []
}

/**
 * Get user's role in a project
 *
 * @param project The project
 * @param userId User's ID
 * @param userEmail User's email
 * @returns User's role or null if not authorized
 */
export function getUserRole(project: Project, userId: string, userEmail?: string): UserRole | null {
  // Check if owner
  if (project.ownerId === userId) {
    return 'owner'
  }

  // Check if collaborator (with backward compatibility)
  if (userEmail && project.collaborators) {
    const normalizedCollabs = normalizeCollaborators(project.collaborators)
    const collaborator = normalizedCollabs.find(c => c.email === userEmail)
    if (collaborator) {
      return collaborator.role
    }
  }

  return null
}

export interface Project {
  projectId: string
  ownerId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  thumbnailUrl?: string
  isPublic: boolean
  collaborators?: Collaborator[]  // Array of collaborators with roles
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
      isPublic: false,
      collaborators: []
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
 * @param userEmail User email to check collaborator access
 * @returns Array of project objects
 */
export async function getUserProjects(userId: string, userEmail?: string): Promise<Project[]> {
  return timedOperation('getUserProjects', async () => {
    try {
      // Query projects where user is the owner
      const ownedResult = await docClient.send(new QueryCommand({
        TableName: TABLES.PROJECTS,
        IndexName: 'ownerId-createdAt-index',
        KeyConditionExpression: 'ownerId = :ownerId',
        ExpressionAttributeValues: {
          ':ownerId': userId
        },
        ScanIndexForward: false // Sort by most recent first
      }))

      let projects = (ownedResult.Items || []) as Project[]

      // If user email is provided, also get projects where user is a collaborator
      if (userEmail) {
        logger.info(`Scanning for collaborative projects for email: ${userEmail}`)

        const collaboratorResult = await docClient.send(new ScanCommand({
          TableName: TABLES.PROJECTS,
          FilterExpression: 'attribute_exists(collaborators)'
        }))

        const allProjects = (collaboratorResult.Items || []) as Project[]

        // Filter for projects where user is a collaborator (with backward compatibility)
        const collaboratorProjects = allProjects.filter(p => {
          if (!p.collaborators) return false
          const normalizedCollabs = normalizeCollaborators(p.collaborators)
          return normalizedCollabs.some(c => c.email === userEmail)
        })
        logger.info(`Found ${collaboratorProjects.length} collaborative projects for ${userEmail}`)

        // Merge owned and collaborator projects, avoiding duplicates
        const projectIds = new Set(projects.map(p => p.projectId))
        collaboratorProjects.forEach(p => {
          if (!projectIds.has(p.projectId)) {
            projects.push(p)
            logger.info(`Adding collaborative project: ${p.projectId} (${p.name})`)
          }
        })
      }

      // Filter out deleted projects, normalize collaborators, and sort by most recent
      return projects
        .filter(p => !p.deletedAt)
        .map(p => ({
          ...p,
          collaborators: normalizeCollaborators(p.collaborators)
        }))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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
 * Add a collaborator to a project
 *
 * @param projectId Project ID
 * @param collaboratorEmail Email of the collaborator to add
 * @returns Updated project object
 */
export async function addCollaborator(
  projectId: string,
  collaboratorEmail: string,
  role: UserRole = 'editor'  // Default to editor
): Promise<Project | null> {
  return timedOperation('addCollaborator', async () => {
    try {
      // Get current project to check if collaborator already exists
      const project = await getProject(projectId)
      if (!project) {
        logger.error(`Project not found: ${projectId}`)
        return null
      }

      const collaborators = project.collaborators || []

      // Check if already a collaborator
      const existingIndex = collaborators.findIndex(c => c.email === collaboratorEmail)
      if (existingIndex !== -1) {
        // Update role if already exists
        collaborators[existingIndex].role = role
        const result = await docClient.send(new UpdateCommand({
          TableName: TABLES.PROJECTS,
          Key: { projectId },
          UpdateExpression: 'SET collaborators = :collaborators, updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':collaborators': collaborators,
            ':updatedAt': new Date().toISOString()
          },
          ReturnValues: 'ALL_NEW'
        }))
        logger.info(`Updated collaborator ${collaboratorEmail} role to ${role} on project ${projectId}`)
        return result.Attributes as Project
      }

      // Add new collaborator
      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.PROJECTS,
        Key: { projectId },
        UpdateExpression: 'SET collaborators = list_append(if_not_exists(collaborators, :empty_list), :new_collaborator), updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':new_collaborator': [{ email: collaboratorEmail, role }],
          ':empty_list': [],
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      }))

      logger.info(`Added collaborator ${collaboratorEmail} with role ${role} to project ${projectId}`)
      return result.Attributes as Project
    } catch (error) {
      handleDatabaseError('addCollaborator', error)
      return null
    }
  })
}

/**
 * Remove a collaborator from a project
 *
 * @param projectId Project ID
 * @param collaboratorEmail Email of the collaborator to remove
 * @returns Updated project object
 */
export async function removeCollaborator(
  projectId: string,
  collaboratorEmail: string
): Promise<Project | null> {
  return timedOperation('removeCollaborator', async () => {
    try {
      const project = await getProject(projectId)
      if (!project) {
        logger.error(`Project not found: ${projectId}`)
        return null
      }

      const collaborators = project.collaborators || []
      const newCollaborators = collaborators.filter(c => c.email !== collaboratorEmail)

      const result = await docClient.send(new UpdateCommand({
        TableName: TABLES.PROJECTS,
        Key: { projectId },
        UpdateExpression: 'SET collaborators = :collaborators, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':collaborators': newCollaborators,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      }))

      logger.info(`Removed collaborator ${collaboratorEmail} from project ${projectId}`)
      return result.Attributes as Project
    } catch (error) {
      handleDatabaseError('removeCollaborator', error)
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

