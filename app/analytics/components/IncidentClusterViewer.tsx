// Phase 39: Global Analytics & Incident Pattern Library
// components/IncidentClusterViewer.tsx
// UI for displaying incident clusters with similarity metrics and representative events

'use client';

import React from 'react';
import { IncidentCluster } from '../analyticsTypes';

interface IncidentClusterViewerProps {
  clusters: IncidentCluster[];
}

export function IncidentClusterViewer({ clusters }: IncidentClusterViewerProps) {
  if (clusters.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>No incident clusters found</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Incident Clusters ({clusters.length})</h3>
      <div style={styles.clusterList}>
        {clusters.map((cluster) => (
          <div key={cluster.clusterId} style={styles.clusterCard}>
            <div style={styles.clusterHeader}>
              <h4 style={styles.clusterTitle}>{cluster.archetype}</h4>
              <span style={styles.frequencyBadge}>{cluster.frequencyInDataset} incidents</span>
            </div>

            <div style={styles.clusterMeta}>
              <div>
                <strong>Cluster ID:</strong> {cluster.clusterId}
              </div>
              <div>
                <strong>Event Sequence:</strong> {cluster.characteristicSequence.join(' → ')}
              </div>
              <div>
                <strong>Severity Pattern:</strong> {cluster.severityTransitionPattern.join(' → ')}
              </div>
            </div>

            {cluster.commonSOPReferences.length > 0 && (
              <div style={styles.referenceSection}>
                <strong>SOP References:</strong>
                <div style={styles.refList}>
                  {cluster.commonSOPReferences.map((sop) => (
                    <span key={sop} style={styles.refBadge}>
                      {sop}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cluster.commonCAPAThemes.length > 0 && (
              <div style={styles.referenceSection}>
                <strong>CAPA Themes:</strong>
                <div style={styles.refList}>
                  {cluster.commonCAPAThemes.map((capa) => (
                    <span key={capa} style={styles.capaRefBadge}>
                      {capa}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cluster.commonTelemetryAnomalies.length > 0 && (
              <div style={styles.referenceSection}>
                <strong>Telemetry Anomalies:</strong>
                <div style={styles.refList}>
                  {cluster.commonTelemetryAnomalies.map((anom) => (
                    <span key={anom} style={styles.anomalyBadge}>
                      {anom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.samplesSection}>
              <strong>Representative Events:</strong>
              <div style={styles.samplesList}>
                {cluster.eventSamples.slice(0, 3).map((event) => (
                  <div key={event.eventId} style={styles.sampleEvent}>
                    <span style={{ fontWeight: 600 }}>{event.type}</span>
                    <span style={styles.sampleTime}>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  clusterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  clusterCard: {
    border: '1px solid #d0d0d0',
    borderLeft: '4px solid #0066cc',
    borderRadius: '4px',
    padding: '12px',
    backgroundColor: '#fafafa',
  },
  clusterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  clusterTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    color: '#333',
  },
  frequencyBadge: {
    backgroundColor: '#e3f2fd',
    color: '#0066cc',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  },
  clusterMeta: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  referenceSection: {
    marginBottom: '8px',
    fontSize: '13px',
  },
  refList: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginTop: '4px',
  },
  refBadge: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
  },
  capaRefBadge: {
    backgroundColor: '#f3e5f5',
    color: '#6a1b9a',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
  },
  anomalyBadge: {
    backgroundColor: '#ffe0b2',
    color: '#bf360c',
    padding: '3px 8px',
    borderRadius: '3px',
    fontSize: '11px',
  },
  samplesSection: {
    marginTop: '8px',
    fontSize: '13px',
  },
  samplesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px',
  },
  sampleEvent: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    padding: '4px 8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
  },
  sampleTime: {
    color: '#999',
    fontSize: '11px',
  },
};
