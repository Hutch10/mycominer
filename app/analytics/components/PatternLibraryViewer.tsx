// Phase 39: Global Analytics & Incident Pattern Library
// components/PatternLibraryViewer.tsx
// UI for browsing and inspecting pattern signatures

'use client';

import React, { useState } from 'react';
import { PatternSignature } from '../analyticsTypes';

interface PatternLibraryViewerProps {
  patterns: PatternSignature[];
  onExplainPattern?: (patternId: string) => void;
}

export function PatternLibraryViewer({ patterns, onExplainPattern }: PatternLibraryViewerProps) {
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);

  if (patterns.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>No patterns found in library</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Pattern Library ({patterns.length})</h3>
      <div style={styles.patternList}>
        {patterns.map((pattern) => (
          <div
            key={pattern.patternId}
            style={styles.patternCard}
            onClick={() => setExpandedPatternId(expandedPatternId === pattern.patternId ? null : pattern.patternId)}
          >
            <div style={styles.patternHeader}>
              <div style={styles.patternNameSection}>
                <h4 style={styles.patternName}>{pattern.name}</h4>
                <span style={styles.confidenceBadge}>Confidence: {(pattern.confidence * 100).toFixed(0)}%</span>
              </div>
              <div style={styles.incidentCountBadge}>{pattern.incidentsUnderPattern} incidents</div>
            </div>

            <div style={styles.patternSequence}>
              <strong>Sequence:</strong> {pattern.characteristicSequence.join(' → ')}
            </div>

            {expandedPatternId === pattern.patternId && (
              <div style={styles.expandedContent}>
                <div style={styles.section}>
                  <strong>Severity Profile:</strong>
                  <div style={styles.severityChart}>
                    {Object.entries(pattern.severityProfile).map(([severity, ratio]) => (
                      <div key={severity} style={styles.severityBar}>
                        <span style={styles.severityLabel}>{severity}</span>
                        <div
                          style={{
                            ...styles.severityBarFill,
                            width: `${ratio * 100}%`,
                            backgroundColor: getSeverityColor(severity),
                          }}
                        />
                        <span style={styles.severityPercent}>{(ratio * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {pattern.commonSOPReferences.length > 0 && (
                  <div style={styles.section}>
                    <strong>Common SOPs:</strong>
                    <div style={styles.refList}>
                      {pattern.commonSOPReferences.map((sop) => (
                        <span key={sop} style={styles.refBadge}>
                          {sop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {pattern.telemetrySignatures.length > 0 && (
                  <div style={styles.section}>
                    <strong>Telemetry Signatures:</strong>
                    <div style={styles.refList}>
                      {pattern.telemetrySignatures.map((sig) => (
                        <span key={sig} style={styles.telemetryBadge}>
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.section}>
                  <strong>Representative Incidents:</strong>
                  <div style={styles.incidentList}>
                    {pattern.representativeIncidents.map((incId) => (
                      <span key={incId} style={styles.incidentBadge}>
                        {incId}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={styles.actionButtons}>
                  {onExplainPattern && (
                    <button
                      onClick={() => onExplainPattern(pattern.patternId)}
                      style={styles.explainButton}
                    >
                      Explain This Pattern
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: '#d32f2f',
    high: '#f57c00',
    medium: '#fbc02d',
    low: '#388e3c',
    info: '#1976d2',
  };
  return colors[severity] || '#999';
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
  patternList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  patternCard: {
    border: '1px solid #d0d0d0',
    borderLeft: '4px solid #6a1b9a',
    borderRadius: '4px',
    padding: '12px',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  patternHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  patternNameSection: {
    flex: 1,
  },
  patternName: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    color: '#333',
  },
  confidenceBadge: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  incidentCountBadge: {
    backgroundColor: '#f3e5f5',
    color: '#6a1b9a',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  patternSequence: {
    fontSize: '12px',
    color: '#555',
    marginBottom: '8px',
  },
  expandedContent: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e0e0e0',
  },
  section: {
    marginBottom: '12px',
    fontSize: '13px',
  },
  severityChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '6px',
  },
  severityBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
  },
  severityLabel: {
    minWidth: '60px',
    fontWeight: 500,
  },
  severityBarFill: {
    height: '16px',
    borderRadius: '2px',
    minWidth: '20px',
  },
  severityPercent: {
    fontSize: '11px',
    color: '#666',
    minWidth: '35px',
    textAlign: 'right',
  },
  refList: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  refBadge: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
  },
  telemetryBadge: {
    backgroundColor: '#fce4ec',
    color: '#c2185b',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
  },
  incidentList: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  incidentBadge: {
    backgroundColor: '#e0f2f1',
    color: '#00695c',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  explainButton: {
    padding: '8px 12px',
    backgroundColor: '#6a1b9a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
