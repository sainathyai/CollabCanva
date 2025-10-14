import { WebSocket } from 'ws'
import { WSMessage, MessageType, AuthMessage, ErrorMessage } from './messageTypes.js'
import { verifyToken, UserClaims } from '../auth/verifyToken.js'
import { logger } from '../utils/logger.js'

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
      
      // TODO: Add more handlers in future PRs
      // case MessageType.OBJECT_CREATE:
      // case MessageType.OBJECT_UPDATE:
      // case MessageType.PRESENCE_CURSOR:
      
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
    
    logger.info('User authenticated', { uid: userClaims.uid })
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

