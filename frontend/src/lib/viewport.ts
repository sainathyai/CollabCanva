/**
 * Viewport Utilities for Object Virtualization
 *
 * Only renders objects that are visible in the current viewport
 * for massive performance improvements with large canvases.
 */

import type { CanvasObject } from '../types'

export interface Viewport {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Check if an object intersects with the viewport
 * @param obj - Canvas object to check
 * @param viewport - Current viewport bounds (screen space)
 * @param scale - Current zoom scale
 * @param padding - Extra padding around viewport (in canvas pixels)
 * @returns true if object is visible in viewport
 */
export function isObjectInViewport(
  obj: CanvasObject,
  viewport: Viewport,
  scale: number,
  padding: number = 200 // Render slightly outside viewport for smooth scrolling
): boolean {
  // Calculate object bounds in canvas space
  const objWidth = obj.width || 0
  const objHeight = obj.height || 0

  const objLeft = obj.x - objWidth / 2
  const objRight = obj.x + objWidth / 2
  const objTop = obj.y - objHeight / 2
  const objBottom = obj.y + objHeight / 2

  // Calculate viewport bounds in canvas space (accounting for zoom and pan)
  // Formula: canvasPosition = (screenPosition - pan) / scale
  const viewLeft = (-viewport.x / scale) - padding
  const viewRight = ((viewport.width - viewport.x) / scale) + padding
  const viewTop = (-viewport.y / scale) - padding
  const viewBottom = ((viewport.height - viewport.y) / scale) + padding

  // Check if object intersects viewport (AABB collision detection)
  const intersects = !(
    objRight < viewLeft ||   // Object is left of viewport
    objLeft > viewRight ||   // Object is right of viewport
    objBottom < viewTop ||   // Object is above viewport
    objTop > viewBottom      // Object is below viewport
  )

  return intersects
}

/**
 * Filter objects to only those visible in viewport
 * @param objects - All canvas objects
 * @param viewport - Current viewport
 * @param scale - Current zoom scale
 * @param padding - Padding around viewport
 * @returns Array of visible objects
 */
export function getVisibleObjects(
  objects: CanvasObject[],
  viewport: Viewport,
  scale: number,
  padding?: number
): CanvasObject[] {
  return objects.filter(obj =>
    isObjectInViewport(obj, viewport, scale, padding)
  )
}

/**
 * Get statistics about visible vs total objects (for debugging)
 */
export function getViewportStats(
  objects: CanvasObject[],
  viewport: Viewport,
  scale: number
) {
  const visible = getVisibleObjects(objects, viewport, scale)

  return {
    total: objects.length,
    visible: visible.length,
    culled: objects.length - visible.length,
    cullingRatio: objects.length > 0
      ? ((objects.length - visible.length) / objects.length * 100).toFixed(1) + '%'
      : '0%'
  }
}

