// Phase 40: Operator Training Mode & Scenario Walkthroughs
// components/TrainingDashboard.tsx
// Main orchestrator wiring all training components together

'use client';

import React, { useState, useEffect } from 'react';
import { TrainingScenarioList } from './TrainingScenarioList';
import { TrainingModuleViewer } from './TrainingModuleViewer';
import { WalkthroughStepPanel } from './WalkthroughStepPanel';
import { TrainingProgressTracker } from './TrainingProgressTracker';
import { TrainingSessionHistoryViewer } from './TrainingSessionHistoryViewer';
import {
  TrainingModule,
  WalkthroughState,
  TrainingStep,
} from '../trainingTypes';
import {
  initTrainingEngine,
  queryTrainingModules,
  getTrainingModule,
  startTrainingSession,
  updateWalkthroughState,
  getActiveSession,
  endTrainingSession,
  getTrainingEngineStats,
} from '../trainingEngine';
import {
  nextStep,
  previousStep,
  markStepCompleted,
  getCurrentStep,
  isWalkthroughComplete,
  getWalkthroughProgress,
} from '../walkthroughAssembler';
import { logExplainRequested, logReplayRequested } from '../trainingSessionLog';

interface TrainingDashboardProps {
  tenantId: string;
  facilityId?: string;
  onRequestExplain?: (stepNumber: number, moduleId: string) => void;
  onRequestReplay?: (incidentId: string) => void;
}

export function TrainingDashboard({
  tenantId,
  facilityId,
  onRequestExplain,
  onRequestReplay,
}: TrainingDashboardProps) {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [walkthroughState, setWalkthroughState] = useState<WalkthroughState | null>(null);
  const [currentStep, setCurrentStep] = useState<TrainingStep | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize training engine on mount
  useEffect(() => {
    initTrainingEngine(tenantId);
  }, [tenantId]);

  // Update current step when walkthrough state changes
  useEffect(() => {
    if (walkthroughState && selectedModule) {
      const step = getCurrentStep(walkthroughState, selectedModule);
      setCurrentStep(step);
    }
  }, [walkthroughState, selectedModule]);

  const handleScenarioSelect = (scenarioId: string) => {
    const module = getTrainingModule(`module-${scenarioId}`, tenantId);
    if (module) {
      setSelectedModule(module);
      setWalkthroughState(null);
      setCurrentStep(null);
    }
  };

  const handleStartWalkthrough = () => {
    if (selectedModule) {
      const state = startTrainingSession(
        selectedModule.moduleId,
        tenantId,
        facilityId
      );
      if (state) {
        setWalkthroughState(state);
      }
    }
  };

  const handleNext = () => {
    if (walkthroughState && selectedModule) {
      const updatedState = nextStep(walkthroughState, selectedModule, tenantId, facilityId);
      setWalkthroughState(updatedState);
      updateWalkthroughState(updatedState);
      
      // Check if walkthrough is complete
      if (isWalkthroughComplete(updatedState)) {
        endTrainingSession(walkthroughState.sessionId);
        alert('Training session completed! 🎉');
      }
    }
  };

  const handlePrevious = () => {
    if (walkthroughState) {
      const updatedState = previousStep(walkthroughState);
      setWalkthroughState(updatedState);
      updateWalkthroughState(updatedState);
    }
  };

  const handleMarkComplete = () => {
    if (walkthroughState && currentStep && selectedModule) {
      const updatedState = markStepCompleted(
        walkthroughState,
        walkthroughState.currentStepIndex,
        selectedModule,
        tenantId,
        facilityId
      );
      setWalkthroughState(updatedState);
      updateWalkthroughState(updatedState);
    }
  };

  const handleRequestExplain = () => {
    if (currentStep && walkthroughState && selectedModule) {
      logExplainRequested(
        walkthroughState.sessionId,
        selectedModule.moduleId,
        currentStep.stepId,
        tenantId,
        facilityId
      );
      
      if (onRequestExplain) {
        onRequestExplain(currentStep.stepNumber, selectedModule.moduleId);
      } else {
        alert(`Explain rationale for Step ${currentStep.stepNumber}:\n\n${currentStep.rationale || 'No rationale available.'}`);
      }
    }
  };

  const handleRequestReplay = () => {
    if (selectedModule && walkthroughState) {
      const incidentId = selectedModule.scenario.sourceIncidentId;
      
      if (incidentId) {
        logReplayRequested(
          walkthroughState.sessionId,
          selectedModule.moduleId,
          incidentId,
          tenantId,
          facilityId
        );
        
        if (onRequestReplay) {
          onRequestReplay(incidentId);
        } else {
          alert(`Replay incident: ${incidentId}\n\n(Integration with Phase 38 Timeline Replay)`);
        }
      } else {
        alert('No related incident available for this training module.');
      }
    }
  };

  const stats = getTrainingEngineStats();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Operator Training Mode</h2>
        <div style={styles.headerActions}>
          <button
            style={styles.historyButton}
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? '📚 Training Modules' : '📊 Session History'}
          </button>
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Available Modules:</span>
          <span style={styles.statValue}>{stats.totalModules}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Active Sessions:</span>
          <span style={styles.statValue}>{stats.activeSessions}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Total Sessions:</span>
          <span style={styles.statValue}>{stats.totalSessions}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Completed Sessions:</span>
          <span style={styles.statValue}>{stats.completedSessions}</span>
        </div>
      </div>

      {showHistory ? (
        <TrainingSessionHistoryViewer tenantId={tenantId} />
      ) : (
        <div style={styles.mainContent}>
          <div style={styles.leftPanel}>
            <TrainingScenarioList
              scenarios={queryTrainingModules({
                queryId: 'dashboard-query',
                timestamp: new Date().toISOString(),
                tenantId,
                facilityId,
              }).modules.map(m => m.scenario)}
              onScenarioSelect={handleScenarioSelect}
            />
          </div>

          <div style={styles.centerPanel}>
            {walkthroughState ? (
              <>
                <WalkthroughStepPanel
                  step={currentStep}
                  walkthroughState={walkthroughState}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onMarkComplete={handleMarkComplete}
                  onRequestExplain={handleRequestExplain}
                  onRequestReplay={handleRequestReplay}
                />
                <div style={styles.progressContainer}>
                  <TrainingProgressTracker walkthroughState={walkthroughState} />
                </div>
              </>
            ) : (
              <TrainingModuleViewer
                module={selectedModule}
                onStartWalkthrough={handleStartWalkthrough}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    margin: 0,
    color: '#333',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  historyButton: {
    padding: '10px 16px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#333',
  },
  statsBar: {
    display: 'flex',
    gap: '20px',
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0066cc',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '20px',
  },
  leftPanel: {
    maxHeight: 'calc(100vh - 280px)',
    overflowY: 'auto',
  },
  centerPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  progressContainer: {
    marginTop: 'auto',
  },
};
