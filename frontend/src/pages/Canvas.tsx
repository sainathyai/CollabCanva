import { useEffect, useState, useRef, useCallback } from 'react'
import { getCurrentUser } from '../lib/auth'
import { wsClient, MessageType, type WSMessage } from '../lib/ws'
import type { CanvasObject, Presence } from '../types'
import { getRandomColor } from '../lib/canvas'
import { KonvaCanvas } from '../components/KonvaCanvas'
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [, setHasReceivedInitialState] = useState(false)
  const [presences, setPresences] = useState<Map<string, Presence>>(new Map())
  const [canvasOffset, setCanvasOffset] = useState({ left: 0, top: 0 })
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  
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
          setSelectedIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(message.objectId)
            return newSet
          })
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

  // Calculate stage size and container offset
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current
      if (!container) return

      setStageSize({
        width: container.offsetWidth,
        height: container.offsetHeight
      })

      const containerRect = container.getBoundingClientRect()
      setCanvasOffset({
        left: containerRect.left,
        top: containerRect.top
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])

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

    const newRect: CanvasObject = {
      id: crypto.randomUUID(),
      type: 'rectangle',
      x: Math.random() * 600 + 50,
      y: Math.random() * 400 + 50,
      width: 150,
      height: 100,
      rotation: 0,
      color: getRandomColor(),
      zIndex: objects.length,
      createdBy: user.uid,
      createdAt: new Date().toISOString()
    }

    wsClient.createObject(newRect)
  }

  // Handle object selection from Konva
  const handleSelect = (ids: Set<string>) => {
    setSelectedIds(ids)
  }

  // Handle object transform from Konva (drag, resize, rotate)
  const handleTransform = (id: string, attrs: Partial<CanvasObject>) => {
    wsClient.updateObject({
      id,
      ...attrs,
      updatedAt: new Date().toISOString()
    })
  }

  // Handle mouse move for cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAuthenticated) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Send cursor position (throttled to ~60fps)
    const now = Date.now()
    if (now - lastCursorUpdate.current > 16) {
      wsClient.updateCursor(x, y)
      lastCursorUpdate.current = now
    }
  }, [isAuthenticated])

  // Handle delete selected objects
  const handleDeleteSelected = () => {
    if (!isAuthenticated) {
      alert('Please wait... authenticating with server')
      return
    }
    
    selectedIds.forEach(id => {
      wsClient.deleteObject(id)
    })
    setSelectedIds(new Set())
  }

  return (
    <div className="canvas-page">
      <Toolbar
        isConnected={isConnected}
        isAuthenticated={isAuthenticated}
        objectCount={objects.length}
        hasSelection={selectedIds.size > 0}
        onAddRectangle={handleAddRectangle}
        onDeleteSelected={handleDeleteSelected}
      />

      <div 
        ref={containerRef} 
        className="canvas-container" 
        style={{ position: 'relative', width: '100%', height: 'calc(100vh - 60px)' }}
        onMouseMove={handleMouseMove}
      >
        <KonvaCanvas
          objects={objects}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onTransform={handleTransform}
          stageWidth={stageSize.width}
          stageHeight={stageSize.height}
        />
        <CursorOverlay
          presences={Array.from(presences.values())}
          currentUserId={user?.uid}
          canvasOffset={canvasOffset}
        />
        {!isConnected && (
          <div style={{ position: 'absolute', top: 10, right: 10, padding: '8px 16px', background: '#fbbf24', borderRadius: '4px' }}>
            Connecting...
          </div>
        )}
      </div>
    </div>
  )
}

export default Canvas

