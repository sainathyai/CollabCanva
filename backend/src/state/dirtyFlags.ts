/**
 * Dirty Flag System
 * 
 * Tracks which projects have unsaved changes that need to be persisted to DynamoDB.
 * Used by the auto-save worker to determine which projects need saving.
 */

import { logger } from '../utils/logger.js'

/**
 * Map of projectId to last modification timestamp
 * If a project is in this map, it has unsaved changes
 */
const dirtyProjects = new Map<string, number>()

/**
 * Mark a project as dirty (has unsaved changes)
 * 
 * @param projectId Project that was modified
 */
export function markDirty(projectId: string): void {
  const now = Date.now()
  dirtyProjects.set(projectId, now)
  logger.debug(`Project marked dirty: ${projectId}`)
}

/**
 * Check if a project has unsaved changes
 * 
 * @param projectId Project to check
 * @returns True if project has unsaved changes
 */
export function isDirty(projectId: string): boolean {
  return dirtyProjects.has(projectId)
}

/**
 * Clear dirty flag for a project (after successful save)
 * 
 * @param projectId Project that was saved
 */
export function clearDirty(projectId: string): void {
  const wasRemoved = dirtyProjects.delete(projectId)
  if (wasRemoved) {
    logger.debug(`Project dirty flag cleared: ${projectId}`)
  }
}

/**
 * Get all projects that have unsaved changes
 * 
 * @returns Array of [projectId, lastModifiedTimestamp] tuples
 */
export function getDirtyProjects(): Array<[string, number]> {
  return Array.from(dirtyProjects.entries())
}

/**
 * Get the count of projects with unsaved changes
 * 
 * @returns Number of dirty projects
 */
export function getDirtyProjectCount(): number {
  return dirtyProjects.size
}

/**
 * Get last modification timestamp for a project
 * 
 * @param projectId Project to check
 * @returns Timestamp of last modification, or null if not dirty
 */
export function getLastModified(projectId: string): number | null {
  return dirtyProjects.get(projectId) || null
}

/**
 * Clear all dirty flags (used for testing)
 */
export function clearAllDirty(): void {
  const count = dirtyProjects.size
  dirtyProjects.clear()
  logger.info(`Cleared all dirty flags (${count} projects)`)
}

/**
 * Get dirty flag statistics
 */
export function getDirtyStats(): {
  totalDirty: number
  oldestModification: number | null
  projects: string[]
} {
  if (dirtyProjects.size === 0) {
    return {
      totalDirty: 0,
      oldestModification: null,
      projects: []
    }
  }

  const entries = Array.from(dirtyProjects.entries())
  const oldestTimestamp = Math.min(...entries.map(([_, ts]) => ts))
  
  return {
    totalDirty: dirtyProjects.size,
    oldestModification: oldestTimestamp,
    projects: entries.map(([id, _]) => id)
  }
}

