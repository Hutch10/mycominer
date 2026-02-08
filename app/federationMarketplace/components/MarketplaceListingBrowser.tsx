// Phase 41: Federation Marketplace v2
// components/MarketplaceListingBrowser.tsx
// UI for browsing marketplace listings with filters

'use client';

import React, { useState } from 'react';
import { MarketplaceListing, MarketplaceAssetType } from '../federationMarketplaceTypes';

interface MarketplaceListingBrowserProps {
  listings: MarketplaceListing[];
  onListingSelect: (listing: MarketplaceListing) => void;
}

export function MarketplaceListingBrowser({ listings, onListingSelect }: MarketplaceListingBrowserProps) {
  const [filterAssetType, setFilterAssetType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterPublic, setFilterPublic] = useState<string>('all');

  // Apply filters
  const filteredListings = listings.filter((listing) => {
    if (filterAssetType !== 'all' && listing.asset.assetType !== filterAssetType) {
      return false;
    }
    if (filterDifficulty !== 'all' && listing.asset.difficulty !== filterDifficulty) {
      return false;
    }
    if (filterPublic === 'public' && !listing.asset.isPublic) {
      return false;
    }
    if (filterPublic === 'private' && listing.asset.isPublic) {
      return false;
    }
    return true;
  });

  const getAssetTypeIcon = (type: MarketplaceAssetType): string => {
    const icons: Record<MarketplaceAssetType, string> = {
      'sop-template': '📋',
      'workflow-template': '🔄',
      'training-module': '🎓',
      'analytics-pattern-pack': '📊',
      'sandbox-scenario': '🧪',
      'forecast-guide': '📈',
      'operator-playbook': '📖',
    };
    return icons[type];
  };

  const getDifficultyColor = (difficulty?: string): string => {
    if (difficulty === 'beginner') return '#4caf50';
    if (difficulty === 'intermediate') return '#ff9800';
    if (difficulty === 'advanced') return '#f44336';
    return '#9e9e9e';
  };

  return (
    <div style={styles.container}>
      <div style={styles.filterBar}>
        <select
          style={styles.filterSelect}
          value={filterAssetType}
          onChange={(e) => setFilterAssetType(e.target.value)}
        >
          <option value="all">All Asset Types</option>
          <option value="sop-template">📋 SOP Templates</option>
          <option value="workflow-template">🔄 Workflow Templates</option>
          <option value="training-module">🎓 Training Modules</option>
          <option value="analytics-pattern-pack">📊 Analytics Pattern Packs</option>
          <option value="sandbox-scenario">🧪 Sandbox Scenarios</option>
          <option value="forecast-guide">📈 Forecast Guides</option>
          <option value="operator-playbook">📖 Operator Playbooks</option>
        </select>

        <select
          style={styles.filterSelect}
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          style={styles.filterSelect}
          value={filterPublic}
          onChange={(e) => setFilterPublic(e.target.value)}
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div style={styles.stats}>
        <span>Showing {filteredListings.length} of {listings.length} listings</span>
      </div>

      {filteredListings.length === 0 ? (
        <p style={styles.empty}>No listings match your filters</p>
      ) : (
        <div style={styles.grid}>
          {filteredListings.map((listing) => (
            <div
              key={listing.listingId}
              style={styles.card}
              onClick={() => onListingSelect(listing)}
            >
              <div style={styles.cardHeader}>
                <span style={styles.assetIcon}>{getAssetTypeIcon(listing.asset.assetType)}</span>
                {listing.isFeatured && <span style={styles.featuredBadge}>⭐ Featured</span>}
              </div>

              <h4 style={styles.assetName}>{listing.asset.name}</h4>
              <p style={styles.assetDescription}>{listing.asset.description}</p>

              <div style={styles.metadata}>
                <div style={styles.metadataItem}>
                  <strong>Type:</strong> {listing.asset.assetType}
                </div>
                <div style={styles.metadataItem}>
                  <strong>Publisher:</strong> {listing.asset.publisherTenantId}
                </div>
                <div style={styles.metadataItem}>
                  <strong>Version:</strong> {listing.asset.version}
                </div>
                {listing.asset.difficulty && (
                  <div style={styles.metadataItem}>
                    <span
                      style={{
                        ...styles.difficultyBadge,
                        backgroundColor: getDifficultyColor(listing.asset.difficulty),
                      }}
                    >
                      {listing.asset.difficulty}
                    </span>
                  </div>
                )}
              </div>

              <div style={styles.tags}>
                {listing.asset.tags.map((tag, idx) => (
                  <span key={idx} style={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={styles.stats}>
                <span style={styles.statBadge}>👥 {listing.asset.subscriberCount} subscribers</span>
                <span style={styles.statBadge}>👁️ {listing.asset.viewCount} views</span>
                {listing.asset.isPublic ? (
                  <span style={styles.publicBadge}>🌐 Public</span>
                ) : (
                  <span style={styles.privateBadge}>🔒 Private</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    backgroundColor: 'white',
  },
  stats: {
    fontSize: '13px',
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    fontStyle: 'italic',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  assetIcon: {
    fontSize: '24px',
  },
  featuredBadge: {
    backgroundColor: '#ffc107',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  assetName: {
    fontSize: '16px',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: '#333',
  },
  assetDescription: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 12px 0',
    lineHeight: '1.5',
  },
  metadata: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
    fontSize: '12px',
    color: '#555',
  },
  metadataItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  difficultyBadge: {
    color: 'white',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    color: '#0066cc',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
  },
  statBadge: {
    fontSize: '11px',
    color: '#999',
    marginRight: '12px',
  },
  publicBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  privateBadge: {
    backgroundColor: '#ff9800',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
};
