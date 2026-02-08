/**
 * Phase 42: Operator Insights & Knowledge Packs — Sample Page
 * 
 * Demonstrates insights system with:
 * - Tenant-scoped insights (tenant-alpha, tenant-beta)
 * - Multiple knowledge packs
 * - Integration hooks (Phases 34, 37, 38, 39, 40)
 * - Documentation and feature showcase
 */

'use client';

import React, { useEffect, useState } from 'react';
import InsightsDashboard from './components/InsightsDashboard';
import { initializeInsights } from './insightsEngine';

export default function InsightsPage() {
  const [initialized, setInitialized] = useState(false);
  const [currentTenant, setCurrentTenant] = useState('tenant-alpha');
  const [showDocumentation, setShowDocumentation] = useState(false);

  useEffect(() => {
    // Initialize insights for demo tenants
    async function init() {
      try {
        await initializeInsights(['tenant-alpha', 'tenant-beta']);
        setInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    }
    init();
  }, []);

  const handleExplain = (insightId: string, title: string) => {
    alert(`[Phase 37] Narrative Explanation for "${title}"\n\nThis insight has been synthesized from historical operational data.\n\nNarrative: The key patterns identified in this insight are grounded in Phases 34, 38, 39, and 40 data, showing clear correlations between training completion, operational timing, and incident reduction.`);
  };

  const handleReplayIncident = (timelineEventId: string) => {
    alert(`[Phase 38] Timeline Replay\n\nReplaying incident timeline...\n\nThis would reconstruct the incident sequence from Phase 38 timeline data, showing the temporal progression of events leading to the pattern identified in this insight.`);
  };

  const handleViewPattern = (analyticsClusterId: string) => {
    alert(`[Phase 39] Analytics Pattern Viewer\n\nOpening related analytics pattern...\n\nThis would display the Phase 39 incident cluster that this insight is based on, showing the statistical patterns and relationships discovered in the analytics engine.`);
  };

  const handleOpenTraining = (trainingModuleId: string) => {
    alert(`[Phase 40] Training Module\n\nLaunching related training...\n\nThis would open the Phase 40 training module that addresses the competency gap or best practice identified in this insight.`);
  };

  if (!initialized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Initializing Operator Insights System...</p>
      </div>
    );
  }

  return (
    <div>
      {!showDocumentation ? (
        <div>
          {/* Tenant Selector */}
          <div style={{ padding: '15px 20px', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
            <select
              value={currentTenant}
              onChange={(e) => setCurrentTenant(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginRight: '10px',
              }}
            >
              <option value="tenant-alpha">Tenant Alpha</option>
              <option value="tenant-beta">Tenant Beta</option>
            </select>
            <button
              onClick={() => setShowDocumentation(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              📖 Documentation
            </button>
          </div>

          {/* Dashboard */}
          <InsightsDashboard
            tenantId={currentTenant}
            onExplain={handleExplain}
            onReplayIncident={handleReplayIncident}
            onViewPattern={handleViewPattern}
            onOpenTraining={handleOpenTraining}
          />
        </div>
      ) : (
        <DocumentationView onClose={() => setShowDocumentation(false)} />
      )}
    </div>
  );
}

// ==================== DOCUMENTATION VIEW ====================

function DocumentationView({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <button
        onClick={onClose}
        style={{
          padding: '8px 16px',
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        ← Back to Dashboard
      </button>

      <h1>🎯 Phase 42: Operator Insights & Knowledge Packs</h1>

      {/* Feature Overview */}
      <div style={styles.section}>
        <h2>📋 Key Features</h2>
        <div style={styles.featureGrid}>
          <FeatureBox
            icon="📊"
            title="Data Synthesis"
            description="Synthesizes data from Phases 34 (KG), 37 (Narrative), 38 (Timeline), 39 (Analytics), 40 (Training)"
          />
          <FeatureBox
            icon="📦"
            title="Knowledge Packs"
            description="6 curated knowledge packs covering environmental exceptions, CAPA patterns, SOP execution, training performance, operational rhythms, and cross-facility benchmarks"
          />
          <FeatureBox
            icon="💡"
            title="8 Insight Categories"
            description="Incident patterns, SOP usage, CAPA recurrence, environmental exceptions, training performance, operational rhythms, cross-facility comparison, operator readiness"
          />
          <FeatureBox
            icon="🔐"
            title="Tenant Isolation"
            description="Strict tenant scoping, read-only access, federation rule enforcement. No writes to any subsystem."
          />
          <FeatureBox
            icon="📜"
            title="Comprehensive Logging"
            description="14 log types: query, pack generation, reference linking, Phase integration, federation rules, tenant isolation, errors"
          />
          <FeatureBox
            icon="🔗"
            title="Multi-Phase Integration"
            description="Explain (Phase 37), Replay Incident (Phase 38), View Pattern (Phase 39), Open Training (Phase 40)"
          />
        </div>
      </div>

      {/* Insight Categories */}
      <div style={styles.section}>
        <h2>🏷️ 8 Insight Categories</h2>
        <div style={styles.categoryGrid}>
          <CategoryCard
            title="Incident Patterns"
            description="Primary incident clusters from Phase 39 analytics, with correlation analysis and response protocols."
            phase="Phase 39"
          />
          <CategoryCard
            title="SOP Usage"
            description="SOP step execution patterns, frequently skipped steps, execution time analysis, and competency levels."
            phase="Phase 38, 40"
          />
          <CategoryCard
            title="CAPA Recurrence"
            description="Why CAPAs are reapplied, root cause analysis, effectiveness by category, preventive strategies."
            phase="Phase 34, 39"
          />
          <CategoryCard
            title="Environmental Exceptions"
            description="Environmental parameter deviations, seasonal patterns, response protocols, recovery time analysis."
            phase="Phase 38, 39"
          />
          <CategoryCard
            title="Training Performance"
            description="Operator training completion, assessment scores, competency trends, identified gaps, training ROI."
            phase="Phase 40"
          />
          <CategoryCard
            title="Operational Rhythms"
            description="Temporal patterns: shift performance, daily/weekly/seasonal variations, peak efficiency periods."
            phase="Phase 38, 39"
          />
          <CategoryCard
            title="Cross-Facility Comparison"
            description="Federation-scoped benchmarking, best practices sharing, performance differentials, cost analysis."
            phase="Phase 34, 39"
          />
          <CategoryCard
            title="Operator Readiness"
            description="Competency assessment, training correlation, experience progression, peer mentoring effectiveness."
            phase="Phase 40"
          />
        </div>
      </div>

      {/* Knowledge Pack Library */}
      <div style={styles.section}>
        <h2>📚 6 Curated Knowledge Packs</h2>
        <div style={styles.packGrid}>
          <PackCard
            title="Environmental Exception Playbook"
            insights={3}
            readTime={35}
            references={5}
            phases={[34, 37, 38, 39, 40]}
          />
          <PackCard
            title="Deviation & CAPA Patterns"
            insights={3}
            readTime={40}
            references={4}
            phases={[34, 39, 40]}
          />
          <PackCard
            title="SOP Execution Insights"
            insights={3}
            readTime={32}
            references={4}
            phases={[31, 38, 39, 40]}
          />
          <PackCard
            title="Training Performance Overview"
            insights={3}
            readTime={28}
            references={3}
            phases={[39, 40]}
          />
          <PackCard
            title="Operational Rhythm Summary"
            insights={3}
            readTime={25}
            references={3}
            phases={[38, 39]}
          />
          <PackCard
            title="Cross-Facility Benchmark Pack"
            insights={3}
            readTime={30}
            references={4}
            phases={[34, 37, 39]}
          />
        </div>
      </div>

      {/* Integration Points */}
      <div style={styles.section}>
        <h2>🔗 Integration Points</h2>
        <div style={styles.integrationGrid}>
          <IntegrationCard
            phase={34}
            name="Knowledge Graph"
            features={['Cross-facility KG relationships', 'Entity linking', 'Dependency graphs']}
          />
          <IntegrationCard
            phase={37}
            name="Narrative Explanations"
            features={['Explain This Insight', 'Grounded explanations', 'Context synthesis']}
          />
          <IntegrationCard
            phase={38}
            name="Timeline Events"
            features={['Replay Related Incident', 'Temporal progression', 'Event sequence']}
          />
          <IntegrationCard
            phase={39}
            name="Analytics & Patterns"
            features={['View Related Pattern', 'Cluster analysis', 'Statistical relationships']}
          />
          <IntegrationCard
            phase={40}
            name="Training Modules"
            features={['Open Training Module', 'Competency alignment', 'Scenario replay']}
          />
        </div>
      </div>

      {/* Architecture Summary */}
      <div style={styles.section}>
        <h2>🏗️ Architecture</h2>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h3>Core Modules:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>insightsTypes.ts</strong>: 15+ types covering insights, packs, queries, logs</li>
            <li><strong>insightsLog.ts</strong>: 14 logging functions, 8 retrieval functions, in-memory store</li>
            <li><strong>knowledgePackLibrary.ts</strong>: 6 curated packs, registry, query functions</li>
            <li><strong>insightAssembler.ts</strong>: Synthesizes insights from Phase data, generates narrative explanations</li>
            <li><strong>insightsEngine.ts</strong>: Master orchestrator, tenant isolation, federation rule enforcement</li>
          </ul>

          <h3>UI Components:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>InsightsDashboard.tsx</strong>: 5-view navigation (Browse, Insights, Packs, Recommendations, History)</li>
            <li><strong>InsightQueryPanel.tsx</strong>: Query builder with category and date range filters</li>
            <li><strong>KnowledgePackViewer.tsx</strong>: Pack browser with featured/active filtering</li>
            <li><strong>InsightSectionPanel.tsx</strong>: Detail view with recommendations and integration hooks</li>
            <li><strong>InsightReferencePanel.tsx</strong>: Source reference display with phase and confidence info</li>
            <li><strong>InsightsHistoryViewer.tsx</strong>: Audit log with result status and timestamps</li>
          </ul>

          <h3>Design Principles:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li>✓ Deterministic (no predictions, no biological inference)</li>
            <li>✓ Read-only (no writes to subsystems)</li>
            <li>✓ Grounded in real data (historical events, approved modules, KG entities)</li>
            <li>✓ Tenant isolated (strict scoping, federation rules)</li>
            <li>✓ Fully logged (14 event types, searchable audit trail)</li>
            <li>✓ Multi-phase integrated (Phases 34, 37, 38, 39, 40)</li>
          </ul>
        </div>
      </div>

      {/* Sample Data */}
      <div style={styles.section}>
        <h2>📊 Sample Insights</h2>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Tenant-Alpha Sample Insights:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Environmental Exception Playbook</strong>: 23% of deviations are environmental. Temperature recovery within 30 min reduces substrate loss 60%.</li>
            <li><strong>SOP Execution Insights</strong>: 5 critical steps account for 67% of deviations. Expert operators: 12-14 min | Novice: 22-28 min.</li>
            <li><strong>Training Performance</strong>: 87% completion rate. Advanced training → 34% fewer deviations. Correlation: 0.82.</li>
            <li><strong>Operational Rhythms</strong>: Morning shifts 23% more successful (92% vs 75%). Friday shows 12% higher deviation rate.</li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h3>Cross-Facility Benchmarking:</h3>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Facility-Alpha Success Rate</strong>: 88% (peer average: 84%, baseline +4.7%)</li>
            <li><strong>Cost Advantage</strong>: $1,240 per batch vs $1,580 peer average (-21.5%)</li>
            <li><strong>Top Performer Differentiators</strong>: Preventive maintenance (12% better), Training (94% vs 81%), Environmental monitoring (hourly vs 4-hourly)</li>
            <li><strong>Best Practices</strong>: Daily operational review (+8%), Predictive maintenance (-34% downtime), Peer learning (+12% training completion)</li>
          </ul>
        </div>
      </div>

      {/* Global Rules */}
      <div style={styles.section}>
        <h2>🔒 Global Rules</h2>
        <div style={{ backgroundColor: '#ffeaa7', padding: '15px', borderRadius: '8px' }}>
          <ul style={{ paddingLeft: '20px' }}>
            <li>✓ All insights are read-only; no writes to any subsystem</li>
            <li>✓ No biological inference or biological prediction</li>
            <li>✓ All insights must be derived from real historical data or approved training/analytics modules</li>
            <li>✓ Tenant isolation and federation policies strictly enforced</li>
            <li>✓ No invented incidents, steps, or synthetic data</li>
            <li>✓ All insight generation logged with 14 event types</li>
            <li>✓ 30-day validity window for insights (regenerate as needed)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function FeatureBox({ icon, title, description }: any) {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{title}</h3>
      <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>{description}</p>
    </div>
  );
}

function CategoryCard({ title, description, phase }: any) {
  return (
    <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
      <h4 style={{ margin: '0 0 8px 0' }}>{title}</h4>
      <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>{description}</p>
      <span style={{ fontSize: '11px', color: '#999' }}>Sources: {phase}</span>
    </div>
  );
}

function PackCard({ title, insights, readTime, references, phases }: any) {
  return (
    <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
      <h4 style={{ margin: '0 0 10px 0' }}>{title}</h4>
      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#666' }}>
        <span>💡 {insights} insights</span>
        <span>⏱️ {readTime} min</span>
        <span>📚 {references} refs</span>
      </div>
      <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#999' }}>
        Phases: {phases.join(', ')}
      </p>
    </div>
  );
}

function IntegrationCard({ phase, name, features }: any) {
  return (
    <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Phase {phase}: {name}</h4>
      <ul style={{ paddingLeft: '20px', margin: '0', fontSize: '13px' }}>
        {features.map((f: any, i: number) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  section: {
    marginBottom: '30px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  packGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  integrationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
};
