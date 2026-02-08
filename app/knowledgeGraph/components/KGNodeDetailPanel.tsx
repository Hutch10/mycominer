"use client";

import React from 'react';
import { KGNode } from '../knowledgeGraphTypes';

interface Props {
  node?: KGNode;
}

export function KGNodeDetailPanel({ node }: Props) {
  if (!node) {
    return (
      <div className="kg-card">
        <div className="kg-card-header">
          <h3>Node Details</h3>
          <span className="kg-pill">Idle</span>
        </div>
        <p className="kg-sub">Select a node to inspect metadata, tenant scope, and related systems.</p>
      </div>
    );
  }

  return (
    <div className="kg-card">
      <div className="kg-card-header">
        <h3>{node.name}</h3>
        <span className="kg-pill">{node.type}</span>
      </div>
      <div className="kg-grid">
        <div>
          <p className="kg-label">Tenant</p>
          <p>{node.tenantId}</p>
        </div>
        {node.facilityId && (
          <div>
            <p className="kg-label">Facility</p>
            <p>{node.facilityId}</p>
          </div>
        )}
        <div>
          <p className="kg-label">Source</p>
          <p>{node.sourceSystem}</p>
        </div>
      </div>
      {node.tags?.length ? (
        <div className="kg-tags">
          {node.tags.map((tag) => (
            <span key={tag} className="kg-pill-soft">{tag}</span>
          ))}
        </div>
      ) : null}
      {node.metadata && (
        <div className="kg-meta">
          <p className="kg-label">Metadata</p>
          <pre className="kg-pre">{JSON.stringify(node.metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
