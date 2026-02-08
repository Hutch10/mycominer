"use client";

import React from 'react';
import { TimelineEvent } from '../timelineTypes';

interface Props {
  events: TimelineEvent[];
  onSelectEvent: (event: TimelineEvent) => void;
}

export function TimelineEventStream({ events, onSelectEvent }: Props) {
  return (
    <div className="tl-card">
      <div className="tl-card-header">
        <h3>Event Stream</h3>
        <span className="tl-pill">Chronological</span>
      </div>
      <p className="tl-sub">Deterministic, timestamped events from real logs. No simulation, no predictions.</p>
      <div className="tl-list">
        {events.map((event) => (
          <button key={event.eventId} className="tl-link" onClick={() => onSelectEvent(event)}>
            <div className="tl-row">
              <div>
                <p className="tl-label">Time</p>
                <p>{new Date(event.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="tl-label">Type</p>
                <p>{event.type}</p>
              </div>
              <div>
                <p className="tl-label">Facility</p>
                <p>{event.facilityId ?? 'n/a'}</p>
              </div>
              <div>
                <p className="tl-label">Title</p>
                <p>{event.title}</p>
              </div>
              <span className={`tl-pill-${event.severity}`}>{event.severity}</span>
            </div>
          </button>
        ))}
        {!events.length && <p className="tl-sub">No events in timeline.</p>}
      </div>
    </div>
  );
}
