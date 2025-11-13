import type { AIFunctionName, AIFunctionParams } from './ai-functions';
import type { CanvasObject } from '../types';

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Debug: Always log the API URL to verify it's correct
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_API_URL env:', import.meta.env.VITE_API_URL);

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
    // Convert selectedIds Set to array for API
    const contextForApi = {
      objects: context.objects,
      selectedIds: Array.from(context.selectedIds)
    };

    // Call backend AI API
    const apiUrl = `${API_BASE_URL}/api/ai/chat`;
    console.log('📡 Calling backend AI API:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        context: contextForApi,
        conversationHistory
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result: AIResponse = await response.json();
    return result;
  } catch (error: any) {
    console.error('AI Service Error:', error);

    // Handle network errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return {
        success: false,
        message: 'Unable to connect to AI service. Please check your connection and try again.',
        error: error.message
      };
    }

    // Handle specific error cases
    if (error.message?.includes('API key')) {
      return {
        success: false,
        message: 'OpenAI API key not configured on the server.',
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

// Validate that AI service is available (backend handles the API key)
export function isAIConfigured(): boolean {
  // AI is configured on the backend, so we assume it's available
  // The backend will return appropriate errors if not configured
  return true;
}

// Get a user-friendly error message if AI is not configured
export function getConfigurationMessage(): string {
  // Configuration is handled on the backend
  return '';
}

