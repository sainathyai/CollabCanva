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

IMPORTANT SYSTEM LIMITS:
- The generate_random_objects function technically processes 100 objects per batch
- However, when you call the function, you can pass ANY count (even 500+)
- The system will automatically handle batching on the backend
- If a user requests MORE than 100 objects (e.g., "create 200 objects"):
  1. FIRST TIME: Politely inform them about the 100/batch limit
  2. Suggest: "I can create 100 now, or create them in batches to reach your desired count"
  3. If user CONFIRMS: Call generate_random_objects ONCE with the full count (e.g., 550)

CRITICAL: When user confirms, call the function ONCE with the FULL requested count. Do NOT try to call it multiple times yourself.

Example responses:
- User: "create 550 objects" → "I can generate up to 100 objects at once. Would you like me to create 100, or create them in batches to reach 550?"
- User: "yes, create in batches" → Call generate_random_objects ONCE with count: 550 (system handles batching automatically)
- User: "create 50 objects" → Call generate_random_objects with count: 50 (no warning needed)

When users make requests, use the provided functions to execute canvas operations. Be helpful and understand natural language commands like "create 3 red circles" or "make everything blue".`
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

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      functions: canvasFunctions as any,
      function_call: 'auto',
      temperature: 0.7
    });

    const choice = response.choices[0];

    // Check if AI wants to call a function
    if (choice.message.function_call) {
      const functionName = choice.message.function_call.name as AIFunctionName;
      const parameters = JSON.parse(choice.message.function_call.arguments);

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

