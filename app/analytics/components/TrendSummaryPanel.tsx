// Phase 39: Global Analytics & Incident Pattern Library
// components/TrendSummaryPanel.tsx
// UI for displaying trend analysis with frequencies and cross-facility comparisons

'use client';

import React from 'react';
import { TrendSummary } from '../analyticsTypes';

interface TrendSummaryPanelProps {
  trends: TrendSummary[];
}

export function TrendSummaryPanel({ trends }: TrendSummaryPanelProps) {
  if (trends.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>No trend data available</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Trend Analysis ({trends.length})</h3>
      <div style={styles.trendList}>
        {trends.map((trend) => (
          <div key={trend.trendId} style={styles.trendCard}>
            <div style={styles.trendHeader}>
              <div>
                <h4 style={styles.trendName}>{trend.name}</h4>
                <p style={styles.trendDescription}>{trend.description}</p>
              </div>
              <span style={styles.metricBadge}>{trend.metric}</span>
            </div>

            <div style={styles.chartContainer}>
              <div style={styles.miniChart}>
                {trend.dataPoints.length > 0 ? (
                  <svg width="100%" height="100%" viewBox="0 0 400 150" style={styles.svg}>
                    {/* Simple bar chart visualization */}
                    {trend.dataPoints.map((point, idx) => {
                      const maxValue = Math.max(...trend.dataPoints.map((p) => p.value), 1);
                      const barHeight = (point.value / maxValue) * 100;
                      const barWidth = 400 / trend.dataPoints.length;
                      const x = (idx * barWidth) + 5;
                      const y = 150 - barHeight;
                      return (
                        <g key={idx}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth - 10}
                            height={barHeight}
                            fill="#0066cc"
                            opacity="0.7"
                          />
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <p style={styles.noData}>No data points</p>
                )}
              </div>
            </div>

            <div style={styles.dataPointsTable}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {trend.dataPoints.slice(0, 5).map((point, idx) => (
                    <tr key={idx} style={styles.tableRow}>
                      <td style={styles.td}>{point.timestamp}</td>
                      <td style={styles.td}>{point.value}</td>
                    </tr>
                  ))}
                  {trend.dataPoints.length > 5 && (
                    <tr style={styles.tableRow}>
                      <td colSpan={2} style={{ ...styles.td, textAlign: 'center', color: '#999' }}>
                        +{trend.dataPoints.length - 5} more entries
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {trend.insights.length > 0 && (
              <div style={styles.insightsSection}>
                <strong>Key Insights:</strong>
                <ul style={styles.insightsList}>
                  {trend.insights.map((insight, idx) => (
                    <li key={idx} style={styles.insight}>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.metadata}>
              <small>
                Aggregation: <strong>{trend.aggregationLevel}</strong> | Created:{' '}
                <strong>{new Date(trend.createdAt).toLocaleString()}</strong>
              </small>
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
  trendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  trendCard: {
    border: '1px solid #d0d0d0',
    borderLeft: '4px solid #0066cc',
    borderRadius: '4px',
    padding: '12px',
    backgroundColor: '#fafafa',
  },
  trendHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  trendName: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    color: '#333',
  },
  trendDescription: {
    fontSize: '12px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  metricBadge: {
    backgroundColor: '#e3f2fd',
    color: '#0066cc',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  chartContainer: {
    marginBottom: '12px',
  },
  miniChart: {
    width: '100%',
    height: '150px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    padding: '8px',
    boxSizing: 'border-box',
  },
  svg: {
    maxWidth: '100%',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    margin: 0,
    lineHeight: '150px',
  },
  dataPointsTable: {
    marginBottom: '12px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  tableHeader: {
    borderBottom: '2px solid #ccc',
  },
  th: {
    textAlign: 'left',
    padding: '6px 8px',
    fontWeight: 600,
    color: '#555',
  },
  tableRow: {
    borderBottom: '1px solid #e0e0e0',
  },
  td: {
    padding: '6px 8px',
    color: '#666',
  },
  insightsSection: {
    marginBottom: '12px',
    fontSize: '13px',
  },
  insightsList: {
    margin: '6px 0 0 0',
    paddingLeft: '20px',
  },
  insight: {
    margin: '4px 0',
    color: '#666',
  },
  metadata: {
    fontSize: '11px',
    color: '#999',
    paddingTop: '8px',
    borderTop: '1px solid #e0e0e0',
  },
};
