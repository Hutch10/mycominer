// Phase 40: Operator Training Mode & Scenario Walkthroughs
// components/WalkthroughStepPanel.tsx
// Step-by-step walkthrough interface

'use client';

import React from 'react';
import { TrainingStep, WalkthroughState } from '../trainingTypes';

interface WalkthroughStepPanelProps {
  step: TrainingStep | null;
  walkthroughState: WalkthroughState | null;
  onNext: () => void;
  onPrevious: () => void;
  onMarkComplete: () => void;
  onRequestExplain: () => void;
  onRequestReplay: () => void;
}

export function WalkthroughStepPanel({
  step,
  walkthroughState,
  onNext,
  onPrevious,
  onMarkComplete,
  onRequestExplain,
  onRequestReplay,
}: WalkthroughStepPanelProps) {
  if (!step || !walkthroughState) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>Start a walkthrough to begin training</p>
      </div>
    );
  }

  const isFirstStep = walkthroughState.currentStepIndex === 0;
  const isLastStep = walkthroughState.currentStepIndex === walkthroughState.totalSteps - 1;
  const isStepCompleted = walkthroughState.completedSteps.includes(step.stepNumber);

  const getStepTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'information': '#4caf50',
      'action-required': '#ff9800',
      'decision-point': '#2196f3',
      'safety-check': '#f44336',
      'verification': '#9c27b0',
      'context-review': '#795548',
      'reference-lookup': '#00bcd4',
    };
    return colors[type] || '#757575';
  };

  return (
    <div style={styles.container}>
      <div style={styles.stepHeader}>
        <div style={styles.stepInfo}>
          <span style={styles.stepNumber}>Step {step.stepNumber} of {walkthroughState.totalSteps}</span>
          <span style={{...styles.stepTypeBadge, backgroundColor: getStepTypeColor(step.stepType)}}>
            {step.stepType}
          </span>
        </div>
        {isStepCompleted && (
          <span style={styles.completedBadge}>✓ Completed</span>
        )}
      </div>

      <h3 style={styles.stepTitle}>{step.title}</h3>
      <p style={styles.stepContent}>{step.content}</p>

      {step.safetyNotes && step.safetyNotes.length > 0 && (
        <div style={styles.safetySection}>
          <h4 style={styles.safetyTitle}>⚠️ Safety Notes</h4>
          <ul style={styles.safetyList}>
            {step.safetyNotes.map((note, idx) => (
              <li key={idx} style={styles.safetyItem}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {step.references && Object.keys(step.references).length > 0 && (
        <div style={styles.referencesSection}>
          <h4 style={styles.sectionTitle}>📚 References</h4>
          <div style={styles.refGrid}>
            {step.references.incidentIds?.map((id, idx) => (
              <div key={idx} style={styles.refItem}>Incident: {id}</div>
            ))}
            {step.references.sopIds?.map((id, idx) => (
              <div key={idx} style={styles.refItem}>SOP: {id}</div>
            ))}
            {step.references.workflowIds?.map((id, idx) => (
              <div key={idx} style={styles.refItem}>Workflow: {id}</div>
            ))}
            {step.references.complianceEventIds?.map((id, idx) => (
              <div key={idx} style={styles.refItem}>Compliance: {id}</div>
            ))}
          </div>
        </div>
      )}

      {step.expectedAction && (
        <div style={styles.actionSection}>
          <h4 style={styles.sectionTitle}>🎯 Expected Action</h4>
          <p style={styles.actionText}>{step.expectedAction}</p>
        </div>
      )}

      {step.hints && step.hints.length > 0 && (
        <details style={styles.hintsDetails}>
          <summary style={styles.hintsSummary}>💡 Hints ({step.hints.length})</summary>
          <ul style={styles.hintsList}>
            {step.hints.map((hint, idx) => (
              <li key={idx} style={styles.hintItem}>{hint}</li>
            ))}
          </ul>
        </details>
      )}

      <div style={styles.integrationButtons}>
        <button style={styles.integrationButton} onClick={onRequestExplain}>
          🔍 Explain Rationale
        </button>
        <button style={styles.integrationButton} onClick={onRequestReplay}>
          🔄 Replay Related Incident
        </button>
      </div>

      <div style={styles.navigationButtons}>
        <button
          style={{...styles.navButton, ...styles.prevButton}}
          onClick={onPrevious}
          disabled={isFirstStep}
        >
          ← Previous
        </button>
        
        {!isStepCompleted && (
          <button
            style={styles.completeButton}
            onClick={onMarkComplete}
          >
            Mark Complete
          </button>
        )}
        
        <button
          style={{...styles.navButton, ...styles.nextButton}}
          onClick={onNext}
          disabled={isLastStep}
        >
          Next →
        </button>
      </div>

      {step.rationale && (
        <details style={styles.rationaleDetails}>
          <summary style={styles.rationaleSummary}>📖 Step Rationale</summary>
          <p style={styles.rationaleText}>{step.rationale}</p>
        </details>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '24px',
    backgroundColor: 'white',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    fontStyle: 'italic',
  },
  stepHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  stepInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#666',
  },
  stepTypeBadge: {
    color: 'white',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  completedBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#333',
  },
  stepContent: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.7',
    marginBottom: '20px',
  },
  safetySection: {
    backgroundColor: '#fff3e0',
    border: '2px solid #ff9800',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '20px',
  },
  safetyTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: '#e65100',
  },
  safetyList: {
    margin: '0',
    paddingLeft: '20px',
  },
  safetyItem: {
    fontSize: '13px',
    color: '#e65100',
    marginBottom: '4px',
  },
  referencesSection: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '10px',
    color: '#333',
  },
  refGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  refItem: {
    backgroundColor: '#e3f2fd',
    color: '#0066cc',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  actionSection: {
    backgroundColor: '#f3e5f5',
    border: '1px solid #9c27b0',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '20px',
  },
  actionText: {
    fontSize: '13px',
    color: '#4a148c',
    margin: 0,
  },
  hintsDetails: {
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '12px',
  },
  hintsSummary: {
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#555',
  },
  hintsList: {
    marginTop: '10px',
    paddingLeft: '20px',
  },
  hintItem: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '6px',
  },
  integrationButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  integrationButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#333',
  },
  navigationButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  navButton: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  prevButton: {
    color: '#555',
  },
  nextButton: {
    color: '#555',
  },
  completeButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  rationaleDetails: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '12px',
  },
  rationaleSummary: {
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#666',
  },
  rationaleText: {
    fontSize: '12px',
    color: '#555',
    marginTop: '10px',
    lineHeight: '1.6',
  },
};
