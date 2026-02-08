// Phase 41: Federation Marketplace v2
// components/MarketplaceSubscriptionPanel.tsx
// UI for managing subscriptions

'use client';

import React from 'react';
import { MarketplaceSubscription } from '../federationMarketplaceTypes';

interface MarketplaceSubscriptionPanelProps {
  subscriptions: MarketplaceSubscription[];
  onCancel: (subscriptionId: string) => void;
  onAccessAsset: (assetId: string) => void;
}

export function MarketplaceSubscriptionPanel({
  subscriptions,
  onCancel,
  onAccessAsset,
}: MarketplaceSubscriptionPanelProps) {
  const activeSubscriptions = subscriptions.filter((sub) => sub.isActive);
  const pendingSubscriptions = subscriptions.filter((sub) => sub.approvalStatus === 'pending');

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>My Subscriptions</h3>

      {pendingSubscriptions.length > 0 && (
        <div style={styles.section}>
          <h4>Pending Approvals ({pendingSubscriptions.length})</h4>
          {pendingSubscriptions.map((sub) => (
            <div key={sub.subscriptionId} style={styles.subscriptionCard}>
              <div><strong>Asset:</strong> {sub.assetId}</div>
              <div><strong>Requested:</strong> {new Date(sub.requestedAt).toLocaleDateString()}</div>
              <span style={styles.pendingBadge}>⏳ Pending Approval</span>
            </div>
          ))}
        </div>
      )}

      <div style={styles.section}>
        <h4>Active Subscriptions ({activeSubscriptions.length})</h4>
        {activeSubscriptions.length === 0 ? (
          <p style={styles.empty}>No active subscriptions</p>
        ) : (
          activeSubscriptions.map((sub) => (
            <div key={sub.subscriptionId} style={styles.subscriptionCard}>
              <div><strong>Asset:</strong> {sub.assetId}</div>
              <div><strong>Subscribed:</strong> {new Date(sub.activatedAt!).toLocaleDateString()}</div>
              <div><strong>Access Count:</strong> {sub.accessCount}</div>
              <div style={styles.actions}>
                <button style={styles.accessButton} onClick={() => onAccessAsset(sub.assetId)}>
                  📂 Access Asset
                </button>
                <button style={styles.cancelButton} onClick={() => onCancel(sub.subscriptionId)}>
                  ✖️ Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
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
  title: {
    fontSize: '18px',
    fontWeight: 700,
    marginTop: 0,
  },
  section: {
    marginBottom: '24px',
  },
  subscriptionCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '12px',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pendingBadge: {
    backgroundColor: '#ff9800',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    alignSelf: 'flex-start',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  accessButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '20px',
    fontStyle: 'italic',
  },
};
