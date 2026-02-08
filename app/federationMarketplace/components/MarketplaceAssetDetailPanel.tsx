// Phase 41: Federation Marketplace v2
// components/MarketplaceAssetDetailPanel.tsx
// UI for viewing asset details

'use client';

import React from 'react';
import { MarketplaceListing } from '../federationMarketplaceTypes';

interface MarketplaceAssetDetailPanelProps {
  listing: MarketplaceListing | null;
  onSubscribe: () => void;
  onExplain: () => void;
  onViewPatterns: () => void;
  onOpenTraining: () => void;
}

export function MarketplaceAssetDetailPanel({
  listing,
  onSubscribe,
  onExplain,
  onViewPatterns,
  onOpenTraining,
}: MarketplaceAssetDetailPanelProps) {
  if (!listing) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>Select a listing to view details</p>
      </div>
    );
  }

  const asset = listing.asset;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{asset.name}</h3>
      <p style={styles.description}>{asset.description}</p>

      <div style={styles.infoGrid}>
        <div><strong>Asset Type:</strong> {asset.assetType}</div>
        <div><strong>Version:</strong> {asset.version}</div>
        <div><strong>Publisher:</strong> {asset.publisherTenantId}</div>
        <div><strong>Category:</strong> {asset.category}</div>
        {asset.difficulty && <div><strong>Difficulty:</strong> {asset.difficulty}</div>}
        {asset.estimatedValue && <div><strong>Value:</strong> {asset.estimatedValue}</div>}
      </div>

      <div style={styles.section}>
        <h4>Tags</h4>
        <div style={styles.tags}>
          {asset.tags.map((tag, idx) => (
            <span key={idx} style={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      {listing.prerequisites && listing.prerequisites.length > 0 && (
        <div style={styles.section}>
          <h4>Prerequisites</h4>
          <ul>
            {listing.prerequisites.map((prereq, idx) => (
              <li key={idx}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.actions}>
        <button style={styles.subscribeButton} onClick={onSubscribe}>
          📥 Subscribe to Asset
        </button>
      </div>

      <div style={styles.integrationButtons}>
        <button style={styles.integrationButton} onClick={onExplain}>
          💡 Explain This Asset
        </button>
        <button style={styles.integrationButton} onClick={onViewPatterns}>
          📊 View Related Patterns
        </button>
        {asset.assetType === 'training-module' && (
          <button style={styles.integrationButton} onClick={onOpenTraining}>
            🎓 Open Training Module
          </button>
        )}
      </div>

      <div style={styles.stats}>
        <div><strong>Subscribers:</strong> {asset.subscriberCount}</div>
        <div><strong>Views:</strong> {asset.viewCount}</div>
        <div><strong>Published:</strong> {new Date(asset.publishedAt).toLocaleDateString()}</div>
        {asset.lastAccessedAt && (
          <div><strong>Last Accessed:</strong> {new Date(asset.lastAccessedAt).toLocaleDateString()}</div>
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
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    fontStyle: 'italic',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 12px 0',
  },
  description: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    fontSize: '13px',
  },
  section: {
    marginBottom: '20px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    color: '#0066cc',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  actions: {
    marginBottom: '20px',
  },
  subscribeButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  integrationButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  integrationButton: {
    padding: '10px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    fontSize: '12px',
    color: '#666',
  },
};
