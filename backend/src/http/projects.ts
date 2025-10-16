/**
 * Project API Endpoints
 *
 * RESTful API for project management (CRUD operations)
 */

import type { IncomingMessage, ServerResponse } from 'http'
import { createProject, getProject, getUserProjects, updateProject, deleteProject } from '../services/projectService.js'
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

      const projects = await getUserProjects(userId)
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

      const success = await deleteProject(projectId)

      if (!success) {
        sendJSON(res, 404, { error: 'Project not found' })
        return
      }

      logger.info(`Project deleted via API: ${projectId}`)
      sendJSON(res, 204, null)
      return
    }

    // 404 - Route not found
    sendJSON(res, 404, { error: 'Not found' })

  } catch (error) {
    logger.error('Project API error:', error)
    sendJSON(res, 500, { error: 'Internal server error' })
  }
}

