"use client";

import React from 'react';
import { TimelineFilter, TimelineEventType, EventSeverity } from '../timelineTypes';

interface Props {
  filter: TimelineFilter;
  onChange: (filter: TimelineFilter) => void;
  onApply: () => void;
  availableFacilities: string[];
  availableRooms: string[];
  availableWorkflows: string[];
}

const eventTypes: TimelineEventType[] = [
  'workflowExecutionEvent',
  'resourceAllocationEvent',
  'telemetryEvent',
  'environmentalException',
  'deviation',
  'CAPAAction',
  'SOPChange',
  'sandboxScenarioRun',
  'sandboxPromotionProposal',
  'forecastGeneration',
  'complianceEvent',
  'facilityStatusChange',
];

const severities: EventSeverity[] = ['info', 'low', 'medium', 'high', 'critical'];

export function TimelineFilterPanel({ filter, onChange, onApply, availableFacilities, availableRooms, availableWorkflows }: Props) {
  const toggleType = (type: TimelineEventType) => {
    const has = filter.eventTypes?.includes(type);
    const types = has ? filter.eventTypes?.filter((t) => t !== type) : [...(filter.eventTypes ?? []), type];
    onChange({ ...filter, eventTypes: types });
  };

  const toggleSeverity = (sev: EventSeverity) => {
    const has = filter.severities?.includes(sev);
    const sevs = has ? filter.severities?.filter((s) => s !== sev) : [...(filter.severities ?? []), sev];
    onChange({ ...filter, severities: sevs });
  };

  const toggleFacility = (fac: string) => {
    const has = filter.facilities?.includes(fac);
    const facs = has ? filter.facilities?.filter((f) => f !== fac) : [...(filter.facilities ?? []), fac];
    onChange({ ...filter, facilities: facs });
  };

  return (
    <div className="tl-card">
      <div className="tl-card-header">
        <h3>Timeline Filters</h3>
        <span className="tl-pill">Read-only</span>
      </div>
      <p className="tl-sub">Filter chronological events; no simulation or state mutation.</p>

      <div className="tl-form">
        <label className="tl-label">Facilities</label>
        <div className="tl-grid">
          {availableFacilities.map((fac) => (
            <button key={fac} type="button" className={`tl-chip ${filter.facilities?.includes(fac) ? 'active' : ''}`} onClick={() => toggleFacility(fac)}>
              {fac}
            </button>
          ))}
        </div>

        <label className="tl-label">Event Types</label>
        <div className="tl-grid">
          {eventTypes.map((type) => (
            <button key={type} type="button" className={`tl-chip ${filter.eventTypes?.includes(type) ? 'active' : ''}`} onClick={() => toggleType(type)}>
              {type}
            </button>
          ))}
        </div>

        <label className="tl-label">Severity</label>
        <div className="tl-grid">
          {severities.map((sev) => (
            <button key={sev} type="button" className={`tl-chip ${filter.severities?.includes(sev) ? 'active' : ''}`} onClick={() => toggleSeverity(sev)}>
              {sev}
            </button>
          ))}
        </div>

        <label className="tl-label">Start Time</label>
        <input className="tl-input" type="datetime-local" value={filter.startTime ?? ''} onChange={(e) => onChange({ ...filter, startTime: e.target.value || undefined })} />

        <label className="tl-label">End Time</label>
        <input className="tl-input" type="datetime-local" value={filter.endTime ?? ''} onChange={(e) => onChange({ ...filter, endTime: e.target.value || undefined })} />
      </div>

      <button type="button" className="tl-button" onClick={onApply}>Apply Filters</button>
    </div>
  );
}
