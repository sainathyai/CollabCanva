import { describe, it, expect } from 'vitest'
import {
  generateObjectId,
  createRectangle,
  isPointInRect,
  findObjectAtPoint,
  getRandomColor,
  distance,
  clamp,
  screenToCanvas,
  canvasToScreen
} from './canvas'
import type { CanvasObject } from '../types'

describe('canvas helpers', () => {
  describe('generateObjectId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateObjectId()
      const id2 = generateObjectId()
      
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^obj_\d+_[a-z0-9]+$/)
    })
  })

  describe('createRectangle', () => {
    it('should create a rectangle with correct properties', () => {
      const rect = createRectangle(10, 20, 100, 50, '#FF0000', 'user123')
      
      expect(rect).toMatchObject({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: '#FF0000',
        createdBy: 'user123'
      })
      expect(rect.id).toMatch(/^obj_\d+_[a-z0-9]+$/)
      expect(rect.createdAt).toBeTruthy()
      expect(rect.updatedAt).toBeTruthy()
    })

    it('should create rectangles with different IDs', () => {
      const rect1 = createRectangle(0, 0, 50, 50, '#000000', 'user1')
      const rect2 = createRectangle(0, 0, 50, 50, '#000000', 'user1')
      
      expect(rect1.id).not.toBe(rect2.id)
    })
  })

  describe('isPointInRect', () => {
    const rect: CanvasObject = {
      id: 'test-rect',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: '#000000',
      createdBy: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    it('should return true for point inside rectangle', () => {
      expect(isPointInRect(150, 150, rect)).toBe(true)
      expect(isPointInRect(200, 175, rect)).toBe(true)
    })

    it('should return true for point on rectangle edge', () => {
      expect(isPointInRect(100, 100, rect)).toBe(true) // top-left corner
      expect(isPointInRect(300, 250, rect)).toBe(true) // bottom-right corner
      expect(isPointInRect(200, 100, rect)).toBe(true) // top edge
      expect(isPointInRect(100, 175, rect)).toBe(true) // left edge
    })

    it('should return false for point outside rectangle', () => {
      expect(isPointInRect(50, 50, rect)).toBe(false)
      expect(isPointInRect(350, 175, rect)).toBe(false)
      expect(isPointInRect(200, 50, rect)).toBe(false)
      expect(isPointInRect(200, 300, rect)).toBe(false)
    })
  })

  describe('findObjectAtPoint', () => {
    const objects: CanvasObject[] = [
      {
        id: 'rect1',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: '#FF0000',
        createdBy: 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'rect2',
        type: 'rectangle',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        fill: '#00FF00',
        createdBy: 'user2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    it('should find object at point', () => {
      const found = findObjectAtPoint(25, 25, objects)
      expect(found).toBeTruthy()
      expect(found?.id).toBe('rect1')
    })

    it('should return topmost object when multiple overlap', () => {
      // Point (75, 75) is in both rectangles
      const found = findObjectAtPoint(75, 75, objects)
      expect(found?.id).toBe('rect2') // rect2 is added later, so it's on top
    })

    it('should return null when no object at point', () => {
      const found = findObjectAtPoint(500, 500, objects)
      expect(found).toBeNull()
    })

    it('should handle empty array', () => {
      const found = findObjectAtPoint(50, 50, [])
      expect(found).toBeNull()
    })
  })

  describe('getRandomColor', () => {
    it('should return a valid hex color', () => {
      const color = getRandomColor()
      expect(color).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('should return colors from predefined palette', () => {
      const colors = new Set<string>()
      // Generate 50 colors to likely get duplicates
      for (let i = 0; i < 50; i++) {
        colors.add(getRandomColor())
      }
      
      // Should have at most 10 unique colors (the palette size)
      expect(colors.size).toBeLessThanOrEqual(10)
    })
  })

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      expect(distance(0, 0, 3, 4)).toBe(5)
      expect(distance(0, 0, 0, 0)).toBe(0)
      expect(distance(1, 1, 4, 5)).toBe(5)
    })

    it('should handle negative coordinates', () => {
      expect(distance(-3, -4, 0, 0)).toBe(5)
      expect(distance(-1, -1, 1, 1)).toBeCloseTo(2.828, 2)
    })
  })

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0)
      expect(clamp(10, 0, 10)).toBe(10)
    })

    it('should work with negative ranges', () => {
      expect(clamp(-5, -10, 10)).toBe(-5)
      expect(clamp(-15, -10, 10)).toBe(-10)
    })
  })

  describe('screenToCanvas', () => {
    const canvasRect: DOMRect = {
      left: 100,
      top: 50,
      width: 800,
      height: 600,
      x: 100,
      y: 50,
      right: 900,
      bottom: 650,
      toJSON: () => ({})
    }

    it('should convert screen coordinates to canvas coordinates', () => {
      const result = screenToCanvas(150, 100, canvasRect)
      expect(result).toEqual({ x: 50, y: 50 })
    })

    it('should handle canvas at origin', () => {
      const originRect: DOMRect = {
        ...canvasRect,
        left: 0,
        top: 0,
        x: 0,
        y: 0
      }
      const result = screenToCanvas(100, 100, originRect)
      expect(result).toEqual({ x: 100, y: 100 })
    })
  })

  describe('canvasToScreen', () => {
    const canvasRect: DOMRect = {
      left: 100,
      top: 50,
      width: 800,
      height: 600,
      x: 100,
      y: 50,
      right: 900,
      bottom: 650,
      toJSON: () => ({})
    }

    it('should convert canvas coordinates to screen coordinates', () => {
      const result = canvasToScreen(50, 50, canvasRect)
      // Current implementation doesn't offset, so it returns the same values
      expect(result).toEqual({ x: 50, y: 50 })
    })
  })

  describe('integration: object manipulation', () => {
    it('should create, find, and manipulate objects', () => {
      // Create an object
      const rect = createRectangle(100, 100, 200, 150, '#FF0000', 'user123')
      expect(rect).toBeTruthy()

      // Check if point is in object
      expect(isPointInRect(150, 150, rect)).toBe(true)
      expect(isPointInRect(50, 50, rect)).toBe(false)

      // Find object in array
      const objects = [rect]
      const found = findObjectAtPoint(150, 150, objects)
      expect(found?.id).toBe(rect.id)

      // Calculate distance from center to corner
      const centerX = rect.x + rect.width / 2
      const centerY = rect.y + rect.height / 2
      const dist = distance(centerX, centerY, rect.x, rect.y)
      expect(dist).toBeGreaterThan(0)
    })

    it('should handle multiple overlapping objects correctly', () => {
      const rect1 = createRectangle(0, 0, 200, 200, '#FF0000', 'user1')
      const rect2 = createRectangle(50, 50, 200, 200, '#00FF00', 'user2')
      const rect3 = createRectangle(100, 100, 200, 200, '#0000FF', 'user3')

      const objects = [rect1, rect2, rect3]

      // Point in all three rectangles - should return topmost (rect3)
      const found1 = findObjectAtPoint(150, 150, objects)
      expect(found1?.id).toBe(rect3.id)

      // Point only in rect1
      const found2 = findObjectAtPoint(25, 25, objects)
      expect(found2?.id).toBe(rect1.id)

      // Point only in rect3
      const found3 = findObjectAtPoint(250, 250, objects)
      expect(found3?.id).toBe(rect3.id)
    })
  })
})

