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
  const [clipboard, setClipboard] = useState<CanvasObject[]>([])
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

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

  // Handle adding shapes (generic for all types)
  const handleAddShape = (type: CanvasObject['type']) => {
    if (!user) {
      alert('You must be logged in to add objects')
      return
    }

    if (!isAuthenticated) {
      alert('Please wait... authenticating with server')
      return
    }

    const newObject: CanvasObject = {
      id: crypto.randomUUID(),
      type,
      x: Math.random() * 600 + 50,
      y: Math.random() * 400 + 50,
      width: type === 'line' ? 0 : type === 'text' ? 200 : 150,
      height: type === 'line' ? 0 : type === 'text' ? 50 : 100,
      rotation: 0,
      color: type === 'text' ? '#000000' : getRandomColor(),
      zIndex: objects.length,
      text: type === 'text' ? 'New Text' : undefined,
      fontSize: type === 'text' ? 16 : undefined,
      points: type === 'line' ? [0, 0, 100, 0] : undefined,
      createdBy: user.uid,
      createdAt: new Date().toISOString()
    }

    wsClient.createObject(newObject)
  }

  // Wrapper for backward compatibility
  const handleAddRectangle = () => handleAddShape('rectangle')

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

  // Handle duplicate selected objects
  const handleDuplicate = () => {
    if (!isAuthenticated) {
      alert('Please wait... authenticating with server')
      return
    }

    const selectedObjects = objects.filter(obj => selectedIds.has(obj.id))
    selectedObjects.forEach(obj => {
      const duplicate: CanvasObject = {
        ...obj,
        id: crypto.randomUUID(),
        x: obj.x + 20,
        y: obj.y + 20,
        createdAt: new Date().toISOString()
      }
      wsClient.createObject(duplicate)
    })
  }

  // Handle color change for selected objects
  const handleColorChange = (color: string) => {
    if (!isAuthenticated) return

    selectedIds.forEach(id => {
      wsClient.updateObject({
        id,
        color,
        updatedAt: new Date().toISOString()
      })
    })
  }

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

  // Copy selected objects to clipboard
  const handleCopy = useCallback(() => {
    if (selectedIds.size === 0) return
    const selectedObjects = objects.filter(obj => selectedIds.has(obj.id))
    setClipboard(selectedObjects)
    console.log(`Copied ${selectedObjects.length} objects`)
  }, [selectedIds, objects])

  // Cut selected objects to clipboard
  const handleCut = useCallback(() => {
    if (selectedIds.size === 0) return
    const selectedObjects = objects.filter(obj => selectedIds.has(obj.id))
    setClipboard(selectedObjects)
    handleDeleteSelected()
    console.log(`Cut ${selectedObjects.length} objects`)
  }, [selectedIds, objects])

  // Paste objects from clipboard
  const handlePaste = useCallback(() => {
    if (clipboard.length === 0 || !isAuthenticated) return

    clipboard.forEach(obj => {
      const newObject: CanvasObject = {
        ...obj,
        id: `obj-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        x: obj.x + 20,
        y: obj.y + 20,
        createdBy: user?.email || 'anonymous',
        createdAt: new Date().toISOString(),
      }
      wsClient.send({
        type: MessageType.OBJECT_CREATE,
        object: newObject,
        timestamp: new Date().toISOString()
      })
    })
    console.log(`Pasted ${clipboard.length} objects`)
  }, [clipboard, isAuthenticated, user])

  // Select all objects
  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(objects.map(obj => obj.id)))
    console.log(`Selected all ${objects.length} objects`)
  }, [objects])

  // Nudge selected objects with arrow keys
  const handleNudge = useCallback((dx: number, dy: number) => {
    if (selectedIds.size === 0) return

    selectedIds.forEach(id => {
      const obj = objects.find(o => o.id === id)
      if (obj) {
        wsClient.send({
          type: MessageType.OBJECT_UPDATE,
          objectId: id,
          updates: {
            x: obj.x + dx,
            y: obj.y + dy,
            updatedAt: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        })
      }
    })
  }, [selectedIds, objects])

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()

    const scaleBy = 1.05
    const stage = e.currentTarget as HTMLElement
    const oldScale = scale

    const pointer = {
      x: (e.clientX - stage.getBoundingClientRect().left) / oldScale,
      y: (e.clientY - stage.getBoundingClientRect().top) / oldScale
    }

    const newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

    // Limit zoom between 0.1x and 5x
    const clampedScale = Math.max(0.1, Math.min(5, newScale))

    setScale(clampedScale)

    // Adjust position to zoom towards mouse pointer
    setPosition({
      x: (pointer.x - (pointer.x - position.x) * (clampedScale / oldScale)),
      y: (pointer.y - (pointer.y - position.y) * (clampedScale / oldScale))
    })
  }, [scale, position])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Space: enable panning mode
      if (e.key === ' ' && !isPanning) {
        e.preventDefault()
        setIsPanning(true)
        document.body.style.cursor = 'grab'
      }
      // Delete or Backspace: delete selected
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault()
        handleDeleteSelected()
      }
      // Ctrl+D: duplicate
      else if (e.ctrlKey && e.key === 'd' && selectedIds.size > 0) {
        e.preventDefault()
        handleDuplicate()
      }
      // Ctrl+A: select all
      else if (e.ctrlKey && e.key === 'a') {
        e.preventDefault()
        handleSelectAll()
      }
      // Ctrl+C: copy
      else if (e.ctrlKey && e.key === 'c' && selectedIds.size > 0) {
        e.preventDefault()
        handleCopy()
      }
      // Ctrl+X: cut
      else if (e.ctrlKey && e.key === 'x' && selectedIds.size > 0) {
        e.preventDefault()
        handleCut()
      }
      // Ctrl+V: paste
      else if (e.ctrlKey && e.key === 'v') {
        e.preventDefault()
        handlePaste()
      }
      // Escape: deselect all
      else if (e.key === 'Escape') {
        setSelectedIds(new Set())
      }
      // Arrow keys: nudge selected objects
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.size > 0) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        switch (e.key) {
          case 'ArrowUp':
            handleNudge(0, -step)
            break
          case 'ArrowDown':
            handleNudge(0, step)
            break
          case 'ArrowLeft':
            handleNudge(-step, 0)
            break
          case 'ArrowRight':
            handleNudge(step, 0)
            break
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPanning(false)
        document.body.style.cursor = 'default'
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedIds, isAuthenticated, objects, handleCopy, handleCut, handlePaste, handleSelectAll, handleNudge, handleDeleteSelected, handleDuplicate, isPanning])

  return (
    <div className="canvas-page">
      <Toolbar
        isConnected={isConnected}
        isAuthenticated={isAuthenticated}
        objectCount={objects.length}
        hasSelection={selectedIds.size > 0}
        selectedCount={selectedIds.size}
        onAddRectangle={handleAddRectangle}
        onAddShape={handleAddShape}
        onDuplicate={handleDuplicate}
        onColorChange={handleColorChange}
        onDeleteSelected={handleDeleteSelected}
      />

      <div
        ref={containerRef}
        className="canvas-container"
        style={{ position: 'relative', width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden' }}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel as any}
      >
        <KonvaCanvas
          objects={objects}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onTransform={handleTransform}
          stageWidth={stageSize.width}
          stageHeight={stageSize.height}
          scale={scale}
          position={position}
          isPanning={isPanning}
          onPositionChange={setPosition}
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

        {/* Zoom indicator */}
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          padding: '6px 12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          userSelect: 'none'
        }}>
          {Math.round(scale * 100)}%
        </div>

        {/* Panning hint */}
        {isPanning && (
          <div style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 12px',
            background: 'rgba(66, 179, 255, 0.9)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            🖐️ Pan Mode: Drag to move canvas
          </div>
        )}
      </div>
    </div>
  )
}

export default Canvas

