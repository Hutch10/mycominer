/**
 * Export Engine
 * Phase 60: Enterprise Export Hub & External Compliance Distribution Center
 * 
 * Main orchestrator for export operations.
 * 
 * RESPONSIBILITIES:
 * - Execute export queries
 * - Evaluate policy
 * - Assemble bundles (via ExportBuilder)
 * - Convert to requested format
 * - Log all operations
 * - Return export results
 * 
 * SUPPORTED FORMATS:
 * - JSON: Structured data export
 * - CSV: Tabular metrics export
 * - HTML: Styled document export
 * - Markdown: Documentation export
 * - ZIP: Multi-file bundle (JSON + CSV + HTML)
 * - Auditor Package: Structured compliance package with folders
 */

import {
  ExportQuery,
  ExportResult,
  ExportBundle,
  ExportDataInput,
  ExportPolicyContext,
  ExportFormat,
} from './exportTypes';
import { ExportBuilder } from './exportBuilder';
import { ExportPolicyEngine } from './exportPolicyEngine';
import { ExportLog } from './exportLog';

export class ExportEngine {
  private builder: ExportBuilder;
  private policyEngine: ExportPolicyEngine;
  private log: ExportLog;
  
  constructor() {
    this.builder = new ExportBuilder();
    this.policyEngine = new ExportPolicyEngine();
    this.log = new ExportLog();
  }
  
  /**
   * Execute export query
   * 
   * Main orchestration method.
   * 
   * STEPS:
   * 1. Evaluate policy
   * 2. Assemble bundle
   * 3. Convert to format
   * 4. Log operation
   * 5. Return result
   */
  executeExport(
    query: ExportQuery,
    context: ExportPolicyContext,
    data: ExportDataInput
  ): ExportResult {
    const startTime = Date.now();
    
    try {
      // Step 1: Evaluate policy
      const policyDecision = this.policyEngine.evaluateExportPolicy(query, context);
      
      // Log policy decision
      this.log.logPolicyDecision(
        query.queryId,
        query.scope,
        policyDecision.allowed,
        policyDecision.reason,
        policyDecision.violations,
        policyDecision.warnings,
        context.userId
      );
      
      // If policy denied, return error result
      if (!policyDecision.allowed) {
        this.log.logError(
          query.queryId,
          'POLICY_VIOLATION',
          policyDecision.reason,
          { violations: policyDecision.violations },
          query.scope.tenantId,
          context.userId
        );
        
        return this.createErrorResult(query, policyDecision.reason, startTime);
      }
      
      // Step 2: Assemble bundle
      const bundle = this.builder.buildExportBundle(query, data, startTime);
      
      // Step 3: Log export generation
      this.log.logExportGenerated(
        bundle.bundleId,
        bundle.category,
        bundle.format,
        bundle.metadata.totalSections,
        bundle.metadata.totalItems,
        bundle.metadata.estimatedSizeBytes,
        query.scope.tenantId || context.userTenantId,
        query.scope.facilityId,
        context.userId
      );
      
      // Step 4: Convert to format (if not JSON)
      let exportedContent = undefined;
      
      if (query.format !== 'json' || query.compressOutput) {
        exportedContent = this.exportToFormat(bundle, query.format);
        
        // Log download (export completion)
        this.log.logExportDownloaded(
          bundle.bundleId,
          query.format,
          exportedContent.filename,
          exportedContent.sizeBytes,
          query.scope.tenantId || context.userTenantId,
          context.userId
        );
      }
      
      // Step 5: Create result
      const generationTimeMs = Date.now() - startTime;
      
      const referencesIncluded = this.countReferences(bundle);
      
      return {
        resultId: `export-result-${Date.now()}`,
        query,
        bundle,
        exportedContent,
        success: true,
        metadata: {
          generatedAt: new Date().toISOString(),
          generationTimeMs,
          sectionsGenerated: bundle.metadata.totalSections,
          itemsIncluded: bundle.metadata.totalItems,
          referencesIncluded,
        },
      };
      
    } catch (error: any) {
      // Log error
      this.log.logError(
        query.queryId,
        'GENERATION_ERROR',
        error.message || 'Unknown error during export generation',
        { stack: error.stack },
        query.scope.tenantId,
        context.userId
      );
      
      return this.createErrorResult(
        query,
        `Export generation failed: ${error.message}`,
        startTime
      );
    }
  }
  
  /**
   * Export bundle to specified format
   */
  private exportToFormat(
    bundle: ExportBundle,
    format: ExportFormat
  ): {
    format: ExportFormat;
    content: string | Uint8Array;
    filename: string;
    sizeBytes: number;
    mimeType: string;
  } {
    let content: string | Uint8Array;
    let filename: string;
    let mimeType: string;
    
    switch (format) {
      case 'json':
        content = this.exportToJSON(bundle);
        filename = `${bundle.bundleId}.json`;
        mimeType = 'application/json';
        break;
      
      case 'csv':
        content = this.exportToCSV(bundle);
        filename = `${bundle.bundleId}.csv`;
        mimeType = 'text/csv';
        break;
      
      case 'html':
        content = this.exportToHTML(bundle);
        filename = `${bundle.bundleId}.html`;
        mimeType = 'text/html';
        break;
      
      case 'markdown':
        content = this.exportToMarkdown(bundle);
        filename = `${bundle.bundleId}.md`;
        mimeType = 'text/markdown';
        break;
      
      case 'zip':
        content = this.exportToZIP(bundle);
        filename = `${bundle.bundleId}.zip`;
        mimeType = 'application/zip';
        break;
      
      case 'auditor-package':
        content = this.exportToAuditorPackage(bundle);
        filename = `${bundle.bundleId}-compliance-pack.zip`;
        mimeType = 'application/zip';
        break;
      
      default:
        content = this.exportToJSON(bundle);
        filename = `${bundle.bundleId}.json`;
        mimeType = 'application/json';
    }
    
    // Calculate size
    const sizeBytes = typeof content === 'string' 
      ? new Blob([content]).size 
      : content.length;
    
    return {
      format,
      content,
      filename,
      sizeBytes,
      mimeType,
    };
  }
  
  /**
   * Export to JSON format
   */
  private exportToJSON(bundle: ExportBundle): string {
    return JSON.stringify(bundle, null, 2);
  }
  
  /**
   * Export to CSV format
   * 
   * Extracts all items into CSV rows.
   */
  private exportToCSV(bundle: ExportBundle): string {
    const rows: string[][] = [];
    
    // Headers
    rows.push([
      'Section',
      'Item ID',
      'Item Type',
      'Timestamp',
      'Data Source',
      'Details',
    ]);
    
    // Data rows
    bundle.sections.forEach(section => {
      section.items.forEach(item => {
        const details = Object.entries(item.data)
          .filter(([key]) => !['timestamp', 'itemId', 'itemType'].includes(key))
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
        
        rows.push([
          section.title,
          item.itemId,
          item.itemType,
          item.timestamp,
          section.dataSource,
          details,
        ]);
      });
    });
    
    // Convert to CSV string
    return rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }
  
  /**
   * Export to HTML format
   * 
   * Creates a styled HTML document.
   */
  private exportToHTML(bundle: ExportBundle): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bundle.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1f2937;
      line-height: 1.6;
    }
    h1 {
      color: #1e40af;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
    }
    h2 {
      color: #374151;
      border-bottom: 2px solid #d1d5db;
      padding-bottom: 8px;
      margin-top: 30px;
    }
    .meta {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #6b7280;
    }
    .section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .section-header {
      margin-bottom: 15px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #111827;
    }
    .section-description {
      color: #6b7280;
      font-size: 14px;
      margin-top: 5px;
    }
    .data-source {
      color: #3b82f6;
      font-size: 12px;
      margin-top: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background: #3b82f6;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tbody tr:nth-child(even) {
      background: #f9fafb;
    }
    tbody tr:hover {
      background: #eff6ff;
    }
    .item-count {
      font-weight: bold;
      color: #059669;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <h1>${bundle.title}</h1>
  
  <div class="meta">
    <strong>Export Bundle:</strong> ${bundle.bundleId}<br>
    <strong>Category:</strong> ${bundle.category}<br>
    <strong>Format:</strong> ${bundle.format}<br>
    <strong>Time Range:</strong> ${new Date(bundle.timeRange.start).toLocaleDateString()} to ${new Date(bundle.timeRange.end).toLocaleDateString()}<br>
    <strong>Generated:</strong> ${new Date(bundle.metadata.generatedAt).toLocaleString()}<br>
    <strong>Total Sections:</strong> ${bundle.metadata.totalSections}<br>
    <strong>Total Items:</strong> ${bundle.metadata.totalItems}<br>
    ${bundle.scope.tenantId ? `<strong>Tenant:</strong> ${bundle.scope.tenantId}<br>` : ''}
    ${bundle.scope.facilityId ? `<strong>Facility:</strong> ${bundle.scope.facilityId}<br>` : ''}
  </div>
  
  <p>${bundle.description}</p>
`;
    
    // Sections
    bundle.sections.forEach(section => {
      html += `
  <div class="section">
    <div class="section-header">
      <div class="section-title">${section.title}</div>
      <div class="section-description">${section.description}</div>
      <div class="data-source">${section.dataSource}</div>
    </div>
`;
      
      if (section.summary) {
        html += `    <p><strong>Summary:</strong> ${section.summary}</p>\n`;
      }
      
      html += `    <p class="item-count">${section.itemCount} items</p>\n`;
      
      // Items table
      if (section.items.length > 0) {
        html += `
    <table>
      <thead>
        <tr>
          <th>Item ID</th>
          <th>Type</th>
          <th>Timestamp</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
`;
        
        section.items.forEach(item => {
          const details = Object.entries(item.data)
            .filter(([key]) => !['timestamp', 'itemId', 'itemType'].includes(key))
            .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
            .join('<br>');
          
          html += `
        <tr>
          <td>${item.itemId}</td>
          <td>${item.itemType}</td>
          <td>${new Date(item.timestamp).toLocaleString()}</td>
          <td>${details}</td>
        </tr>
`;
        });
        
        html += `
      </tbody>
    </table>
`;
      }
      
      html += `  </div>\n`;
    });
    
    // Footer
    html += `
  <div class="footer">
    <strong>Data Sources:</strong> ${bundle.metadata.dataSourcesUsed.join(', ')}<br>
    <strong>Computation Time:</strong> ${bundle.metadata.computationTimeMs}ms<br>
    <strong>Generated by:</strong> Phase 60: Enterprise Export Hub &amp; External Compliance Distribution Center
  </div>
</body>
</html>`;
    
    return html;
  }
  
  /**
   * Export to Markdown format
   */
  private exportToMarkdown(bundle: ExportBundle): string {
    let markdown = `# ${bundle.title}\n\n`;
    
    // Metadata
    markdown += `**Export Bundle:** ${bundle.bundleId}  \n`;
    markdown += `**Category:** ${bundle.category}  \n`;
    markdown += `**Format:** ${bundle.format}  \n`;
    markdown += `**Time Range:** ${new Date(bundle.timeRange.start).toLocaleDateString()} to ${new Date(bundle.timeRange.end).toLocaleDateString()}  \n`;
    markdown += `**Generated:** ${new Date(bundle.metadata.generatedAt).toLocaleString()}  \n`;
    markdown += `**Total Sections:** ${bundle.metadata.totalSections}  \n`;
    markdown += `**Total Items:** ${bundle.metadata.totalItems}  \n`;
    
    if (bundle.scope.tenantId) {
      markdown += `**Tenant:** ${bundle.scope.tenantId}  \n`;
    }
    if (bundle.scope.facilityId) {
      markdown += `**Facility:** ${bundle.scope.facilityId}  \n`;
    }
    
    markdown += `\n---\n\n`;
    markdown += `${bundle.description}\n\n`;
    markdown += `---\n\n`;
    
    // Sections
    bundle.sections.forEach(section => {
      markdown += `## ${section.title}\n\n`;
      markdown += `${section.description}\n\n`;
      markdown += `*Data Source: ${section.dataSource}*\n\n`;
      
      if (section.summary) {
        markdown += `**Summary:** ${section.summary}\n\n`;
      }
      
      markdown += `**Items:** ${section.itemCount}\n\n`;
      
      // Items (show first 10)
      if (section.items.length > 0) {
        const itemsToShow = section.items.slice(0, 10);
        
        itemsToShow.forEach(item => {
          markdown += `### ${item.itemType}: ${item.itemId}\n\n`;
          markdown += `*Timestamp:* ${new Date(item.timestamp).toLocaleString()}\n\n`;
          
          Object.entries(item.data).forEach(([key, value]) => {
            if (!['timestamp', 'itemId', 'itemType'].includes(key)) {
              markdown += `- **${key}:** ${value}\n`;
            }
          });
          
          markdown += `\n`;
        });
        
        if (section.items.length > 10) {
          markdown += `*... and ${section.items.length - 10} more items*\n\n`;
        }
      }
      
      markdown += `---\n\n`;
    });
    
    // Footer
    markdown += `## Export Metadata\n\n`;
    markdown += `- **Bundle ID:** ${bundle.bundleId}\n`;
    markdown += `- **Export ID:** ${bundle.exportId}\n`;
    markdown += `- **Data Sources:** ${bundle.metadata.dataSourcesUsed.join(', ')}\n`;
    markdown += `- **Computation Time:** ${bundle.metadata.computationTimeMs}ms\n`;
    markdown += `- **Generated by:** Phase 60: Enterprise Export Hub & External Compliance Distribution Center\n`;
    
    return markdown;
  }
  
  /**
   * Export to ZIP format
   * 
   * Creates a ZIP bundle with JSON, CSV, and HTML files.
   */
  private exportToZIP(bundle: ExportBundle): Uint8Array {
    // For now, return a placeholder
    // In production, use a ZIP library (e.g., JSZip)
    const placeholder = `ZIP Bundle: ${bundle.bundleId}\n\nContains:\n- ${bundle.bundleId}.json\n- ${bundle.bundleId}.csv\n- ${bundle.bundleId}.html`;
    return new TextEncoder().encode(placeholder);
  }
  
  /**
   * Export to Auditor Package format
   * 
   * Creates a structured compliance package with folders:
   * - /audit-findings/
   * - /drift-logs/
   * - /sla-compliance/
   * - /metadata/
   */
  private exportToAuditorPackage(bundle: ExportBundle): Uint8Array {
    // For now, return a placeholder
    // In production, create a structured ZIP with folders
    const placeholder = `Auditor Package: ${bundle.bundleId}\n\nStructure:\n/audit-findings/\n/drift-logs/\n/sla-compliance/\n/metadata/\n\nGenerated: ${bundle.metadata.generatedAt}`;
    return new TextEncoder().encode(placeholder);
  }
  
  /**
   * Get log instance
   */
  getLog(): ExportLog {
    return this.log;
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return this.log.getStatistics();
  }
  
  // ========================================================================
  // HELPER METHODS
  // ========================================================================
  
  /**
   * Count references in bundle
   */
  private countReferences(bundle: ExportBundle): number {
    const refs = bundle.references;
    return (
      refs.auditFindingIds.length +
      refs.driftEventIds.length +
      refs.alertIds.length +
      refs.taskIds.length +
      refs.operatorMetricIds.length +
      refs.realTimeSignalIds.length +
      refs.capacityProjectionIds.length +
      refs.scheduleIds.length +
      refs.insightIds.length +
      refs.reportIds.length
    );
  }
  
  /**
   * Create error result
   */
  private createErrorResult(
    query: ExportQuery,
    errorMessage: string,
    startTime: number
  ): ExportResult {
    return {
      resultId: `export-result-${Date.now()}`,
      query,
      success: false,
      error: errorMessage,
      metadata: {
        generatedAt: new Date().toISOString(),
        generationTimeMs: Date.now() - startTime,
        sectionsGenerated: 0,
        itemsIncluded: 0,
        referencesIncluded: 0,
      },
    };
  }
}
