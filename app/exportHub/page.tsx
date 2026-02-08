'use client';

/**
 * Export Hub Dashboard
 * Phase 60: Enterprise Export Hub & External Compliance Distribution Center
 * 
 * Executive and auditor-friendly UI for building and downloading export bundles.
 */

import { useState, useMemo } from 'react';
import {
  ExportQuery,
  ExportResult,
  ExportCategory,
  ExportFormat,
  ExportDataInput,
  ExportPolicyContext,
  ExportBundle,
} from './exportTypes';
import { ExportEngine } from './exportEngine';

// ============================================================================
// SAMPLE DATA GENERATION
// ============================================================================

function generateSampleData(): ExportDataInput {
  return {
    auditFindings: [
      {
        auditFindingId: 'audit-001',
        severity: 'critical',
        category: 'sterilization',
        status: 'open',
        description: 'Autoclave temperature below minimum threshold',
        foundAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
        roomId: 'room-sterile-1',
      },
      {
        auditFindingId: 'audit-002',
        severity: 'high',
        category: 'documentation',
        status: 'in-progress',
        description: 'Missing batch documentation for run #4521',
        foundAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
    ],
    
    driftEvents: [
      {
        driftId: 'drift-001',
        severity: 85,
        category: 'temperature',
        detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
        roomId: 'room-fruiting-2',
      },
      {
        driftId: 'drift-002',
        severity: 62,
        category: 'humidity',
        detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
        roomId: 'room-fruiting-1',
      },
    ],
    
    alerts: [
      {
        alertId: 'alert-001',
        severity: 'critical',
        category: 'environmental',
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
        roomId: 'room-fruiting-2',
      },
      {
        alertId: 'alert-002',
        severity: 'high',
        category: 'equipment',
        status: 'resolved',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        slaDeadline: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
    ],
    
    tasks: [
      {
        taskId: 'task-001',
        priority: 'high',
        status: 'completed',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        slaDeadline: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'operator-001',
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
      {
        taskId: 'task-002',
        priority: 'medium',
        status: 'in-progress',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'operator-002',
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
    ],
    
    operatorMetrics: [
      {
        metricId: 'metric-001',
        operatorId: 'op-001',
        operatorName: 'Alice Johnson',
        utilizationRate: 78.5,
        taskCompletionRate: 92.3,
        slaComplianceRate: 88.7,
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
      {
        metricId: 'metric-002',
        operatorId: 'op-002',
        operatorName: 'Bob Smith',
        utilizationRate: 65.2,
        taskCompletionRate: 85.9,
        slaComplianceRate: 91.2,
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
    ],
    
    realTimeSignals: [
      {
        signalId: 'signal-001',
        metric: 'temperature',
        value: 23.5,
        unit: '°C',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
        roomId: 'room-fruiting-1',
      },
    ],
    
    capacityProjections: [
      {
        projectionId: 'proj-001',
        category: 'inoculation',
        projectedCapacity: 450,
        riskLevel: 'low',
        windowStart: new Date().toISOString(),
        windowEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
    ],
    
    schedules: [
      {
        scheduleId: 'sched-001',
        totalSlots: 120,
        totalConflicts: 3,
        criticalConflicts: 0,
        averageCapacityUtilization: 72.5,
        slaRiskScore: 15,
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
    ],
    
    insights: [
      {
        insightId: 'insight-001',
        category: 'capacity',
        severity: 'medium',
        summary: 'Inoculation capacity utilization trending upward',
        metrics: { utilization: 72.5, trend: 8.5 },
        timestamp: new Date().toISOString(),
        tenantId: 'tenant-alpha',
      },
    ],
    
    reports: [
      {
        reportId: 'report-001',
        category: 'executive-summary',
        title: 'Monthly Executive Summary',
        sectionsCount: 3,
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
    ],
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ExportHubPage() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<ExportCategory>('compliance-pack');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('html');
  const [generating, setGenerating] = useState(false);
  const [currentExport, setCurrentExport] = useState<ExportResult | null>(null);
  
  // Sample data and engine
  const sampleData = useMemo(() => generateSampleData(), []);
  const engine = useMemo(() => new ExportEngine(), []);
  
  // Generate export
  const handleGenerateExport = () => {
    setGenerating(true);
    setCurrentExport(null);
    
    // Create query
    const query: ExportQuery = {
      queryId: `export-query-${Date.now()}`,
      description: `Export ${selectedCategory} in ${selectedFormat} format`,
      scope: {
        tenantId: 'tenant-alpha',
        facilityId: 'facility-1',
      },
      category: selectedCategory,
      format: selectedFormat,
      includeMetadata: true,
      includeReferences: true,
      includeRawData: true,
      compressOutput: false,
      requestedBy: 'export-demo-user',
      requestedAt: new Date().toISOString(),
    };
    
    // Create context
    const context: ExportPolicyContext = {
      userId: 'export-demo-user',
      userTenantId: 'tenant-alpha',
      permissions: [
        'export:executive-view',
        'export:compliance-pack',
        'export:bundle-formats',
        'export:raw-data',
        'export:long-range',
      ],
      role: 'executive',
    };
    
    // Simulate async execution
    setTimeout(() => {
      const result = engine.executeExport(query, context, sampleData);
      setCurrentExport(result);
      setGenerating(false);
    }, 800);
  };
  
  // Download export
  const handleDownload = () => {
    if (!currentExport?.exportedContent) return;
    
    const { content, filename, mimeType } = currentExport.exportedContent;
    
    // For demo purposes, handle as string (ZIP/binary formats would need proper handling)
    const textContent = typeof content === 'string' ? content : 'Binary content (requires ZIP library)';
    const blob = new Blob([textContent], { type: mimeType });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  // Get statistics
  const stats = engine.getStatistics();
  
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>
          Enterprise Export Hub
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Package and export operational data for external distribution, compliance, and auditing.
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <StatCard
          title="Total Exports"
          value={stats.totalExports.toString()}
          subtitle={stats.trends.exportsChange}
          color="blue"
        />
        <StatCard
          title="Total Downloads"
          value={stats.totalDownloads.toString()}
          subtitle={stats.trends.downloadsChange}
          color="green"
        />
        <StatCard
          title="Avg Size"
          value={`${(stats.averageSizeBytes / 1024).toFixed(1)} KB`}
          subtitle="Per export"
          color="purple"
        />
        <StatCard
          title="Data Sources"
          value="10"
          subtitle="Phases 50-59"
          color="orange"
        />
      </div>
      
      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', marginBottom: '40px' }}>
        {/* Export Builder Panel */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Export Builder</h2>
          
          {/* Category Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Export Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExportCategory)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="compliance-pack">Compliance Pack (Full Audit Bundle)</option>
              <option value="executive-summary">Executive Summary (Insights & Reports)</option>
              <option value="operational-snapshot">Operational Snapshot (Tasks, Alerts, Schedules)</option>
              <option value="audit-findings">Audit Findings Only</option>
              <option value="drift-logs">Drift Event Logs</option>
              <option value="alert-logs">Alert Logs</option>
              <option value="task-logs">Task Logs</option>
              <option value="operator-analytics">Operator Analytics</option>
              <option value="real-time-metrics">Real-Time Metrics</option>
              <option value="capacity-forecasts">Capacity Forecasts</option>
              <option value="schedules">Workload Schedules</option>
              <option value="insights">Executive Insights</option>
              <option value="reports">Enterprise Reports</option>
              <option value="full-operational">Full Operational Export</option>
            </select>
          </div>
          
          {/* Format Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
              Export Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="json">JSON (Structured Data)</option>
              <option value="csv">CSV (Tabular Data)</option>
              <option value="html">HTML (Styled Document)</option>
              <option value="markdown">Markdown (Documentation)</option>
              <option value="zip">ZIP Bundle (Multi-File)</option>
              <option value="auditor-package">Auditor Package (Compliance)</option>
            </select>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerateExport}
            disabled={generating}
            style={{
              width: '100%',
              padding: '12px',
              background: generating ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: generating ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
            }}
          >
            {generating ? 'Generating Export...' : 'Generate Export Bundle'}
          </button>
          
          {/* Scope Info */}
          <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', fontSize: '13px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#1e40af' }}>Export Scope</div>
            <div style={{ color: '#3b82f6' }}>
              <strong>Tenant:</strong> tenant-alpha<br />
              <strong>Facility:</strong> facility-1<br />
              <strong>User:</strong> export-demo-user<br />
              <strong>Role:</strong> executive
            </div>
          </div>
        </div>
        
        {/* Export Preview Panel */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Export Preview</h2>
            {currentExport?.success && currentExport.exportedContent && (
              <button
                onClick={handleDownload}
                style={{
                  padding: '8px 16px',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Download Export
              </button>
            )}
          </div>
          
          {/* Preview Content */}
          {!currentExport && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
              <div style={{ fontSize: '16px' }}>
                Select a category and format, then click "Generate Export Bundle" to preview.
              </div>
            </div>
          )}
          
          {currentExport && !currentExport.success && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '20px', color: '#dc2626' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>Export Failed</div>
              <div>{currentExport.error}</div>
            </div>
          )}
          
          {currentExport && currentExport.success && currentExport.bundle && (
            <ExportBundlePreview bundle={currentExport.bundle} />
          )}
        </div>
      </div>
      
      {/* Export History Viewer */}
      <ExportHistoryViewer engine={engine} />
      
      {/* Architecture Notice */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '20px', marginTop: '40px' }}>
        <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
          🏗️ Phase 60 Architecture
        </div>
        <div style={{ fontSize: '14px', color: '#3b82f6' }}>
          Export Hub packages operational data from <strong>all 10 phases (50-59)</strong> into external-ready bundles with strict policy enforcement.
          Supports 6 export formats (JSON, CSV, HTML, Markdown, ZIP, Auditor Package). All exports are <strong>deterministic and read-only</strong> with complete audit trails.
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const colors = {
    blue: { bg: '#eff6ff', text: '#1e40af', value: '#3b82f6' },
    green: { bg: '#f0fdf4', text: '#166534', value: '#10b981' },
    purple: { bg: '#faf5ff', text: '#6b21a8', value: '#a855f7' },
    orange: { bg: '#fff7ed', text: '#9a3412', value: '#f97316' },
  };
  
  const c = colors[color];
  
  return (
    <div style={{ background: c.bg, padding: '20px', borderRadius: '12px', border: `1px solid ${c.value}30` }}>
      <div style={{ fontSize: '14px', color: c.text, marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: c.value, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: c.text }}>{subtitle}</div>
    </div>
  );
}

// ============================================================================
// EXPORT BUNDLE PREVIEW COMPONENT
// ============================================================================

interface ExportBundlePreviewProps {
  bundle: ExportBundle;
}

function ExportBundlePreview({ bundle }: ExportBundlePreviewProps) {
  return (
    <div>
      {/* Header */}
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>{bundle.title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '13px', color: '#6b7280' }}>
          <div><strong>Category:</strong> {bundle.category}</div>
          <div><strong>Format:</strong> {bundle.format}</div>
          <div><strong>Sections:</strong> {bundle.metadata.totalSections}</div>
          <div><strong>Items:</strong> {bundle.metadata.totalItems}</div>
        </div>
      </div>
      
      {/* Sections */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Export Sections ({bundle.sections.length})</h4>
        {bundle.sections.map((section, idx) => (
          <div key={section.sectionId} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{idx + 1}. {section.title}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{section.description}</div>
              </div>
              <div style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                {section.itemCount} items
              </div>
            </div>
            {section.summary && (
              <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                <strong>Summary:</strong> {section.summary}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              <strong>Data Source:</strong> {section.dataSource}
            </div>
          </div>
        ))}
      </div>
      
      {/* Metadata */}
      <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', fontSize: '13px', color: '#6b7280' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#111827' }}>Export Metadata</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <div><strong>Bundle ID:</strong> {bundle.bundleId.substring(0, 20)}...</div>
          <div><strong>Generated:</strong> {new Date(bundle.metadata.generatedAt).toLocaleString()}</div>
          <div><strong>Computation Time:</strong> {bundle.metadata.computationTimeMs}ms</div>
          <div><strong>Estimated Size:</strong> {(bundle.metadata.estimatedSizeBytes / 1024).toFixed(1)} KB</div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <strong>Data Sources:</strong> {bundle.metadata.dataSourcesUsed.join(', ')}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT HISTORY VIEWER COMPONENT
// ============================================================================

interface ExportHistoryViewerProps {
  engine: ExportEngine;
}

function ExportHistoryViewer({ engine }: ExportHistoryViewerProps) {
  const log = engine.getLog();
  const entries = log.getLatestEntries(10).filter(e => e.entryType === 'export-generated');
  
  if (entries.length === 0) {
    return null;
  }
  
  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Recent Exports</h2>
      <div style={{ display: 'grid', gap: '10px' }}>
        {entries.slice().reverse().map((entry) => {
          const exportEntry = entry as any;
          return (
            <div
              key={entry.entryId}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  {exportEntry.export.category}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {exportEntry.export.format} • {exportEntry.export.sectionsGenerated} sections • {exportEntry.export.itemsIncluded} items
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>
                {new Date(entry.timestamp).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
