import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../lib/auth'
import { wsClient, MessageType, type WSMessage } from '../lib/ws'
import { useProject } from '../contexts/ProjectContext'
import type { CanvasObject, Presence } from '../types'
import { getRandomColor } from '../lib/canvas'
import { KonvaCanvas } from '../components/KonvaCanvas'
import Toolbar from '../components/Toolbar'
import TopToolbar from '../components/TopToolbar'
import CursorOverlay from '../components/CursorOverlay'
import { AIChat } from '../components/AIChat'
import type { AIFunctionName, AIFunctionParams } from '../lib/ai-functions'
import { exportCanvasToPNGNative } from '../lib/export'
import type { KonvaCanvasHandle } from '../components/KonvaCanvas'
import { TemplateSelector } from '../components/TemplateSelector'
import type { Template } from '../lib/templates'
import { ShortcutsHelp } from '../components/ShortcutsHelp'
import { HistoryManager, createHistoryAction } from '../lib/history'

// Helper function to generate user colors
const getUserColor = (userId: string): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function Canvas() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { switchProject, currentProject } = useProject()
  const [objects, setObjects] = useState<CanvasObject[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Determine user's role in the current project
  const user = getCurrentUser()
  const getUserRole = useCallback((): 'owner' | 'editor' | 'viewer' | null => {
    if (!currentProject || !user) return null

    // Check if owner
    if (currentProject.ownerId === user.uid) return 'owner'

    // Check if collaborator
    if (user.email && currentProject.collaborators) {
      const collaborator = currentProject.collaborators.find(c => c.email === user.email)
      if (collaborator) return collaborator.role
    }

    return null
  }, [currentProject, user])

  const userRole = getUserRole()
  const isViewer = userRole === 'viewer'

  // Update global connection state for Header
  useEffect(() => {
    if ((window as any).updateConnectionState) {
      (window as any).updateConnectionState({
        isConnected,
        isAuthenticated,
        projectName: currentProject?.name
      })
    }
  }, [isConnected, isAuthenticated, currentProject])
  const [, setHasReceivedInitialState] = useState(false)
  const [presences, setPresences] = useState<Map<string, Presence>>(new Map())
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [clipboard, setClipboard] = useState<CanvasObject[]>([])
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<KonvaCanvasHandle>(null)
  const lastCursorUpdate = useRef<number>(0)
  const historyManager = useRef(new HistoryManager(50))
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const lastSavedObjects = useRef<CanvasObject[]>([])

  // Track if action is from undo/redo to prevent double-recording
  const isUndoRedoAction = useRef(false)

  // Load project details
  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard')
      return
    }

    switchProject(projectId).catch((error) => {
      console.error('Failed to load project:', error)
      // Redirect to dashboard if project not found
      navigate('/dashboard')
    })
  }, [projectId, switchProject, navigate])

  // Initialize WebSocket connection (re-init when project changes)
  useEffect(() => {
    if (!projectId) return

    const connectWebSocket = async () => {
      try {
        await wsClient.connect()
        setIsConnected(true)
        console.log('Connected to WebSocket server')

        // SECURITY FIX: Authenticate immediately after connection
        // Server requires authentication before sending initial state
        if (user) {
          try {
            // 🚀 FIX: Force token refresh to prevent stale token errors
            // This is especially important with 3000+ objects causing long initial sync
            const token = await user.getIdToken(true) // true = force refresh
            console.log('🔑 Sending authentication...', user.displayName || user.email)
            console.log('📁 Project ID:', projectId)
            wsClient.authenticate(token, user.displayName || undefined, projectId)
          } catch (error) {
            console.error('❌ Failed to authenticate:', error)
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

    // Cleanup on unmount or when project changes
    return () => {
      unsubscribe()
      wsClient.disconnect()
    }
  }, [user, projectId])

  // Handle incoming WebSocket messages (useCallback to prevent re-subscriptions on refresh)
  const handleWebSocketMessage = useCallback((message: WSMessage) => {
    console.log('📨 Received message:', message.type)

    switch (message.type) {
      case MessageType.INITIAL_STATE:
        // 🚀 CRITICAL FIX: Only process INITIAL_STATE once to prevent duplicates
        // Backend now sends objects AND presence in a single message
        if ('objects' in message && message.objects) {
          setObjects(message.objects)
          setHasReceivedInitialState(true)
          console.log('✅ Loaded initial state:', message.objects.length, 'objects')
        }
        // Load initial presence state (can be in same message)
        if ('presence' in message && message.presence) {
          const presenceMap = new Map<string, Presence>()
          message.presence.forEach((p: Presence) => {
            presenceMap.set(p.userId, { ...p, color: getUserColor(p.userId) })
          })
          setPresences(presenceMap)
          console.log('✅ Loaded initial presence:', message.presence.length, 'users')
        }
        break

      case MessageType.OBJECT_CREATE:
        if ('object' in message) {
          setObjects(prev => {
            // Avoid duplicates - critical for refresh bug fix
            const exists = prev.find(o => o.id === message.object.id)
            if (exists) {
              console.warn('⚠️ Duplicate object create ignored:', message.object.id)
              return prev
            }
            console.log('➕ Adding object:', message.object.id, '(total:', prev.length + 1, ')')
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
        console.log('✅ Authenticated successfully - Connection established')
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
              // Update existing presence
              updated.set(message.userId, { ...existing, x: message.x, y: message.y, lastSeen: Date.now() })
            } else if ('displayName' in message) {
              // Create presence if it doesn't exist yet (race condition with PRESENCE_JOIN)
              updated.set(message.userId, {
                userId: message.userId,
                displayName: message.displayName || 'Anonymous',
                x: message.x,
                y: message.y,
                lastSeen: Date.now(),
                color: getUserColor(message.userId)
              })
              console.log('👤 Created presence from cursor update:', message.displayName)
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
  }, []) // Empty deps - uses only setters which are stable

  // Calculate stage size and container offset
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current
      if (!container) return

      setStageSize({
        width: container.offsetWidth,
        height: container.offsetHeight
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

    // Record history for undo
    if (!isUndoRedoAction.current) {
      historyManager.current.addAction(createHistoryAction.create(newObject))
    }
  }

  // Wrapper for backward compatibility
  const handleAddRectangle = () => handleAddShape('rectangle')

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(5, prev * 1.2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(0.1, prev / 1.2))
  }, [])

  const handleZoomReset = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handlePanReset = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleFitAll = useCallback(() => {
    if (objects.length === 0) return

    // Calculate bounding box of all objects
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    objects.forEach(obj => {
      const objMinX = obj.x - (obj.width || 0) / 2
      const objMaxX = obj.x + (obj.width || 0) / 2
      const objMinY = obj.y - (obj.height || 0) / 2
      const objMaxY = obj.y + (obj.height || 0) / 2

      minX = Math.min(minX, objMinX)
      maxX = Math.max(maxX, objMaxX)
      minY = Math.min(minY, objMinY)
      maxY = Math.max(maxY, objMaxY)
    })

    const objectsWidth = maxX - minX
    const objectsHeight = maxY - minY
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    // Calculate scale to fit all objects with padding
    const padding = 50
    const scaleX = (stageSize.width - padding * 2) / objectsWidth
    const scaleY = (stageSize.height - padding * 2) / objectsHeight
    const newScale = Math.min(scaleX, scaleY, 2) // Max zoom 2x

    // Calculate position to center objects
    const newX = stageSize.width / 2 - centerX * newScale
    const newY = stageSize.height / 2 - centerY * newScale

    setScale(newScale)
    setPosition({ x: newX, y: newY })
  }, [objects, stageSize])

  // Export canvas to PNG
  const handleExportPNG = useCallback(() => {
    const stage = canvasRef.current?.getStage()
    if (!stage) {
      console.error('Stage not available for export')
      return
    }

    try {
      const projectName = currentProject?.name || 'canvas'
      exportCanvasToPNGNative({ current: stage }, {
        filename: projectName.toLowerCase().replace(/\s+/g, '-'),
        quality: 1.0
      })
      console.log('✅ Canvas exported successfully!')
    } catch (error) {
      console.error('Failed to export canvas:', error)
      alert('Failed to export canvas. Please try again.')
    }
  }, [currentProject])

  // Load template onto canvas
  const handleLoadTemplate = useCallback((template: Template) => {
    if (!user || !isAuthenticated || isViewer) {
      alert('You do not have permission to load templates')
      return
    }

    console.log(`📄 Loading template: ${template.name}`)

    // Calculate offset to prevent template overlap
    // Each template gets a 200px diagonal offset (increased for better spacing)
    const templateCount = Math.floor(objects.length / 8) // Approximate templates loaded
    const offsetX = (templateCount % 4) * 200 // Horizontal: 0, 200, 400, 600, then wrap
    const offsetY = Math.floor(templateCount / 4) * 200 // Vertical: increment every 4 templates

    // Create all template objects on the canvas
    template.objects.forEach((obj) => {
      const newObject: CanvasObject = {
        id: crypto.randomUUID(),
        type: obj.type,
        x: obj.x + offsetX,
        y: obj.y + offsetY,
        width: obj.width,
        height: obj.height,
        rotation: obj.rotation,
        color: obj.color,
        zIndex: objects.length,
        text: obj.text,
        fontSize: obj.type === 'text' ? 16 : undefined,
        points: obj.points,
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      }

      // Send to server via WebSocket
      wsClient.createObject(newObject)

      // Record history for undo
      if (!isUndoRedoAction.current) {
        historyManager.current.addAction(createHistoryAction.create(newObject))
      }
    })

    console.log(`✅ Loaded template "${template.name}" with ${template.objects.length} objects at offset (${offsetX}, ${offsetY})`)
  }, [user, isAuthenticated, isViewer, objects.length])

  // Undo/Redo handlers (simplified - tracks object snapshots)
  const handleUndo = useCallback(() => {
    if (!isAuthenticated || isViewer) {
      alert('You do not have permission to undo')
      return
    }

    const action = historyManager.current.undo()
    if (!action) {
      console.log('⚠️ Nothing to undo')
      return
    }

    // Mark as undo action to prevent re-recording
    isUndoRedoAction.current = true

    try {
      switch (action.type) {
        case 'create':
          // Undo create = delete the object
          if (action.object) {
            wsClient.deleteObject(action.object.id)
            console.log(`↩️ Undo CREATE: Deleted object ${action.object.id}`)
          }
          break

        case 'delete':
          // Undo delete = recreate the object
          if (action.object) {
            wsClient.createObject(action.object)
            console.log(`↩️ Undo DELETE: Recreated object ${action.object.id}`)
          }
          break

        case 'batch_delete':
          // Undo batch delete = recreate all objects
          if (action.objects) {
            action.objects.forEach(obj => wsClient.createObject(obj))
            console.log(`↩️ Undo BATCH_DELETE: Recreated ${action.objects.length} objects`)
          }
          break

        case 'modify':
        case 'move':
          // Undo modify/move = restore "before" state
          if (action.objectId && action.before) {
            wsClient.updateObject({
              id: action.objectId,
              ...action.before
            })
            console.log(`↩️ Undo ${action.type.toUpperCase()}: Restored object ${action.objectId}`)
          }
          break
      }

      // Update button states
      setCanUndo(historyManager.current.canUndo())
      setCanRedo(historyManager.current.canRedo())
    } finally {
      // Reset flag after a short delay (let WebSocket message process)
      setTimeout(() => {
        isUndoRedoAction.current = false
      }, 100)
    }
  }, [isAuthenticated, isViewer])

  const handleRedo = useCallback(() => {
    if (!isAuthenticated || isViewer) {
      alert('You do not have permission to redo')
      return
    }

    const action = historyManager.current.redo()
    if (!action) {
      console.log('⚠️ Nothing to redo')
      return
    }

    // Mark as redo action to prevent re-recording
    isUndoRedoAction.current = true

    try {
      switch (action.type) {
        case 'create':
          // Redo create = recreate the object
          if (action.object) {
            wsClient.createObject(action.object)
            console.log(`↪️ Redo CREATE: Recreated object ${action.object.id}`)
          }
          break

        case 'delete':
          // Redo delete = delete the object again
          if (action.object) {
            wsClient.deleteObject(action.object.id)
            console.log(`↪️ Redo DELETE: Deleted object ${action.object.id}`)
          }
          break

        case 'batch_delete':
          // Redo batch delete = delete all objects again
          if (action.objects) {
            action.objects.forEach(obj => wsClient.deleteObject(obj.id))
            console.log(`↪️ Redo BATCH_DELETE: Deleted ${action.objects.length} objects`)
          }
          break

        case 'modify':
        case 'move':
          // Redo modify/move = restore "after" state
          if (action.objectId && action.after) {
            wsClient.updateObject({
              id: action.objectId,
              ...action.after
            })
            console.log(`↪️ Redo ${action.type.toUpperCase()}: Applied object ${action.objectId}`)
          }
          break
      }

      // Update button states
      setCanUndo(historyManager.current.canUndo())
      setCanRedo(historyManager.current.canRedo())
    } finally {
      // Reset flag after a short delay (let WebSocket message process)
      setTimeout(() => {
        isUndoRedoAction.current = false
      }, 100)
    }
  }, [isAuthenticated, isViewer])

  // Update undo/redo button states based on history
  useEffect(() => {
    setCanUndo(historyManager.current.canUndo())
    setCanRedo(historyManager.current.canRedo())
  }, [objects]) // Update when objects change (indicates history might have changed)

  // Align selected objects to center
  const handleAlignCenter = useCallback(() => {
    if (selectedIds.size < 2 || isViewer) {
      return
    }

    const selectedObjects = objects.filter(obj => selectedIds.has(obj.id))

    // Calculate center point of all selected objects
    const bounds = selectedObjects.reduce(
      (acc, obj) => ({
        minX: Math.min(acc.minX, obj.x),
        maxX: Math.max(acc.maxX, obj.x + (obj.width || 0)),
        minY: Math.min(acc.minY, obj.y),
        maxY: Math.max(acc.maxY, obj.y + (obj.height || 0))
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    )

    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2

    // Move each object to be centered
    selectedObjects.forEach(obj => {
      const newX = centerX - (obj.width || 0) / 2
      const newY = centerY - (obj.height || 0) / 2

      wsClient.updateObject({
        id: obj.id,
        x: newX,
        y: newY
      })

      // Record history for undo
      if (!isUndoRedoAction.current) {
        historyManager.current.addAction(createHistoryAction.move(
          obj.id,
          { x: obj.x, y: obj.y },
          { x: newX, y: newY }
        ))
      }
    })

    console.log(`✅ Aligned ${selectedObjects.length} objects to center`)
  }, [objects, selectedIds, isViewer])

  // Track unsaved changes
  useEffect(() => {
    // Compare current objects with last saved state
    const currentObjectsStr = JSON.stringify(objects.map(obj => ({ id: obj.id, x: obj.x, y: obj.y, width: obj.width, height: obj.height, rotation: obj.rotation, color: obj.color, text: obj.text })))
    const lastSavedStr = JSON.stringify(lastSavedObjects.current.map(obj => ({ id: obj.id, x: obj.x, y: obj.y, width: obj.width, height: obj.height, rotation: obj.rotation, color: obj.color, text: obj.text })))

    if (currentObjectsStr !== lastSavedStr && lastSavedObjects.current.length > 0) {
      setHasUnsavedChanges(true)
    }
  }, [objects])

  // Manual save function
  const handleSave = useCallback(() => {
    if (!isAuthenticated || isViewer) {
      alert('You do not have permission to save')
      return
    }

    setIsSaving(true)

    // The WebSocket already handles real-time syncing, so we just need to:
    // 1. Update the last saved state
    // 2. Show visual feedback
    lastSavedObjects.current = JSON.parse(JSON.stringify(objects))

    // Simulate save feedback
    setTimeout(() => {
      setIsSaving(false)
      setHasUnsavedChanges(false)
      console.log('✅ Canvas saved successfully!')
    }, 500)
  }, [objects, isAuthenticated, isViewer])

  // Initialize last saved state when objects first load
  useEffect(() => {
    if (objects.length > 0 && lastSavedObjects.current.length === 0) {
      lastSavedObjects.current = JSON.parse(JSON.stringify(objects))
    }
  }, [objects])

  const handleCreateRandomObjects = useCallback((count: number) => {
    if (!user) {
      alert('You must be logged in to create objects')
      return
    }

    if (!isAuthenticated) {
      alert('Please wait... authenticating with server')
      return
    }

    const shapes: CanvasObject['type'][] = ['rectangle', 'circle', 'triangle', 'star', 'ellipse']
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']

    // 🚀 FIX: Calculate visible canvas area in canvas space (accounting for zoom & pan)
    // Convert screen coordinates to canvas coordinates: (screenPos - pan) / scale
    const viewportLeft = (-position.x / scale)
    const viewportTop = (-position.y / scale)
    const viewportRight = ((stageSize.width - position.x) / scale)
    const viewportBottom = ((stageSize.height - position.y) / scale)

    // Add padding to avoid objects at edges
    const padding = 50
    const canvasWidth = viewportRight - viewportLeft - padding * 2
    const canvasHeight = viewportBottom - viewportTop - padding * 2

    for (let i = 0; i < count; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const color = colors[Math.floor(Math.random() * colors.length)]

      // Generate positions within visible canvas area
      const x = viewportLeft + padding + Math.random() * canvasWidth
      const y = viewportTop + padding + Math.random() * canvasHeight
      const width = Math.random() * 100 + 60
      const height = Math.random() * 100 + 60

      const newObject: CanvasObject = {
        id: crypto.randomUUID(),
        type: shape,
        x,
        y,
        width,
        height,
        color,
        rotation: 0,
        zIndex: objects.length + i,
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      }

      // Send to server
      wsClient.send({
        type: MessageType.OBJECT_CREATE,
        object: newObject,
        timestamp: new Date().toISOString()
      })

      // Record history for undo
      if (!isUndoRedoAction.current) {
        historyManager.current.addAction(createHistoryAction.create(newObject))
      }
    }
  }, [user, isAuthenticated, stageSize, objects.length, scale, position])

  // Handle object selection from Konva
  const handleSelect = (ids: Set<string>) => {
    setSelectedIds(ids)
  }

  // Handle object transform from Konva (drag, resize, rotate)
  const handleTransform = (id: string, attrs: Partial<CanvasObject>) => {
    // Get object's current state before transformation (for history)
    const obj = objects.find(o => o.id === id)
    const before: Partial<CanvasObject> = {}
    const after: Partial<CanvasObject> = {}

    if (obj && !isUndoRedoAction.current) {
      // Capture changed attributes
      Object.keys(attrs).forEach(key => {
        const k = key as keyof CanvasObject
        if (obj[k] !== attrs[k]) {
          before[k] = obj[k] as any
          after[k] = attrs[k] as any
        }
      })
    }

    wsClient.updateObject({
      id,
      ...attrs,
      updatedAt: new Date().toISOString()
    })

    // Record history for undo (choose type based on what changed)
    if (!isUndoRedoAction.current && obj && Object.keys(before).length > 0) {
      const actionType = (attrs.x !== undefined || attrs.y !== undefined) ? 'move' : 'modify'
      if (actionType === 'move') {
        historyManager.current.addAction(createHistoryAction.move(
          id,
          { x: obj.x, y: obj.y },
          { x: attrs.x ?? obj.x, y: attrs.y ?? obj.y }
        ))
      } else {
        historyManager.current.addAction(createHistoryAction.modify(id, before, after))
      }
    }
  }

  // Handle mouse move for cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAuthenticated) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    // Get cursor position relative to the container
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

      // Record history for undo
      if (!isUndoRedoAction.current) {
        historyManager.current.addAction(createHistoryAction.create(duplicate))
      }
    })
  }

  // Handle color change for selected objects
  const handleColorChange = (color: string) => {
    if (!isAuthenticated) return

    selectedIds.forEach(id => {
      // Get object's current color before changing (for history)
      const obj = objects.find(o => o.id === id)

      wsClient.updateObject({
        id,
        color,
        updatedAt: new Date().toISOString()
      })

      // Record history for undo
      if (!isUndoRedoAction.current && obj && obj.color !== color) {
        historyManager.current.addAction(createHistoryAction.modify(
          id,
          { color: obj.color },
          { color }
        ))
      }
    })
  }

  // Handle delete selected objects
  const handleDeleteSelected = () => {
    if (!isAuthenticated) {
      alert('Please wait... authenticating with server')
      return
    }

    // Get full objects before deleting (for history)
    const objectsToDelete = objects.filter(obj => selectedIds.has(obj.id))

    selectedIds.forEach(id => {
      wsClient.deleteObject(id)
    })
    setSelectedIds(new Set())

    // Record history for undo
    if (!isUndoRedoAction.current && objectsToDelete.length > 0) {
      if (objectsToDelete.length === 1) {
        historyManager.current.addAction(createHistoryAction.delete(objectsToDelete[0]))
      } else {
        historyManager.current.addAction(createHistoryAction.batchDelete(objectsToDelete))
      }
    }
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

  // Handle mouse wheel zoom - using useEffect to attach with { passive: false }
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      const scaleBy = 1.05
      const oldScale = scale

      const containerRect = container.getBoundingClientRect()

      // Mouse position in screen space (relative to container)
      const mouseX = e.clientX - containerRect.left
      const mouseY = e.clientY - containerRect.top

      // Mouse position in canvas space (before zoom)
      const canvasX = (mouseX - position.x) / oldScale
      const canvasY = (mouseY - position.y) / oldScale

      // Calculate new scale
      const newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy

      // Limit zoom between 0.1x and 5x
      const clampedScale = Math.max(0.1, Math.min(5, newScale))

      setScale(clampedScale)

      // Adjust position so the point under mouse stays in same place
      // Formula: newPosition = mousePosition - canvasPoint * newScale
      setPosition({
        x: mouseX - canvasX * clampedScale,
        y: mouseY - canvasY * clampedScale
      })
    }

    // Add event listener with { passive: false } to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [scale, position])

  // AI Function Execution Handler
  const executeAIFunction = useCallback((functionName: AIFunctionName, parameters: AIFunctionParams) => {
    if (!user || !isAuthenticated) {
      console.error('Cannot execute AI function: user not authenticated');
      return;
    }

    console.log('Executing AI function:', functionName, parameters);

    try {
      switch (functionName) {
        case 'generate_random_objects': {
          const { count } = parameters as any;
          const MAX_PER_BATCH = 100;

          if (count <= MAX_PER_BATCH) {
            // Single batch
            handleCreateRandomObjects(count);
            console.log(`Generated ${count} random objects`);
          } else {
            // Multiple batches with iteration
            const batches = Math.ceil(count / MAX_PER_BATCH);
            let remaining = count;

            console.log(`Generating ${count} objects in ${batches} batches...`);

            for (let i = 0; i < batches; i++) {
              const batchSize = Math.min(remaining, MAX_PER_BATCH);

              // Use setTimeout to batch asynchronously and give visual feedback
              setTimeout(() => {
                handleCreateRandomObjects(batchSize);
                console.log(`Batch ${i + 1}/${batches}: Generated ${batchSize} objects`);
              }, i * 300); // 300ms delay between batches

              remaining -= batchSize;
            }

            console.log(`Scheduled ${count} objects across ${batches} batches`);
          }
          break;
        }

        case 'create_shape': {
          const { type, count = 1, color, text, width, height } = parameters as any;
          const newObjects: CanvasObject[] = [];

          // 🚀 FIX: Calculate visible canvas area (same as random objects)
          const viewportLeft = (-position.x / scale)
          const viewportTop = (-position.y / scale)
          const viewportRight = ((stageSize.width - position.x) / scale)
          const viewportBottom = ((stageSize.height - position.y) / scale)
          const padding = 50
          const canvasWidth = viewportRight - viewportLeft - padding * 2
          const canvasHeight = viewportBottom - viewportTop - padding * 2

          for (let i = 0; i < count; i++) {
            const newObject: CanvasObject = {
              id: crypto.randomUUID(),
              type,
              x: viewportLeft + padding + Math.random() * canvasWidth,
              y: viewportTop + padding + Math.random() * canvasHeight,
              width: width || (type === 'line' ? 0 : type === 'text' ? 200 : 150),
              height: height || (type === 'line' ? 0 : type === 'text' ? 50 : 100),
              rotation: 0,
              color: color || getRandomColor(),
              zIndex: objects.length + i,
              text: type === 'text' ? (text || 'New Text') : undefined,
              fontSize: type === 'text' ? 16 : undefined,
              points: type === 'line' ? [0, 0, 100, 0] : undefined,
              createdBy: user.uid,
              createdAt: new Date().toISOString()
            };
            newObjects.push(newObject);
            wsClient.createObject(newObject);
          }
          console.log(`Created ${count} ${type}(s)`);
          break;
        }

        case 'modify_color': {
          const { selector, color } = parameters as any;
          let targetObjects: CanvasObject[] = [];

          if (selector === 'all') {
            targetObjects = objects;
          } else if (selector === 'selected') {
            targetObjects = objects.filter(obj => selectedIds.has(obj.id));
          } else {
            targetObjects = objects.filter(obj => obj.type === selector);
          }

          targetObjects.forEach(obj => {
            wsClient.updateObject({
              id: obj.id,
              color,
              updatedAt: new Date().toISOString()
            });
          });
          console.log(`Changed color of ${targetObjects.length} object(s) to ${color}`);
          break;
        }

        case 'move_objects': {
          const { selector, dx, dy } = parameters as any;
          let targetObjects: CanvasObject[] = [];

          if (selector === 'all') {
            targetObjects = objects;
          } else if (selector === 'selected') {
            targetObjects = objects.filter(obj => selectedIds.has(obj.id));
          } else {
            targetObjects = objects.filter(obj => obj.type === selector);
          }

          targetObjects.forEach(obj => {
            wsClient.updateObject({
              id: obj.id,
              x: obj.x + dx,
              y: obj.y + dy,
              updatedAt: new Date().toISOString()
            });
          });
          console.log(`Moved ${targetObjects.length} object(s) by (${dx}, ${dy})`);
          break;
        }

        case 'resize_objects': {
          const { selector, scale: scaleValue } = parameters as any;
          let targetObjects: CanvasObject[] = [];

          if (selector === 'all') {
            targetObjects = objects;
          } else if (selector === 'selected') {
            targetObjects = objects.filter(obj => selectedIds.has(obj.id));
          } else {
            targetObjects = objects.filter(obj => obj.type === selector);
          }

          targetObjects.forEach(obj => {
            wsClient.updateObject({
              id: obj.id,
              width: Math.max(obj.width * scaleValue, 10),
              height: Math.max(obj.height * scaleValue, 10),
              updatedAt: new Date().toISOString()
            });
          });
          console.log(`Resized ${targetObjects.length} object(s) by ${scaleValue}x`);
          break;
        }

        case 'rotate_objects': {
          const { selector, degrees } = parameters as any;
          let targetObjects: CanvasObject[] = [];

          if (selector === 'all') {
            targetObjects = objects;
          } else if (selector === 'selected') {
            targetObjects = objects.filter(obj => selectedIds.has(obj.id));
          } else {
            targetObjects = objects.filter(obj => obj.type === selector);
          }

          targetObjects.forEach(obj => {
            wsClient.updateObject({
              id: obj.id,
              rotation: (obj.rotation || 0) + degrees,
              updatedAt: new Date().toISOString()
            });
          });
          console.log(`Rotated ${targetObjects.length} object(s) by ${degrees} degrees`);
          break;
        }

        case 'delete_objects': {
          const { selector } = parameters as any;
          let targetObjects: CanvasObject[] = [];

          if (selector === 'all') {
            targetObjects = objects;
          } else if (selector === 'selected') {
            targetObjects = objects.filter(obj => selectedIds.has(obj.id));
          } else {
            targetObjects = objects.filter(obj => obj.type === selector);
          }

          targetObjects.forEach(obj => {
            wsClient.deleteObject(obj.id);
          });
          setSelectedIds(new Set());

          // Record history for undo
          if (!isUndoRedoAction.current && targetObjects.length > 0) {
            if (targetObjects.length === 1) {
              historyManager.current.addAction(createHistoryAction.delete(targetObjects[0]))
            } else {
              historyManager.current.addAction(createHistoryAction.batchDelete(targetObjects))
            }
          }

          console.log(`Deleted ${targetObjects.length} object(s)`);
          break;
        }

        case 'arrange_objects': {
          const { selector, arrangement, spacing = 20 } = parameters as any;
          let targetObjects: CanvasObject[] = [];

          if (selector === 'all') {
            targetObjects = [...objects];
          } else {
            targetObjects = objects.filter(obj => selectedIds.has(obj.id));
          }

          if (targetObjects.length === 0) {
            console.log('No objects to arrange');
            return;
          }

          // Calculate center point
          const centerX = stageSize.width / 2;
          const centerY = stageSize.height / 2;

          switch (arrangement) {
            case 'grid': {
              const cols = Math.ceil(Math.sqrt(targetObjects.length));
              const avgWidth = targetObjects.reduce((sum, obj) => sum + (obj.width || 100), 0) / targetObjects.length;
              const avgHeight = targetObjects.reduce((sum, obj) => sum + (obj.height || 100), 0) / targetObjects.length;

              targetObjects.forEach((obj, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                wsClient.updateObject({
                  id: obj.id,
                  x: 100 + col * (avgWidth + spacing),
                  y: 100 + row * (avgHeight + spacing)
                });
              });
              break;
            }
            case 'circle': {
              const radius = 200;
              targetObjects.forEach((obj, index) => {
                const angle = (2 * Math.PI * index) / targetObjects.length;
                wsClient.updateObject({
                  id: obj.id,
                  x: centerX + radius * Math.cos(angle),
                  y: centerY + radius * Math.sin(angle)
                });
              });
              break;
            }
            case 'line-horizontal': {
              const avgWidth = targetObjects.reduce((sum, obj) => sum + (obj.width || 100), 0) / targetObjects.length;
              targetObjects.forEach((obj, index) => {
                wsClient.updateObject({
                  id: obj.id,
                  x: 100 + index * (avgWidth + spacing),
                  y: centerY
                });
              });
              break;
            }
            case 'line-vertical': {
              const avgHeight = targetObjects.reduce((sum, obj) => sum + (obj.height || 100), 0) / targetObjects.length;
              targetObjects.forEach((obj, index) => {
                wsClient.updateObject({
                  id: obj.id,
                  x: centerX,
                  y: 100 + index * (avgHeight + spacing)
                });
              });
              break;
            }
            case 'align-left': {
              const leftmost = Math.min(...targetObjects.map(o => o.x - (o.width || 100) / 2));
              targetObjects.forEach(obj => {
                wsClient.updateObject({
                  id: obj.id,
                  x: leftmost
                });
              });
              break;
            }
            case 'align-center': {
              targetObjects.forEach(obj => {
                wsClient.updateObject({
                  id: obj.id,
                  x: centerX
                });
              });
              break;
            }
            case 'align-right': {
              const rightmost = Math.max(...targetObjects.map(o => o.x + (o.width || 100) / 2));
              targetObjects.forEach(obj => {
                wsClient.updateObject({
                  id: obj.id,
                  x: rightmost
                });
              });
              break;
            }
          }
          console.log(`✅ Arranged ${targetObjects.length} object(s) in ${arrangement} pattern`);
          break;
        }

        case 'duplicate_objects': {
          const { selector, count = 1, offset = 20 } = parameters as any;
          let targetObjects: CanvasObject[] = [];

          if (selector === 'all') {
            targetObjects = objects;
          } else {
            targetObjects = objects.filter(obj => selectedIds.has(obj.id));
          }

          targetObjects.forEach(obj => {
            for (let i = 0; i < count; i++) {
              const duplicate: CanvasObject = {
                ...obj,
                id: crypto.randomUUID(),
                x: obj.x + (offset * (i + 1)),
                y: obj.y + (offset * (i + 1)),
                createdAt: new Date().toISOString()
              };
              wsClient.createObject(duplicate);

              // Record history for undo
              if (!isUndoRedoAction.current) {
                historyManager.current.addAction(createHistoryAction.create(duplicate))
              }
            }
          });
          console.log(`Duplicated ${targetObjects.length} object(s) ${count} time(s)`);
          break;
        }

        case 'delete_random_objects': {
          const { count } = parameters as any;

          if (objects.length === 0) {
            console.log('No objects to delete');
            return;
          }

          // Calculate how many objects to actually delete
          const deleteCount = Math.min(count, objects.length);

          // Create a shuffled copy of all objects
          const shuffledObjects = [...objects].sort(() => Math.random() - 0.5);

          // Take the first N objects from shuffled array
          const objectsToDelete = shuffledObjects.slice(0, deleteCount);

          // Delete each selected object
          objectsToDelete.forEach(obj => {
            wsClient.deleteObject(obj.id);
          });

          // Record history for undo
          if (!isUndoRedoAction.current && objectsToDelete.length > 0) {
            if (objectsToDelete.length === 1) {
              historyManager.current.addAction(createHistoryAction.delete(objectsToDelete[0]))
            } else {
              historyManager.current.addAction(createHistoryAction.batchDelete(objectsToDelete))
            }
          }

          console.log(`✅ Randomly deleted ${deleteCount} object(s) from canvas`);
          break;
        }

        case 'count_objects': {
          const { type } = parameters as any;

          let count = 0;
          let message = '';

          if (type === 'all') {
            count = objects.length;
            message = `There are ${count} object${count !== 1 ? 's' : ''} on the canvas.`;
          } else {
            // Count specific type
            count = objects.filter(obj => obj.type === type).length;
            message = `There are ${count} ${type}${count !== 1 ? 's' : ''} on the canvas.`;
          }

          // Log for debugging
          console.log(`📊 Count: ${message}`);

          // Return the count message (AI will display this to user)
          return message;
        }

        case 'load_template': {
          const { templateName, x: targetX, y: targetY } = parameters as any;

          // Import templates dynamically
          import('../lib/templates').then(({ templates }) => {
            const template = templates.find(t => t.id === templateName);

            if (!template) {
              console.error('Template not found:', templateName);
              return;
            }

            // Calculate center position if not specified
            // Add random offset (±100px) to prevent stacking when creating multiple templates
            const randomOffsetX = (Math.random() - 0.5) * 200; // -100 to +100
            const randomOffsetY = (Math.random() - 0.5) * 200; // -100 to +100
            
            const viewportCenterX = targetX !== undefined ? targetX :
              ((-position.x + stageSize.width / 2) / scale) + randomOffsetX;
            const viewportCenterY = targetY !== undefined ? targetY :
              ((-position.y + stageSize.height / 2) / scale) + randomOffsetY;

            // Load all template objects
            const newObjects: CanvasObject[] = template.objects.map((templateObj) => ({
              ...templateObj,
              id: crypto.randomUUID(),
              userId: user.uid,
              x: templateObj.x + viewportCenterX - 150, // Offset from template center
              y: templateObj.y + viewportCenterY - 150,
              zIndex: objects.length,
              createdBy: user.uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));

            // Create all objects via WebSocket
            newObjects.forEach(obj => {
              wsClient.createObject(obj);
            });

            console.log(`✅ Loaded template: ${template.name} (${newObjects.length} objects)`);
          });
          break;
        }

        case 'export_canvas': {
          const { filename = 'canvas-export', quality = 1.0 } = parameters as any;

          // Get the Konva stage from canvas ref
          const stage = canvasRef.current?.getStage();
          if (!stage) {
            console.error('Canvas stage not available for export');
            break;
          }

          // Create a ref-like object for the stage
          const stageRefObject = { current: stage };

          // Import export function dynamically
          import('../lib/export').then(({ exportCanvasToPNGNative }) => {
            try {
              exportCanvasToPNGNative(stageRefObject, { filename, quality });
              console.log(`✅ Canvas exported as ${filename}.png`);
              return `Successfully exported canvas as ${filename}.png`;
            } catch (error) {
              console.error('Error exporting canvas:', error);
              return `Failed to export canvas: ${error}`;
            }
          });
          break;
        }

        default:
          console.error('Unknown AI function:', functionName);
      }
    } catch (error) {
      console.error('Error executing AI function:', error);
    }
  }, [objects, selectedIds, user, isAuthenticated, stageSize, handleCreateRandomObjects, position, scale, canvasRef]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Cmd+S / Ctrl+S: save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Cmd+Z / Ctrl+Z: undo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      // Cmd+Shift+Z / Ctrl+Shift+Z: redo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        handleRedo()
      }
      // Space: enable panning mode
      else if (e.key === ' ' && !isPanning) {
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
      // Ctrl+Shift+C: align center
      else if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        handleAlignCenter()
      }
      // Escape: deselect all
      else if (e.key === 'Escape') {
        setSelectedIds(new Set())
      }
      // G: toggle grid
      else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        setShowGrid(prev => !prev)
      }
      // S: toggle snap to grid
      else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        setSnapToGrid(prev => !prev)
      }
      // ?: toggle shortcuts help
      else if (e.key === '?') {
        e.preventDefault()
        setIsShortcutsHelpOpen(prev => !prev)
      }
      // F: fit all objects
      else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        handleFitAll()
      }
      // + or =: zoom in
      else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      }
      // - or _: zoom out
      else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      }
      // Home: reset zoom and pan
      else if (e.key === 'Home') {
        e.preventDefault()
        handleZoomReset()
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
  }, [selectedIds, isAuthenticated, objects, handleCopy, handleCut, handlePaste, handleSelectAll, handleNudge, handleDeleteSelected, handleDuplicate, isPanning, handleZoomIn, handleZoomOut, handleZoomReset, handleFitAll])

  return (
    <div className="canvas-page">
      <TopToolbar
        isAuthenticated={isAuthenticated}
        isViewer={isViewer}
        objectCount={objects.length}
        selectedCount={selectedIds.size}
        hasSelection={selectedIds.size > 0}
        onDuplicate={handleDuplicate}
        onColorChange={handleColorChange}
        onDeleteSelected={handleDeleteSelected}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onPanReset={handlePanReset}
        onCreateRandomObjects={handleCreateRandomObjects}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        isPanning={isPanning}
        onTogglePan={() => setIsPanning(!isPanning)}
        onFitAll={handleFitAll}
        onExportPNG={handleExportPNG}
        onOpenTemplates={() => setIsTemplateSelectorOpen(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onAlignCenter={handleAlignCenter}
      />

      <Toolbar
        isAuthenticated={isAuthenticated}
        isViewer={isViewer}
        onAddRectangle={handleAddRectangle}
        onAddShape={handleAddShape}
      />

      <div
        ref={containerRef}
        className="canvas-container"
        onMouseMove={handleMouseMove}
      >
        <KonvaCanvas
          ref={canvasRef}
          objects={objects}
          selectedIds={selectedIds}
          onSelect={isViewer ? () => { } : handleSelect}
          onTransform={isViewer ? () => { } : handleTransform}
          stageWidth={stageSize.width}
          stageHeight={stageSize.height}
          scale={scale}
          position={position}
          isPanning={isPanning}
          onPositionChange={setPosition}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          isViewer={isViewer}
        />
        <CursorOverlay
          presences={Array.from(presences.values())}
          currentUserId={user?.uid}
        />

        {/* AI Chat Component */}
        <AIChat
          context={{
            objects,
            selectedIds
          }}
          onExecuteFunction={executeAIFunction}
          isOpen={isAIChatOpen}
          onToggle={() => setIsAIChatOpen(!isAIChatOpen)}
        />

        {!isConnected && (
          <div style={{ position: 'absolute', top: 10, right: 10, padding: '8px 16px', background: '#fbbf24', borderRadius: '4px' }}>
            Connecting...
          </div>
        )}

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

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsHelp
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />
    </div>
  )
}

export default Canvas

