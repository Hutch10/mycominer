"use client";

import React from 'react';
import { TimelineFilter, TimelineEvent, IncidentThread } from '../timelineTypes';
import { initTimelineEngine, getFilteredTimeline, getIncidentThreads } from '../timelineEngine';
import { initIncidentReplay, nextEvent, previousEvent, jumpToKeyEvent } from '../incidentReplayEngine';
import { getTimelineLog } from '../timelineLog';
import { TimelineFilterPanel } from './TimelineFilterPanel';
import { TimelineEventStream } from './TimelineEventStream';
import { IncidentThreadList } from './IncidentThreadList';
import { IncidentReplayViewer } from './IncidentReplayViewer';
import { TimelineHistoryViewer } from './TimelineHistoryViewer';

interface Props {
  events: TimelineEvent[];
  tenantId: string;
  federatedTenantIds?: string[];
}

export function TimelineDashboard({ events, tenantId, federatedTenantIds }: Props) {
  const [filter, setFilter] = React.useState<TimelineFilter>({});
  const engine = React.useMemo(() => initTimelineEngine({ events, tenantId, federatedTenantIds }), [events, tenantId, federatedTenantIds]);
  const [timeline, setTimeline] = React.useState(() => getFilteredTimeline(engine, filter));
  const [threads, setThreads] = React.useState(() => getIncidentThreads(engine));
  const [selectedThread, setSelectedThread] = React.useState<IncidentThread | undefined>();
  const [replayState, setReplayState] = React.useState(selectedThread ? initIncidentReplay({ thread: selectedThread }) : undefined);
  const [selectedEvent, setSelectedEvent] = React.useState<TimelineEvent | undefined>();
  const [history, setHistory] = React.useState(() => getTimelineLog(100));

  const availableFacilities = React.useMemo(() => Array.from(new Set(events.map((e) => e.facilityId).filter(Boolean))) as string[], [events]);
  const availableRooms = React.useMemo(() => Array.from(new Set(events.map((e) => e.roomId).filter(Boolean))) as string[], [events]);
  const availableWorkflows = React.useMemo(() => Array.from(new Set(events.map((e) => e.workflowId).filter(Boolean))) as string[], [events]);

  const applyFilter = () => {
    const next = getFilteredTimeline(engine, filter);
    setTimeline(next);
  };

  const selectThread = (thread: IncidentThread) => {
    setSelectedThread(thread);
    const state = initIncidentReplay({ thread });
    setReplayState(state);
    setSelectedEvent(state.currentEvent);
    setHistory(getTimelineLog(100));
  };

  const handleNext = () => {
    if (!replayState) return;
    const next = nextEvent(replayState);
    setReplayState(next);
    setSelectedEvent(next.currentEvent);
  };

  const handlePrev = () => {
    if (!replayState) return;
    const prev = previousEvent(replayState);
    setReplayState(prev);
    setSelectedEvent(prev.currentEvent);
  };

  const handleJumpKey = (dir: 'next' | 'prev') => {
    if (!replayState) return;
    const jumped = jumpToKeyEvent(replayState, dir);
    setReplayState(jumped);
    setSelectedEvent(jumped.currentEvent);
  };

  return (
    <div className="tl-shell">
      <header className="tl-header">
        <div>
          <p className="tl-kicker">Phase 38 · Global Timeline</p>
          <h1>Incident Replay & Chronological View</h1>
          <p className="tl-sub">Deterministic, read-only timeline of workflows, telemetry, deviations, CAPA, SOPs, and compliance events. Step through incidents chronologically.</p>
        </div>
        <div className="tl-links">
          <a href="/knowledgeGraph">Knowledge Graph</a>
          <a href="/globalSearch">Global Search</a>
          <a href="/copilot">Copilot</a>
          <a href="/compliance">Compliance</a>
        </div>
      </header>

      <div className="tl-layout">
        <div className="tl-col">
          <TimelineFilterPanel filter={filter} onChange={setFilter} onApply={applyFilter} availableFacilities={availableFacilities} availableRooms={availableRooms} availableWorkflows={availableWorkflows} />
          <TimelineEventStream events={timeline} onSelectEvent={setSelectedEvent} />
          <TimelineHistoryViewer log={history} />
        </div>
        <div className="tl-col">
          <IncidentThreadList threads={threads} onSelectThread={selectThread} />
          <IncidentReplayViewer replayState={replayState} onNext={handleNext} onPrev={handlePrev} onJumpToKey={handleJumpKey} onJumpToType={() => {}} />
          <div className="tl-card tl-card-ghost">
            <h3>Guardrails</h3>
            <ul className="tl-list-text">
              <li>Timeline and replay are read-only; no writes to any subsystem.</li>
              <li>All events are factual, timestamped, and traceable to real logs.</li>
              <li>No biological simulation or prediction; only structural relationships.</li>
              <li>Tenant and federation boundaries enforced.</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .tl-shell { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(128deg, #f8fafc, #e2e8f0); }
        .tl-header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .tl-header h1 { margin: 4px 0 6px; color: #0f172a; font-size: 28px; }
        .tl-sub { margin: 0; color: #334155; font-size: 13px; }
        .tl-kicker { margin: 0; letter-spacing: 0.1em; text-transform: uppercase; font-size: 11px; color: #475569; }
        .tl-links { display: flex; gap: 10px; flex-wrap: wrap; }
        .tl-links a { color: #0ea5e9; font-weight: 600; }
        .tl-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; align-items: start; }
        .tl-col { display: flex; flex-direction: column; gap: 14px; }
        .tl-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; box-shadow: 0 8px 20px rgba(0,0,0,0.04); }
        .tl-card-soft { background: #f8fafc; }
        .tl-card-ghost { background: #edf2f7; }
        .tl-card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .tl-label { margin: 0; color: #475569; font-size: 12px; }
        .tl-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .tl-list-text { margin: 0; padding-left: 18px; color: #334155; display: grid; gap: 6px; }
        .tl-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; align-items: center; }
        .tl-block { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; background: #fff; display: grid; gap: 6px; }
        .tl-pill { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #0f172a; background: #e2e8f0; }
        .tl-pill-soft { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; background: #10b981; }
        .tl-pill-warn { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; background: #f59e0b; }
        .tl-pill-info { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; background: #3b82f6; }
        .tl-pill-low { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; background: #8b5cf6; }
        .tl-pill-medium { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; background: #f97316; }
        .tl-pill-high { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; background: #ef4444; }
        .tl-pill-critical { display: inline-flex; padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; background: #7f1d1d; }
        .tl-link { width: 100%; text-align: left; border: none; background: none; cursor: pointer; padding: 0; }
        .tl-link:hover, .tl-links a:hover { text-decoration: underline; }
        .tl-input { width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; }
        .tl-button { padding: 10px 14px; border-radius: 8px; border: 1px solid #0ea5e9; background: #0ea5e9; color: #fff; font-weight: 600; cursor: pointer; }
        .tl-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .tl-button.ghost { background: #fff; color: #0ea5e9; }
        .tl-chip { border: 1px solid #cbd5e1; border-radius: 999px; padding: 6px 10px; background: #f8fafc; cursor: pointer; }
        .tl-chip.active { background: #0ea5e9; color: #fff; border-color: #0ea5e9; }
        .tl-form { display: grid; gap: 8px; }
        .tl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
        .tl-progress { height: 6px; background: #e2e8f0; border-radius: 8px; overflow: hidden; }
        .tl-progress-bar { height: 100%; background: #0ea5e9; transition: width 0.3s; }
        .tl-controls { display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
        .tl-subtle { color: #334155; }
        @media (max-width: 900px) { .tl-layout { grid-template-columns: 1fr; } .tl-header { flex-direction: column; } }
      `}</style>
    </div>
  );
}
