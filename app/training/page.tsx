// Phase 40: Operator Training Mode & Scenario Walkthroughs
// page.tsx
// Main page with sample training session

'use client';

import React from 'react';
import { TrainingDashboard } from './components/TrainingDashboard';

export default function TrainingPage() {
  const handleRequestExplain = (stepNumber: number, moduleId: string) => {
    console.log(`[Phase 37 Integration] Explain requested for step ${stepNumber} in module ${moduleId}`);
    // In production: call Phase 37 narrative explanation engine
    alert(`Phase 37 Integration: Generate explanation for step ${stepNumber}\n\nModule: ${moduleId}\n\nThis would invoke the narrative engine to explain why this step is important.`);
  };

  const handleRequestReplay = (incidentId: string) => {
    console.log(`[Phase 38 Integration] Replay requested for incident ${incidentId}`);
    // In production: call Phase 38 timeline replay engine
    alert(`Phase 38 Integration: Replay incident ${incidentId}\n\nThis would invoke the timeline replay to show how the incident unfolded.`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>Phase 40: Operator Training Mode & Scenario Walkthroughs</h3>
        <p style={styles.infoText}>
          Deterministic, read-only operator training system using real historical incidents, SOPs, 
          workflows, compliance events, and sandbox scenarios to generate guided training modules.
        </p>
        <div style={styles.featureList}>
          <div style={styles.feature}>
            <strong>✓ 8 Scenario Sources:</strong> incident-thread, sop-walkthrough, deviation-capa, 
            sandbox-scenario, workflow-execution, environmental-exception, compliance-summary, forecast-interpretation
          </div>
          <div style={styles.feature}>
            <strong>✓ Step-by-Step Walkthroughs:</strong> Navigate through training scenarios with 
            7 step types (information, action-required, decision-point, safety-check, verification, 
            context-review, reference-lookup)
          </div>
          <div style={styles.feature}>
            <strong>✓ Comprehensive Logging:</strong> All training activities logged with 11 event 
            types (session lifecycle, step tracking, reference access, integration hooks)
          </div>
          <div style={styles.feature}>
            <strong>✓ Phase Integration:</strong> Hooks to Phase 37 (explain step rationale) and 
            Phase 38 (replay related incidents)
          </div>
          <div style={styles.feature}>
            <strong>✓ Read-Only & Deterministic:</strong> No biological simulation, no predictions, 
            no auto-execution. Tenant isolation enforced.
          </div>
        </div>
      </div>

      <TrainingDashboard
        tenantId="tenant-alpha"
        facilityId="facility-01"
        onRequestExplain={handleRequestExplain}
        onRequestReplay={handleRequestReplay}
      />

      <div style={styles.usageGuide}>
        <h4 style={styles.usageTitle}>Usage Guide</h4>
        <ol style={styles.usageSteps}>
          <li>Browse available training scenarios in the left panel</li>
          <li>Filter by scenario type (8 sources) or difficulty (3 levels)</li>
          <li>Click on a scenario to view module details and learning objectives</li>
          <li>Click "Begin Walkthrough" to start a training session</li>
          <li>Progress through steps using Previous/Next navigation</li>
          <li>Click "Mark Complete" after reviewing each step</li>
          <li>Use "Explain Rationale" to invoke Phase 37 narrative engine</li>
          <li>Use "Replay Related Incident" to invoke Phase 38 timeline replay</li>
          <li>View session history using "Session History" button in header</li>
          <li>Track progress with real-time progress bar and statistics</li>
        </ol>
      </div>

      <div style={styles.integrationBox}>
        <h4 style={styles.integrationTitle}>Integration Points</h4>
        <div style={styles.integrationGrid}>
          <div style={styles.integrationItem}>
            <strong>Phase 31 (SOP):</strong> SOP walkthrough scenarios reference real SOP templates
          </div>
          <div style={styles.integrationItem}>
            <strong>Phase 32 (Compliance):</strong> Deviation+CAPA scenarios use real compliance events
          </div>
          <div style={styles.integrationItem}>
            <strong>Phase 30 (Sandbox):</strong> Sandbox interpretation scenarios use real sandbox experiments
          </div>
          <div style={styles.integrationItem}>
            <strong>Phase 38 (Timeline):</strong> Incident scenarios reference real incident threads
          </div>
          <div style={styles.integrationItem}>
            <strong>Phase 37 (Narrative):</strong> Explain rationale uses narrative engine
          </div>
          <div style={styles.integrationItem}>
            <strong>Phase 29 (Forecasting):</strong> Forecast interpretation scenarios use historical forecasts
          </div>
          <div style={styles.integrationItem}>
            <strong>Phase 34 (KG):</strong> All references link to knowledge graph entities
          </div>
          <div style={styles.integrationItem}>
            <strong>Phase 36 (Workflow):</strong> Workflow execution scenarios use real workflow definitions
          </div>
        </div>
      </div>

      <div style={styles.sampleData}>
        <h4 style={styles.sampleTitle}>Sample Training Modules</h4>
        <ul style={styles.sampleList}>
          <li><strong>Environmental Exception Response:</strong> 6-step walkthrough covering temperature spike detection, safety checks, deviation logging, SOP reference, CAPA initiation, and verification</li>
          <li><strong>SOP Walkthrough - Aseptic Transfer:</strong> 3-step training on SOP overview, safety protocols, and execution steps</li>
          <li><strong>Deviation + CAPA Analysis:</strong> Training on analyzing deviation patterns and CAPA effectiveness</li>
          <li><strong>Sandbox Interpretation:</strong> Training on interpreting sandbox experiment results</li>
          <li><strong>Forecast Interpretation:</strong> Training on understanding historical forecasts and predictive analytics</li>
          <li><strong>Workflow Execution:</strong> Training on following workflow steps and decision logic</li>
        </ul>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    border: '2px solid #2196f3',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '24px',
  },
  infoTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginTop: 0,
    marginBottom: '12px',
    color: '#0d47a1',
  },
  infoText: {
    fontSize: '14px',
    color: '#1565c0',
    marginBottom: '16px',
    lineHeight: '1.6',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  feature: {
    fontSize: '13px',
    color: '#1565c0',
    padding: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '4px',
  },
  usageGuide: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '24px',
  },
  usageTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '12px',
    color: '#333',
  },
  usageSteps: {
    margin: 0,
    paddingLeft: '24px',
    fontSize: '13px',
    color: '#555',
    lineHeight: '1.8',
  },
  integrationBox: {
    backgroundColor: '#fff3e0',
    border: '2px solid #ff9800',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '24px',
  },
  integrationTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '12px',
    color: '#e65100',
  },
  integrationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  integrationItem: {
    fontSize: '13px',
    color: '#e65100',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '4px',
  },
  sampleData: {
    backgroundColor: '#f1f8e9',
    border: '1px solid #8bc34a',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '24px',
  },
  sampleTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '12px',
    color: '#33691e',
  },
  sampleList: {
    margin: 0,
    paddingLeft: '24px',
    fontSize: '13px',
    color: '#558b2f',
    lineHeight: '1.8',
  },
};
