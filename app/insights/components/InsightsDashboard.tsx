/**
 * Phase 42 UI Components — Insights Dashboard
 * 
 * Main orchestrator component for the Operator Insights interface.
 * 5-view navigation: Browse | Insights | Packs | Recommendations | History
 */

'use client';

import React, { useState, useEffect } from 'react';
import { KnowledgePack, InsightQueryResult, Insight, InsightsLogEntry } from '../insightsTypes';
import { queryInsights, listKnowledgePacksForTenant, getInsightsLog, getInsightsStats } from '../insightsEngine';
import InsightQueryPanel from './InsightQueryPanel';
import { KnowledgePackViewer } from './InsightQueryPanel';
import { InsightSectionPanel } from './InsightQueryPanel';
import { InsightReferencePanel } from './InsightQueryPanel';
import { InsightsHistoryViewer } from './InsightQueryPanel';

interface DashboardProps {
  tenantId: string;
  facilityId?: string;
  onExplain?: (insightId: string, title: string) => void;
  onReplayIncident?: (timelineEventId: string) => void;
  onViewPattern?: (analyticsClusterId: string) => void;
  onOpenTraining?: (trainingModuleId: string) => void;
}

export default function InsightsDashboard({
  tenantId,
  facilityId,
  onExplain,
  onReplayIncident,
  onViewPattern,
  onOpenTraining,
}: DashboardProps) {
  const [view, setView] = useState<'browse' | 'insights' | 'packs' | 'recommendations' | 'history'>('browse');
  const [selectedPack, setSelectedPack] = useState<KnowledgePack | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [queryResult, setQueryResult] = useState<InsightQueryResult | null>(null);
  const [packs, setPacks] = useState<KnowledgePack[]>([]);
  const [logs, setLogs] = useState<InsightsLogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Initialize data
  useEffect(() => {
    loadInitialData();
  }, [tenantId, facilityId]);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [packsData, logsData, statsData] = await Promise.all([
        listKnowledgePacksForTenant(tenantId, facilityId),
        getInsightsLog(tenantId, facilityId, 20),
        getInsightsStats(tenantId),
      ]);
      setPacks(packsData);
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load insights data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleQueryInsights(category?: string, dateRange?: any) {
    setLoading(true);
    try {
      const result = await queryInsights({
        tenantId,
        facilityId,
        insightCategory: category as any,
        dateRange,
      });
      setQueryResult(result);
      setView('insights');
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* Header with Navigation */}
      <div style={styles.header}>
        <div style={styles.titleBar}>
          <h1 style={styles.title}>📊 Operator Insights & Knowledge Packs</h1>
          <p style={styles.subtitle}>Synthesized from Phases 34, 37, 38, 39, 40</p>
        </div>

        {/* Navigation Tabs */}
        <div style={styles.navTabs}>
          {(['browse', 'insights', 'packs', 'recommendations', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              style={{
                ...styles.navButton,
                ...(view === tab ? styles.navButtonActive : styles.navButtonInactive),
              }}
            >
              {tab === 'browse' && '🔍 Browse'}
              {tab === 'insights' && '💡 Insights'}
              {tab === 'packs' && '📦 Packs'}
              {tab === 'recommendations' && '⭐ Recommendations'}
              {tab === 'history' && '📜 History'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.total_knowledge_packs}</div>
            <div style={styles.statLabel}>Knowledge Packs</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.featured_packs}</div>
            <div style={styles.statLabel}>Featured</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{stats.average_pack_read_time} min</div>
            <div style={styles.statLabel}>Avg Read Time</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>5</div>
            <div style={styles.statLabel}>Source Phases</div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div style={styles.contentArea}>
        {view === 'browse' && (
          <div style={styles.browseView}>
            <div style={styles.browseLeft}>
              <InsightQueryPanel onQuery={handleQueryInsights} />
            </div>
            <div style={styles.browseRight}>
              {selectedInsight ? (
                <InsightSectionPanel
                  insight={selectedInsight}
                  onExplain={onExplain}
                  onReplayIncident={onReplayIncident}
                  onViewPattern={onViewPattern}
                  onOpenTraining={onOpenTraining}
                />
              ) : (
                <div style={styles.emptyState}>
                  <p>Select an insight to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'insights' && queryResult && (
          <div style={styles.fullWidthView}>
            <h2>Query Results: {queryResult.filteredCount} insights</h2>
            <div style={styles.insightsList}>
              {queryResult.insights.map((insight) => (
                <div
                  key={insight.insightId}
                  style={styles.insightCard}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <h3>{insight.title}</h3>
                  <p>{insight.summary}</p>
                  <div style={styles.badge}>{insight.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'packs' && (
          <div style={styles.fullWidthView}>
            <KnowledgePackViewer
              packs={packs}
              onSelectPack={setSelectedPack}
              selectedPackId={selectedPack?.packId}
            />
          </div>
        )}

        {view === 'recommendations' && (
          <div style={styles.fullWidthView}>
            <h2>Recommended Knowledge Packs</h2>
            <div style={styles.recommendationsList}>
              {packs
                .filter((p) => p.is_featured)
                .map((pack) => (
                  <div key={pack.packId} style={styles.recommendationCard}>
                    <h3>{pack.name}</h3>
                    <p>{pack.description}</p>
                    <p>⭐ {pack.access_count} accesses | ⏱️ {pack.estimated_read_time_minutes} min read</p>
                    <button
                      onClick={() => {
                        setSelectedPack(pack);
                        setView('packs');
                      }}
                      style={styles.actionButton}
                    >
                      View Pack
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {view === 'history' && (
          <div style={styles.fullWidthView}>
            <InsightsHistoryViewer logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '20px',
  },
  titleBar: {
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    fontWeight: 'bold' as const,
  },
  subtitle: {
    margin: '0',
    fontSize: '13px',
    color: '#666',
  },
  navTabs: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '10px',
  },
  navButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    transition: 'all 0.2s',
  },
  navButtonActive: {
    backgroundColor: '#1976d2',
    color: '#fff',
  },
  navButtonInactive: {
    backgroundColor: '#f0f0f0',
    color: '#333',
  },
  statsBar: {
    display: 'flex',
    gap: '30px',
    padding: '15px 20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
  },
  statItem: {
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#1976d2',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
  contentArea: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto' as const,
  },
  browseView: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    height: '100%',
  },
  browseLeft: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  browseRight: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflowY: 'auto' as const,
  },
  fullWidthView: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#999',
    paddingTop: '40px',
  },
  insightsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  },
  insightCard: {
    padding: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  recommendationsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  recommendationCard: {
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '4px',
    fontSize: '12px',
    marginTop: '10px',
  },
  actionButton: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold' as const,
  },
};
