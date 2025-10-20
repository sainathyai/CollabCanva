import OpenAI from 'openai';
import { canvasFunctions, type AIFunctionName, type AIFunctionParams } from './ai-functions';
import type { CanvasObject } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export interface AIContext {
  objects: CanvasObject[];
  selectedIds: Set<string>;
}

export interface AIResponse {
  success: boolean;
  message: string;
  functionCall?: {
    name: AIFunctionName;
    parameters: AIFunctionParams;
  };
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Process AI command and get function call response
export async function processAICommand(
  prompt: string,
  context: AIContext,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  try {
    // Prepare context information for the AI
    const contextMessage = `
Current canvas state:
- Total objects: ${context.objects.length}
- Selected objects: ${context.selectedIds.size}
- Object types present: ${getUniqueTypes(context.objects).join(', ')}
Available shape types: rectangle, circle, triangle, star, ellipse, roundedRect, diamond, pentagon, polygon, arrow, line, text
    `.trim();

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
    ];

    // Add conversation history (last 10 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt
    });

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
    });

    const choice = response.choices[0];

    // Check if AI wants to call a function (new tools format)
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      const functionName = toolCall.function.name as AIFunctionName;
      const parameters = JSON.parse(toolCall.function.arguments);

      return {
        success: true,
        message: choice.message.content || 'Executing command...',
        functionCall: {
          name: functionName,
          parameters
        }
      };
    }

    // Regular message response (no function call)
    return {
      success: true,
      message: choice.message.content || 'I understand, but I need more information to help you.'
    };

  } catch (error: any) {
    console.error('AI Service Error:', error);

    // Handle specific error cases
    if (error.message?.includes('API key')) {
      return {
        success: false,
        message: 'OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.',
        error: error.message
      };
    }

    if (error.message?.includes('rate limit')) {
      return {
        success: false,
        message: 'Rate limit exceeded. Please try again in a moment.',
        error: error.message
      };
    }

    return {
      success: false,
      message: 'Sorry, I encountered an error processing your request. Please try again.',
      error: error.message || 'Unknown error'
    };
  }
}

// Helper function to get unique shape types from objects
function getUniqueTypes(objects: CanvasObject[]): string[] {
  const types = new Set(objects.map(obj => obj.type));
  return Array.from(types);
}

// Validate that OpenAI API key is configured
export function isAIConfigured(): boolean {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return Boolean(apiKey && apiKey !== 'your-openai-api-key-here');
}

// Get a user-friendly error message if AI is not configured
export function getConfigurationMessage(): string {
  if (!isAIConfigured()) {
    return 'AI features require an OpenAI API key. Please add VITE_OPENAI_API_KEY to your .env file. Get your API key from https://platform.openai.com/api-keys';
  }
  return '';
}

