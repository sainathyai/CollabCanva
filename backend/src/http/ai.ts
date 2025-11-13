import { IncomingMessage, ServerResponse } from 'http'
import { processAICommand, type AIContext, type ChatMessage } from '../services/ai-service.js'
import { logger } from '../utils/logger.js'

export async function aiHandler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  try {
    // Read request body
    let body = ''
    for await (const chunk of req) {
      body += chunk.toString()
    }

    const data = JSON.parse(body)
    const { prompt, context, conversationHistory = [] } = data

    if (!prompt || typeof prompt !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing or invalid prompt' }))
      return
    }

    if (!context || !context.objects || !Array.isArray(context.objects)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing or invalid context' }))
      return
    }

    // Convert selectedIds from Set to array if needed
    const aiContext: AIContext = {
      objects: context.objects,
      selectedIds: Array.isArray(context.selectedIds)
        ? context.selectedIds
        : context.selectedIds
        ? Array.from(context.selectedIds as Set<string>)
        : []
    }

    const history: ChatMessage[] = conversationHistory || []

    // Process AI command
    const result = await processAICommand(prompt, aiContext, history)

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result))
  } catch (error: any) {
    logger.error('AI handler error:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      })
    )
  }
}

