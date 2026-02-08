// Phase 41: Federation Marketplace v2
// components/FederationMarketplaceDashboard.tsx
// Main orchestrator component

'use client';

import React, { useState, useEffect } from 'react';
import { MarketplaceListingBrowser } from './MarketplaceListingBrowser';
import { MarketplaceAssetDetailPanel } from './MarketplaceAssetDetailPanel';
import { MarketplaceSubscriptionPanel } from './MarketplaceSubscriptionPanel';
import { MarketplacePublisherPanel, MarketplacePolicyViewer, MarketplaceHistoryViewer } from './MarketplaceUtilityPanels';
import { MarketplaceListing } from '../federationMarketplaceTypes';
import {
  initializeMarketplace,
  queryListings,
  requestSubscription,
  getSubscriptions,
  getActiveSubscriptions,
  cancelSubscription,
  accessAsset,
  getMarketplaceStats,
} from '../federationMarketplaceEngine';
import { getListingsByTenant } from '../publisherRegistry';
import { getActivePoliciesByTenant } from '../marketplacePolicyEngine';
import { getMarketplaceLogsByTenant } from '../marketplaceLog';

interface FederationMarketplaceDashboardProps {
  tenantId: string;
  facilityId?: string;
  operatorId: string;
  onRequestExplain?: (assetId: string) => void;
  onViewPatterns?: (assetId: string) => void;
  onOpenTraining?: (assetId: string) => void;
}

export function FederationMarketplaceDashboard({
  tenantId,
  facilityId,
  operatorId,
  onRequestExplain,
  onViewPatterns,
  onOpenTraining,
}: FederationMarketplaceDashboardProps) {
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [view, setView] = useState<'browse' | 'subscriptions' | 'publisher' | 'policies' | 'history'>('browse');

  useEffect(() => {
    initializeMarketplace(tenantId);
  }, [tenantId]);

  const listings = queryListings({
    queryId: `query-${Date.now()}`,
    tenantId,
    facilityId,
  }).listings;

  const subscriptions = getSubscriptions(tenantId);
  const publishedListings = getListingsByTenant(tenantId);
  const policies = getActivePoliciesByTenant(tenantId);
  const logs = getMarketplaceLogsByTenant(tenantId);
  const stats = getMarketplaceStats(tenantId);

  const handleSubscribe = () => {
    if (selectedListing) {
      requestSubscription(
        selectedListing.listingId,
        tenantId,
        facilityId,
        operatorId,
        'Subscription request from dashboard'
      );
      alert('Subscription requested!');
    }
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    cancelSubscription(subscriptionId, tenantId, operatorId);
    alert('Subscription cancelled');
  };

  const handleAccessAsset = (assetId: string) => {
    const success = accessAsset(assetId, tenantId, facilityId, operatorId);
    if (success) {
      alert(`Asset accessed: ${assetId}`);
    } else {
      alert('Access denied');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Federation Marketplace</h2>
        <div style={styles.nav}>
          <button onClick={() => setView('browse')} style={view === 'browse' ? styles.navButtonActive : styles.navButton}>
            📚 Browse
          </button>
          <button onClick={() => setView('subscriptions')} style={view === 'subscriptions' ? styles.navButtonActive : styles.navButton}>
            📥 Subscriptions
          </button>
          <button onClick={() => setView('publisher')} style={view === 'publisher' ? styles.navButtonActive : styles.navButton}>
            📤 Publisher
          </button>
          <button onClick={() => setView('policies')} style={view === 'policies' ? styles.navButtonActive : styles.navButton}>
            🔐 Policies
          </button>
          <button onClick={() => setView('history')} style={view === 'history' ? styles.navButtonActive : styles.navButton}>
            📊 History
          </button>
        </div>
      </div>

      <div style={styles.statsBar}>
        <div>Listings: {stats.totalListings}</div>
        <div>Subscriptions: {stats.activeSubscriptions}</div>
        <div>Published: {stats.publishedAssets}</div>
        <div>Pending: {stats.pendingApprovals}</div>
      </div>

      {view === 'browse' && (
        <div style={styles.mainContent}>
          <div style={styles.leftPanel}>
            <MarketplaceListingBrowser
              listings={listings}
              onListingSelect={setSelectedListing}
            />
          </div>
          <div style={styles.rightPanel}>
            <MarketplaceAssetDetailPanel
              listing={selectedListing}
              onSubscribe={handleSubscribe}
              onExplain={() => selectedListing && onRequestExplain?.(selectedListing.asset.assetId)}
              onViewPatterns={() => selectedListing && onViewPatterns?.(selectedListing.asset.assetId)}
              onOpenTraining={() => selectedListing && onOpenTraining?.(selectedListing.asset.assetId)}
            />
          </div>
        </div>
      )}

      {view === 'subscriptions' && (
        <MarketplaceSubscriptionPanel
          subscriptions={subscriptions}
          onCancel={handleCancelSubscription}
          onAccessAsset={handleAccessAsset}
        />
      )}

      {view === 'publisher' && (
        <MarketplacePublisherPanel publishedListings={publishedListings} />
      )}

      {view === 'policies' && (
        <MarketplacePolicyViewer policies={policies} />
      )}

      {view === 'history' && (
        <MarketplaceHistoryViewer logs={logs} />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  nav: {
    display: 'flex',
    gap: '8px',
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  navButtonActive: {
    padding: '8px 16px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: '1px solid #0066cc',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  statsBar: {
    display: 'flex',
    gap: '20px',
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: 600,
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  leftPanel: {
    maxHeight: 'calc(100vh - 280px)',
    overflowY: 'auto',
  },
  rightPanel: {},
};
