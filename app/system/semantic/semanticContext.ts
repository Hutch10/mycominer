/**
 * Semantic Context Engine
 * 
 * Maintains rolling conversation context per session.
 * Enables context-aware agent responses and semantic analysis.
 */

export interface ContextMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SessionContext {
  sessionId: string;
  messages: ContextMessage[];
  createdAt: string;
  lastUpdated: string;
  metadata: {
    messageCount: number;
    totalTokens?: number;
    topics?: string[];
  };
}

class SemanticContextEngine {
  private contexts: Map<string, SessionContext> = new Map();
  private maxMessagesPerSession: number = 50; // Rolling window size
  private maxSessions: number = 100; // Keep last 100 sessions

  /**
   * Initialize a new session context
   */
  initializeSession(sessionId: string): SessionContext {
    if (this.contexts.has(sessionId)) {
      return this.contexts.get(sessionId)!;
    }

    const context: SessionContext = {
      sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      metadata: {
        messageCount: 0,
      },
    };

    this.contexts.set(sessionId, context);
    this.trimSessions();
    
    return context;
  }

  /**
   * Add a message to session context
   */
  addMessage(
    sessionId: string,
    role: 'user' | 'agent' | 'system',
    content: string,
    metadata: Record<string, any> = {}
  ): void {
    const context = this.initializeSession(sessionId);

    const message: ContextMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    };

    context.messages.push(message);
    
    // Maintain rolling window
    if (context.messages.length > this.maxMessagesPerSession) {
      context.messages = context.messages.slice(-this.maxMessagesPerSession);
    }

    context.lastUpdated = new Date().toISOString();
    context.metadata.messageCount = context.messages.length;

    this.contexts.set(sessionId, context);
  }

  /**
   * Get full context for a session
   */
  getContext(sessionId: string): SessionContext | null {
    return this.contexts.get(sessionId) || null;
  }

  /**
   * Get messages for a session
   */
  getMessages(sessionId: string, limit?: number): ContextMessage[] {
    const context = this.contexts.get(sessionId);
    if (!context) return [];

    if (limit) {
      return context.messages.slice(-limit);
    }
    return context.messages;
  }

  /**
   * Get recent messages across all sessions
   */
  getRecentMessages(limit: number = 20): ContextMessage[] {
    const allMessages: (ContextMessage & { sessionId: string })[] = [];

    for (const [sessionId, context] of this.contexts.entries()) {
      context.messages.forEach((msg) => {
        allMessages.push({ ...msg, sessionId });
      });
    }

    // Sort by timestamp descending
    allMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return allMessages.slice(0, limit);
  }

  /**
   * Get context summary for a session
   */
  getContextSummary(sessionId: string): string {
    const context = this.contexts.get(sessionId);
    if (!context || context.messages.length === 0) {
      return 'No context available';
    }

    // Build a summary of the conversation
    const summary = context.messages
      .slice(-10) // Last 10 messages
      .map((msg) => `${msg.role}: ${msg.content.substring(0, 100)}...`)
      .join('\n');

    return summary;
  }

  /**
   * Build context string for agent consumption
   */
  buildContextString(sessionId: string, maxMessages: number = 10): string {
    const messages = this.getMessages(sessionId, maxMessages);
    
    if (messages.length === 0) {
      return '';
    }

    return messages
      .map((msg) => {
        if (msg.role === 'user') {
          return `Human: ${msg.content}`;
        } else if (msg.role === 'agent') {
          return `Assistant: ${msg.content}`;
        } else {
          return `System: ${msg.content}`;
        }
      })
      .join('\n\n');
  }

  /**
   * Search for messages containing specific keywords
   */
  searchMessages(sessionId: string, query: string): ContextMessage[] {
    const context = this.contexts.get(sessionId);
    if (!context) return [];

    const lowerQuery = query.toLowerCase();
    return context.messages.filter((msg) =>
      msg.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): string[] {
    return Array.from(this.contexts.keys());
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): {
    messageCount: number;
    userMessages: number;
    agentMessages: number;
    systemMessages: number;
    duration: number;
  } | null {
    const context = this.contexts.get(sessionId);
    if (!context) return null;

    return {
      messageCount: context.messages.length,
      userMessages: context.messages.filter((m) => m.role === 'user').length,
      agentMessages: context.messages.filter((m) => m.role === 'agent').length,
      systemMessages: context.messages.filter((m) => m.role === 'system').length,
      duration: new Date(context.lastUpdated).getTime() - new Date(context.createdAt).getTime(),
    };
  }

  /**
   * Clear context for a specific session
   */
  clearSession(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  /**
   * Clear all contexts
   */
  clearAll(): void {
    this.contexts.clear();
  }

  /**
   * Trim old sessions to prevent memory overflow
   */
  private trimSessions(): void {
    if (this.contexts.size > this.maxSessions) {
      // Remove oldest sessions
      const sortedSessions = Array.from(this.contexts.entries()).sort((a, b) => 
        new Date(a[1].lastUpdated).getTime() - new Date(b[1].lastUpdated).getTime()
      );

      const sessionsToRemove = sortedSessions.slice(0, this.contexts.size - this.maxSessions);
      sessionsToRemove.forEach(([sessionId]) => {
        this.contexts.delete(sessionId);
      });
    }
  }

  /**
   * Export context as JSON
   */
  exportContext(sessionId: string): string {
    const context = this.contexts.get(sessionId);
    return JSON.stringify(context, null, 2);
  }

  /**
   * Get global statistics
   */
  getGlobalStats(): {
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
  } {
    let totalMessages = 0;
    
    for (const context of this.contexts.values()) {
      totalMessages += context.messages.length;
    }

    return {
      totalSessions: this.contexts.size,
      totalMessages,
      averageMessagesPerSession: this.contexts.size > 0 
        ? totalMessages / this.contexts.size 
        : 0,
    };
  }
}

// Singleton instance
const semanticContextEngine = new SemanticContextEngine();

export default semanticContextEngine;
