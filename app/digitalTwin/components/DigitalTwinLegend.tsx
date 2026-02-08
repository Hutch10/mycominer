"use client";

import React from 'react';

export function DigitalTwinLegend() {
  const items = [
    { label: 'Nominal', color: '#16a34a' },
    { label: 'Attention', color: '#fbbf24' },
    { label: 'Critical', color: '#ef4444' },
    { label: 'Bottleneck', color: '#f97316', outline: true },
  ];

  return (
    <div className="dt-legend" aria-label="Legend">
      {items.map((item) => (
        <div key={item.label} className="dt-legend-row">
          <span
            className="dt-legend-swatch"
            style={{ background: item.color, outline: item.outline ? `2px solid ${item.color}` : 'none' }}
          />
          <span>{item.label}</span>
        </div>
      ))}
      <style jsx>{`
        .dt-legend {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 12px;
          color: #0f172a;
          padding: 8px 0;
        }
        .dt-legend-row {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .dt-legend-swatch {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #0f172a22;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}
