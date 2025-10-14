// WebSocket client for real-time canvas synchronization

export enum MessageType {
  // Auth
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth.success',
  AUTH_ERROR = 'auth.error',
  
  // Object operations
  OBJECT_CREATE = 'object.create',
  OBJECT_UPDATE = 'object.update',
  OBJECT_DELETE = 'object.delete',
  INITIAL_STATE = 'initialState',
  
  // Error
  ERROR = 'error'
}

export interface CanvasObject {
  id: string
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  fill: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface WSMessage {
  type: MessageType
  timestamp: string
  [key: string]: any
}

export type MessageHandler = (message: WSMessage) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageHandlers: Set<MessageHandler> = new Set()
  private isIntentionallyClosed = false

  constructor(url: string) {
    this.url = url
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionallyClosed = false
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket closed')
          this.ws = null
          
          // Attempt to reconnect if not intentionally closed
          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            const delay = this.reconnectDelay * this.reconnectAttempts
            console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
            setTimeout(() => {
              this.connect().catch(err => console.error('Reconnection failed:', err))
            }, delay)
          }
        }
      } catch (error) {
        console.error('Error creating WebSocket:', error)
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionallyClosed = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Send a message to the server
   */
  send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected, cannot send message')
    }
  }

  /**
   * Subscribe to incoming messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  /**
   * Handle incoming message and notify all handlers
   */
  private handleMessage(message: WSMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('Error in message handler:', error)
      }
    })
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  /**
   * Authenticate with the server
   */
  authenticate(token: string): void {
    this.send({
      type: MessageType.AUTH,
      token,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send object create message
   */
  createObject(object: CanvasObject): void {
    this.send({
      type: MessageType.OBJECT_CREATE,
      object,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send object update message
   */
  updateObject(object: Partial<CanvasObject> & { id: string }): void {
    this.send({
      type: MessageType.OBJECT_UPDATE,
      object,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Send object delete message
   */
  deleteObject(objectId: string): void {
    this.send({
      type: MessageType.OBJECT_DELETE,
      objectId,
      timestamp: new Date().toISOString()
    })
  }
}

// Create and export singleton instance
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
export const wsClient = new WebSocketClient(wsUrl)

