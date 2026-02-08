"use client";

import React from 'react';
import { KGEdge, KGNode } from '../knowledgeGraphTypes';

interface Props {
  pathEdges: KGEdge[];
  nodes: KGNode[];
}

export function KGPathViewer({ pathEdges, nodes }: Props) {
  return (
    <div className="kg-card kg-card-soft">
      <div className="kg-card-header">
        <h3>Path Viewer</h3>
        <span className="kg-pill">Explainer</span>
      </div>
      <p className="kg-sub">Simple path visualization (bounded). No auto-execution.</p>
      <div className="kg-list">
        {pathEdges.map((edge) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to = nodes.find((n) => n.id === edge.to);
          return (
            <div key={edge.id} className="kg-row">
              <div>
                <p className="kg-label">From</p>
                <p>{from?.name ?? edge.from}</p>
              </div>
              <div>
                <p className="kg-label">Relation</p>
                <p>{edge.type}</p>
              </div>
              <div>
                <p className="kg-label">To</p>
                <p>{to?.name ?? edge.to}</p>
              </div>
              {edge.federated ? <span className="kg-pill-soft">Federated</span> : null}
            </div>
          );
        })}
        {!pathEdges.length && <p className="kg-sub">No path found within the bounded search.</p>}
      </div>
      <button className="kg-button ghost" type="button">Explain This Path (Phase 25 hook)</button>
    </div>
  );
}
