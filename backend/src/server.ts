import http from 'http'
import { env } from './env.js'
import { logger } from './utils/logger.js'
import { healthHandler } from './http/health.js'
import { setupWebSocket } from './ws/index.js'

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

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

// Set up WebSocket server
setupWebSocket(server)

// Start server
server.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`)
  logger.info(`Environment: ${env.NODE_ENV}`)
  logger.info(`Allowed origins: ${env.ALLOWED_ORIGINS.join(', ')}`)
  logger.info(`Health check: http://localhost:${env.PORT}/health`)
  logger.info(`WebSocket: ws://localhost:${env.PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, closing server gracefully')
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
})

