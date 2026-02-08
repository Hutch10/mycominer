// Phase 40: Operator Training Mode & Scenario Walkthroughs
// components/TrainingScenarioList.tsx
// UI for browsing available training scenarios

'use client';

import React, { useState } from 'react';
import { TrainingScenario, TrainingDifficulty, TrainingScenarioSource } from '../trainingTypes';

interface TrainingScenarioListProps {
  scenarios: TrainingScenario[];
  onScenarioSelect: (scenarioId: string) => void;
}

export function TrainingScenarioList({ scenarios, onScenarioSelect }: TrainingScenarioListProps) {
  const [filter, setFilter] = useState<TrainingScenarioSource | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<TrainingDifficulty | 'all'>('all');

  const filteredScenarios = scenarios.filter((s) => {
    if (filter !== 'all' && s.source !== filter) return false;
    if (difficultyFilter !== 'all' && s.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Available Training Scenarios</h3>

      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} style={styles.select}>
            <option value="all">All Types</option>
            <option value="incident-thread">Incident Response</option>
            <option value="sop-walkthrough">SOP Walkthrough</option>
            <option value="deviation-capa">Deviation & CAPA</option>
            <option value="sandbox-scenario">Sandbox Interpretation</option>
            <option value="workflow-execution">Workflow Execution</option>
            <option value="forecast-interpretation">Forecast Interpretation</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Difficulty:</label>
          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value as any)} style={styles.select}>
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div style={styles.scenarioGrid}>
        {filteredScenarios.map((scenario) => (
          <div key={scenario.scenarioId} style={styles.scenarioCard} onClick={() => onScenarioSelect(scenario.scenarioId)}>
            <div style={styles.cardHeader}>
              <h4 style={styles.scenarioName}>{scenario.name}</h4>
              <span style={{
                ...styles.difficultyBadge,
                backgroundColor: getDifficultyColor(scenario.difficulty),
              }}>
                {scenario.difficulty}
              </span>
            </div>

            <p style={styles.description}>{scenario.description}</p>

            <div style={styles.meta}>
              <span style={styles.metaItem}>⏱️ {scenario.estimatedDurationMinutes} min</span>
              <span style={styles.metaItem}>📚 {scenario.learningObjectives.length} objectives</span>
            </div>

            <div style={styles.tags}>
              {scenario.tags.slice(0, 3).map((tag) => (
                <span key={tag} style={styles.tag}>{tag}</span>
              ))}
            </div>

            <button style={styles.startButton} onClick={(e) => {
              e.stopPropagation();
              onScenarioSelect(scenario.scenarioId);
            }}>
              Start Training
            </button>
          </div>
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <p style={styles.empty}>No scenarios match the selected filters</p>
      )}
    </div>
  );
}

function getDifficultyColor(difficulty: TrainingDifficulty): string {
  const colors: Record<TrainingDifficulty, string> = {
    beginner: '#4caf50',
    intermediate: '#ff9800',
    advanced: '#f44336',
  };
  return colors[difficulty];
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#333',
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#555',
  },
  select: {
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '12px',
  },
  scenarioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  scenarioCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  scenarioName: {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0,
    color: '#333',
    flex: 1,
  },
  difficultyBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    color: 'white',
  },
  description: {
    fontSize: '13px',
    color: '#666',
    margin: '8px 0',
    lineHeight: '1.5',
  },
  meta: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
  },
  metaItem: {
    fontSize: '12px',
    color: '#999',
  },
  tags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    color: '#0066cc',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
  },
  startButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '32px',
    fontStyle: 'italic',
  },
};