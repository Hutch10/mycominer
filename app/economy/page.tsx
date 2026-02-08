import React from 'react';
import UsageAnalyticsPanel from './components/UsageAnalyticsPanel';
import TokenBalanceCard from './components/TokenBalanceCard';
import BurnHistoryTable from './components/BurnHistoryTable';

const ORG_ID = 'demo-org-1';

export default function Page() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Economic Dashboard (Phase 74)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div>
          <UsageAnalyticsPanel orgId={ORG_ID} />
          <div style={{ height: 12 }} />
          <BurnHistoryTable orgId={ORG_ID} />
        </div>
        <div>
          <TokenBalanceCard orgId={ORG_ID} tokens={[]} />
        </div>
      </div>
    </div>
  );
}
