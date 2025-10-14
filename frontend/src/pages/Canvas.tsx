import { useEffect, useState, useRef, useCallback } from 'react'
import { getCurrentUser } from '../lib/auth'
import { wsClient, MessageType, type WSMessage } from '../lib/ws'
import type { CanvasObject, Presence } from '../types'
import {
  createRectangle,
  renderAllObjects,
  findObjectAtPoint,
  screenToCanvas,
  getRandomColor
} from '../lib/canvas'
import Toolbar from '../components/Toolbar'
import CursorOverlay from '../components/CursorOverlay'

// Helper function to generate user colors
const getUserColor = (userId: string): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function Canvas() {
  const [objects, setObjects] = useState<CanvasObject[]>([])
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [, setHasReceivedInitialState] = useState(false)
  const [presences, setPresences] = useState<Map<string, Presence>>(new Map())
  const [canvasOffset, setCanvasOffset] = useState({ left: 0, top: 0 })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const user = getCurrentUser()
  const lastCursorUpdate = useRef<number>(0)

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await wsClient.connect()
        setIsConnected(true)
        console.log('Connected to WebSocket server')
        
        // SECURITY FIX: Authenticate immediately after connection
        // Server requires authentication before sending initial state
        if (user) {
          try {
            const token = await user.getIdToken()
            console.log('Sending authentication...', user.displayName)
            wsClient.authenticate(token, user.displayName || undefined)
          } catch (error) {
            console.error('Failed to authenticate:', error)
          }
        }
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
        setIsConnected(false)
      }
    }

    connectWebSocket()

    // Subscribe to WebSocket messages
    const unsubscribe = wsClient.onMessage((message: WSMessage) => {
      handleWebSocketMessage(message)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      wsClient.disconnect()
    }
  }, [user])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: WSMessage) => {
    console.log('Received message:', message.type)

    switch (message.type) {
      case MessageType.INITIAL_STATE:
        if ('objects' in message) {
          setObjects(message.objects)
          setHasReceivedInitialState(true)
          console.log('Loaded initial state:', message.objects.length, 'objects')
        }
        // Load initial presence state
        if ('presence' in message && message.presence) {
          const presenceMap = new Map<string, Presence>()
          message.presence.forEach((p: Presence) => {
            presenceMap.set(p.userId, { ...p, color: getUserColor(p.userId) })
          })
          setPresences(presenceMap)
          console.log('Loaded initial presence:', message.presence.length, 'users')
        }
        break

      case MessageType.OBJECT_CREATE:
        if ('object' in message) {
          setObjects(prev => {
            // Avoid duplicates
            if (prev.find(o => o.id === message.object.id)) {
              return prev
            }
            return [...prev, message.object]
          })
        }
        break

      case MessageType.OBJECT_UPDATE:
        if ('object' in message) {
          setObjects(prev =>
            prev.map(obj =>
              obj.id === message.object.id ? { ...obj, ...message.object } : obj
            )
          )
        }
        break

      case MessageType.OBJECT_DELETE:
        if ('objectId' in message) {
          setObjects(prev => prev.filter(obj => obj.id !== message.objectId))
          if (selectedObjectId === message.objectId) {
            setSelectedObjectId(null)
          }
        }
        break

      case MessageType.AUTH_SUCCESS:
        console.log('Authenticated successfully')
        setIsAuthenticated(true)
        break

      case MessageType.PRESENCE_JOIN:
        if ('presence' in message) {
          setPresences(prev => {
            const updated = new Map(prev)
            updated.set(message.presence.userId, { ...message.presence, color: getUserColor(message.presence.userId) })
            return updated
          })
          console.log('User joined:', message.presence.displayName)
        }
        break

      case MessageType.PRESENCE_CURSOR:
        if ('userId' in message && 'x' in message && 'y' in message) {
          setPresences(prev => {
            const updated = new Map(prev)
            const existing = updated.get(message.userId)
            if (existing) {
              updated.set(message.userId, { ...existing, x: message.x, y: message.y, lastSeen: Date.now() })
            }
            return updated
          })
        }
        break

      case MessageType.PRESENCE_LEAVE:
        if ('userId' in message) {
          setPresences(prev => {
            const updated = new Map(prev)
            updated.delete(message.userId)
            return updated
          })
          console.log('User left:', message.userId)
        }
        break

      case MessageType.ERROR:
        console.error('WebSocket error:', 'error' in message ? message.error : 'Unknown error')
        break
    }
  }

  // Calculate canvas offset relative to container
  useEffect(() => {
    const updateCanvasOffset = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const canvasRect = canvas.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      setCanvasOffset({
        left: canvasRect.left - containerRect.left,
        top: canvasRect.top - containerRect.top
      })
    }

    updateCanvasOffset()
    window.addEventListener('resize', updateCanvasOffset)
    
    return () => {
      window.removeEventListener('resize', updateCanvasOffset)
    }
  }, [])

  // Render canvas whenever objects change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    renderAllObjects(ctx, objects, selectedObjectId || undefined)
  }, [objects, selectedObjectId])

  // Handle adding a new rectangle
  const handleAddRectangle = () => {
    if (!user) {
      alert('You must be logged in to add objects')
      return
    }

    if (!isAuthenticated) {
      alert('Please wait... authenticating with server')
      return
    }

    const newRect = createRectangle(
      Math.random() * 600 + 50,
      Math.random() * 400 + 50,
      150,
      100,
      getRandomColor(),
      user.uid
    )

    wsClient.createObject(newRect)
  }

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || isDragging) return

    const rect = canvas.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, rect)

    const clickedObject = findObjectAtPoint(x, y, objects)
    setSelectedObjectId(clickedObject ? clickedObject.id : null)
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedObjectId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, rect)

    const selectedObj = objects.find(obj => obj.id === selectedObjectId)
    if (selectedObj) {
      setIsDragging(true)
      setDragOffset({
        x: x - selectedObj.x,
        y: y - selectedObj.y
      })
    }
  }

  // Handle mouse move for both dragging and cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !isAuthenticated) return

    const rect = canvas.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, rect)

    // Send cursor position (throttled to ~60fps)
    const now = Date.now()
    if (now - lastCursorUpdate.current > 16) {
      wsClient.updateCursor(x, y)
      lastCursorUpdate.current = now
    }

    // Handle dragging if active
    if (isDragging && selectedObjectId) {
      const newX = x - dragOffset.x
      const newY = y - dragOffset.y

      wsClient.updateObject({
        id: selectedObjectId,
        x: newX,
        y: newY
      })
    }
  }, [isDragging, selectedObjectId, isAuthenticated, dragOffset])

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle delete selected object
  const handleDeleteSelected = () => {
    if (!isAuthenticated) {
      alert('Please wait... authenticating with server')
      return
    }
    
    if (selectedObjectId) {
      wsClient.deleteObject(selectedObjectId)
      setSelectedObjectId(null)
    }
  }

  return (
    <div className="canvas-page">
      <Toolbar
        isConnected={isConnected}
        isAuthenticated={isAuthenticated}
        objectCount={objects.length}
        hasSelection={selectedObjectId !== null}
        onAddRectangle={handleAddRectangle}
        onDeleteSelected={handleDeleteSelected}
      />

      <div ref={containerRef} className="canvas-container" style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="canvas"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <CursorOverlay
          presences={Array.from(presences.values())}
          currentUserId={user?.uid}
          canvasOffset={canvasOffset}
        />
      </div>
    </div>
  )
}

export default Canvas

