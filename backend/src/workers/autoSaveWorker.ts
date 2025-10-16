/**
 * Auto-Save Worker
 *
 * Background worker that runs every 5 seconds to save modified projects to DynamoDB.
 * This batch approach is more efficient than saving on every single change.
 */

import { logger } from '../utils/logger.js'
import { getDirtyProjects, clearDirty } from '../state/dirtyFlags.js'
import { getAllObjectsForProject } from '../state/canvasState.js'
import { saveObjects } from '../services/objectService.js'
import { recordSave, recordSaveError } from '../monitoring/autoSaveMetrics.js'

// Configuration
const SAVE_INTERVAL_MS = 5000 // 5 seconds
let autoSaveTimer: NodeJS.Timeout | null = null
let isRunning = false

/**
 * Main auto-save loop
 * Runs every 5 seconds to save dirty projects
 */
async function autoSaveLoop(): Promise<void> {
  if (!isRunning) {
    return
  }

  const startTime = Date.now()
  const dirtyProjects = getDirtyProjects()

  if (dirtyProjects.length === 0) {
    logger.debug('[AutoSave] No dirty projects to save')
    return
  }

  logger.info(`[AutoSave] Starting save for ${dirtyProjects.length} projects`)

  let totalObjectsSaved = 0
  let successfulProjects = 0
  let failedProjects = 0

  for (const [projectId, lastModified] of dirtyProjects) {
    try {
      // Get all objects for this project from memory
      const objects = getAllObjectsForProject(projectId)

      if (objects.length === 0) {
        logger.debug(`[AutoSave] Project ${projectId} has no objects, skipping`)
        clearDirty(projectId)
        continue
      }

      logger.debug(`[AutoSave] Saving ${objects.length} objects for project ${projectId}`)

      // Save to DynamoDB in batches
      const savedCount = await saveObjects(projectId, objects)

      if (savedCount === objects.length) {
        // All objects saved successfully
        clearDirty(projectId)
        successfulProjects++
        totalObjectsSaved += savedCount

        const ageSeconds = Math.round((Date.now() - lastModified) / 1000)
        logger.info(`[AutoSave] ✅ Saved ${savedCount} objects for ${projectId} (age: ${ageSeconds}s)`)

        // Record metrics
        recordSave(projectId, savedCount, Date.now() - startTime)
      } else {
        // Partial save
        failedProjects++
        logger.warn(`[AutoSave] ⚠️  Partial save for ${projectId}: ${savedCount}/${objects.length} objects`)
        recordSaveError(projectId, new Error(`Partial save: ${savedCount}/${objects.length}`))
      }

    } catch (error) {
      failedProjects++
      logger.error(`[AutoSave] ❌ Failed to save project ${projectId}:`, error)
      recordSaveError(projectId, error)
      // Don't clear dirty flag - will retry next interval
    }
  }

  const duration = Date.now() - startTime
  logger.info(`[AutoSave] Completed: ${successfulProjects} saved, ${failedProjects} failed, ${totalObjectsSaved} objects, ${duration}ms`)
}

/**
 * Start the auto-save worker
 */
export function startAutoSaveWorker(): void {
  if (isRunning) {
    logger.warn('[AutoSave] Worker already running')
    return
  }

  isRunning = true

  // Run immediately on start
  logger.info(`[AutoSave] Worker starting (interval: ${SAVE_INTERVAL_MS}ms)`)
  autoSaveLoop().catch(err => {
    logger.error('[AutoSave] Error in initial save loop:', err)
  })

  // Then run every 5 seconds
  autoSaveTimer = setInterval(() => {
    autoSaveLoop().catch(err => {
      logger.error('[AutoSave] Error in save loop:', err)
    })
  }, SAVE_INTERVAL_MS)

  logger.info('✅ Auto-save worker started')
}

/**
 * Stop the auto-save worker
 */
export function stopAutoSaveWorker(): void {
  if (!isRunning) {
    logger.warn('[AutoSave] Worker not running')
    return
  }

  isRunning = false

  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }

  logger.info('Auto-save worker stopped')
}

/**
 * Check if auto-save worker is running
 */
export function isAutoSaveRunning(): boolean {
  return isRunning
}

/**
 * Get auto-save configuration
 */
export function getAutoSaveConfig(): {
  intervalMs: number
  isRunning: boolean
} {
  return {
    intervalMs: SAVE_INTERVAL_MS,
    isRunning
  }
}

