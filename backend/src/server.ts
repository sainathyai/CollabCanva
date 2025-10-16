import http from 'http'
import { env } from './env.js'
import { logger } from './utils/logger.js'
import { healthHandler } from './http/health.js'
import { metricsHandler } from './http/metrics.js'
import { projectsHandler } from './http/projects.js'
import { setupWebSocket } from './ws/index.js'
import { initializeDatabase } from './db/dynamodb.js'
import { loadFromDatabase, DEFAULT_PROJECT_ID } from './state/canvasState.js'
import { startAutoSaveWorker, stopAutoSaveWorker } from './workers/autoSaveWorker.js'

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  const origin = req.headers.origin
  if (origin && env.ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Route handlers
  if (req.url === '/health' && req.method === 'GET') {
    healthHandler(req, res)
    return
  }

  if (req.url === '/metrics' && req.method === 'GET') {
    metricsHandler(req, res)
    return
  }

  // Project API routes
  if (req.url?.startsWith('/api/projects')) {
    projectsHandler(req, res)
    return
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

// Set up WebSocket server
setupWebSocket(server)

// Initialize database and load state
async function initializeServer() {
  logger.info('🚀 Initializing CollabCanvas server...')

  // Initialize DynamoDB connection
  try {
    await initializeDatabase()
    logger.info('✅ Database initialization complete')

    // Load existing objects from database into memory (default project for backward compatibility)
    const loadedCount = await loadFromDatabase(DEFAULT_PROJECT_ID)
    if (loadedCount > 0) {
      logger.info(`📦 Loaded ${loadedCount} objects from database`)
    } else {
      logger.info('📦 No existing objects found - starting fresh')
    }
  } catch (error) {
    logger.error('⚠️  Database initialization failed:', error)
    logger.warn('⚠️  Server will run in memory-only mode')
    logger.warn('⚠️  Data will NOT persist across restarts')
  }

  // Start auto-save worker for periodic database syncing
  try {
    startAutoSaveWorker()
    logger.info('✅ Auto-save worker started (5 second interval)')
  } catch (error) {
    logger.error('⚠️  Auto-save worker failed to start:', error)
    logger.warn('⚠️  Server will continue without auto-save')
  }

  // Start server regardless of DB status (graceful degradation)
  server.listen(env.PORT, () => {
    logger.info('🎨 CollabCanvas Backend Ready!')
    logger.info(`Server running on port ${env.PORT}`)
    logger.info(`Environment: ${env.NODE_ENV}`)
    logger.info(`Allowed origins: ${env.ALLOWED_ORIGINS.join(', ')}`)
    logger.info(`Health check: http://localhost:${env.PORT}/health`)
    logger.info(`WebSocket: ws://localhost:${env.PORT}`)
  })
}

// Start initialization
initializeServer().catch(err => {
  logger.error('Failed to initialize server:', err)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully')
  stopAutoSaveWorker()
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, closing server gracefully')
  stopAutoSaveWorker()
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

