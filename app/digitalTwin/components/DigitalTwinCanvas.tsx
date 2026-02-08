"use client";

import React from 'react';
import { DigitalTwinInsight, DigitalTwinSnapshot, RoomLayout } from '../digitalTwinTypes';

interface Props {
  snapshot: DigitalTwinSnapshot;
  insights: DigitalTwinInsight[];
}

const roomColor: Record<string, string> = {
  green: '#16a34a',
  yellow: '#fbbf24',
  red: '#ef4444',
};

function roomStyle(room: RoomLayout) {
  return {
    left: `${room.position.x}px`,
    top: `${room.position.y}px`,
    width: `${room.size.width * 6}px`,
    height: `${room.size.height * 6}px`,
  } satisfies React.CSSProperties;
}

export function DigitalTwinCanvas({ snapshot, insights }: Props) {
  const bottlenecks = new Set(snapshot.overlays.bottlenecks ?? []);
  return (
    <div className="dt-frame">
      <div className="dt-canvas" aria-label="Digital twin canvas">
        {snapshot.layout.rooms.map((room) => {
          const state = snapshot.roomStates.find((r) => r.roomId === room.roomId);
          const fill = state?.color ? roomColor[state.color] : '#94a3b8';
          const isBottleneck = bottlenecks.has(room.roomId);
          return (
            <div
              key={room.roomId}
              className={`dt-room ${isBottleneck ? 'dt-room-bottleneck' : ''}`}
              style={roomStyle(room)}
            >
              <div className="dt-room-header">
                <span className="dt-room-name">{room.name}</span>
                <span className="dt-room-purpose">{room.purpose}</span>
              </div>
              <div className="dt-room-body" style={{ background: fill }}>
                <div className="dt-metric">
                  <span>T</span>
                  <strong>{state?.temperatureC ?? '—'}°C</strong>
                </div>
                <div className="dt-metric">
                  <span>H</span>
                  <strong>{state?.humidityPercent ?? '—'}%</strong>
                </div>
                <div className="dt-metric">
                  <span>Occ</span>
                  <strong>{state?.occupancyPercent ?? '—'}%</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dt-panel">
        <h3>Insights</h3>
        <ul>
          {insights.length === 0 && <li>No active insights</li>}
          {insights.map((insight) => (
            <li key={insight.insightId}>
              <strong>{insight.type}</strong>: {insight.summary}
            </li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .dt-frame {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          align-items: start;
        }
        .dt-canvas {
          position: relative;
          min-height: 380px;
          border: 1px solid #cbd5e1;
          background: radial-gradient(circle at 20% 20%, #f8fafc, #e2e8f0);
          overflow: hidden;
        }
        .dt-room {
          position: absolute;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }
        .dt-room:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }
        .dt-room-bottleneck {
          outline: 3px solid #f97316;
          outline-offset: 2px;
        }
        .dt-room-header {
          display: flex;
          justify-content: space-between;
          padding: 6px 8px;
          font-size: 12px;
          background: #0f172a;
          color: #e2e8f0;
        }
        .dt-room-name {
          font-weight: 700;
        }
        .dt-room-purpose {
          opacity: 0.8;
        }
        .dt-room-body {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          padding: 8px;
          color: #0f172a;
          font-size: 12px;
          background: #e2e8f0;
        }
        .dt-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .dt-panel {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
        }
        .dt-panel h3 {
          margin: 0 0 8px;
          font-size: 14px;
          color: #0f172a;
        }
        .dt-panel ul {
          margin: 0;
          padding-left: 16px;
          display: grid;
          gap: 6px;
        }
      `}</style>
    </div>
  );
}
