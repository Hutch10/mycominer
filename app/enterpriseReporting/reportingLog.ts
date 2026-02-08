/**
 * ENTERPRISE REPORTING - LOG
 * Phase 59: Expansion Track
 * 
 * Audit trail for report generation and policy decisions.
 */

import {
  ReportLogEntry,
  ReportGeneratedLogEntry,
  ReportExportedLogEntry,
  ReportPolicyDecisionLogEntry,
  ReportErrorLogEntry,
  ReportStatistics,
  ReportBundle,
  ReportCategory,
  ReportTimePeriod,
  ReportFormat,
  ReportingPolicyDecision,
} from './reportingTypes';

export class ReportingLog {
  private entries: ReportLogEntry[] = [];
  
  /**
   * Log a generated report
   */
  logReportGenerated(
    bundle: ReportBundle,
    generatedBy: string
  ): void {
    const entry: ReportGeneratedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'report-generated',
      timestamp: new Date().toISOString(),
      tenantId: bundle.scope.tenantId,
      facilityId: bundle.scope.facilityId,
      report: {
        bundleId: bundle.bundleId,
        category: bundle.category,
        timePeriod: bundle.timePeriod,
        sectionsGenerated: bundle.sections.length,
        format: bundle.metadata.format,
      },
      generatedBy,
    };
    
    this.entries.push(entry);
  }
  
  /**
   * Log a report export
   */
  logReportExported(
    bundleId: string,
    format: ReportFormat,
    filename: string,
    sizeBytes: number,
    tenantId: string | undefined,
    exportedBy: string
  ): void {
    const entry: ReportExportedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'report-exported',
      timestamp: new Date().toISOString(),
      tenantId,
      export: {
        bundleId,
        format,
        filename,
        sizeBytes,
      },
      exportedBy,
    };
    
    this.entries.push(entry);
  }
  
  /**
   * Log a policy decision
   */
  logPolicyDecision(
    queryId: string,
    scope: { tenantId?: string; facilityId?: string; federationId?: string },
    decision: ReportingPolicyDecision,
    userId: string
  ): void {
    const entry: ReportPolicyDecisionLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'policy-decision',
      timestamp: new Date().toISOString(),
      decision: {
        queryId,
        scope,
        allowed: decision.allowed,
        reason: decision.reason,
        violations: decision.violations,
        warnings: decision.warnings,
      },
      userId,
    };
    
    this.entries.push(entry);
  }
  
  /**
   * Log an error
   */
  logError(
    queryId: string,
    errorCode: string,
    message: string,
    details: string | undefined,
    tenantId: string | undefined,
    userId: string
  ): void {
    const entry: ReportErrorLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
   * Get log entries with optional filtering
   */
  getEntries(filters?: {
    entryType?: string;
    tenantId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): ReportLogEntry[] {
    let filtered = this.entries;
    
    if (filters?.entryType) {
      filtered = filtered.filter(e => e.entryType === filters.entryType);
    }
    
    if (filters?.tenantId) {
      filtered = filtered.filter(e => {
        if (e.entryType === 'report-generated') {
          return e.tenantId === filters.tenantId;
        }
        if (e.entryType === 'report-exported') {
          return e.tenantId === filters.tenantId;
        }
        if (e.entryType === 'error') {
          return e.tenantId === filters.tenantId;
        }
        return true;
      });
    }
    
    if (filters?.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
    }
    
    if (filters?.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
    }
    
    if (filters?.limit) {
      filtered = filtered.slice(-filters.limit);
    }
    
    return filtered;
  }
  
  /**
   * Get latest entries
   */
  getLatestEntries(limit: number = 100): ReportLogEntry[] {
    return this.entries.slice(-limit);
  }
  
  /**
   * Get comprehensive statistics
   */
  getStatistics(): ReportStatistics {
    const reportEntries = this.entries.filter(e => e.entryType === 'report-generated') as ReportGeneratedLogEntry[];
    const exportEntries = this.entries.filter(e => e.entryType === 'report-exported') as ReportExportedLogEntry[];
    
    // By category
    const byCategory: Record<ReportCategory, number> = {
      'executive-summary': 0,
      'sla-compliance': 0,
      'capacity-scheduling': 0,
      'operator-performance': 0,
      'risk-drift': 0,
      'audit-governance': 0,
      'documentation-completeness': 0,
      'cross-engine-operational': 0,
      'compliance-pack': 0,
    };
    reportEntries.forEach(e => {
      byCategory[e.report.category] = (byCategory[e.report.category] || 0) + 1;
    });
    
    // By tenant
    const byTenant: Record<string, number> = {};
    reportEntries.forEach(e => {
      if (e.tenantId) {
        byTenant[e.tenantId] = (byTenant[e.tenantId] || 0) + 1;
      }
    });
    
    // By time period
    const byTimePeriod: Record<ReportTimePeriod, number> = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      quarterly: 0,
      custom: 0,
    };
    reportEntries.forEach(e => {
      byTimePeriod[e.report.timePeriod] = (byTimePeriod[e.report.timePeriod] || 0) + 1;
    });
    
    // By format
    const byFormat: Record<ReportFormat, number> = {
      json: 0,
      markdown: 0,
      html: 0,
      csv: 0,
    };
    reportEntries.forEach(e => {
      byFormat[e.report.format] = (byFormat[e.report.format] || 0) + 1;
    });
    
    // Performance
    const averageGenerationTimeMs = 150; // Placeholder
    
    // Trends (last 24h vs previous 24h)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 48 * 60 * 60 * 1000;
    
    const last24hReports = reportEntries.filter(e => new Date(e.timestamp).getTime() >= oneDayAgo).length;
    const prev24hReports = reportEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time >= twoDaysAgo && time < oneDayAgo;
    }).length;
    
    const last24hExports = exportEntries.filter(e => new Date(e.timestamp).getTime() >= oneDayAgo).length;
    const prev24hExports = exportEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time >= twoDaysAgo && time < oneDayAgo;
    }).length;
    
    const reportsChange = prev24hReports > 0
      ? `${((last24hReports - prev24hReports) / prev24hReports * 100).toFixed(0)}%`
      : 'N/A';
    const exportsChange = prev24hExports > 0
      ? `${((last24hExports - prev24hExports) / prev24hExports * 100).toFixed(0)}%`
      : 'N/A';
    
    return {
      totalReports: reportEntries.length,
      totalExports: exportEntries.length,
      byCategory,
      byTenant,
      byTimePeriod,
      byFormat,
      averageGenerationTimeMs,
      trends: {
        reportsChange: reportsChange.startsWith('-') ? reportsChange : `+${reportsChange}`,
        exportsChange: exportsChange.startsWith('-') ? exportsChange : `+${exportsChange}`,
      },
    };
  }
  
  /**
   * Export log entries to JSON
   */
  exportToJSON(filters?: any): string {
    const entries = this.getEntries(filters);
    return JSON.stringify(entries, null, 2);
  }
  
  /**
   * Export log entries to CSV
   */
  exportToCSV(filters?: any): string {
    const entries = this.getEntries(filters);
    
    const headers = ['Entry ID', 'Entry Type', 'Timestamp', 'Tenant ID', 'Details'];
    const rows = entries.map(entry => {
      let details = '';
      
      if (entry.entryType === 'report-generated') {
        details = `${entry.report.category} - ${entry.report.sectionsGenerated} sections`;
      } else if (entry.entryType === 'report-exported') {
        details = `${entry.export.format} - ${entry.export.filename}`;
      } else if (entry.entryType === 'policy-decision') {
        details = `${entry.decision.allowed ? 'Allowed' : 'Denied'} - ${entry.decision.reason}`;
      } else if (entry.entryType === 'error') {
        details = `${entry.error.errorCode} - ${entry.error.message}`;
      }
      
      return [
        entry.entryId,
        entry.entryType,
        entry.timestamp,
        'tenantId' in entry ? entry.tenantId || '' : '',
        details,
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    return csvContent;
  }
  
  /**
   * Clear old entries
   */
  clearOldEntries(retentionDays: number = 90): number {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
    const initialCount = this.entries.length;
    this.entries = this.entries.filter(e => e.timestamp >= cutoffDate);
    return initialCount - this.entries.length;
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
}
