/**
 * Project API Endpoints
 *
 * RESTful API for project management (CRUD operations)
 */

import type { IncomingMessage, ServerResponse } from 'http'
import { createProject, getProject, getUserProjects, updateProject, deleteProject, addCollaborator, removeCollaborator, getUserRole, type UserRole } from '../services/projectService.js'
import { logger } from '../utils/logger.js'

/**
 * Parse JSON body from request
 */
async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

/**
 * Extract user ID from request (mock for now, will use Firebase token later)
 */
function getUserId(req: IncomingMessage): string | null {
  // For now, get from query parameter or header
  // In production, this would come from Firebase token
  const url = new URL(req.url!, `http://${req.headers.host}`)
  return url.searchParams.get('userId') || req.headers['x-user-id'] as string || null
}

/**
 * Send JSON response
 */
function sendJSON(res: ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

/**
 * Handle project API requests
 * Routes: /api/projects/*
 */
export async function projectsHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url!, `http://${req.headers.host}`)
  const pathname = url.pathname
  const method = req.method

  try {
    // POST /api/projects - Create new project
    if (pathname === '/api/projects' && method === 'POST') {
      const userId = getUserId(req)
      if (!userId) {
        sendJSON(res, 401, { error: 'Unauthorized' })
        return
      }

      const body = await parseBody(req)
      const { name, description } = body

      if (!name || typeof name !== 'string') {
        sendJSON(res, 400, { error: 'Project name is required' })
        return
      }

      const project = await createProject(userId, name, description)
      logger.info(`Project created via API: ${project.projectId}`)
      sendJSON(res, 201, project)
      return
    }

    // GET /api/projects - List user's projects
    if (pathname === '/api/projects' && method === 'GET') {
      const userId = getUserId(req)
      if (!userId) {
        sendJSON(res, 401, { error: 'Unauthorized' })
        return
      }

      // Get user email from header or query param for collaborator check
      const userEmail = url.searchParams.get('userEmail') || req.headers['x-user-email'] as string
      const projects = await getUserProjects(userId, userEmail)
      sendJSON(res, 200, { projects })
      return
    }

    // GET /api/projects/:id - Get single project
    const getMatch = pathname.match(/^\/api\/projects\/([^\/]+)$/)
    if (getMatch && method === 'GET') {
      const projectId = getMatch[1]
      const project = await getProject(projectId)

      if (!project) {
        sendJSON(res, 404, { error: 'Project not found' })
        return
      }

      sendJSON(res, 200, project)
      return
    }

    // PUT /api/projects/:id - Update project
    const putMatch = pathname.match(/^\/api\/projects\/([^\/]+)$/)
    if (putMatch && method === 'PUT') {
      const projectId = putMatch[1]
      const userId = getUserId(req)

      if (!userId) {
        sendJSON(res, 401, { error: 'Unauthorized' })
        return
      }

      // Check if user is the owner
      const existingProject = await getProject(projectId)
      if (!existingProject) {
        sendJSON(res, 404, { error: 'Project not found' })
        return
      }

      if (existingProject.ownerId !== userId) {
        logger.warn('Non-owner attempted to update project', { userId, projectId, ownerId: existingProject.ownerId })
        sendJSON(res, 403, { error: 'Only project owners can edit project details' })
        return
      }

      const body = await parseBody(req)
      const updates: any = {}

      if (body.name !== undefined) updates.name = body.name
      if (body.description !== undefined) updates.description = body.description
      if (body.isPublic !== undefined) updates.isPublic = body.isPublic

      const project = await updateProject(projectId, updates)

      if (!project) {
        sendJSON(res, 404, { error: 'Project not found' })
        return
      }

      logger.info(`Project updated via API: ${projectId}`)
      sendJSON(res, 200, project)
      return
    }

    // DELETE /api/projects/:id - Delete project
    const deleteMatch = pathname.match(/^\/api\/projects\/([^\/]+)$/)
    if (deleteMatch && method === 'DELETE') {
      const projectId = deleteMatch[1]
      const userId = getUserId(req)

      if (!userId) {
        sendJSON(res, 401, { error: 'Unauthorized' })
        return
      }

      // Check if user is the owner
      const existingProject = await getProject(projectId)
      if (!existingProject) {
        sendJSON(res, 404, { error: 'Project not found' })
        return
      }

      if (existingProject.ownerId !== userId) {
        logger.warn('Non-owner attempted to delete project', { userId, projectId, ownerId: existingProject.ownerId })
        sendJSON(res, 403, { error: 'Only project owners can delete projects' })
        return
      }

      const success = await deleteProject(projectId)

      if (!success) {
        sendJSON(res, 404, { error: 'Project not found' })
        return
      }

      logger.info(`Project deleted via API: ${projectId}`)
      sendJSON(res, 204, null)
      return
    }

    // POST /api/projects/:id/collaborators - Add collaborator
    const addCollabMatch = pathname.match(/^\/api\/projects\/([^\/]+)\/collaborators$/)
    if (addCollabMatch && method === 'POST') {
      const projectId = addCollabMatch[1]
      const userId = getUserId(req)

      if (!userId) {
        sendJSON(res, 401, { error: 'Unauthorized' })
        return
      }

      const body = await parseBody(req)
      const { email, role } = body

      if (!email || typeof email !== 'string') {
        sendJSON(res, 400, { error: 'Collaborator email is required' })
        return
      }

      // Validate role
      const validRole: UserRole = (role === 'viewer' || role === 'editor') ? role : 'editor'

      // Check if requester is the project owner
      const project = await getProject(projectId)
      if (!project) {
        sendJSON(res, 404, { error: 'Project not found' })
        return
      }

      if (project.ownerId !== userId) {
        sendJSON(res, 403, { error: 'Only project owner can add collaborators' })
        return
      }

      const updatedProject = await addCollaborator(projectId, email, validRole)
      if (!updatedProject) {
        sendJSON(res, 500, { error: 'Failed to add collaborator' })
        return
      }

      logger.info(`Collaborator added via API: ${email} to ${projectId}`)
      sendJSON(res, 200, updatedProject)
      return
    }

    // DELETE /api/projects/:id/collaborators/:email - Remove collaborator
    const removeCollabMatch = pathname.match(/^\/api\/projects\/([^\/]+)\/collaborators\/([^\/]+)$/)
    if (removeCollabMatch && method === 'DELETE') {
      const projectId = removeCollabMatch[1]
      const collaboratorEmail = decodeURIComponent(removeCollabMatch[2])
      const userId = getUserId(req)

      if (!userId) {
        sendJSON(res, 401, { error: 'Unauthorized' })
        return
      }

      // Check if requester is the project owner
      const project = await getProject(projectId)
      if (!project) {
        sendJSON(res, 404, { error: 'Project not found' })
        return
      }

      if (project.ownerId !== userId) {
        sendJSON(res, 403, { error: 'Only project owner can remove collaborators' })
        return
      }

      const updatedProject = await removeCollaborator(projectId, collaboratorEmail)
      if (!updatedProject) {
        sendJSON(res, 500, { error: 'Failed to remove collaborator' })
        return
      }

      logger.info(`Collaborator removed via API: ${collaboratorEmail} from ${projectId}`)
      sendJSON(res, 200, updatedProject)
      return
    }

    // 404 - Route not found
    sendJSON(res, 404, { error: 'Not found' })

  } catch (error) {
    logger.error('Project API error:', error)
    sendJSON(res, 500, { error: 'Internal server error' })
  }
}

