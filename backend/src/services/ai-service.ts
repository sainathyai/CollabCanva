import OpenAI from 'openai'
import { env } from '../env.js'
import { logger } from '../utils/logger.js'

// Initialize OpenAI client
let openai: OpenAI | null = null

if (env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY
  })
  logger.info('✅ OpenAI client initialized')
} else {
  logger.warn('⚠️  OpenAI API key not configured - AI features will be disabled')
}

// AI Function definitions (same as frontend)
export const canvasFunctions = [
  {
    name: 'load_template',
    description: 'Load a predefined template onto the canvas. Templates include animals (cat, dog, bird, fish, rabbit, butterfly, bear), humans (stick-figure, emoji-face, simple-person), objects (house, tree, car, sun, rocket, flower, heart, cloud, moon, rainbow), and scenes (park-scene, city-scene, beach-scene). Use this when user asks to "create a cat", "add a house", "draw a person", "make a heart", etc.',
    parameters: {
      type: 'object',
      properties: {
        templateName: {
          type: 'string',
          enum: ['cat', 'dog', 'bird', 'fish', 'rabbit', 'butterfly', 'bear', 'stick-figure', 'emoji-face', 'simple-person', 'house', 'tree', 'car', 'sun', 'rocket', 'flower', 'heart', 'cloud', 'moon', 'rainbow', 'park-scene', 'city-scene', 'beach-scene'],
          description: 'The name of the template to load'
        },
        x: {
          type: 'number',
          description: 'X position where the template should be placed (default: center)',
          minimum: 0
        },
        y: {
          type: 'number',
          description: 'Y position where the template should be placed (default: center)',
          minimum: 0
        }
      },
      required: ['templateName']
    }
  },
  {
    name: 'export_canvas',
    description: 'Export the current canvas as a PNG image file. Use this when user asks to "save as image", "download as PNG", "export canvas", "save my work", etc.',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name for the exported file (without extension)',
          default: 'canvas-export'
        },
        quality: {
          type: 'number',
          description: 'Image quality from 0.1 to 1.0 (default: 1.0)',
          minimum: 0.1,
          maximum: 1.0
        }
      },
      required: []
    }
  },
  {
    name: 'generate_random_objects',
    description: 'Generate multiple random shapes with random colors and positions. Use this when user asks for "random objects", "surprise me", or wants variety without specifying exact shape types.',
    parameters: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of random objects to generate (default: 5)',
          minimum: 1,
          maximum: 100
        }
      },
      required: ['count']
    }
  },
  {
    name: 'create_shape',
    description: 'Create one or more shapes of a SPECIFIC type. Use this when user specifies the exact shape type (e.g., "create 3 circles", "add a rectangle").',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['rectangle', 'circle', 'triangle', 'star', 'ellipse', 'roundedRect', 'diamond', 'pentagon', 'polygon', 'arrow', 'line', 'text'],
          description: 'The type of shape to create'
        },
        count: {
          type: 'number',
          description: 'Number of shapes to create (default: 1)',
          minimum: 1,
          maximum: 50
        },
        color: {
          type: 'string',
          description: 'Color of the shape in hex format (e.g., #FF0000). If not provided, will use random color'
        },
        text: {
          type: 'string',
          description: 'Text content (only for text shapes)'
        },
        width: {
          type: 'number',
          description: 'Width of the shape in pixels',
          minimum: 10,
          maximum: 500
        },
        height: {
          type: 'number',
          description: 'Height of the shape in pixels',
          minimum: 10,
          maximum: 500
        }
      },
      required: ['type']
    }
  },
  {
    name: 'modify_color',
    description: 'Change the color of objects on the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to modify: all, selected, or specific shape type'
        },
        color: {
          type: 'string',
          description: 'New color in hex format (e.g., #0000FF)'
        }
      },
      required: ['selector', 'color']
    }
  },
  {
    name: 'move_objects',
    description: 'Move objects on the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to move'
        },
        dx: {
          type: 'number',
          description: 'Horizontal movement in pixels (positive = right, negative = left)'
        },
        dy: {
          type: 'number',
          description: 'Vertical movement in pixels (positive = down, negative = up)'
        }
      },
      required: ['selector', 'dx', 'dy']
    }
  },
  {
    name: 'resize_objects',
    description: 'Resize objects on the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to resize'
        },
        scale: {
          type: 'number',
          description: 'Scale multiplier (e.g., 2 = double size, 0.5 = half size)',
          minimum: 0.1,
          maximum: 5
        }
      },
      required: ['selector', 'scale']
    }
  },
  {
    name: 'rotate_objects',
    description: 'Rotate objects on the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to rotate'
        },
        degrees: {
          type: 'number',
          description: 'Rotation angle in degrees (positive = clockwise, negative = counter-clockwise)'
        }
      },
      required: ['selector', 'degrees']
    }
  },
  {
    name: 'delete_objects',
    description: 'Delete objects from the canvas',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'text'],
          description: 'Which objects to delete'
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'arrange_objects',
    description: 'Arrange objects in a specific layout pattern',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['all', 'selected'],
          description: 'Which objects to arrange'
        },
        arrangement: {
          type: 'string',
          enum: ['grid', 'circle', 'line-horizontal', 'line-vertical', 'align-left', 'align-center', 'align-right'],
          description: 'How to arrange the objects'
        },
        spacing: {
          type: 'number',
          description: 'Spacing between objects in pixels',
          minimum: 0,
          maximum: 200
        }
      },
      required: ['selector', 'arrangement']
    }
  },
  {
    name: 'duplicate_objects',
    description: 'Duplicate selected objects with optional offset',
    parameters: {
      type: 'object',
      properties: {
        selector: {
          type: 'string',
          enum: ['selected', 'all'],
          description: 'Which objects to duplicate'
        },
        count: {
          type: 'number',
          description: 'Number of times to duplicate',
          minimum: 1,
          maximum: 10
        },
        offset: {
          type: 'number',
          description: 'Offset in pixels for each duplicate',
          minimum: 0,
          maximum: 100
        }
      },
      required: ['selector']
    }
  },
  {
    name: 'delete_random_objects',
    description: 'Randomly select and delete a specified number of objects from the canvas. Use this when user wants to reduce clutter or randomly remove objects.',
    parameters: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of random objects to delete',
          minimum: 1,
          maximum: 100
        }
      },
      required: ['count']
    }
  },
  {
    name: 'count_objects',
    description: 'Count the number of objects on the canvas. Can count all objects or filter by specific shape type. Use this when user asks "how many circles?", "count all objects", etc.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['all', 'rectangle', 'circle', 'triangle', 'star', 'ellipse', 'roundedRect', 'diamond', 'pentagon', 'polygon', 'arrow', 'line', 'text'],
          description: 'Type of objects to count. Use "all" to count all objects regardless of type.'
        }
      },
      required: ['type']
    }
  }
]

export interface AIContext {
  objects: Array<{
    id: string
    type: string
    x?: number
    y?: number
    width?: number
    height?: number
    rotation?: number
    color?: string
    text?: string
  }>
  selectedIds: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  success: boolean
  message: string
  functionCall?: {
    name: string
    parameters: Record<string, any>
  }
  error?: string
}

// Helper function to get unique shape types from objects
function getUniqueTypes(objects: AIContext['objects']): string[] {
  const types = new Set(objects.map(obj => obj.type))
  return Array.from(types)
}

// Process AI command and get function call response
export async function processAICommand(
  prompt: string,
  context: AIContext,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  if (!openai) {
    return {
      success: false,
      message: 'OpenAI API key not configured. AI features are disabled.',
      error: 'OPENAI_API_KEY not set'
    }
  }

  try {
    // Prepare context information for the AI
    const contextMessage = `
Current canvas state:
- Total objects: ${context.objects.length}
- Selected objects: ${context.selectedIds.length}
- Object types present: ${getUniqueTypes(context.objects).join(', ')}
Available shape types: rectangle, circle, triangle, star, ellipse, roundedRect, diamond, pentagon, polygon, arrow, line, text
    `.trim()

    // Build messages array with conversation history
    const messages: any[] = [
      {
        role: 'system',
        content: `You are a helpful canvas manipulation assistant. You help users create, modify, and arrange shapes on a collaborative canvas.

${contextMessage}

AVAILABLE CAPABILITIES:
1. TEMPLATES: Use load_template function when users ask to create animals, people, or objects:
   - Animals: cat, dog, bird, fish
   - Humans: stick-figure, emoji-face, simple-person
   - Objects: house, tree, car, sun, rocket, flower
   - Scenes: rainbow, park-scene, beach-scene
   Examples: "create a cat", "draw a house", "add a dog"

2. EXPORT: Use export_canvas function when users want to save/download:
   Examples: "export as PNG", "save canvas", "download image", "export with filename my-art"

3. SHAPE CREATION: Use create_shape for specific shapes
   Available: rectangle, circle, triangle, star, ellipse, roundedRect, diamond, pentagon, polygon, arrow, line, text

4. RANDOM OBJECTS: Use generate_random_objects for variety
   - System handles batching automatically for large counts
   - For 100+ objects, inform user about batching but call function ONCE with full count

When users make requests, intelligently choose the right function. Be helpful and understand natural language commands.`
      }
    ]

    // Add conversation history (last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10)
    messages.push(...recentHistory)

    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt
    })

    // Call OpenAI with function calling (using new tools format)
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      tools: canvasFunctions.map(func => ({
        type: 'function' as const,
        function: func
      })),
      tool_choice: 'auto',
      temperature: 0.7
    })

    const choice = response.choices[0]

    // Check if AI wants to call a function (new tools format)
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0]

      // Type guard: ensure this is a function tool call
      if (toolCall.type === 'function' && 'function' in toolCall) {
        const functionName = toolCall.function.name
        const parameters = JSON.parse(toolCall.function.arguments)

        return {
          success: true,
          message: choice.message.content || 'Executing command...',
          functionCall: {
            name: functionName,
            parameters
          }
        }
      }
    }

    // Regular message response (no function call)
    return {
      success: true,
      message: choice.message.content || 'I understand, but I need more information to help you.'
    }
  } catch (error: any) {
    logger.error('AI Service Error:', error)

    // Handle specific error cases
    if (error.message?.includes('API key')) {
      return {
        success: false,
        message: 'OpenAI API key not configured or invalid.',
        error: error.message
      }
    }

    if (error.message?.includes('rate limit')) {
      return {
        success: false,
        message: 'Rate limit exceeded. Please try again in a moment.',
        error: error.message
      }
    }

    return {
      success: false,
      message: 'Sorry, I encountered an error processing your request. Please try again.',
      error: error.message || 'Unknown error'
    }
  }
}

// Check if AI is configured
export function isAIConfigured(): boolean {
  return Boolean(env.OPENAI_API_KEY)
}

