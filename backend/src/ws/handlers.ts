import { WebSocket } from 'ws'
import {
  WSMessage,
  MessageType,
  AuthMessage,
  ErrorMessage,
  ObjectCreateMessage,
  ObjectUpdateMessage,
  ObjectDeleteMessage,
  PresenceCursorMessage
} from './messageTypes.js'
import { verifyToken, UserClaims } from '../auth/verifyToken.js'
import { logger } from '../utils/logger.js'
import * as canvasState from '../state/canvasState.js'
import * as presenceState from '../state/presenceState.js'
import { getProject, getUserRole, type UserRole } from '../services/projectService.js'

// Store authenticated users (in-memory for MVP)
export const connectedClients = new Map<WebSocket, UserClaims>()

// Store current project ID for each connection
export const clientProjects = new Map<WebSocket, string>()

// Store user roles for each connection (for quick permission checks)
export const clientRoles = new Map<WebSocket, UserRole>()

/**
 * Handle incoming WebSocket messages
 */
export async function handleMessage(ws: WebSocket, message: string) {
  try {
    const data: WSMessage = JSON.parse(message)
    logger.debug('Received message', { type: data.type })

    switch (data.type) {
      case MessageType.AUTH:
        await handleAuth(ws, data as AuthMessage)
        break

      case MessageType.OBJECT_CREATE:
        await handleObjectCreate(ws, data as ObjectCreateMessage)
        break

      case MessageType.OBJECT_UPDATE:
        await handleObjectUpdate(ws, data as ObjectUpdateMessage)
        break

      case MessageType.OBJECT_DELETE:
        await handleObjectDelete(ws, data as ObjectDeleteMessage)
        break

      case MessageType.PRESENCE_CURSOR:
        await handlePresenceCursor(ws, data as PresenceCursorMessage)
        break

      default:
        sendError(ws, `Unknown message type: ${data.type}`)
    }
  } catch (error) {
    logger.error('Error handling message', { error })
    sendError(ws, 'Invalid message format')
  }
}

/**
 * Handle authentication message
 */
async function handleAuth(ws: WebSocket, message: AuthMessage) {
  try {
    const userClaims = await verifyToken(message.token, message.displayName)

    // Store authenticated user
    connectedClients.set(ws, userClaims)

    // Determine projectId (default for backward compatibility). Prefer client-provided projectId.
    const projectId = message.projectId || canvasState.DEFAULT_PROJECT_ID

    // Check if user has access to this project and get their role
    const project = await getProject(projectId)
    let userRole: UserRole | null = null

    if (project && project.projectId !== canvasState.DEFAULT_PROJECT_ID) {
      logger.debug('Checking user role', {
        userId: userClaims.uid,
        userEmail: userClaims.email,
        projectId,
        projectOwnerId: project.ownerId,
        collaborators: project.collaborators
      })

      userRole = getUserRole(project, userClaims.uid, userClaims.email)

      logger.debug('getUserRole result', {
        userRole,
        userId: userClaims.uid,
        userEmail: userClaims.email
      })

      // In development, grant owner access for backward compatibility with old projects
      const isDev = process.env.NODE_ENV === 'development'
      const devEmailMatch = isDev && userClaims.email === 'dev@example.com'
      if (!userRole && devEmailMatch) {
        logger.debug('Granting dev owner access for backward compatibility')
        userRole = 'owner'
      }

      if (!userRole) {
        logger.warn('User attempted to access unauthorized project', {
          userId: userClaims.uid,
          userEmail: userClaims.email,
          projectId,
          projectOwnerId: project.ownerId
        })
        ws.send(JSON.stringify({
          type: MessageType.AUTH_ERROR,
          error: 'You do not have access to this project',
          timestamp: new Date().toISOString()
        }))
        ws.close()
        return
      }

      // Store user role for permission checks
      clientRoles.set(ws, userRole)

      logger.info('User authorized for project', {
        userId: userClaims.uid,
        userEmail: userClaims.email,
        projectId,
        role: userRole
      })
    } else if (project) {
      // Default project - everyone is editor
      clientRoles.set(ws, 'editor')
    }

    // Check if this is a re-authentication with different project
    const previousProjectId = clientProjects.get(ws)
    const isProjectChange = previousProjectId && previousProjectId !== projectId

    // Update project mapping
    clientProjects.set(ws, projectId)

    if (isProjectChange) {
      logger.info('Client switched projects', {
        userId: userClaims.uid,
        fromProject: previousProjectId,
        toProject: projectId
      })
    }

    // Send success response
    ws.send(JSON.stringify({
      type: MessageType.AUTH_SUCCESS,
      userId: userClaims.uid,
      displayName: userClaims.name,
      timestamp: new Date().toISOString()
    }))

    // Load objects from database if not already in memory
    const objectsInMemory = await canvasState.getAllObjects(projectId)
    if (objectsInMemory.length === 0) {
      logger.info('Project not in memory, loading from database', { projectId })
      await canvasState.loadFromDatabase(projectId)
    }

    // SECURITY FIX: Send initial canvas state ONLY after authentication
    const initialObjects = await canvasState.getAllObjects(projectId)
    logger.info('Sending initial state to authenticated user', {
      userId: userClaims.uid,
      projectId,
      objectCount: initialObjects.length,
      objects: initialObjects.map(o => ({ id: o.id, type: o.type, createdBy: o.createdBy }))
    })
    // Register user presence
    const presence = await presenceState.updatePresence(
      userClaims.uid,
      userClaims.name || 'Anonymous',
      0,
      0
    )

    // Send all existing presence to the new user
    const allPresence = await presenceState.getAllPresence()
    
    // 🚀 CRITICAL FIX: Send SINGLE INITIAL_STATE message with both objects AND presence
    // This prevents race conditions where two separate messages cause duplicate/inconsistent state
    ws.send(JSON.stringify({
      type: MessageType.INITIAL_STATE,
      objects: initialObjects,
      presence: allPresence.filter(p => p.userId !== userClaims.uid),
      timestamp: new Date().toISOString()
    }))

    // Broadcast presence join to all other clients in the same project
    const joinMessage = JSON.stringify({
      type: MessageType.PRESENCE_JOIN,
      presence,
      timestamp: new Date().toISOString()
    })
    broadcastToProject(projectId, joinMessage, ws)

    logger.info('User authenticated and initial state sent', {
      uid: userClaims.uid,
      projectId,
      objectCount: initialObjects.length,
      presenceCount: allPresence.length,
      totalConnectedClients: connectedClients.size,
      projectClients: Array.from(clientProjects.values()).reduce((acc, pid) => {
        acc[pid] = (acc[pid] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    })
  } catch (error) {
    logger.error('Authentication failed', { error })
    ws.send(JSON.stringify({
      type: MessageType.AUTH_ERROR,
      error: 'Authentication failed',
      timestamp: new Date().toISOString()
    }))
    ws.close()
  }
}

/**
 * Handle object create message
 */
async function handleObjectCreate(ws: WebSocket, message: ObjectCreateMessage) {
  try {
    const user = connectedClients.get(ws)
    if (!user) {
      sendError(ws, 'Not authenticated')
      return
    }

    // Check permission - viewers cannot create
    const role = clientRoles.get(ws)
    logger.debug('Object create permission check', { role, userId: user.uid })
    if (role === 'viewer') {
      logger.warn('Viewer attempted to create object', { userId: user.uid, role })
      sendError(ws, 'Viewers cannot create objects')
      return
    }

    const projectId = clientProjects.get(ws) || canvasState.DEFAULT_PROJECT_ID

    // Create object in state for this project (Redis/memory)
    const object = await canvasState.createObject(projectId, message.object)

    // Broadcast to all clients in the same project
    const broadcastMessage = JSON.stringify({
      type: MessageType.OBJECT_CREATE,
      object,
      timestamp: new Date().toISOString()
    })

    broadcastToProject(projectId, broadcastMessage)
    logger.info('Object created and broadcasted', {
      id: object.id,
      projectId,
      userId: user.uid,
      connectedClientsCount: connectedClients.size,
      clientsInProject: Array.from(clientProjects.entries())
        .filter(([_, pid]) => pid === projectId)
        .length
    })
  } catch (error) {
    logger.error('Error creating object', { error })
    sendError(ws, 'Failed to create object')
  }
}

/**
 * Handle object update message
 */
async function handleObjectUpdate(ws: WebSocket, message: ObjectUpdateMessage) {
  try {
    const user = connectedClients.get(ws)
    if (!user) {
      sendError(ws, 'Not authenticated')
      return
    }

    // Check permission - viewers cannot update
    const role = clientRoles.get(ws)
    if (role === 'viewer') {
      sendError(ws, 'Viewers cannot edit objects')
      return
    }

    const projectId = clientProjects.get(ws) || canvasState.DEFAULT_PROJECT_ID

    // Update object in state (last-write-wins) for this project (Redis/memory)
    const object = await canvasState.updateObject(projectId, message.object)

    // Broadcast to all clients in the same project
    const broadcastMessage = JSON.stringify({
      type: MessageType.OBJECT_UPDATE,
      object,
      timestamp: new Date().toISOString()
    })

    broadcastToProject(projectId, broadcastMessage)
    logger.debug('Object updated and broadcasted', { id: object.id, projectId })
  } catch (error) {
    logger.error('Error updating object', { error })
    sendError(ws, 'Failed to update object')
  }
}

/**
 * Handle object delete message
 */
async function handleObjectDelete(ws: WebSocket, message: ObjectDeleteMessage) {
  try {
    const user = connectedClients.get(ws)
    if (!user) {
      sendError(ws, 'Not authenticated')
      return
    }

    // Check permission - viewers cannot delete
    const role = clientRoles.get(ws)
    if (role === 'viewer') {
      sendError(ws, 'Viewers cannot delete objects')
      return
    }

    const projectId = clientProjects.get(ws) || canvasState.DEFAULT_PROJECT_ID

    // Delete object from state for this project (Redis/memory)
    const deleted = await canvasState.deleteObject(projectId, message.objectId)

    if (deleted) {
      // Broadcast to all clients in the same project
      const broadcastMessage = JSON.stringify({
        type: MessageType.OBJECT_DELETE,
        objectId: message.objectId,
        timestamp: new Date().toISOString()
      })

      broadcastToProject(projectId, broadcastMessage)
      logger.info('Object deleted and broadcasted', { id: message.objectId, projectId })
    } else {
      sendError(ws, 'Object not found')
    }
  } catch (error) {
    logger.error('Error deleting object', { error })
    sendError(ws, 'Failed to delete object')
  }
}

/**
 * Handle presence cursor update
 */
async function handlePresenceCursor(ws: WebSocket, message: PresenceCursorMessage) {
  try {
    const user = connectedClients.get(ws)
    if (!user) {
      logger.warn('⚠️  Presence cursor from unauthenticated client')
      sendError(ws, 'Not authenticated')
      return
    }

    const projectId = clientProjects.get(ws) || canvasState.DEFAULT_PROJECT_ID

    // Update cursor position in presence state (Redis/memory)
    await presenceState.updatePresence(user.uid, user.name || 'Anonymous', message.x, message.y)

    // Broadcast cursor position to all other clients in the same project
    const broadcastMessage = JSON.stringify({
      type: MessageType.PRESENCE_CURSOR,
      userId: user.uid,
      displayName: user.name || 'Anonymous',
      x: message.x,
      y: message.y,
      timestamp: new Date().toISOString()
    })

    const clientsInProject = Array.from(clientProjects.entries())
      .filter(([_, pid]) => pid === projectId && _ !== ws)

    logger.debug(`📍 Broadcasting cursor for ${user.name} in project ${projectId} to ${clientsInProject.length} clients`)

    broadcastToProject(projectId, broadcastMessage, ws)
  } catch (error) {
    logger.error('Error updating presence cursor', { error })
  }
}

/**
 * Send error message to client
 */
function sendError(ws: WebSocket, error: string) {
  const errorMessage: ErrorMessage = {
    type: MessageType.ERROR,
    error,
    timestamp: new Date().toISOString()
  }
  ws.send(JSON.stringify(errorMessage))
}

/**
 * Handle client disconnect
 */
export async function handleDisconnect(ws: WebSocket) {
  const user = connectedClients.get(ws)
  if (user) {
    logger.info('User disconnected', { uid: user.uid })

    // Remove from presence (Redis/memory)
    await presenceState.removePresence(user.uid)

    // Get project ID before removing from map
    const projectId = clientProjects.get(ws) || canvasState.DEFAULT_PROJECT_ID

    // Broadcast presence leave to all other clients in the same project
    const leaveMessage = JSON.stringify({
      type: MessageType.PRESENCE_LEAVE,
      userId: user.uid,
      timestamp: new Date().toISOString()
    })
    broadcastToProject(projectId, leaveMessage, ws)

    connectedClients.delete(ws)
    clientProjects.delete(ws)
    clientRoles.delete(ws)
  }
}

/**
 * Broadcast message to all connected clients except sender
 */
export function broadcast(sender: WebSocket, message: string) {
  connectedClients.forEach((user, client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

/**
 * Broadcast message to all clients in a specific project
 * @param projectId - Project ID to broadcast to
 * @param message - Message to broadcast
 * @param exclude - Optional client to exclude from broadcast
 */
function broadcastToProject(projectId: string, message: string, exclude?: WebSocket) {
  connectedClients.forEach((user, client) => {
    const clientProjectId = clientProjects.get(client)
    if (clientProjectId === projectId && client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(message)
    }
  })
}

/**
 * Broadcast message to all connected clients including sender
 * @param message - Message to broadcast
 * @param exclude - Optional client to exclude from broadcast
 */
export function broadcastToAll(message: string, exclude?: WebSocket) {
  connectedClients.forEach((user, client) => {
    if (client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(message)
    }
  })
}

