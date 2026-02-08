/**
 * ENTERPRISE REPORTING - ENGINE
 * Phase 59: Expansion Track
 * 
 * Main orchestrator for deterministic report generation.
 */

import {
  ReportQuery,
  ReportResult,
  ReportBundle,
  ReportFormat,
  ReportingPolicyContext,
  ReportingDataInput,
} from './reportingTypes';
import { ReportingBuilder } from './reportingBuilder';
import { ReportingPolicyEngine } from './reportingPolicyEngine';
import { ReportingLog } from './reportingLog';

export class ReportingEngine {
  private builder: ReportingBuilder;
  private policyEngine: ReportingPolicyEngine;
  private log: ReportingLog;
  
  constructor() {
    this.builder = new ReportingBuilder();
    this.policyEngine = new ReportingPolicyEngine();
    this.log = new ReportingLog();
  }
  
  /**
   * Execute a report query
   */
  executeQuery(
    query: ReportQuery,
    context: ReportingPolicyContext,
    data: ReportingDataInput
  ): ReportResult {
    const startTime = Date.now();
    
    try {
      // Step 1: Evaluate policy
      const policyDecision = this.policyEngine.evaluateQueryPolicy(query, context);
      this.log.logPolicyDecision(query.queryId, query.scope, policyDecision, context.userId);
      
      if (!policyDecision.allowed) {
        this.log.logError(
          query.queryId,
          'POLICY_VIOLATION',
          policyDecision.reason,
          policyDecision.violations.join('; '),
          query.scope.tenantId,
          context.userId
        );
        
        return this.createErrorResult(query, policyDecision.reason, startTime);
      }
      
      // Step 2: Determine time period
      const { periodStart, periodEnd } = this.getTimePeriod(query.timePeriod, query.customTimeRange);
      
      // Step 3: Build report bundle
      const bundleId = `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const bundle = this.builder.buildReportBundle(
        bundleId,
        reportId,
        query.category,
        query.timePeriod,
        periodStart,
        periodEnd,
        query.scope,
        data,
        {
          includeSummary: query.includeSummary,
          includeDetails: query.includeDetails,
          includeRecommendations: query.includeRecommendations,
          includeReferences: query.includeReferences,
        },
        query.format,
        context.userId
      );
      
      // Step 4: Log report generation
      this.log.logReportGenerated(bundle, context.userId);
      
      // Step 5: Export if needed
      const exportedContent = query.format !== 'json'
        ? this.exportBundle(bundle, query.format, context.userId)
        : undefined;
      
      // Step 6: Create result
      const generationTimeMs = Date.now() - startTime;
      
      const result: ReportResult = {
        resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query,
        bundle,
        exportedContent,
        success: true,
        metadata: {
          generatedAt: new Date().toISOString(),
          generationTimeMs,
          sectionsGenerated: bundle.sections.length,
          referencesIncluded: this.countReferences(bundle),
        },
      };
      
      return result;
    } catch (error: any) {
      this.log.logError(
        query.queryId,
        'GENERATION_ERROR',
        error.message,
        error.stack,
        query.scope.tenantId,
        context.userId
      );
      
      return this.createErrorResult(query, `Report generation failed: ${error.message}`, startTime);
    }
  }
  
  /**
   * Export a bundle to a specific format
   */
  private exportBundle(
    bundle: ReportBundle,
    format: ReportFormat,
    userId: string
  ): {
    format: ReportFormat;
    content: string;
    filename: string;
    sizeBytes: number;
  } {
    let content: string;
    let filename: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(bundle, null, 2);
        filename = `${bundle.bundleId}.json`;
        break;
      
      case 'markdown':
        content = this.exportToMarkdown(bundle);
        filename = `${bundle.bundleId}.md`;
        break;
      
      case 'html':
        content = this.exportToHTML(bundle);
        filename = `${bundle.bundleId}.html`;
        break;
      
      case 'csv':
        content = this.exportToCSV(bundle);
        filename = `${bundle.bundleId}.csv`;
        break;
      
      default:
        content = JSON.stringify(bundle, null, 2);
        filename = `${bundle.bundleId}.json`;
    }
    
    const sizeBytes = new Blob([content]).size;
    
    // Log export
    this.log.logReportExported(
      bundle.bundleId,
      format,
      filename,
      sizeBytes,
      bundle.scope.tenantId,
      userId
    );
    
    return {
      format,
      content,
      filename,
      sizeBytes,
    };
  }
  
  /**
   * Export bundle to Markdown
   */
  private exportToMarkdown(bundle: ReportBundle): string {
    let md = `# ${bundle.title}\n\n`;
    md += `**Category:** ${bundle.category}  \n`;
    md += `**Period:** ${bundle.timePeriod} (${bundle.periodStart} to ${bundle.periodEnd})  \n`;
    md += `**Generated:** ${bundle.metadata.generatedAt}  \n`;
    if (bundle.scope.tenantId) md += `**Tenant:** ${bundle.scope.tenantId}  \n`;
    if (bundle.scope.facilityId) md += `**Facility:** ${bundle.scope.facilityId}  \n`;
    md += `\n---\n\n`;
    
    // Executive Summary
    md += `## Executive Summary\n\n`;
    md += `${bundle.executiveSummary.overview}\n\n`;
    
    if (bundle.executiveSummary.keyFindings.length > 0) {
      md += `### Key Findings\n\n`;
      bundle.executiveSummary.keyFindings.forEach(finding => {
        md += `- ${finding}\n`;
      });
      md += `\n`;
    }
    
    if (bundle.executiveSummary.criticalIssues.length > 0) {
      md += `### Critical Issues\n\n`;
      bundle.executiveSummary.criticalIssues.forEach(issue => {
        md += `- ${issue}\n`;
      });
      md += `\n`;
    }
    
    if (bundle.executiveSummary.recommendations.length > 0) {
      md += `### Recommendations\n\n`;
      bundle.executiveSummary.recommendations.forEach(rec => {
        md += `- ${rec}\n`;
      });
      md += `\n`;
    }
    
    // Sections
    bundle.sections.forEach(section => {
      md += `## ${section.title}\n\n`;
      
      if (section.content.summary) {
        md += `${section.content.summary}\n\n`;
      }
      
      if (section.content.metrics) {
        md += `### Metrics\n\n`;
        Object.entries(section.content.metrics).forEach(([key, value]) => {
          md += `- **${key}:** ${value}\n`;
        });
        md += `\n`;
      }
      
      if (section.content.tables) {
        section.content.tables.forEach(table => {
          md += `### ${table.title}\n\n`;
          md += `| ${table.headers.join(' | ')} |\n`;
          md += `| ${table.headers.map(() => '---').join(' | ')} |\n`;
          table.rows.forEach(row => {
            md += `| ${row.join(' | ')} |\n`;
          });
          if (table.footer) {
            md += `\n*${table.footer}*\n`;
          }
          md += `\n`;
        });
      }
      
      if (section.content.text) {
        md += `${section.content.text}\n\n`;
      }
      
      md += `*Data sources: ${section.dataSources.join(', ')}*\n\n`;
    });
    
    // Metadata
    md += `---\n\n`;
    md += `## Report Metadata\n\n`;
    md += `- **Report ID:** ${bundle.reportId}\n`;
    md += `- **Bundle ID:** ${bundle.bundleId}\n`;
    md += `- **Sections:** ${bundle.sections.length}\n`;
    md += `- **Word Count:** ${bundle.metadata.wordCount}\n`;
    md += `- **Data Sources:** ${bundle.metadata.dataSourcesUsed.join(', ')}\n`;
    md += `- **Computation Time:** ${bundle.metadata.computationTimeMs}ms\n`;
    
    return md;
  }
  
  /**
   * Export bundle to HTML
   */
  private exportToHTML(bundle: ReportBundle): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bundle.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; border-bottom: 1px solid #ecf0f1; padding-bottom: 5px; }
    h3 { color: #7f8c8d; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #3498db; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .meta { color: #7f8c8d; font-size: 0.9em; margin: 5px 0; }
    .summary-box { background: #ecf0f1; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
    ul { line-height: 1.8; }
  </style>
</head>
<body>
  <h1>${bundle.title}</h1>
  <div class="meta">
    <strong>Category:</strong> ${bundle.category}<br>
    <strong>Period:</strong> ${bundle.timePeriod} (${bundle.periodStart} to ${bundle.periodEnd})<br>
    <strong>Generated:</strong> ${bundle.metadata.generatedAt}<br>
    ${bundle.scope.tenantId ? `<strong>Tenant:</strong> ${bundle.scope.tenantId}<br>` : ''}
    ${bundle.scope.facilityId ? `<strong>Facility:</strong> ${bundle.scope.facilityId}<br>` : ''}
  </div>
  
  <h2>Executive Summary</h2>
  <div class="summary-box">
    <p>${bundle.executiveSummary.overview}</p>
  </div>`;
    
    if (bundle.executiveSummary.keyFindings.length > 0) {
      html += `<h3>Key Findings</h3><ul>`;
      bundle.executiveSummary.keyFindings.forEach(finding => {
        html += `<li>${finding}</li>`;
      });
      html += `</ul>`;
    }
    
    if (bundle.executiveSummary.criticalIssues.length > 0) {
      html += `<h3>Critical Issues</h3><ul>`;
      bundle.executiveSummary.criticalIssues.forEach(issue => {
        html += `<li>${issue}</li>`;
      });
      html += `</ul>`;
    }
    
    if (bundle.executiveSummary.recommendations.length > 0) {
      html += `<h3>Recommendations</h3><ul>`;
      bundle.executiveSummary.recommendations.forEach(rec => {
        html += `<li>${rec}</li>`;
      });
      html += `</ul>`;
    }
    
    // Sections
    bundle.sections.forEach(section => {
      html += `<h2>${section.title}</h2>`;
      
      if (section.content.summary) {
        html += `<p>${section.content.summary}</p>`;
      }
      
      if (section.content.metrics) {
        html += `<h3>Metrics</h3><ul>`;
        Object.entries(section.content.metrics).forEach(([key, value]) => {
          html += `<li><strong>${key}:</strong> ${value}</li>`;
        });
        html += `</ul>`;
      }
      
      if (section.content.tables) {
        section.content.tables.forEach(table => {
          html += `<h3>${table.title}</h3>`;
          html += `<table><thead><tr>`;
          table.headers.forEach(h => html += `<th>${h}</th>`);
          html += `</tr></thead><tbody>`;
          table.rows.forEach(row => {
            html += `<tr>`;
            row.forEach(cell => html += `<td>${cell}</td>`);
            html += `</tr>`;
          });
          html += `</tbody></table>`;
          if (table.footer) {
            html += `<p class="meta"><em>${table.footer}</em></p>`;
          }
        });
      }
      
      if (section.content.text) {
        html += `<p>${section.content.text}</p>`;
      }
      
      html += `<p class="meta">Data sources: ${section.dataSources.join(', ')}</p>`;
    });
    
    html += `</body></html>`;
    return html;
  }
  
  /**
   * Export bundle to CSV (metrics only)
   */
  private exportToCSV(bundle: ReportBundle): string {
    const rows: string[][] = [];
    rows.push(['Section', 'Metric', 'Value']);
    
    bundle.sections.forEach(section => {
      if (section.content.metrics) {
        Object.entries(section.content.metrics).forEach(([key, value]) => {
          rows.push([section.title, key, String(value)]);
        });
      }
    });
    
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
  
  /**
   * Get time period boundaries
   */
  private getTimePeriod(
    timePeriod: string,
    customTimeRange?: { start: string; end: string }
  ): { periodStart: string; periodEnd: string } {
    if (timePeriod === 'custom' && customTimeRange) {
      return {
        periodStart: customTimeRange.start,
        periodEnd: customTimeRange.end,
      };
    }
    
    const now = Date.now();
    const periods: Record<string, number> = {
      daily: 24 * 60 * 60 * 1000,           // 1 day
      weekly: 7 * 24 * 60 * 60 * 1000,      // 7 days
      monthly: 30 * 24 * 60 * 60 * 1000,    // 30 days
      quarterly: 90 * 24 * 60 * 60 * 1000,  // 90 days
    };
    
    const milliseconds = periods[timePeriod] || periods.monthly;
    
    return {
      periodStart: new Date(now - milliseconds).toISOString(),
      periodEnd: new Date(now).toISOString(),
    };
  }
  
  /**
   * Count references in a bundle
   */
  private countReferences(bundle: ReportBundle): number {
    return (
      bundle.references.insightIds.length +
      bundle.references.metricIds.length +
      bundle.references.signalIds.length +
      bundle.references.projectionIds.length +
      bundle.references.scheduleIds.length +
      bundle.references.taskIds.length +
      bundle.references.alertIds.length +
      bundle.references.driftIds.length +
      bundle.references.auditFindingIds.length
    );
  }
  
  /**
   * Create error result
   */
  private createErrorResult(query: ReportQuery, errorMessage: string, startTime: number): ReportResult {
    return {
      resultId: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      success: false,
      error: errorMessage,
      metadata: {
        generatedAt: new Date().toISOString(),
        generationTimeMs: Date.now() - startTime,
        sectionsGenerated: 0,
        referencesIncluded: 0,
      },
    };
  }
  
  /**
   * Get log instance
   */
  getLog(): ReportingLog {
    return this.log;
  }
  
  /**
   * Get statistics
   */
  getStatistics(): any {
    return this.log.getStatistics();
  }
}
