import { WebSocket } from 'ws'
import { 
  WSMessage, 
  MessageType, 
  AuthMessage, 
  ErrorMessage,
  ObjectCreateMessage,
  ObjectUpdateMessage,
  ObjectDeleteMessage
} from './messageTypes.js'
import { verifyToken, UserClaims } from '../auth/verifyToken.js'
import { logger } from '../utils/logger.js'
import * as canvasState from '../state/canvasState.js'

// Store authenticated users (in-memory for MVP)
export const connectedClients = new Map<WebSocket, UserClaims>()

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
        handleObjectCreate(ws, data as ObjectCreateMessage)
        break
      
      case MessageType.OBJECT_UPDATE:
        handleObjectUpdate(ws, data as ObjectUpdateMessage)
        break
      
      case MessageType.OBJECT_DELETE:
        handleObjectDelete(ws, data as ObjectDeleteMessage)
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
    const userClaims = await verifyToken(message.token)
    
    // Store authenticated user
    connectedClients.set(ws, userClaims)
    
    // Send success response
    ws.send(JSON.stringify({
      type: MessageType.AUTH_SUCCESS,
      userId: userClaims.uid,
      displayName: userClaims.name,
      timestamp: new Date().toISOString()
    }))
    
    // SECURITY FIX: Send initial canvas state ONLY after authentication
    const initialObjects = canvasState.getAllObjects()
    ws.send(JSON.stringify({
      type: MessageType.INITIAL_STATE,
      objects: initialObjects,
      timestamp: new Date().toISOString()
    }))
    
    logger.info('User authenticated and initial state sent', { 
      uid: userClaims.uid, 
      objectCount: initialObjects.length 
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
function handleObjectCreate(ws: WebSocket, message: ObjectCreateMessage) {
  try {
    const user = connectedClients.get(ws)
    if (!user) {
      sendError(ws, 'Not authenticated')
      return
    }

    // Create object in state
    const object = canvasState.createObject(message.object)
    
    // Broadcast to all clients including sender
    const broadcastMessage = JSON.stringify({
      type: MessageType.OBJECT_CREATE,
      object,
      timestamp: new Date().toISOString()
    })
    
    broadcastToAll(broadcastMessage)
    logger.info('Object created and broadcasted', { id: object.id, userId: user.uid })
  } catch (error) {
    logger.error('Error creating object', { error })
    sendError(ws, 'Failed to create object')
  }
}

/**
 * Handle object update message
 */
function handleObjectUpdate(ws: WebSocket, message: ObjectUpdateMessage) {
  try {
    const user = connectedClients.get(ws)
    if (!user) {
      sendError(ws, 'Not authenticated')
      return
    }

    // Update object in state (last-write-wins)
    const object = canvasState.updateObject(message.object)
    
    // Broadcast to all clients including sender
    const broadcastMessage = JSON.stringify({
      type: MessageType.OBJECT_UPDATE,
      object,
      timestamp: new Date().toISOString()
    })
    
    broadcastToAll(broadcastMessage)
    logger.debug('Object updated and broadcasted', { id: object.id })
  } catch (error) {
    logger.error('Error updating object', { error })
    sendError(ws, 'Failed to update object')
  }
}

/**
 * Handle object delete message
 */
function handleObjectDelete(ws: WebSocket, message: ObjectDeleteMessage) {
  try {
    const user = connectedClients.get(ws)
    if (!user) {
      sendError(ws, 'Not authenticated')
      return
    }

    // Delete object from state
    const deleted = canvasState.deleteObject(message.objectId)
    
    if (deleted) {
      // Broadcast to all clients including sender
      const broadcastMessage = JSON.stringify({
        type: MessageType.OBJECT_DELETE,
        objectId: message.objectId,
        timestamp: new Date().toISOString()
      })
      
      broadcastToAll(broadcastMessage)
      logger.info('Object deleted and broadcasted', { id: message.objectId })
    } else {
      sendError(ws, 'Object not found')
    }
  } catch (error) {
    logger.error('Error deleting object', { error })
    sendError(ws, 'Failed to delete object')
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
export function handleDisconnect(ws: WebSocket) {
  const user = connectedClients.get(ws)
  if (user) {
    logger.info('User disconnected', { uid: user.uid })
    connectedClients.delete(ws)
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
 * Broadcast message to all connected clients including sender
 */
export function broadcastToAll(message: string) {
  connectedClients.forEach((user, client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}

