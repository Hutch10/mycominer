"use client";

import React from 'react';
import { IncidentReplayState, TimelineEvent } from '../timelineTypes';

interface Props {
  replayState?: IncidentReplayState;
  onNext: () => void;
  onPrev: () => void;
  onJumpToKey: (dir: 'next' | 'prev') => void;
  onJumpToType: (type: string) => void;
}

export function IncidentReplayViewer({ replayState, onNext, onPrev, onJumpToKey, onJumpToType }: Props) {
  if (!replayState) {
    return (
      <div className="tl-card">
        <div className="tl-card-header">
          <h3>Incident Replay</h3>
          <span className="tl-pill">Idle</span>
        </div>
        <p className="tl-sub">Select an incident thread to begin step-through replay. Read-only – no actions executed.</p>
      </div>
    );
  }

  const current = replayState.currentEvent;
  const progress = Math.round((replayState.currentIndex / replayState.totalEvents) * 100);

  return (
    <div className="tl-card">
      <div className="tl-card-header">
        <h3>Replay: {replayState.threadId.slice(-8)}</h3>
        <span className="tl-pill">Step {replayState.currentIndex + 1} / {replayState.totalEvents}</span>
      </div>
      <p className="tl-sub">Step through events chronologically. Replay is read-only; no simulation or state changes.</p>

      <div className="tl-block">
        <div className="tl-row">
          <div>
            <p className="tl-label">Time</p>
            <p>{new Date(current.timestamp).toLocaleString()}</p>
          </div>
          <div>
            <p className="tl-label">Type</p>
            <p>{current.type}</p>
          </div>
          <div>
            <p className="tl-label">Facility</p>
            <p>{current.facilityId ?? 'n/a'}</p>
          </div>
          <span className={`tl-pill-${current.severity}`}>{current.severity}</span>
        </div>
        <div className="tl-row">
          <h4>{current.title}</h4>
        </div>
        <p className="tl-subtle">{current.description}</p>
      </div>

      <div className="tl-progress">
        <div className="tl-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="tl-controls">
        <button className="tl-button" type="button" onClick={onPrev} disabled={replayState.currentIndex === 0}>← Previous</button>
        <button className="tl-button ghost" type="button" onClick={() => onJumpToKey('prev')}>⬆ Key Event</button>
        <button className="tl-button ghost" type="button" onClick={() => onJumpToKey('next')}>⬇ Key Event</button>
        <button className="tl-button" type="button" onClick={onNext} disabled={replayState.currentIndex >= replayState.totalEvents - 1}>Next →</button>
      </div>
      <button className="tl-button ghost" type="button">Explain This Incident (Phase 37 hook)</button>
    </div>
  );
}
