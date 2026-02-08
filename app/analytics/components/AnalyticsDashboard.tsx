// Phase 39: Global Analytics & Incident Pattern Library
// components/AnalyticsDashboard.tsx
// Orchestrator component wiring query panel, clusters, patterns, trends, history

'use client';

import React, { useState } from 'react';
import { AnalyticsQuery, AnalyticsResult } from '../analyticsTypes';
import { AnalyticsQueryPanel } from './AnalyticsQueryPanel';
import { IncidentClusterViewer } from './IncidentClusterViewer';
import { PatternLibraryViewer } from './PatternLibraryViewer';
import { TrendSummaryPanel } from './TrendSummaryPanel';
import { AnalyticsHistoryViewer } from './AnalyticsHistoryViewer';

interface AnalyticsDashboardProps {
  tenantId: string;
  onQuerySubmit: (query: AnalyticsQuery) => void;
  analyticsResults: AnalyticsResult | null;
  analyticsLog: any[];
  onExplainPattern?: (patternId: string) => void;
  onReplayIncident?: (incidentId: string) => void;
}

export function AnalyticsDashboard({
  tenantId,
  onQuerySubmit,
  analyticsResults,
  analyticsLog,
  onExplainPattern,
  onReplayIncident,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'clusters' | 'patterns' | 'trends' | 'history'>('overview');

  const handleQuerySubmit = (query: AnalyticsQuery) => {
    onQuerySubmit(query);
    setActiveTab('overview');
  };

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.headerSection}>
        <h2 style={styles.title}>Analytics & Incident Pattern Library</h2>
        <p style={styles.subtitle}>Tenant: {tenantId}</p>
      </div>

      <div style={styles.mainLayout}>
        <div style={styles.leftPanel}>
          <AnalyticsQueryPanel tenantId={tenantId} onQuerySubmit={handleQuerySubmit} />
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.tabBar}>
            {['overview', 'clusters', 'patterns', 'trends', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  ...styles.tabButton,
                  borderBottom: activeTab === tab ? '3px solid #0066cc' : 'none',
                  color: activeTab === tab ? '#0066cc' : '#666',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div style={styles.contentArea}>
            {activeTab === 'overview' && (
              <div>
                {analyticsResults ? (
                  <div style={styles.overviewSection}>
                    <div style={styles.summaryCards}>
                      <div style={styles.summaryCard}>
                        <div style={styles.cardValue}>{analyticsResults.clusters.length}</div>
                        <div style={styles.cardLabel}>Incident Clusters</div>
                      </div>
                      <div style={styles.summaryCard}>
                        <div style={styles.cardValue}>{analyticsResults.patterns.length}</div>
                        <div style={styles.cardLabel}>Patterns Found</div>
                      </div>
                      <div style={styles.summaryCard}>
                        <div style={styles.cardValue}>{analyticsResults.trends.length}</div>
                        <div style={styles.cardLabel}>Trend Analysis</div>
                      </div>
                      <div style={styles.summaryCard}>
                        <div style={styles.cardValue}>{analyticsResults.executionTimeMs}ms</div>
                        <div style={styles.cardLabel}>Execution Time</div>
                      </div>
                    </div>

                    <div style={styles.referenceIndexSection}>
                      <h4 style={styles.sectionTitle}>Reference Index</h4>
                      <div style={styles.referenceGrid}>
                        <div>
                          <strong>{analyticsResults.referenceIndex.incidentIds.length}</strong> incident IDs
                        </div>
                        <div>
                          <strong>{analyticsResults.referenceIndex.capaIds.length}</strong> CAPA actions
                        </div>
                        <div>
                          <strong>{analyticsResults.referenceIndex.deviationIds.length}</strong> deviations
                        </div>
                        <div>
                          <strong>{analyticsResults.referenceIndex.sopIds.length}</strong> SOP references
                        </div>
                        <div>
                          <strong>{analyticsResults.referenceIndex.facilityIds.length}</strong> facilities involved
                        </div>
                      </div>
                    </div>

                    <div style={styles.queryDisplaySection}>
                      <h4 style={styles.sectionTitle}>Last Query</h4>
                      <div style={styles.queryDisplay}>
                        <div>
                          <strong>Target:</strong> {analyticsResults.query.target}
                        </div>
                        <div>
                          <strong>Strategy:</strong> {analyticsResults.query.clusteringStrategy}
                        </div>
                        <div>
                          <strong>Description:</strong> {analyticsResults.query.description}
                        </div>
                        <div>
                          <strong>Generated:</strong> {new Date(analyticsResults.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.noResults}>
                    <p>Run a query to see analytics results</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'clusters' && analyticsResults && (
              <IncidentClusterViewer clusters={analyticsResults.clusters} />
            )}

            {activeTab === 'patterns' && analyticsResults && (
              <PatternLibraryViewer patterns={analyticsResults.patterns} onExplainPattern={onExplainPattern} />
            )}

            {activeTab === 'trends' && analyticsResults && (
              <TrendSummaryPanel trends={analyticsResults.trends} />
            )}

            {activeTab === 'history' && (
              <AnalyticsHistoryViewer logEntries={analyticsLog} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    padding: '16px',
    backgroundColor: '#fafafa',
    minHeight: '100vh',
  },
  headerSection: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '16px',
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: 'white',
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid #e0e0e0',
    padding: '0 16px',
    gap: '12px',
  },
  tabButton: {
    padding: '12px 0',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    transition: 'color 0.2s',
  },
  contentArea: {
    padding: '16px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
  },
  overviewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#0066cc',
    margin: '0 0 4px 0',
  },
  cardLabel: {
    fontSize: '12px',
    color: '#999',
    fontWeight: 500,
  },
  referenceIndexSection: {
    backgroundColor: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: '8px',
    padding: '16px',
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0066cc',
  },
  referenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    fontSize: '13px',
    color: '#333',
  },
  queryDisplaySection: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
  },
  queryDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '13px',
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#999',
  },
};
