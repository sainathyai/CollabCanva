import { useEffect, useState, useRef } from 'react'
import { getCurrentUser } from '../lib/auth'
import { wsClient, MessageType, type WSMessage } from '../lib/ws'
import type { CanvasObject } from '../types'
import {
  createRectangle,
  renderAllObjects,
  findObjectAtPoint,
  screenToCanvas,
  getRandomColor
} from '../lib/canvas'

function Canvas() {
  const [objects, setObjects] = useState<CanvasObject[]>([])
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const user = getCurrentUser()

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await wsClient.connect()
        setIsConnected(true)
        console.log('Connected to WebSocket server')

        // Authenticate if we have a user token
        if (user) {
          const token = await user.getIdToken()
          wsClient.authenticate(token)
        }
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
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
          console.log('Loaded initial state:', message.objects.length, 'objects')
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
        break

      case MessageType.ERROR:
        console.error('WebSocket error:', 'error' in message ? message.error : 'Unknown error')
        break
    }
  }

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

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedObjectId) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, rect)

    const newX = x - dragOffset.x
    const newY = y - dragOffset.y

    wsClient.updateObject({
      id: selectedObjectId,
      x: newX,
      y: newY
    })
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle delete selected object
  const handleDeleteSelected = () => {
    if (selectedObjectId) {
      wsClient.deleteObject(selectedObjectId)
      setSelectedObjectId(null)
    }
  }

  return (
    <div className="canvas-page">
      <div className="canvas-toolbar">
        <button className="btn-primary" onClick={handleAddRectangle}>
          Add Rectangle
        </button>
        <button
          className="btn-secondary"
          onClick={handleDeleteSelected}
          disabled={!selectedObjectId}
        >
          Delete Selected
        </button>
        <div className="toolbar-info">
          <span className={isConnected ? 'status-connected' : 'status-disconnected'}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
          <span className="text-muted">
            Objects: {objects.length}
          </span>
        </div>
      </div>

      <div className="canvas-container">
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
      </div>
    </div>
  )
}

export default Canvas

