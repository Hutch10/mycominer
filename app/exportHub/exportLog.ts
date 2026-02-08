/**
 * Export Log
 * Phase 60: Enterprise Export Hub & External Compliance Distribution Center
 * 
 * Maintains audit trail of all export operations.
 * 
 * RESPONSIBILITIES:
 * - Log export generation events
 * - Log export download events
 * - Log policy decisions
 * - Log errors
 * - Provide filtering and statistics
 * - Export log data (JSON, CSV)
 */

import {
  ExportLogEntry,
  ExportGeneratedLogEntry,
  ExportDownloadedLogEntry,
  ExportPolicyDecisionLogEntry,
  ExportErrorLogEntry,
  ExportStatistics,
  ExportCategory,
  ExportFormat,
} from './exportTypes';

export class ExportLog {
  private entries: ExportLogEntry[] = [];
  
  /**
   * Log export generated event
   */
  logExportGenerated(
    bundleId: string,
    category: ExportCategory,
    format: ExportFormat,
    sectionsGenerated: number,
    itemsIncluded: number,
    sizeBytes: number,
    tenantId: string,
    facilityId: string | undefined,
    generatedBy: string
  ): void {
    const entry: ExportGeneratedLogEntry = {
      entryId: `export-gen-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      entryType: 'export-generated',
      timestamp: new Date().toISOString(),
      tenantId,
      facilityId,
      export: {
        bundleId,
        category,
        format,
        sectionsGenerated,
        itemsIncluded,
        sizeBytes,
      },
      generatedBy,
    };
    
    this.entries.push(entry);
  }
  
  /**
   * Log export downloaded event
   */
  logExportDownloaded(
    bundleId: string,
    format: ExportFormat,
    filename: string,
    sizeBytes: number,
    tenantId: string,
    downloadedBy: string
  ): void {
    const entry: ExportDownloadedLogEntry = {
      entryId: `export-dl-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      entryType: 'export-downloaded',
      timestamp: new Date().toISOString(),
      tenantId,
      download: {
        bundleId,
        format,
        filename,
        sizeBytes,
      },
      downloadedBy,
    };
    
    this.entries.push(entry);
  }
  
  /**
   * Log policy decision
   */
  logPolicyDecision(
    queryId: string,
    scope: { tenantId?: string; facilityId?: string; federationId?: string },
    allowed: boolean,
    reason: string,
    violations: string[],
    warnings: string[],
    userId: string
  ): void {
    const entry: ExportPolicyDecisionLogEntry = {
      entryId: `export-policy-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      entryType: 'policy-decision',
      timestamp: new Date().toISOString(),
      decision: {
        queryId,
        scope,
        allowed,
        reason,
        violations,
        warnings,
      },
      userId,
    };
    
    this.entries.push(entry);
  }
  
  /**
   * Log error
   */
  logError(
    queryId: string,
    errorCode: string,
    message: string,
    details: any,
    tenantId: string | undefined,
    userId: string
  ): void {
    const entry: ExportErrorLogEntry = {
      entryId: `export-error-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
      tenantId,
      error: {
        queryId,
        errorCode,
        message,
        details,
      },
      userId,
    };
    
    this.entries.push(entry);
  }
  
  /**
   * Get entries with optional filtering
   */
  getEntries(filters?: {
    entryType?: 'export-generated' | 'export-downloaded' | 'policy-decision' | 'error';
    tenantId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): ExportLogEntry[] {
    let filtered = this.entries;
    
    // Filter by entry type
    if (filters?.entryType) {
      filtered = filtered.filter(e => e.entryType === filters.entryType);
    }
    
    // Filter by tenant ID
    if (filters?.tenantId) {
      filtered = filtered.filter(e => {
        if (e.entryType === 'export-generated') {
          return e.tenantId === filters.tenantId;
        }
        if (e.entryType === 'export-downloaded') {
          return e.tenantId === filters.tenantId;
        }
        if (e.entryType === 'error') {
          return e.tenantId === filters.tenantId;
        }
        return true;
      });
    }
    
    // Filter by date range
    if (filters?.startDate) {
      const startTime = new Date(filters.startDate).getTime();
      filtered = filtered.filter(e => new Date(e.timestamp).getTime() >= startTime);
    }
    
    if (filters?.endDate) {
      const endTime = new Date(filters.endDate).getTime();
      filtered = filtered.filter(e => new Date(e.timestamp).getTime() <= endTime);
    }
    
    // Apply limit
    if (filters?.limit) {
      filtered = filtered.slice(-filters.limit);
    }
    
    return filtered;
  }
  
  /**
   * Get latest entries
   */
  getLatestEntries(limit: number = 100): ExportLogEntry[] {
    return this.entries.slice(-limit);
  }
  
  /**
   * Get statistics
   */
  getStatistics(): ExportStatistics {
    const exportEntries = this.entries.filter(e => e.entryType === 'export-generated') as ExportGeneratedLogEntry[];
    const downloadEntries = this.entries.filter(e => e.entryType === 'export-downloaded') as ExportDownloadedLogEntry[];
    
    // By category
    const byCategory: Record<ExportCategory, number> = {
      'compliance-pack': 0,
      'executive-summary': 0,
      'operational-snapshot': 0,
      'audit-findings': 0,
      'drift-logs': 0,
      'alert-logs': 0,
      'task-logs': 0,
      'operator-analytics': 0,
      'real-time-metrics': 0,
      'capacity-forecasts': 0,
      'schedules': 0,
      'insights': 0,
      'reports': 0,
      'full-operational': 0,
    };
    
    exportEntries.forEach(e => {
      byCategory[e.export.category]++;
    });
    
    // By tenant
    const byTenant: Record<string, number> = {};
    exportEntries.forEach(e => {
      byTenant[e.tenantId] = (byTenant[e.tenantId] || 0) + 1;
    });
    
    // By format
    const byFormat: Record<ExportFormat, number> = {
      json: 0,
      csv: 0,
      html: 0,
      markdown: 0,
      zip: 0,
      'auditor-package': 0,
    };
    
    exportEntries.forEach(e => {
      byFormat[e.export.format]++;
    });
    
    // Average size
    const totalSize = exportEntries.reduce((sum, e) => sum + e.export.sizeBytes, 0);
    const averageSizeBytes = exportEntries.length > 0 ? totalSize / exportEntries.length : 0;
    
    // Trends (24-hour change)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 48 * 60 * 60 * 1000;
    
    const exportsLast24h = exportEntries.filter(e => new Date(e.timestamp).getTime() >= oneDayAgo).length;
    const exportsPrev24h = exportEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time >= twoDaysAgo && time < oneDayAgo;
    }).length;
    
    const downloadsLast24h = downloadEntries.filter(e => new Date(e.timestamp).getTime() >= oneDayAgo).length;
    const downloadsPrev24h = downloadEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time >= twoDaysAgo && time < oneDayAgo;
    }).length;
    
    const exportsChange = this.calculateTrendChange(exportsLast24h, exportsPrev24h);
    const downloadsChange = this.calculateTrendChange(downloadsLast24h, downloadsPrev24h);
    
    return {
      totalExports: exportEntries.length,
      totalDownloads: downloadEntries.length,
      byCategory,
      byTenant,
      byFormat,
      averageGenerationTimeMs: 200, // Placeholder
      averageSizeBytes,
      trends: {
        exportsChange,
        downloadsChange,
      },
    };
  }
  
  /**
   * Export entries to JSON
   */
  exportToJSON(filters?: {
    entryType?: 'export-generated' | 'export-downloaded' | 'policy-decision' | 'error';
    tenantId?: string;
    startDate?: string;
    endDate?: string;
  }): string {
    const entries = this.getEntries(filters);
    return JSON.stringify(entries, null, 2);
  }
  
  /**
   * Export entries to CSV
   */
  exportToCSV(filters?: {
    entryType?: 'export-generated' | 'export-downloaded' | 'policy-decision' | 'error';
    tenantId?: string;
    startDate?: string;
    endDate?: string;
  }): string {
    const entries = this.getEntries(filters);
    
    // CSV headers
    const headers = ['Entry ID', 'Entry Type', 'Timestamp', 'Tenant ID', 'Details'];
    
    // CSV rows
    const rows = entries.map(entry => {
      let details = '';
      
      if (entry.entryType === 'export-generated') {
        const e = entry as ExportGeneratedLogEntry;
        details = `${e.export.category} - ${e.export.format} - ${e.export.sectionsGenerated} sections - ${e.export.itemsIncluded} items`;
      } else if (entry.entryType === 'export-downloaded') {
        const e = entry as ExportDownloadedLogEntry;
        details = `${e.download.format} - ${e.download.filename}`;
      } else if (entry.entryType === 'policy-decision') {
        const e = entry as ExportPolicyDecisionLogEntry;
        details = `${e.decision.allowed ? 'Allowed' : 'Denied'} - ${e.decision.reason}`;
      } else if (entry.entryType === 'error') {
        const e = entry as ExportErrorLogEntry;
        details = `${e.error.errorCode} - ${e.error.message}`;
      }
      
      const tenantId = entry.entryType === 'export-generated' ? entry.tenantId :
                       entry.entryType === 'export-downloaded' ? entry.tenantId :
                       entry.entryType === 'error' ? entry.tenantId || 'N/A' : 'N/A';
      
      return [
        `"${entry.entryId}"`,
        `"${entry.entryType}"`,
        `"${entry.timestamp}"`,
        `"${tenantId}"`,
        `"${details}"`,
      ].join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }
  
  /**
   * Clear old entries
   */
  clearOldEntries(retentionDays: number = 90): number {
    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const beforeCount = this.entries.length;
    
    this.entries = this.entries.filter(e => 
      new Date(e.timestamp).getTime() >= cutoffTime
    );
    
    return beforeCount - this.entries.length;
  }
  
  /**
   * Get entry count
   */
  getEntryCount(): number {
    return this.entries.length;
  }
  
  /**
   * Clear all entries
   */
  clearAllEntries(): void {
    this.entries = [];
  }
  
  // ========================================================================
  // HELPER METHODS
  // ========================================================================
  
  /**
   * Calculate trend change percentage
   */
  private calculateTrendChange(current: number, previous: number): string {
    if (previous === 0) {
      return current > 0 ? '+100.0%' : 'N/A';
    }
    
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }
}
