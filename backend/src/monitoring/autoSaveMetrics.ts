/**
 * Auto-Save Metrics
 * 
 * Tracks performance and success metrics for the auto-save worker.
 * Useful for monitoring and debugging in production.
 */

import { logger } from '../utils/logger.js'

interface SaveMetric {
  projectId: string
  objectCount: number
  durationMs: number
  timestamp: number
}

interface SaveError {
  projectId: string
  error: unknown
  timestamp: number
}

// In-memory metrics storage
const recentSaves: SaveMetric[] = []
const recentErrors: SaveError[] = []
const MAX_HISTORY = 100

// Aggregate stats
let totalSaves = 0
let totalObjectsSaved = 0
let totalErrors = 0
let totalDurationMs = 0

/**
 * Record a successful save operation
 */
export function recordSave(projectId: string, objectCount: number, durationMs: number): void {
  const metric: SaveMetric = {
    projectId,
    objectCount,
    durationMs,
    timestamp: Date.now()
  }
  
  recentSaves.push(metric)
  if (recentSaves.length > MAX_HISTORY) {
    recentSaves.shift()
  }
  
  totalSaves++
  totalObjectsSaved += objectCount
  totalDurationMs += durationMs
  
  logger.debug(`[Metrics] Recorded save: ${projectId}, ${objectCount} objects, ${durationMs}ms`)
}

/**
 * Record a save error
 */
export function recordSaveError(projectId: string, error: unknown): void {
  const errorRecord: SaveError = {
    projectId,
    error,
    timestamp: Date.now()
  }
  
  recentErrors.push(errorRecord)
  if (recentErrors.length > MAX_HISTORY) {
    recentErrors.shift()
  }
  
  totalErrors++
  
  logger.debug(`[Metrics] Recorded error for ${projectId}`)
}

/**
 * Get current metrics summary
 */
export function getMetrics(): {
  totalSaves: number
  totalObjectsSaved: number
  totalErrors: number
  averageDurationMs: number
  successRate: number
  recentSaves: number
  recentErrors: number
  lastSaveTimestamp: number | null
} {
  const averageDurationMs = totalSaves > 0 ? Math.round(totalDurationMs / totalSaves) : 0
  const totalOperations = totalSaves + totalErrors
  const successRate = totalOperations > 0 ? (totalSaves / totalOperations) * 100 : 100
  
  const lastSaveTimestamp = recentSaves.length > 0 
    ? recentSaves[recentSaves.length - 1].timestamp 
    : null
  
  return {
    totalSaves,
    totalObjectsSaved,
    totalErrors,
    averageDurationMs,
    successRate: Math.round(successRate * 100) / 100, // 2 decimal places
    recentSaves: recentSaves.length,
    recentErrors: recentErrors.length,
    lastSaveTimestamp
  }
}

/**
 * Get detailed recent save history
 */
export function getRecentSaves(limit: number = 10): SaveMetric[] {
  return recentSaves.slice(-limit).reverse() // Most recent first
}

/**
 * Get detailed recent error history
 */
export function getRecentErrors(limit: number = 10): Array<{
  projectId: string
  errorMessage: string
  timestamp: number
}> {
  return recentErrors.slice(-limit).reverse().map(e => ({
    projectId: e.projectId,
    errorMessage: e.error instanceof Error ? e.error.message : String(e.error),
    timestamp: e.timestamp
  }))
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearMetrics(): void {
  recentSaves.length = 0
  recentErrors.length = 0
  totalSaves = 0
  totalObjectsSaved = 0
  totalErrors = 0
  totalDurationMs = 0
  logger.info('[Metrics] All metrics cleared')
}

/**
 * Log current metrics summary
 */
export function logMetrics(): void {
  const metrics = getMetrics()
  logger.info('[Metrics] Auto-Save Summary:', {
    totalSaves: metrics.totalSaves,
    totalObjects: metrics.totalObjectsSaved,
    totalErrors: metrics.totalErrors,
    avgDuration: `${metrics.averageDurationMs}ms`,
    successRate: `${metrics.successRate}%`
  })
}

// Log metrics every 5 minutes in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    if (totalSaves > 0 || totalErrors > 0) {
      logMetrics()
    }
  }, 5 * 60 * 1000)
}

