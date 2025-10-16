/**
 * Metrics HTTP Endpoint
 *
 * Returns auto-save performance metrics and dirty flag statistics
 */

import type { IncomingMessage, ServerResponse } from 'http'
import { getMetrics, getRecentSaves, getRecentErrors } from '../monitoring/autoSaveMetrics.js'
import { getDirtyStats } from '../state/dirtyFlags.js'
import { isAutoSaveRunning, getAutoSaveConfig } from '../workers/autoSaveWorker.js'
import { logger } from '../utils/logger.js'

export function metricsHandler(req: IncomingMessage, res: ServerResponse): void {
  try {
    const saveMetrics = getMetrics()
    const dirtyStats = getDirtyStats()
    const recentSaves = getRecentSaves(5)
    const recentErrors = getRecentErrors(5)
    const autoSaveConfig = getAutoSaveConfig()

    const response = {
      timestamp: new Date().toISOString(),
      autoSave: {
        isRunning: isAutoSaveRunning(),
        intervalMs: autoSaveConfig.intervalMs,
        totalSaves: saveMetrics.totalSaves,
        totalObjectsSaved: saveMetrics.totalObjectsSaved,
        totalErrors: saveMetrics.totalErrors,
        averageDurationMs: saveMetrics.averageDurationMs,
        successRate: saveMetrics.successRate,
        lastSaveTimestamp: saveMetrics.lastSaveTimestamp
          ? new Date(saveMetrics.lastSaveTimestamp).toISOString()
          : null
      },
      dirtyProjects: {
        count: dirtyStats.totalDirty,
        oldestModification: dirtyStats.oldestModification
          ? new Date(dirtyStats.oldestModification).toISOString()
          : null,
        projectIds: dirtyStats.projects
      },
      recentActivity: {
        saves: recentSaves,
        errors: recentErrors
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(response, null, 2))

    logger.debug('[Metrics] Endpoint accessed')
  } catch (error) {
    logger.error('[Metrics] Error generating metrics:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Failed to generate metrics' }))
  }
}

