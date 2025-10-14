import { WebSocketServer, WebSocket } from 'ws'
import { Server as HTTPServer } from 'http'
import { handleMessage, handleDisconnect } from './handlers.js'
import { logger } from '../utils/logger.js'
import { getAllObjects } from '../state/canvasState.js'
import { MessageType } from './messageTypes.js'

export function setupWebSocket(server: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws: WebSocket) => {
    logger.info('New WebSocket connection established')

    // Send initial canvas state to new client
    const initialObjects = getAllObjects()
    const initialStateMessage = JSON.stringify({
      type: MessageType.INITIAL_STATE,
      objects: initialObjects,
      timestamp: new Date().toISOString()
    })
    ws.send(initialStateMessage)
    logger.debug('Sent initial state to client', { objectCount: initialObjects.length })

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      const message = data.toString()
      handleMessage(ws, message).catch(error => {
        logger.error('Error handling message', { error })
      })
    })

    // Handle connection close
    ws.on('close', () => {
      handleDisconnect(ws)
    })

    // Handle errors
    ws.on('error', (error) => {
      logger.error('WebSocket error', { error })
    })
  })

  wss.on('error', (error) => {
    logger.error('WebSocket server error', { error })
  })

  logger.info('WebSocket server initialized')
  return wss
}

