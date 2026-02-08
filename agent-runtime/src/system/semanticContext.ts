/**
 * Semantic Context Engine - Manages conversation history per session
 */

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SessionContext {
  sessionId: string;
  messages: Message[];
  createdAt: string;
  lastUpdate: string;
}

class SemanticContextEngine {
  private contexts: Map<string, SessionContext> = new Map();
  private maxMessagesPerSession: number = 50;
  private maxSessions: number = 100;

  addMessage(sessionId: string, role: 'user' | 'agent' | 'system', content: string, metadata?: Record<string, any>): void {
    let context = this.contexts.get(sessionId);

    if (!context) {
      context = {
        sessionId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
      };
      this.contexts.set(sessionId, context);
    }

    const message: Message = {
      id: `${sessionId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    };

    context.messages.push(message);
    context.lastUpdate = new Date().toISOString();

    // Trim old messages
    if (context.messages.length > this.maxMessagesPerSession) {
      context.messages = context.messages.slice(-this.maxMessagesPerSession);
    }

    // Trim old sessions
    if (this.contexts.size > this.maxSessions) {
      const sortedSessions = Array.from(this.contexts.entries())
        .sort((a, b) => new Date(a[1].lastUpdate).getTime() - new Date(b[1].lastUpdate).getTime());
      
      const toRemove = sortedSessions.slice(0, sortedSessions.length - this.maxSessions);
      toRemove.forEach(([sessionId]) => this.contexts.delete(sessionId));
    }
  }

  getMessages(sessionId: string, limit?: number): Message[] {
    const context = this.contexts.get(sessionId);
    if (!context) return [];
    
    return limit ? context.messages.slice(-limit) : context.messages;
  }

  getContext(sessionId: string): SessionContext | undefined {
    return this.contexts.get(sessionId);
  }

  buildContextString(sessionId: string, maxMessages: number = 10): string {
    const messages = this.getMessages(sessionId, maxMessages);
    
    if (messages.length === 0) {
      return 'No previous conversation history.';
    }

    return messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  getContextSummary(sessionId: string): string {
    const context = this.contexts.get(sessionId);
    if (!context || context.messages.length === 0) {
      return 'No context available';
    }

    return context.messages
      .slice(-10)
      .map(msg => `${msg.role}: ${msg.content.substring(0, 100)}...`)
      .join('\n');
  }

  clearSession(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  getAllSessions(): string[] {
    return Array.from(this.contexts.keys());
  }

  getStats() {
    let totalMessages = 0;
    for (const context of this.contexts.values()) {
      totalMessages += context.messages.length;
    }

    return {
      totalSessions: this.contexts.size,
      totalMessages,
      averageMessagesPerSession: this.contexts.size > 0 ? totalMessages / this.contexts.size : 0,
    };
  }
}

const semanticContextEngine = new SemanticContextEngine();
export default semanticContextEngine;
