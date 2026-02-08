// Phase 39: Global Analytics & Incident Pattern Library
// analytics/page.tsx
// Sample page demonstrating analytics queries, clusters, patterns, and trends

'use client';

import React, { useState, useMemo } from 'react';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AnalyticsQuery, AnalyticsResult } from './analyticsTypes';
import { initAnalyticsEngine, seedAnalyticsData, queryAnalytics } from './analyticsEngine';
import { getAnalyticsLog } from './analyticsLog';
import { TimelineEvent } from '../timeline/timelineTypes';

// Sample timeline events for seeding analytics
const sampleTimelineEvents: TimelineEvent[] = [
  {
    eventId: 'evt-1',
    timestamp: '2026-01-15T08:00:00Z',
    type: 'workflowExecutionEvent',
    severity: 'info',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    roomId: 'rm-clean-a',
    workflowId: 'wf-prep-fruit',
    title: 'Workflow Started: Prep & Fruit',
    description: 'Workflow initiated',
    sourceSystem: 'Execution Engine',
  },
  {
    eventId: 'evt-2',
    timestamp: '2026-01-15T09:30:00Z',
    type: 'environmentalException',
    severity: 'high',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    roomId: 'rm-clean-a',
    title: 'Environmental Alert: Temperature Rise',
    description: 'Temperature exceeded threshold: 28.5°C',
    sourceSystem: 'Telemetry Engine',
    incidentThreadId: 'incident-2026-01-15-facility-01',
  },
  {
    eventId: 'evt-3',
    timestamp: '2026-01-15T09:35:00Z',
    type: 'deviation',
    severity: 'high',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    roomId: 'rm-clean-a',
    title: 'Deviation Logged: Temperature Threshold Breach',
    description: 'Deviation dev-alpha-1 created',
    sourceSystem: 'Compliance Engine',
    linkedIds: ['sop-alpha-template'],
    incidentThreadId: 'incident-2026-01-15-facility-01',
  },
  {
    eventId: 'evt-4',
    timestamp: '2026-01-15T09:45:00Z',
    type: 'SOPChange',
    severity: 'medium',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    title: 'SOP Referenced: HVAC Stabilization',
    description: 'Emergency HVAC stabilization invoked',
    sourceSystem: 'SOP Engine',
    linkedIds: ['sop-alpha-template'],
    incidentThreadId: 'incident-2026-01-15-facility-01',
  },
  {
    eventId: 'evt-5',
    timestamp: '2026-01-15T10:00:00Z',
    type: 'CAPAAction',
    severity: 'medium',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    title: 'CAPA Logged: Replace HVAC Filter',
    description: 'CAPA capa-alpha-1: Replace HVAC filter',
    sourceSystem: 'Compliance Engine',
    linkedIds: ['dev-alpha-1'],
    incidentThreadId: 'incident-2026-01-15-facility-01',
  },
  {
    eventId: 'evt-6',
    timestamp: '2026-01-15T10:30:00Z',
    type: 'telemetryEvent',
    severity: 'info',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    roomId: 'rm-clean-a',
    title: 'Telemetry: Temperature Stabilized',
    description: 'Temperature returned to 23.2°C',
    sourceSystem: 'Telemetry Engine',
    linkedIds: ['evt-2'],
    incidentThreadId: 'incident-2026-01-15-facility-01',
  },
  // Similar incident at facility-02
  {
    eventId: 'evt-7',
    timestamp: '2026-01-16T14:00:00Z',
    type: 'environmentalException',
    severity: 'high',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-02',
    roomId: 'rm-fruit-b',
    title: 'Environmental Alert: Temperature Rise',
    description: 'Temperature spike to 27.8°C',
    sourceSystem: 'Telemetry Engine',
    incidentThreadId: 'incident-2026-01-16-facility-02',
  },
  {
    eventId: 'evt-8',
    timestamp: '2026-01-16T14:05:00Z',
    type: 'deviation',
    severity: 'high',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-02',
    roomId: 'rm-fruit-b',
    title: 'Deviation Logged: Temperature Threshold Breach',
    description: 'Deviation dev-alpha-2 created',
    sourceSystem: 'Compliance Engine',
    linkedIds: ['sop-alpha-template'],
    incidentThreadId: 'incident-2026-01-16-facility-02',
  },
  {
    eventId: 'evt-9',
    timestamp: '2026-01-16T14:20:00Z',
    type: 'SOPChange',
    severity: 'medium',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-02',
    title: 'SOP Referenced: HVAC Stabilization',
    description: 'Emergency HVAC stabilization invoked',
    sourceSystem: 'SOP Engine',
    linkedIds: ['sop-alpha-template'],
    incidentThreadId: 'incident-2026-01-16-facility-02',
  },
  {
    eventId: 'evt-10',
    timestamp: '2026-01-16T14:30:00Z',
    type: 'CAPAAction',
    severity: 'medium',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-02',
    title: 'CAPA Logged: Calibrate Thermostat',
    description: 'CAPA capa-alpha-2: Calibrate thermostat',
    sourceSystem: 'Compliance Engine',
    linkedIds: ['dev-alpha-2'],
    incidentThreadId: 'incident-2026-01-16-facility-02',
  },
  // Resource shortage pattern
  {
    eventId: 'evt-11',
    timestamp: '2026-01-17T08:15:00Z',
    type: 'resourceAllocationEvent',
    severity: 'high',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    roomId: 'rm-clean-a',
    title: 'Resource Shortage: Agar Media Depleted',
    description: 'Agar media stock below minimum threshold',
    sourceSystem: 'Resource Engine',
    incidentThreadId: 'incident-2026-01-17-facility-01',
  },
  {
    eventId: 'evt-12',
    timestamp: '2026-01-17T08:30:00Z',
    type: 'workflowExecutionEvent',
    severity: 'high',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    roomId: 'rm-clean-a',
    workflowId: 'wf-prep-fruit',
    title: 'Workflow Delayed: Resource Unavailable',
    description: 'Workflow paused pending resource availability',
    sourceSystem: 'Execution Engine',
    incidentThreadId: 'incident-2026-01-17-facility-01',
  },
  {
    eventId: 'evt-13',
    timestamp: '2026-01-17T09:00:00Z',
    type: 'SOPChange',
    severity: 'medium',
    tenantId: 'tenant-alpha',
    facilityId: 'facility-01',
    title: 'SOP Updated: Resource Sourcing Protocol',
    description: 'SOP sop-resource-sourcing updated for expedited procurement',
    sourceSystem: 'SOP Engine',
    linkedIds: ['sop-resource-sourcing'],
    incidentThreadId: 'incident-2026-01-17-facility-01',
  },
];

export default function AnalyticsPage() {
  const [analyticsResult, setAnalyticsResult] = useState<AnalyticsResult | null>(null);
  const [analyticsLog, setAnalyticsLog] = useState<any[]>([]);

  // Initialize analytics engine and seed data once
  const engine = useMemo(() => {
    const analyticsEngine = initAnalyticsEngine();
    seedAnalyticsData(sampleTimelineEvents);
    return analyticsEngine;
  }, []);

  const handleQuerySubmit = (query: AnalyticsQuery) => {
    const result = queryAnalytics(query);
    setAnalyticsResult(result);
    setAnalyticsLog(getAnalyticsLog());
  };

  const handleExplainPattern = (patternId: string) => {
    console.log(`Explaining pattern: ${patternId}`);
    // Hook to Phase 37 Narrative Engine
    alert(`Would invoke Phase 37 Narrative Engine to explain pattern ${patternId}`);
  };

  const handleReplayIncident = (incidentId: string) => {
    console.log(`Replaying incident: ${incidentId}`);
    // Hook to Phase 38 Incident Replay
    alert(`Would invoke Phase 38 Incident Replay for incident ${incidentId}`);
  };

  return (
    <div style={styles.pageContainer}>
      <AnalyticsDashboard
        tenantId="tenant-alpha"
        onQuerySubmit={handleQuerySubmit}
        analyticsResults={analyticsResult}
        analyticsLog={analyticsLog}
        onExplainPattern={handleExplainPattern}
        onReplayIncident={handleReplayIncident}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
  },
};
