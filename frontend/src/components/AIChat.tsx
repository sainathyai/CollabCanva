import { useState, useRef, useEffect } from 'react';
import { processAICommand, isAIConfigured, getConfigurationMessage, type AIContext, type ChatMessage } from '../lib/ai-service';
import type { AIFunctionName, AIFunctionParams } from '../lib/ai-functions';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  context: AIContext;
  onExecuteFunction: (functionName: AIFunctionName, parameters: AIFunctionParams) => string | void;
  isOpen: boolean;
  onToggle: () => void;
}

export function AIChat({ context, onExecuteFunction, isOpen, onToggle }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your AI canvas assistant. I can help you create, modify, and arrange shapes. Try saying "create 3 red circles" or "make all rectangles blue"!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showExamples, setShowExamples] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent wheel events from bubbling to canvas (prevent zoom when scrolling chat)
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleWheel = (e: WheelEvent) => {
      // Always stop propagation to prevent canvas zoom
      e.stopPropagation();
      // Allow the default scroll behavior for the chat
    };

    // Use capture phase to intercept events before they reach canvas
    sidebar.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () => sidebar.removeEventListener('wheel', handleWheel, { capture: true });
  }, []);

  const exampleCommands = [
    'Create a cat 🐱',
    'Draw a rabbit 🐰',
    'Add a butterfly 🦋',
    'Make a heart ❤️',
    'Create a beach scene 🏖️',
    'Draw a rocket 🚀',
    'Add a rainbow 🌈',
    'Export canvas as PNG',
    'Generate 10 random objects',
    'Create 5 blue circles',
    'Make all rectangles red',
    'Arrange selected objects in a grid'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Check if AI is configured
    if (!isAIConfigured()) {
      const configMessage = getConfigurationMessage();
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: configMessage,
        timestamp: new Date()
      }]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert message history to ChatMessage format (exclude welcome message and system messages)
      const conversationHistory: ChatMessage[] = messages
        .filter(m => m.id !== 'welcome' && m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      // Process command with AI (via backend API)
      console.log('🤖🤖🤖 Calling processAICommand - should use backend API');
      const response = await processAICommand(input, context, conversationHistory);

      if (response.success && response.functionCall) {
        // Execute the function (may return a message for info functions like count)
        const result = onExecuteFunction(response.functionCall.name, response.functionCall.parameters);

        // Add success message
        const successMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result || `Done! I executed: ${response.functionCall.name.replace(/_/g, ' ')} with the parameters you specified.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      } else if (response.success) {
        // Just a message response, no function call
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Error occurred
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: response.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Sorry, I encountered an unexpected error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Keep focus in the input field after command execution
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    setShowExamples(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="ai-chat-toggle"
        aria-label="Open AI Assistant"
      >
        🤖 AI Assistant
      </button>
    );
  }

  return (
    <div ref={sidebarRef} className="ai-chat-sidebar">
      <div className="ai-chat-header">
        <h3>🤖 AI Canvas Assistant</h3>
        <button onClick={onToggle} className="ai-chat-close" aria-label="Close AI Assistant">
          ×
        </button>
      </div>

      <div className="ai-chat-status">
        <span className={`status-dot ${!isAIConfigured() ? 'status-dot-error' : ''}`}></span>
        {isAIConfigured() ? (
          <span>AI Ready ({context.objects.length} objects, {context.selectedIds.size} selected)</span>
        ) : (
          <span className="status-error">API Key Required</span>
        )}
      </div>

      <div className="ai-chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`ai-message ai-message-${message.role}`}>
            <div className="ai-message-content">{message.content}</div>
            <div className="ai-message-time">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="ai-message ai-message-assistant">
            <div className="ai-message-content">
              <div className="ai-loading">
                <span className="ai-loading-dot"></span>
                <span className="ai-loading-dot"></span>
                <span className="ai-loading-dot"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showExamples && (
        <div className="ai-examples">
          <div className="ai-examples-header">
            <span>Try these commands:</span>
            <button onClick={() => setShowExamples(false)}>×</button>
          </div>
          <div className="ai-examples-list">
            {exampleCommands.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="ai-example-button"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ai-chat-input-container">
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
          className="ai-examples-toggle"
          aria-label="Show example commands"
        >
          💡
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to create, modify, or arrange shapes..."
          className="ai-chat-input"
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="ai-chat-send"
          aria-label="Send message"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  );
}

