"use client";

import React from 'react';
import { KGEdge, KGNode } from '../knowledgeGraphTypes';

interface Props {
  anchor?: KGNode;
  edges: KGEdge[];
  nodes: KGNode[];
  onSelectNode: (node: KGNode) => void;
}

export function KGNeighborhoodViewer({ anchor, edges, nodes, onSelectNode }: Props) {
  const edgesToRender = anchor ? edges.filter((e) => e.from === anchor.id || e.to === anchor.id) : edges;

  return (
    <div className="kg-card">
      <div className="kg-card-header">
        <h3>Neighborhood</h3>
        <span className="kg-pill">Local</span>
      </div>
      <p className="kg-sub">Shows adjacent nodes and relationships within the scoped graph.</p>
      <div className="kg-list">
        {edgesToRender.map((edge) => {
          const otherId = anchor && edge.from === anchor.id ? edge.to : edge.from;
          const other = nodes.find((n) => n.id === otherId);
          return (
            <button key={edge.id} className="kg-link" onClick={() => other && onSelectNode(other)}>
              <div className="kg-row">
                <div>
                  <p className="kg-label">Edge</p>
                  <p>{edge.type}</p>
                </div>
                <div>
                  <p className="kg-label">To</p>
                  <p>{other?.name ?? otherId}</p>
                </div>
                <div>
                  <p className="kg-label">Tenant</p>
                  <p>{edge.tenantId}</p>
                </div>
                {edge.federated ? <span className="kg-pill-soft">Federated</span> : null}
              </div>
            </button>
          );
        })}
        {!edgesToRender.length && <p className="kg-sub">No adjacent edges in scope.</p>}
      </div>
    </div>
  );
}
