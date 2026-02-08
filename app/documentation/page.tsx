/**
 * Phase 47: Autonomous Documentation Engine - Dashboard Page
 * 
 * Documentation generation and exploration interface.
 * All documentation is deterministic from real system metadata.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentationEngine,
  DocumentationQuery,
  DocumentationResult,
  DocumentationSection,
  DocumentationReference,
  DocumentationStatistics,
  DocumentationTemplate,
  createDocumentationEngine
} from '../documentation';

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export default function DocumentationDashboardPage() {
  const [tenantId] = useState('demo-tenant');
  const [facilityId] = useState('facility-alpha');
  const [engine] = useState(() => createDocumentationEngine(tenantId, facilityId));

  const [statistics, setStatistics] = useState<DocumentationStatistics>(engine.getStatistics());
  const [activeTab, setActiveTab] = useState<'overview' | 'query' | 'bundles' | 'history'>('overview');
  const [generatedResult, setGeneratedResult] = useState<DocumentationResult | null>(null);
  const [selectedSection, setSelectedSection] = useState<DocumentationSection | null>(null);
  const [selectedReference, setSelectedReference] = useState<DocumentationReference | null>(null);

  useEffect(() => {
    setStatistics(engine.getStatistics());
  }, [engine]);

  const handleGenerateDocumentation = (query: DocumentationQuery) => {
    try {
      const result = engine.generateDocumentation(query, 'admin-user', ['admin', 'operator']);
      setGeneratedResult(result);
      setStatistics(engine.getStatistics());
      setActiveTab('bundles');
    } catch (error) {
      console.error('Documentation generation failed:', error);
      alert(`Failed to generate documentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          📚 Autonomous Documentation Engine
        </h1>
        <p className="text-indigo-200">
          Deterministic documentation synthesis from real system metadata • No GenAI • No invented content
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">📄</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.totalDocumentsGenerated}</div>
          <div className="text-indigo-200 text-sm">Documents Generated</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.totalSectionsGenerated}</div>
          <div className="text-indigo-200 text-sm">Sections Created</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">🔗</div>
          <div className="text-2xl font-bold text-white mb-1">{statistics.totalReferencesGenerated}</div>
          <div className="text-indigo-200 text-sm">References</div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl font-bold text-white mb-1">
            {statistics.averageExecutionTimeMs.toFixed(0)}ms
          </div>
          <div className="text-indigo-200 text-sm">Avg Generation Time</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-6">
        <div className="flex gap-2 p-2">
          {['overview', 'query', 'bundles', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-indigo-500 text-white'
                  : 'text-indigo-200 hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        {activeTab === 'overview' && (
          <DocumentationOverview
            statistics={statistics}
            templates={engine.getAllTemplates()}
            onGenerateForTemplate={(templateType) => {
              const query: DocumentationQuery = {
                queryType: 'generate-engine-documentation',
                scope: {
                  scope: 'facility',
                  tenantId,
                  facilityId
                },
                filters: {
                  templateType,
                  engineType: 'fabric'
                },
                options: {
                  format: 'markdown',
                  includeTableOfContents: true
                }
              };
              handleGenerateDocumentation(query);
            }}
          />
        )}

        {activeTab === 'query' && (
          <DocumentationQueryPanel
            tenantId={tenantId}
            facilityId={facilityId}
            templates={engine.getAllTemplates()}
            onGenerate={handleGenerateDocumentation}
          />
        )}

        {activeTab === 'bundles' && (
          <DocumentationBundleViewer
            result={generatedResult}
            onSelectSection={setSelectedSection}
            onSelectReference={setSelectedReference}
          />
        )}

        {activeTab === 'history' && (
          <DocumentationHistoryViewer log={engine.getLog()} />
        )}
      </div>

      {/* Section Detail Modal */}
      {selectedSection && (
        <DocumentationSectionPanel
          section={selectedSection}
          onClose={() => setSelectedSection(null)}
        />
      )}

      {/* Reference Detail Modal */}
      {selectedReference && (
        <DocumentationReferencePanel
          reference={selectedReference}
          onClose={() => setSelectedReference(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// DOCUMENTATION OVERVIEW COMPONENT
// ============================================================================

function DocumentationOverview({
  statistics,
  templates,
  onGenerateForTemplate
}: {
  statistics: DocumentationStatistics;
  templates: DocumentationTemplate[];
  onGenerateForTemplate: (templateType: any) => void;
}) {
  const documentsByCategory = Object.entries(statistics.documentsByCategory)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const documentsByTemplate = Object.entries(statistics.documentsByTemplate)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Documentation Engine Overview</h2>
        <p className="text-indigo-200 mb-6">
          Generate deterministic documentation from real system metadata across {templates.length} templates.
          All content is extracted from actual engine data - no AI generation, no invented content.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">Available Templates</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {templates.slice(0, 10).map((template) => (
              <div
                key={template.id}
                className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => onGenerateForTemplate(template.templateType)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">{template.name}</span>
                  <span className="text-indigo-300 text-sm">{template.category}</span>
                </div>
                <div className="text-indigo-200 text-sm">{template.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">Usage Statistics</h3>
          
          {documentsByCategory.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-white mb-2">By Category</h4>
                <div className="space-y-2">
                  {documentsByCategory.map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-indigo-200 text-sm">{category}</span>
                      <span className="text-white font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {documentsByTemplate.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-white mb-2">By Template</h4>
                  <div className="space-y-2">
                    {documentsByTemplate.slice(0, 5).map(([template, count]) => (
                      <div key={template} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <span className="text-indigo-200 text-sm">{template}</span>
                        <span className="text-white font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-indigo-200">
              <div className="text-3xl mb-2">📊</div>
              <div>No documentation generated yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">Quick Generate</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onGenerateForTemplate('engine-overview')}
            className="px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-200 transition-colors"
          >
            🔧 Engine Overview
          </button>
          <button
            onClick={() => onGenerateForTemplate('training-module-documentation')}
            className="px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-200 transition-colors"
          >
            📚 Training Module
          </button>
          <button
            onClick={() => onGenerateForTemplate('health-drift-summary')}
            className="px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-200 transition-colors"
          >
            🏥 Health Summary
          </button>
          <button
            onClick={() => onGenerateForTemplate('system-overview')}
            className="px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-200 transition-colors"
          >
            🌐 System Overview
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DOCUMENTATION QUERY PANEL COMPONENT
// ============================================================================

function DocumentationQueryPanel({
  tenantId,
  facilityId,
  templates,
  onGenerate
}: {
  tenantId: string;
  facilityId: string;
  templates: DocumentationTemplate[];
  onGenerate: (query: DocumentationQuery) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [queryType, setQueryType] = useState<string>('generate-engine-documentation');
  const [engineType, setEngineType] = useState<string>('fabric');

  const handleGenerate = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    
    const query: DocumentationQuery = {
      queryType: queryType as any,
      scope: {
        scope: 'facility',
        tenantId,
        facilityId
      },
      filters: {
        templateType: template?.templateType,
        engineType: engineType as any,
        includeReferences: true,
        includeMetadata: true
      },
      options: {
        format: 'markdown',
        includeTableOfContents: true,
        includeTimestamp: true
      }
    };

    onGenerate(query);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Generate Documentation</h2>
        <p className="text-indigo-200 mb-4">
          Select a template and configure options to generate documentation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Template Selection */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-md font-bold text-white mb-3">Template</h3>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          {selectedTemplate && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              {templates.find(t => t.id === selectedTemplate)?.description}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-md font-bold text-white mb-3">Options</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-indigo-200 text-sm mb-2">Query Type</label>
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20"
              >
                <option value="generate-engine-documentation">Engine Documentation</option>
                <option value="generate-asset-documentation">Asset Documentation</option>
                <option value="generate-system-overview">System Overview</option>
                <option value="generate-operational-documentation">Operational Summary</option>
              </select>
            </div>

            <div>
              <label className="block text-indigo-200 text-sm mb-2">Engine Type</label>
              <select
                value={engineType}
                onChange={(e) => setEngineType(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20"
              >
                <option value="fabric">Fabric</option>
                <option value="training">Training</option>
                <option value="insights">Insights</option>
                <option value="health">Health</option>
                <option value="governance">Governance</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={!selectedTemplate}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Documentation
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// DOCUMENTATION BUNDLE VIEWER COMPONENT
// ============================================================================

function DocumentationBundleViewer({
  result,
  onSelectSection,
  onSelectReference
}: {
  result: DocumentationResult | null;
  onSelectSection: (section: DocumentationSection) => void;
  onSelectReference: (reference: DocumentationReference) => void;
}) {
  if (!result) {
    return (
      <div className="text-center py-12 text-indigo-200">
        <div className="text-4xl mb-4">📄</div>
        <div>Generate documentation to view results here</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">{result.title}</h2>
        <p className="text-indigo-200 mb-4">{result.description}</p>
        <div className="flex gap-4 text-sm text-indigo-300">
          <span>Generated: {new Date(result.generatedAt).toLocaleString()}</span>
          <span>•</span>
          <span>By: {result.generatedBy}</span>
          <span>•</span>
          <span>{result.executionTimeMs}ms</span>
        </div>
      </div>

      {/* Metadata Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-indigo-200 text-sm">Sections</div>
          <div className="text-white font-bold text-xl">{result.bundle.totalSections}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-indigo-200 text-sm">References</div>
          <div className="text-white font-bold text-xl">{result.bundle.totalReferences}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-indigo-200 text-sm">Metadata Fields</div>
          <div className="text-white font-bold text-xl">{result.bundle.totalMetadataFields}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-indigo-200 text-sm">Engines Queried</div>
          <div className="text-white font-bold text-xl">{result.metadata.totalEnginesQueried}</div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">Sections</h3>
        <div className="space-y-2">
          {result.bundle.sections.map((section) => (
            <div
              key={section.id}
              className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => onSelectSection(section)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{section.title}</span>
                <span className="text-indigo-300 text-sm">{section.contentType}</span>
              </div>
              <div className="text-indigo-200 text-sm line-clamp-2">{section.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* References */}
      {result.bundle.references.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">References</h3>
          <div className="space-y-2">
            {result.bundle.references.map((reference) => (
              <div
                key={reference.id}
                className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => onSelectReference(reference)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white">{reference.targetAssetName}</span>
                  <span className="text-indigo-300 text-sm">{reference.targetEngine}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DOCUMENTATION HISTORY VIEWER COMPONENT
// ============================================================================

function DocumentationHistoryViewer({ log }: { log: any }) {
  const entries = log.getAllEntries().slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Documentation History</h2>
        <p className="text-indigo-200">Recent documentation generation activity</p>
      </div>

      <div className="space-y-2">
        {entries.length > 0 ? (
          entries.map((entry: any) => (
            <div
              key={entry.id}
              className="p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-medium">{entry.entryType}</span>
                <span className="text-indigo-300 text-sm">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-indigo-200 text-sm">
                By: {entry.performedBy} • {entry.success ? '✓ Success' : '✗ Failed'}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-indigo-200">
            <div className="text-3xl mb-2">📋</div>
            <div>No history available</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION DETAIL PANEL
// ============================================================================

function DocumentationSectionPanel({
  section,
  onClose
}: {
  section: DocumentationSection;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-slate-900 rounded-xl border border-white/10 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Section Details</h3>
            <button onClick={onClose} className="text-indigo-200 hover:text-white">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-indigo-200 text-sm mb-1">Title</div>
              <div className="text-white font-medium text-lg">{section.title}</div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Content Type</div>
              <div className="text-white">{section.contentType}</div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Content</div>
              <div className="text-white bg-white/5 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm">
                {section.content}
              </div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Metadata Sources</div>
              <div className="text-white">{section.metadataSource.length} sources</div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Last Updated</div>
              <div className="text-white">{new Date(section.lastUpdated).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REFERENCE DETAIL PANEL
// ============================================================================

function DocumentationReferencePanel({
  reference,
  onClose
}: {
  reference: DocumentationReference;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-slate-900 rounded-xl border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Reference Details</h3>
            <button onClick={onClose} className="text-indigo-200 hover:text-white">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-indigo-200 text-sm mb-1">Asset Name</div>
              <div className="text-white font-medium text-lg">{reference.targetAssetName}</div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Type</div>
              <div className="text-white">{reference.referenceType}</div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Target Engine</div>
              <div className="text-white">{reference.targetEngine} (Phase {reference.targetPhase})</div>
            </div>

            {reference.targetAssetType && (
              <div>
                <div className="text-indigo-200 text-sm mb-1">Asset Type</div>
                <div className="text-white">{reference.targetAssetType}</div>
              </div>
            )}

            <div>
              <div className="text-indigo-200 text-sm mb-1">Asset ID</div>
              <div className="text-white font-mono text-sm">{reference.targetAssetId}</div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Description</div>
              <div className="text-white">{reference.description}</div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Visibility</div>
              <div className="text-white">{reference.visibility}</div>
            </div>

            <div>
              <div className="text-indigo-200 text-sm mb-1">Scope</div>
              <div className="text-white font-mono text-sm">
                {reference.scope.scope} • Tenant: {reference.scope.tenantId}
                {reference.scope.facilityId && ` • Facility: ${reference.scope.facilityId}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
