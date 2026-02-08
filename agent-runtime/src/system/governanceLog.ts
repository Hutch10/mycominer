/**
 * Governance Logging System - Records all agent interactions
 */

import { v4 as uuidv4 } from 'uuid';

export interface GovernanceLogEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  userMessage: string;
  agentResponse: string | null;
  responseType: 'streaming' | 'standard' | 'error';
  error: string | null;
  metadata: {
    duration?: number;
    tokenCount?: number;
    model?: string;
    contextSize?: number;
    agentId?: string;
    routingScore?: number;
  };
  status: 'pending' | 'completed' | 'failed';
}

class GovernanceLogger {
  private logs: GovernanceLogEntry[] = [];
  private maxLogs: number = 1000;

  createEntry(sessionId: string, userMessage: string): string {
    const id = uuidv4();
    const entry: GovernanceLogEntry = {
      id,
      timestamp: new Date().toISOString(),
      sessionId,
      userMessage,
      agentResponse: null,
      responseType: 'standard',
      error: null,
      metadata: {},
      status: 'pending',
    };

    this.logs.push(entry);
    
    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    return id;
  }

  completeEntry(id: string, agentResponse: string, metadata?: Partial<GovernanceLogEntry['metadata']>): void {
    const entry = this.logs.find(log => log.id === id);
    if (entry) {
      entry.agentResponse = agentResponse;
      entry.status = 'completed';
      entry.metadata = { ...entry.metadata, ...metadata };
    }
  }

  failEntry(id: string, error: string): void {
    const entry = this.logs.find(log => log.id === id);
    if (entry) {
      entry.error = error;
      entry.status = 'failed';
    }
  }

  getEntry(id: string): GovernanceLogEntry | undefined {
    return this.logs.find(log => log.id === id);
  }

  getAllLogs(limit?: number): GovernanceLogEntry[] {
    console.log('BACKEND MEMORY CHECK: Total logs in array =', this.logs.length);
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }

  getLogsBySession(sessionId: string, limit: number = 50): GovernanceLogEntry[] {
    return this.logs
      .filter(log => log.sessionId === sessionId)
      .slice(-limit);
  }

  getStats() {
    const total = this.logs.length;
    const completed = this.logs.filter(log => log.status === 'completed').length;
    const failed = this.logs.filter(log => log.status === 'failed').length;
    const pending = this.logs.filter(log => log.status === 'pending').length;

    return {
      total,
      completed,
      failed,
      pending,
      successRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

const governanceLogger = new GovernanceLogger();
export default governanceLogger;
