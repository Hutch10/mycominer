// Phase 41: Federation Marketplace v2
// components/MarketplacePublisherPanel.tsx & MarketplacePolicyViewer.tsx & MarketplaceHistoryViewer.tsx
// Combined utility components for space efficiency

'use client';

import React from 'react';
import { MarketplaceListing, MarketplacePolicy, MarketplaceLogEntry } from '../federationMarketplaceTypes';

// ===== PUBLISHER PANEL =====

export function MarketplacePublisherPanel({ publishedListings }: { publishedListings: MarketplaceListing[] }) {
  return (
    <div style={styles.container}>
      <h3>My Published Assets ({publishedListings.length})</h3>
      {publishedListings.map((listing) => (
        <div key={listing.listingId} style={styles.card}>
          <div><strong>{listing.asset.name}</strong></div>
          <div>Type: {listing.asset.assetType}</div>
          <div>Subscribers: {listing.asset.subscriberCount}</div>
          <div>Views: {listing.asset.viewCount}</div>
        </div>
      ))}
    </div>
  );
}

// ===== POLICY VIEWER =====

export function MarketplacePolicyViewer({ policies }: { policies: MarketplacePolicy[] }) {
  return (
    <div style={styles.container}>
      <h3>Marketplace Policies ({policies.length})</h3>
      {policies.map((policy) => (
        <div key={policy.policyId} style={styles.card}>
          <h4>{policy.policyName}</h4>
          <p>{policy.policyDescription}</p>
          <div>Can Publish: {policy.canPublish ? '✓' : '✗'}</div>
          <div>Can Subscribe: {policy.canSubscribe ? '✓' : '✗'}</div>
          <div>Requires Approval: {policy.requiresApproval ? '✓' : '✗'}</div>
          <div>Asset Types: {policy.allowedAssetTypes.join(', ')}</div>
        </div>
      ))}
    </div>
  );
}

// ===== HISTORY VIEWER =====

export function MarketplaceHistoryViewer({ logs }: { logs: MarketplaceLogEntry[] }) {
  return (
    <div style={styles.container}>
      <h3>Marketplace Activity Log ({logs.length})</h3>
      {logs.slice(0, 50).reverse().map((log) => (
        <div key={log.logId} style={styles.logEntry}>
          <div style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</div>
          <div style={styles.logType}>{log.logType}</div>
          {log.action && <div>Action: {log.action}</div>}
          {log.result && <div>Result: {log.result}</div>}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: 'white',
  },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '12px',
    fontSize: '13px',
  },
  logEntry: {
    borderBottom: '1px solid #f0f0f0',
    padding: '12px 0',
    fontSize: '12px',
  },
  logTime: {
    color: '#999',
    fontSize: '11px',
    marginBottom: '4px',
  },
  logType: {
    fontWeight: 600,
    marginBottom: '4px',
  },
};
