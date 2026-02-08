// Phase 40: Operator Training Mode & Scenario Walkthroughs
// components/TrainingModuleViewer.tsx
// UI for displaying module metadata and starting walkthrough

'use client';

import React from 'react';
import { TrainingModule } from '../trainingTypes';

interface TrainingModuleViewerProps {
  module: TrainingModule | null;
  onStartWalkthrough: () => void;
}

export function TrainingModuleViewer({ module, onStartWalkthrough }: TrainingModuleViewerProps) {
  if (!module) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>Select a training scenario to view details</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{module.scenario.name}</h3>
        <span style={styles.versionBadge}>v{module.metadata.version}</span>
      </div>

      <p style={styles.description}>{module.scenario.description}</p>

      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <strong>Difficulty:</strong> {module.scenario.difficulty}
        </div>
        <div style={styles.infoItem}>
          <strong>Duration:</strong> ~{module.scenario.estimatedDurationMinutes} min
        </div>
        <div style={styles.infoItem}>
          <strong>Total Steps:</strong> {module.totalSteps}
        </div>
        <div style={styles.infoItem}>
          <strong>Status:</strong> {module.metadata.approvalStatus}
        </div>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Learning Objectives</h4>
        <ul style={styles.list}>
          {module.scenario.learningObjectives.map((obj, idx) => (
            <li key={idx} style={styles.listItem}>{obj}</li>
          ))}
        </ul>
      </div>

      {module.scenario.prerequisites.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Prerequisites</h4>
          <ul style={styles.list}>
            {module.scenario.prerequisites.map((prereq, idx) => (
              <li key={idx} style={styles.listItem}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}

      {module.completionCriteria && module.completionCriteria.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Completion Criteria</h4>
          <ul style={styles.list}>
            {module.completionCriteria.map((criteria, idx) => (
              <li key={idx} style={styles.listItem}>{criteria}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.references}>
        <h4 style={styles.sectionTitle}>References</h4>
        <div style={styles.refGrid}>
          {module.scenario.sourceIncidentId && (
            <div style={styles.refBadge}>Incident: {module.scenario.sourceIncidentId}</div>
          )}
          {module.scenario.sourceSOPId && (
            <div style={styles.refBadge}>SOP: {module.scenario.sourceSOPId}</div>
          )}
          {module.scenario.sourceWorkflowId && (
            <div style={styles.refBadge}>Workflow: {module.scenario.sourceWorkflowId}</div>
          )}
          {module.scenario.sourceSandboxId && (
            <div style={styles.refBadge}>Sandbox: {module.scenario.sourceSandboxId}</div>
          )}
        </div>
      </div>

      <button style={styles.startButton} onClick={onStartWalkthrough}>
        Begin Walkthrough
      </button>

      <div style={styles.footer}>
        <small>Last updated: {new Date(module.metadata.lastUpdated).toLocaleDateString()}</small>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    fontStyle: 'italic',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
    color: '#333',
  },
  versionBadge: {
    backgroundColor: '#e0e0e0',
    color: '#666',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  description: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
    lineHeight: '1.6',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
  },
  infoItem: {
    fontSize: '13px',
    color: '#555',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#333',
  },
  list: {
    margin: '0',
    paddingLeft: '20px',
  },
  listItem: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '6px',
  },
  references: {
    marginBottom: '20px',
  },
  refGrid: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  refBadge: {
    backgroundColor: '#e3f2fd',
    color: '#0066cc',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  startButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    fontSize: '11px',
  },
};
