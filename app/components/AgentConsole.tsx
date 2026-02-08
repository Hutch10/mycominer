'use client';

import React, { useState, useRef, useEffect } from 'react';

// Use Next.js API routes (frontend proxy)
const API_BASE_URL = '/api';

/**
 * AgentConsole Component
 * 
 * Interactive chat interface for the multi-agent system.
 * Sends messages to the agent API and displays streaming responses.
 * 
 * Future enhancements:
 * - Governance visualization
 * - Multi-agent orchestration display
 * - Explainability graph rendering
 * - Context inspection
 */

interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AgentConsoleProps {
  className?: string;
}

export default function AgentConsole({ className = '' }: AgentConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check agent runtime health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/agent`, { 
        method: 'GET',
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      setConnectionStatus(data.status === 'healthy' ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: getSessionId(),
          userId: 'web-user',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Agent request failed');
      }

      const contentType = response.headers.get('content-type');
      
      // Handle streaming response
      if (contentType?.includes('text/event-stream') || contentType?.includes('stream')) {
        await handleStreamingResponse(response);
      } else {
        // Handle standard JSON response
        const data = await response.json();
        const responseContent = data.response || data.message || '';
        const agentMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'agent',
          content: typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentMessage]);
      }

      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the agent runtime is running.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let agentMessageId = `msg_${Date.now()}`;
    let accumulatedContent = '';

    // Add initial streaming message
    const streamingMessage: Message = {
      id: agentMessageId,
      role: 'agent',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, streamingMessage]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Update the streaming message
        setMessages((prev) => 
          prev.map((msg) =>
            msg.id === agentMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Streaming error:', error);
      // Update message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === agentMessageId
            ? { ...msg, content: accumulatedContent + '\n\n[Stream interrupted]', isStreaming: false }
            : msg
        )
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm relative z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Agent Console</h2>
          <span className="flex items-center gap-2 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : connectionStatus === 'disconnected'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
              }`}
            />
            <span className="text-gray-600">
              {connectionStatus === 'connected'
                ? 'Connected'
                : connectionStatus === 'disconnected'
                ? 'Disconnected'
                : 'Checking...'}
            </span>
          </span>
        </div>
        <button
          onClick={checkHealth}
          className="text-sm text-gray-600 hover:text-gray-900 transition"
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg font-medium mb-2">Welcome to MycoMiner Agent Console</p>
            <p className="text-sm">Start a conversation with the multi-agent system</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.role === 'agent'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                <div className="text-xs opacity-70 mb-1">
                  {message.role === 'user' ? 'You' : message.role === 'agent' ? 'Agent' : 'System'}
                  {message.isStreaming && ' • Streaming...'}
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}
                  {message.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />}
                </div>
                <div className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative z-10 border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="z-10 flex-1 bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
            style={{ color: '#000000 !important', backgroundColor: '#ffffff !important', padding: '12px' }}
            rows={2}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Multi-agent system integration • Future: governance logs, semantic context, explainability graphs
        </p>
      </form>
    </div>
  );
}

// Helper to maintain session across messages
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';

  let sessionId = sessionStorage.getItem('mycominer_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('mycominer_session_id', sessionId);
  }
  return sessionId;
}
