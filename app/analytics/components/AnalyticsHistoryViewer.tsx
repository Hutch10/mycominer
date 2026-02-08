// Phase 39: Global Analytics & Incident Pattern Library
// components/AnalyticsHistoryViewer.tsx
// UI for viewing analytics session logs and audit trail

'use client';

import React, { useState } from 'react';
import { AnalyticsLogEntry } from '../analyticsTypes';

interface AnalyticsHistoryViewerProps {
  logEntries: AnalyticsLogEntry[];
}

export function AnalyticsHistoryViewer({ logEntries }: AnalyticsHistoryViewerProps) {
  const [filter, setFilter] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredEntries =
    filter === 'all' ? logEntries : logEntries.filter((entry) => entry.entryType === filter);

  if (logEntries.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>No analytics history available</p>
      </div>
    );
  }

  const entryTypes = Array.from(new Set(logEntries.map((e) => e.entryType)));

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Analytics History & Audit Log</h3>

      <div style={styles.filterBar}>
        <label style={styles.filterLabel}>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Entries</option>
          {entryTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.logList}>
        {filteredEntries.map((entry) => (
          <div
            key={entry.logId}
            style={styles.logEntry}
            onClick={() => setExpandedLogId(expandedLogId === entry.logId ? null : entry.logId)}
          >
            <div style={styles.logEntryHeader}>
              <div style={styles.logEntryLeftSection}>
                <span style={{ ...styles.entryTypeBadge, backgroundColor: getEntryTypeColor(entry.entryType) }}>
                  {entry.entryType}
                </span>
                <span style={styles.timestamp}>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              <div style={styles.logEntryRightSection}>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: entry.status === 'success' ? '#c8e6c9' : entry.status === 'partial' ? '#fff9c4' : '#ffcdd2',
                    color: entry.status === 'success' ? '#2e7d32' : entry.status === 'partial' ? '#827717' : '#c62828',
                  }}
                >
                  {entry.status}
                </span>
              </div>
            </div>

            <div style={styles.logEntryMeta}>
              <small>
                Tenant: <strong>{entry.tenantId}</strong>
              </small>
              {entry.executionTimeMs !== undefined && (
                <small style={{ marginLeft: '12px' }}>
                  Execution: <strong>{entry.executionTimeMs}ms</strong>
                </small>
              )}
            </div>

            {expandedLogId === entry.logId && (
              <div style={styles.expandedLogEntry}>
                {entry.query && (
                  <div style={styles.queryDetails}>
                    <strong>Query Description:</strong>
                    <p style={styles.queryText}>{entry.query.description}</p>
                    <small>
                      Target: <code>{entry.query.target}</code> | Strategy:{' '}
                      <code>{entry.query.clusteringStrategy || 'default'}</code>
                    </small>
                  </div>
                )}

                {entry.clustersGenerated !== undefined && (
                  <div style={styles.resultsDetails}>
                    <strong>Results:</strong>
                    <ul style={styles.resultsList}>
                      {entry.clustersGenerated !== undefined && (
                        <li>Clusters Generated: {entry.clustersGenerated}</li>
                      )}
                      {entry.patternsFound !== undefined && <li>Patterns Found: {entry.patternsFound}</li>}
                      {entry.trendsComputed !== undefined && <li>Trends Computed: {entry.trendsComputed}</li>}
                    </ul>
                  </div>
                )}

                {entry.errorMessage && (
                  <div style={styles.errorDetails}>
                    <strong>Error:</strong>
                    <p style={styles.errorText}>{entry.errorMessage}</p>
                  </div>
                )}

                <div style={styles.scopeDetails}>
                  <strong>Scope:</strong>
                  <small>
                    Tenants: {entry.scopeFiltering.tenantsInScope.join(', ')} | Facilities:{' '}
                    {entry.scopeFiltering.facilitiesInScope.length > 0
                      ? entry.scopeFiltering.facilitiesInScope.join(', ')
                      : 'all'}
                  </small>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.summary}>
        <strong>Summary:</strong>
        <small>
          Total entries: <strong>{logEntries.length}</strong> | Success rate:{' '}
          <strong>
            {(
              (logEntries.filter((e) => e.status === 'success').length / logEntries.length) *
              100
            ).toFixed(0)}
            %
          </strong>
        </small>
      </div>
    </div>
  );
}

function getEntryTypeColor(entryType: string): string {
  const colors: Record<string, string> = {
    'query-initiated': '#e3f2fd',
    'clustering-complete': '#e8f5e9',
    'pattern-library-queried': '#f3e5f5',
    'trend-analysis-complete': '#fce4ec',
    'result-generated': '#e0f2f1',
    'export-requested': '#fff3e0',
    'access-denied': '#ffebee',
    error: '#ffebee',
  };
  return colors[entryType] || '#f5f5f5';
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '12px',
    color: '#333',
  },
  empty: {
    color: '#999',
    fontStyle: 'italic',
  },
  filterBar: {
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#555',
  },
  filterSelect: {
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '12px',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  logEntry: {
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    padding: '10px',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  logEntryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  logEntryLeftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  entryTypeBadge: {
    padding: '4px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#333',
  },
  timestamp: {
    fontSize: '12px',
    color: '#666',
  },
  logEntryRightSection: {
    display: 'flex',
    gap: '8px',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 600,
  },
  logEntryMeta: {
    fontSize: '11px',
    color: '#999',
    display: 'flex',
    gap: '12px',
  },
  expandedLogEntry: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  queryDetails: {
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '3px',
    fontSize: '12px',
  },
  queryText: {
    margin: '4px 0',
    color: '#333',
    fontStyle: 'italic',
  },
  resultsDetails: {
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '3px',
    fontSize: '12px',
  },
  resultsList: {
    margin: '4px 0 0 0',
    paddingLeft: '20px',
    color: '#555',
  },
  errorDetails: {
    backgroundColor: '#ffebee',
    padding: '8px',
    borderRadius: '3px',
    fontSize: '12px',
  },
  errorText: {
    margin: '4px 0',
    color: '#c62828',
  },
  scopeDetails: {
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '3px',
    fontSize: '12px',
  },
  summary: {
    fontSize: '12px',
    color: '#666',
    paddingTop: '8px',
    borderTop: '1px solid #e0e0e0',
  },
};
