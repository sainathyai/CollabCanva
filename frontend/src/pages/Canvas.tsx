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

  const containerRef = useRef<HTMLDivElement>(null)
  const lastCursorUpdate = useRef<number>(0)

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
            const token = await user.getIdToken()
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

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (message: WSMessage) => {
    console.log('📨 Received message:', message.type)

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

    for (let i = 0; i < count; i++) {
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const color = colors[Math.floor(Math.random() * colors.length)]
      const x = Math.random() * (stageSize.width - 300) + 100
      const y = Math.random() * (stageSize.height - 300) + 100
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
    }
  }, [user, isAuthenticated, stageSize, objects.length])

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

          for (let i = 0; i < count; i++) {
            const newObject: CanvasObject = {
              id: crypto.randomUUID(),
              type,
              x: Math.random() * (stageSize.width - 200) + 100,
              y: Math.random() * (stageSize.height - 200) + 100,
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

          if (targetObjects.length === 0) return;

          // Calculate center point
          const centerX = stageSize.width / 2;
          const centerY = stageSize.height / 2;

          switch (arrangement) {
            case 'grid': {
              const cols = Math.ceil(Math.sqrt(targetObjects.length));
              targetObjects.forEach((obj, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                wsClient.updateObject({
                  id: obj.id,
                  x: 100 + col * (obj.width + spacing),
                  y: 100 + row * (obj.height + spacing),
                  updatedAt: new Date().toISOString()
                });
              });
              break;
            }
            case 'circle': {
              const radius = 150;
              targetObjects.forEach((obj, index) => {
                const angle = (2 * Math.PI * index) / targetObjects.length;
                wsClient.updateObject({
                  id: obj.id,
                  x: centerX + radius * Math.cos(angle),
                  y: centerY + radius * Math.sin(angle),
                  updatedAt: new Date().toISOString()
                });
              });
              break;
            }
            case 'line-horizontal': {
              targetObjects.forEach((obj, index) => {
                wsClient.updateObject({
                  id: obj.id,
                  x: 100 + index * (obj.width + spacing),
                  y: centerY,
                  updatedAt: new Date().toISOString()
                });
              });
              break;
            }
            case 'line-vertical': {
              targetObjects.forEach((obj, index) => {
                wsClient.updateObject({
                  id: obj.id,
                  x: centerX,
                  y: 100 + index * (obj.height + spacing),
                  updatedAt: new Date().toISOString()
                });
              });
              break;
            }
            case 'align-left': {
              const leftmost = Math.min(...targetObjects.map(o => o.x));
              targetObjects.forEach(obj => {
                wsClient.updateObject({
                  id: obj.id,
                  x: leftmost,
                  updatedAt: new Date().toISOString()
                });
              });
              break;
            }
            case 'align-center': {
              targetObjects.forEach(obj => {
                wsClient.updateObject({
                  id: obj.id,
                  x: centerX - obj.width / 2,
                  updatedAt: new Date().toISOString()
                });
              });
              break;
            }
            case 'align-right': {
              const rightmost = Math.max(...targetObjects.map(o => o.x + o.width));
              targetObjects.forEach(obj => {
                wsClient.updateObject({
                  id: obj.id,
                  x: rightmost - obj.width,
                  updatedAt: new Date().toISOString()
                });
              });
              break;
            }
          }
          console.log(`Arranged ${targetObjects.length} object(s) in ${arrangement}`);
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
            }
          });
          console.log(`Duplicated ${targetObjects.length} object(s) ${count} time(s)`);
          break;
        }

        default:
          console.error('Unknown AI function:', functionName);
      }
    } catch (error) {
      console.error('Error executing AI function:', error);
    }
  }, [objects, selectedIds, user, isAuthenticated, stageSize, handleCreateRandomObjects]);

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
      // G: toggle grid
      else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        setShowGrid(prev => !prev)
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
        isPanning={isPanning}
        onTogglePan={() => setIsPanning(!isPanning)}
        onFitAll={handleFitAll}
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
    </div>
  )
}

export default Canvas

