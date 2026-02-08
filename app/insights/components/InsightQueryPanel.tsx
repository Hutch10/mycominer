/**
 * Phase 42 UI Components — Insight Query Panel, KnowledgePackViewer, 
 * InsightSectionPanel, InsightReferencePanel, InsightsHistoryViewer
 */

'use client';

import React, { useState } from 'react';
import { KnowledgePack, Insight, InsightReference, InsightsLogEntry, InsightCategory } from '../insightsTypes';

// ==================== INSIGHT QUERY PANEL ====================

interface InsightQueryPanelProps {
  onQuery: (category?: string, dateRange?: any) => void;
}

export default function InsightQueryPanel({ onQuery }: InsightQueryPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const categories: InsightCategory[] = [
    'incident-patterns',
    'sop-usage',
    'capa-recurrence',
    'environmental-exceptions',
    'training-performance',
    'operational-rhythms',
    'cross-facility-comparison',
    'operator-readiness',
  ];

  return (
    <div>
      <h3>Query Insights</h3>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <button
        onClick={() => onQuery(selectedCategory || undefined, startDate && endDate ? { startDate, endDate } : undefined)}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Execute Query
      </button>
    </div>
  );
}

// ==================== KNOWLEDGE PACK VIEWER ====================

interface KnowledgePackViewerProps {
  packs: KnowledgePack[];
  onSelectPack: (pack: KnowledgePack) => void;
  selectedPackId?: string;
}

export function KnowledgePackViewer({ packs, onSelectPack, selectedPackId }: KnowledgePackViewerProps) {
  const [expandedPackId, setExpandedPackId] = useState<string | null>(selectedPackId || null);

  if (packs.length === 0) {
    return <p style={{ color: '#999' }}>No knowledge packs available</p>;
  }

  return (
    <div>
      <h2>📦 Knowledge Packs</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {packs.map((pack) => (
          <div
            key={pack.packId}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#f9f9f9',
            }}
          >
            <div
              onClick={() => {
                setExpandedPackId(expandedPackId === pack.packId ? null : pack.packId);
                onSelectPack(pack);
              }}
              style={{
                padding: '15px',
                cursor: 'pointer',
                backgroundColor: expandedPackId === pack.packId ? '#e3f2fd' : '#fff',
                borderBottom: expandedPackId === pack.packId ? '2px solid #1976d2' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>
                    {pack.is_featured ? '⭐ ' : ''}{pack.name}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '13px' }}>
                    {pack.description}
                  </p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#666' }}>
                    <span>📂 {pack.category}</span>
                    <span>⏱️ {pack.estimated_read_time_minutes} min</span>
                    <span>👁️ {pack.access_count} accesses</span>
                  </div>
                </div>
                <div style={{ fontSize: '18px' }}>{expandedPackId === pack.packId ? '▼' : '▶'}</div>
              </div>
            </div>

            {expandedPackId === pack.packId && (
              <div style={{ padding: '15px', borderTop: '1px solid #e0e0e0' }}>
                <h4>📌 Key Insights:</h4>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                  {pack.key_insights.map((insight, idx) => (
                    <li key={idx} style={{ marginBottom: '5px', fontSize: '13px' }}>
                      {insight}
                    </li>
                  ))}
                </ul>

                {pack.sections.length > 0 && (
                  <>
                    <h4>📄 Sections:</h4>
                    <div style={{ marginTop: '10px' }}>
                      {pack.sections.map((section, idx) => (
                        <div key={idx} style={{ marginBottom: '10px', paddingLeft: '10px' }}>
                          <strong>{idx + 1}. {section.title}</strong>
                          <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>
                            {section.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== INSIGHT SECTION PANEL ====================

interface InsightSectionPanelProps {
  insight: Insight;
  onExplain?: (insightId: string, title: string) => void;
  onReplayIncident?: (timelineEventId: string) => void;
  onViewPattern?: (analyticsClusterId: string) => void;
  onOpenTraining?: (trainingModuleId: string) => void;
}

export function InsightSectionPanel({
  insight,
  onExplain,
  onReplayIncident,
  onViewPattern,
  onOpenTraining,
}: InsightSectionPanelProps) {
  return (
    <div>
      <h2>{insight.title}</h2>
      <p style={{ color: '#666', marginBottom: '15px' }}>{insight.description}</p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Summary</h3>
        <p>{insight.summary}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Key Findings</h3>
        <ul style={{ paddingLeft: '20px' }}>
          {insight.key_findings.map((finding, idx) => (
            <li key={idx} style={{ marginBottom: '8px' }}>
              {finding}
            </li>
          ))}
        </ul>
      </div>

      {insight.safety_notes && insight.safety_notes.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <h3>⚠️ Safety Notes</h3>
          <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
            {insight.safety_notes.map((note, idx) => (
              <li key={idx} style={{ marginBottom: '5px' }}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.actionable_recommendations && insight.actionable_recommendations.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
          <h3>✓ Actionable Recommendations</h3>
          <ul style={{ paddingLeft: '20px', margin: '5px 0 0 0' }}>
            {insight.actionable_recommendations.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: '5px' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {onExplain && (
          <button
            onClick={() => onExplain(insight.insightId, insight.title)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e91e63',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            📖 Explain (Phase 37)
          </button>
        )}
        {onReplayIncident && (
          <button
            onClick={() => onReplayIncident(insight.insightId)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff9800',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ⏮️ Replay Incident (Phase 38)
          </button>
        )}
        {onViewPattern && (
          <button
            onClick={() => onViewPattern(insight.insightId)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9c27b0',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🎯 View Pattern (Phase 39)
          </button>
        )}
        {onOpenTraining && (
          <button
            onClick={() => onOpenTraining(insight.insightId)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            📚 Training (Phase 40)
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== INSIGHT REFERENCE PANEL ====================

interface InsightReferencePanelProps {
  references: InsightReference[];
}

export function InsightReferencePanel({ references }: InsightReferencePanelProps) {
  if (references.length === 0) {
    return <p style={{ color: '#999' }}>No references available</p>;
  }

  return (
    <div>
      <h3>📚 References ({references.length})</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {references.map((ref) => (
          <div
            key={ref.referenceId}
            style={{
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <strong>{ref.title}</strong>
            <p style={{ margin: '5px 0', fontSize: '13px', color: '#666' }}>
              {ref.description}
            </p>
            <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#999' }}>
              <span>Phase {ref.sourcePhase}</span>
              <span>{ref.referenceType}</span>
              {ref.confidence && <span>Confidence: {(ref.confidence * 100).toFixed(0)}%</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== INSIGHTS HISTORY VIEWER ====================

interface InsightsHistoryViewerProps {
  logs: InsightsLogEntry[];
}

export function InsightsHistoryViewer({ logs }: InsightsHistoryViewerProps) {
  if (logs.length === 0) {
    return <p style={{ color: '#999' }}>No history available</p>;
  }

  return (
    <div>
      <h2>📜 Activity History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {logs.map((log) => (
          <div
            key={log.logId}
            style={{
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor: log.result === 'failed' ? '#ffebee' : '#f9f9f9',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <strong>{log.entryType}</strong>
                <p style={{ margin: '5px 0', fontSize: '13px' }}>{log.action}</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                style={{
                  padding: '4px 8px',
                  backgroundColor: log.result === 'success' ? '#4caf50' : log.result === 'partial' ? '#ff9800' : '#f44336',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                {log.result}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
