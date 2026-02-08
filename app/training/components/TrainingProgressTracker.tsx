// Phase 40: Operator Training Mode & Scenario Walkthroughs
// components/TrainingProgressTracker.tsx
// Visual progress indicator for walkthrough

'use client';

import React from 'react';
import { WalkthroughState } from '../trainingTypes';

interface TrainingProgressTrackerProps {
  walkthroughState: WalkthroughState | null;
}

export function TrainingProgressTracker({ walkthroughState }: TrainingProgressTrackerProps) {
  if (!walkthroughState) {
    return null;
  }

  const progressPercentage = Math.round(
    (walkthroughState.completedSteps.length / walkthroughState.totalSteps) * 100
  );

  const estimatedTimeRemaining = Math.round(
    ((walkthroughState.totalSteps - walkthroughState.completedSteps.length) * 5) // Assume 5 min per step
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Training Progress</h4>
        <span style={styles.percentage}>{progressPercentage}%</span>
      </div>

      <div style={styles.progressBarContainer}>
        <div style={{...styles.progressBarFill, width: `${progressPercentage}%`}} />
      </div>

      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Completed Steps:</span>
          <span style={styles.statValue}>
            {walkthroughState.completedSteps.length} / {walkthroughState.totalSteps}
          </span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Current Step:</span>
          <span style={styles.statValue}>{walkthroughState.currentStepIndex + 1}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Est. Time Remaining:</span>
          <span style={styles.statValue}>~{estimatedTimeRemaining} min</span>
        </div>
      </div>

      {walkthroughState.stepHistory.length > 0 && (
        <details style={styles.historyDetails}>
          <summary style={styles.historySummary}>
            📊 Step History ({walkthroughState.stepHistory.length})
          </summary>
          <div style={styles.historyList}>
            {walkthroughState.stepHistory.slice().reverse().map((step, idx) => (
              <div key={idx} style={styles.historyItem}>
                <span style={styles.historyStep}>Step {step.stepNumber}</span>
                <span style={styles.historyTime}>
                  {new Date(step.viewedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </details>
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
    marginBottom: '12px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    color: '#333',
  },
  percentage: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0066cc',
  },
  progressBarContainer: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease',
  },
  stats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  statLabel: {
    color: '#666',
  },
  statValue: {
    fontWeight: 600,
    color: '#333',
  },
  historyDetails: {
    marginTop: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '12px',
  },
  historySummary: {
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#666',
  },
  historyList: {
    marginTop: '10px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  historyStep: {
    fontSize: '12px',
    color: '#555',
  },
  historyTime: {
    fontSize: '11px',
    color: '#999',
  },
};
