/**
 * Database Operation Logger
 *
 * Tracks and logs all DynamoDB operations with timing metrics
 * and success/failure statistics for monitoring and debugging.
 */

import { logger } from './logger.js'

interface OperationMetrics {
  operation: string
  startTime: number
  success: boolean
  duration: number
  error?: unknown
}

// In-memory metrics storage (could be sent to CloudWatch in production)
const metrics: OperationMetrics[] = []
const MAX_METRICS_STORED = 1000

/**
 * Log the start of a database operation
 *
 * @param operation Name of the operation (e.g., "createProject", "saveObject")
 * @returns Start time to pass to logOperationEnd
 */
export function logOperationStart(operation: string): number {
  const startTime = Date.now()
  logger.debug(`[DB] Starting ${operation}`)
  return startTime
}

/**
 * Log the end of a database operation with timing
 *
 * @param operation Name of the operation
 * @param startTime Start time from logOperationStart
 * @param success Whether the operation succeeded
 * @param error Error object if operation failed
 */
export function logOperationEnd(
  operation: string,
  startTime: number,
  success: boolean,
  error?: unknown
): void {
  const duration = Date.now() - startTime

  const metric: OperationMetrics = {
    operation,
    startTime,
    success,
    duration,
    error
  }

  // Store metric (with size limit)
  metrics.push(metric)
  if (metrics.length > MAX_METRICS_STORED) {
    metrics.shift()
  }

  // Log the result
  if (success) {
    logger.info(`[DB] ✅ ${operation} completed in ${duration}ms`)
  } else {
    logger.error(`[DB] ❌ ${operation} failed after ${duration}ms`, error)
  }
}

/**
 * Wrapper function to time a database operation
 *
 * @param operation Name of the operation
 * @param fn Async function to execute
 * @returns Result of the function
 */
export async function timedOperation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = logOperationStart(operation)

  try {
    const result = await fn()
    logOperationEnd(operation, startTime, true)
    return result
  } catch (error) {
    logOperationEnd(operation, startTime, false, error)
    throw error
  }
}

/**
 * Get operation statistics
 *
 * @returns Statistics about recent database operations
 */
export function getOperationStats(): {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  averageDuration: number
  operationCounts: Record<string, number>
} {
  const total = metrics.length
  const successful = metrics.filter(m => m.success).length
  const failed = total - successful
  const avgDuration = total > 0
    ? metrics.reduce((sum, m) => sum + m.duration, 0) / total
    : 0

  // Count operations by type
  const operationCounts: Record<string, number> = {}
  metrics.forEach(m => {
    operationCounts[m.operation] = (operationCounts[m.operation] || 0) + 1
  })

  return {
    totalOperations: total,
    successfulOperations: successful,
    failedOperations: failed,
    averageDuration: Math.round(avgDuration),
    operationCounts
  }
}

/**
 * Log current operation statistics
 */
export function logStats(): void {
  const stats = getOperationStats()
  logger.info('[DB] Operation Statistics:', {
    total: stats.totalOperations,
    successful: stats.successfulOperations,
    failed: stats.failedOperations,
    avgDuration: `${stats.averageDuration}ms`,
    operations: stats.operationCounts
  })
}

/**
 * Clear stored metrics (useful for testing)
 */
export function clearMetrics(): void {
  metrics.length = 0
  logger.debug('[DB] Metrics cleared')
}

// Log stats every 5 minutes in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    if (metrics.length > 0) {
      logStats()
    }
  }, 5 * 60 * 1000)
}

