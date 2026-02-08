"use client";

import React from 'react';
import { KGEdge, KGNode, KGResult } from '../knowledgeGraphTypes';

interface Props {
  result: KGResult;
  onSelectNode: (node: KGNode) => void;
}

export function KGQueryResultPanel({ result, onSelectNode }: Props) {
  return (
    <div className="kg-card">
      <div className="kg-card-header">
        <h3>Query Results</h3>
        <span className="kg-pill">{result.scope}</span>
      </div>
      <p className="kg-sub">Read-only semantic results. No writes, no execution.</p>
      <div className="kg-grid">
        <div>
          <p className="kg-label">Nodes</p>
          <p>{result.nodes.length}</p>
        </div>
        <div>
          <p className="kg-label">Edges</p>
          <p>{result.edges.length}</p>
        </div>
      </div>
      <div className="kg-list">
        {result.nodes.map((node) => (
          <button key={node.id} className="kg-link" onClick={() => onSelectNode(node)}>
            <div className="kg-row">
              <div>
                <p className="kg-label">Name</p>
                <p>{node.name}</p>
              </div>
              <div>
                <p className="kg-label">Type</p>
                <p>{node.type}</p>
              </div>
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
            </div>
          </button>
        ))}
        {!result.nodes.length && <p className="kg-sub">No nodes matched.</p>}
      </div>
      <div className="kg-list kg-list-block">
        {result.edges.map((edge) => (
          <div key={edge.id} className="kg-row">
            <div>
              <p className="kg-label">Relation</p>
              <p>{edge.type}</p>
            </div>
            <div>
              <p className="kg-label">From</p>
              <p>{edge.from}</p>
            </div>
            <div>
              <p className="kg-label">To</p>
              <p>{edge.to}</p>
            </div>
            {edge.federated ? <span className="kg-pill-soft">Federated</span> : null}
          </div>
        ))}
        {!result.edges.length && <p className="kg-sub">No edges in scope.</p>}
      </div>
      <button type="button" className="kg-button ghost">Explain This Neighborhood (Phase 25 hook)</button>
    </div>
  );
}
