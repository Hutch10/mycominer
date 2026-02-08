"use client";

import React from 'react';
import { IncidentThread } from '../timelineTypes';

interface Props {
  threads: IncidentThread[];
  onSelectThread: (thread: IncidentThread) => void;
}

export function IncidentThreadList({ threads, onSelectThread }: Props) {
  return (
    <div className="tl-card">
      <div className="tl-card-header">
        <h3>Incident Threads</h3>
        <span className="tl-pill">Grouped</span>
      </div>
      <p className="tl-sub">Related events automatically grouped by incident. No state mutation; read-only.</p>
      <div className="tl-list">
        {threads.map((thread) => (
          <button key={thread.threadId} className="tl-link" onClick={() => onSelectThread(thread)}>
            <div className="tl-row">
              <div>
                <p className="tl-label">Thread</p>
                <p>{thread.threadId.slice(-8)}</p>
              </div>
              <div>
                <p className="tl-label">Facility</p>
                <p>{thread.facilityId ?? 'global'}</p>
              </div>
              <div>
                <p className="tl-label">Events</p>
                <p>{thread.events.length}</p>
              </div>
              <div>
                <p className="tl-label">Key Events</p>
                <p>{thread.keyEvents.length}</p>
              </div>
              <span className={`tl-pill-${thread.severity}`}>{thread.severity}</span>
              {thread.resolved ? <span className="tl-pill-soft">Resolved</span> : <span className="tl-pill-warn">Open</span>}
            </div>
          </button>
        ))}
        {!threads.length && <p className="tl-sub">No incident threads.</p>}
      </div>
    </div>
  );
}
