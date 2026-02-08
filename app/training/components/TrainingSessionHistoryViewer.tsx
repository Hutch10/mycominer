// Phase 40: Operator Training Mode & Scenario Walkthroughs
// components/TrainingSessionHistoryViewer.tsx
// Audit log viewer for training sessions

'use client';

import React, { useState } from 'react';
import { 
  TrainingSessionLogEntry, 
  getTrainingSessionLogByTenant, 
  getTrainingSessionLogByType 
} from '../trainingSessionLog';

interface TrainingSessionHistoryViewerProps {
  tenantId: string;
}

export function TrainingSessionHistoryViewer({ tenantId }: TrainingSessionHistoryViewerProps) {
  const [filterType, setFilterType] = useState<string>('all');
  
  const allLogs = getTrainingSessionLogByTenant(tenantId);
  const filteredLogs = filterType === 'all' 
    ? allLogs 
    : getTrainingSessionLogByType(filterType as any);

  const getLogIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'session-started': '▶️',
      'session-completed': '✅',
      'session-paused': '⏸️',
      'session-resumed': '▶️',
      'step-viewed': '👁️',
      'step-completed': '✓',
      'query-executed': '🔍',
      'module-loaded': '📚',
      'reference-accessed': '📖',
      'explain-requested': '💡',
      'replay-requested': '🔄',
      'error': '❌',
    };
    return icons[type] || '•';
  };

  const getLogColor = (type: string): string => {
    const colors: Record<string, string> = {
      'session-started': '#2196f3',
      'session-completed': '#4caf50',
      'session-paused': '#ff9800',
      'session-resumed': '#2196f3',
      'step-viewed': '#9e9e9e',
      'step-completed': '#4caf50',
      'query-executed': '#9c27b0',
      'module-loaded': '#00bcd4',
      'reference-accessed': '#795548',
      'explain-requested': '#ff5722',
      'replay-requested': '#3f51b5',
      'error': '#f44336',
    };
    return colors[type] || '#757575';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Training Session History</h4>
        <select 
          style={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Events ({allLogs.length})</option>
          <option value="session-started">Session Started</option>
          <option value="session-completed">Session Completed</option>
          <option value="session-paused">Session Paused</option>
          <option value="session-resumed">Session Resumed</option>
          <option value="step-viewed">Step Viewed</option>
          <option value="step-completed">Step Completed</option>
          <option value="query-executed">Query Executed</option>
          <option value="module-loaded">Module Loaded</option>
          <option value="reference-accessed">Reference Accessed</option>
          <option value="explain-requested">Explain Requested</option>
          <option value="replay-requested">Replay Requested</option>
          <option value="error">Errors</option>
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <p style={styles.empty}>No training session history found</p>
      ) : (
        <div style={styles.logList}>
          {filteredLogs.slice().reverse().map((log, idx) => (
            <div key={idx} style={styles.logItem}>
              <div style={styles.logHeader}>
                <span style={{...styles.logIcon, color: getLogColor(log.logType)}}>
                  {getLogIcon(log.logType)}
                </span>
                <span style={styles.logType}>{log.logType}</span>
                <span style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div style={styles.logDetails}>
                {log.moduleId && (
                  <div style={styles.logDetail}>
                    <strong>Module:</strong> {log.moduleId}
                  </div>
                )}
                {log.stepNumber !== undefined && (
                  <div style={styles.logDetail}>
                    <strong>Step:</strong> {log.stepNumber}
                  </div>
                )}
                {log.queryText && (
                  <div style={styles.logDetail}>
                    <strong>Query:</strong> {log.queryText}
                  </div>
                )}
                {log.referenceId && (
                  <div style={styles.logDetail}>
                    <strong>Reference:</strong> {log.referenceId} ({log.referenceType})
                  </div>
                )}
                {log.errorMessage && (
                  <div style={styles.errorDetail}>
                    <strong>Error:</strong> {log.errorMessage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    color: '#333',
  },
  filterSelect: {
    padding: '6px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#555',
    backgroundColor: 'white',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    fontStyle: 'italic',
    fontSize: '13px',
  },
  logList: {
    maxHeight: '500px',
    overflowY: 'auto',
  },
  logItem: {
    borderBottom: '1px solid #f0f0f0',
    padding: '12px 0',
  },
  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '6px',
  },
  logIcon: {
    fontSize: '14px',
  },
  logType: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#555',
    flex: 1,
  },
  logTime: {
    fontSize: '11px',
    color: '#999',
  },
  logDetails: {
    marginLeft: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  logDetail: {
    fontSize: '11px',
    color: '#666',
  },
  errorDetail: {
    fontSize: '11px',
    color: '#f44336',
  },
};
