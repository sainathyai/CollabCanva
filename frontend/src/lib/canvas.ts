// Canvas helper functions
import { CanvasObject } from '../types'

/**
 * Generate a unique object ID
 */
export function generateObjectId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new rectangle object
 */
export function createRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  createdBy: string
): CanvasObject {
  return {
    id: generateObjectId(),
    type: 'rectangle',
    x,
    y,
    width,
    height,
    color,
    rotation: 0,
    zIndex: 0,
    createdBy,
    createdAt: new Date().toISOString()
  }
}

/**
 * Check if a point is inside a rectangle
 */
export function isPointInRect(
  px: number,
  py: number,
  rect: CanvasObject
): boolean {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  )
}

/**
 * Find object at given point (returns topmost)
 */
export function findObjectAtPoint(
  x: number,
  y: number,
  objects: CanvasObject[]
): CanvasObject | null {
  // Iterate in reverse order to get topmost object
  for (let i = objects.length - 1; i >= 0; i--) {
    if (isPointInRect(x, y, objects[i])) {
      return objects[i]
    }
  }
  return null
}

/**
 * Get random color for objects
 */
export function getRandomColor(): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52B788'  // Green
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Calculate distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  _canvasRect: DOMRect
): { x: number; y: number } {
  return {
    x: canvasX,
    y: canvasY
  }
}

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  canvasRect: DOMRect
): { x: number; y: number } {
  return {
    x: screenX - canvasRect.left,
    y: screenY - canvasRect.top
  }
}

/**
 * Render a canvas object on a 2D context
 */
export function renderObject(ctx: CanvasRenderingContext2D, object: CanvasObject): void {
  if (object.type === 'rectangle') {
    ctx.fillStyle = object.color
    ctx.fillRect(object.x, object.y, object.width, object.height)
    
    // Draw border
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeRect(object.x, object.y, object.width, object.height)
  }
}

/**
 * Render all objects on a canvas
 */
export function renderAllObjects(
  ctx: CanvasRenderingContext2D,
  objects: CanvasObject[],
  selectedId?: string
): void {
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  
  // Draw all objects
  objects.forEach(obj => {
    renderObject(ctx, obj)
    
    // Highlight selected object
    if (selectedId && obj.id === selectedId) {
      ctx.strokeStyle = '#007AFF'
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      ctx.strokeRect(obj.x - 2, obj.y - 2, obj.width + 4, obj.height + 4)
      ctx.setLineDash([])
    }
  })
}

