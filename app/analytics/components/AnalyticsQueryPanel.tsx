// Phase 39: Global Analytics & Incident Pattern Library
// components/AnalyticsQueryPanel.tsx
// UI for building analytics queries with scope, target type, and clustering strategy

'use client';

import React, { useState } from 'react';
import { AnalyticsQuery, AnalyticsScope, AnalyticsTarget } from '../analyticsTypes';

interface AnalyticsQueryPanelProps {
  tenantId: string;
  onQuerySubmit: (query: AnalyticsQuery) => void;
}

export function AnalyticsQueryPanel({ tenantId, onQuerySubmit }: AnalyticsQueryPanelProps) {
  const [description, setDescription] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [target, setTarget] = useState<AnalyticsTarget>('incidents');
  const [strategy, setStrategy] = useState<'event-sequence' | 'severity-transition' | 'sop-reference' | 'capa-pattern' | 'telemetry-anomaly' | 'facility-context'>('event-sequence');
  const [includePatterns, setIncludePatterns] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scope: AnalyticsScope = {
      tenantId,
      facilityId: facilityId || undefined,
    };

    const query: AnalyticsQuery = {
      queryId: `query-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tenantId,
      target,
      scope,
      description: description || `Analyze ${target} with ${strategy}`,
      includePatterns,
      includeTrends,
      clusteringStrategy: strategy,
    };

    onQuerySubmit(query);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Analytics Query Builder</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.group}>
          <label style={styles.label}>Query Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Show recurring environmental incidents for Facility 01"
            style={styles.input}
          />
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Analysis Target:</label>
          <select value={target} onChange={(e) => setTarget(e.target.value as AnalyticsTarget)} style={styles.select}>
            <option>incidents</option>
            <option>deviations</option>
            <option>capa</option>
            <option>environmental-exceptions</option>
            <option>sop-changes</option>
            <option>resource-shortages</option>
            <option>facility-rhythms</option>
            <option>cross-tenant-federation</option>
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Clustering Strategy:</label>
          <select value={strategy} onChange={(e) => setStrategy(e.target.value as any)} style={styles.select}>
            <option value="event-sequence">Event Sequence</option>
            <option value="severity-transition">Severity Transition</option>
            <option value="sop-reference">SOP Reference</option>
            <option value="capa-pattern">CAPA Pattern</option>
            <option value="telemetry-anomaly">Telemetry Anomaly</option>
            <option value="facility-context">Facility Context</option>
          </select>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Facility (optional):</label>
          <input
            type="text"
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            placeholder="e.g., facility-01"
            style={styles.input}
          />
        </div>

        <div style={styles.checkboxGroup}>
          <label style={styles.checkboxLabel}>
            <input type="checkbox" checked={includePatterns} onChange={(e) => setIncludePatterns(e.target.checked)} />
            Include Pattern Analysis
          </label>
          <label style={styles.checkboxLabel}>
            <input type="checkbox" checked={includeTrends} onChange={(e) => setIncludeTrends(e.target.checked)} />
            Include Trend Analysis
          </label>
        </div>

        <button type="submit" style={styles.button}>
          Run Analytics Query
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '12px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '4px',
    color: '#555',
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '16px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    gap: '6px',
    cursor: 'pointer',
  },
  button: {
    padding: '10px 16px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
