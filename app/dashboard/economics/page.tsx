import React from 'react';
import { Metadata } from 'next';
import { getAllFacilitiesEconomics, getMarketSnapshot } from '../../lib/monetization/insights-api';

export const metadata: Metadata = {
  title: 'Economics Dashboard',
  description: 'Monetization dashboard — batch, room, facility and scenarios',
};

// Client-side refresh toolbar
function RefreshControlsClient() {
  'use client';
  const { useRouter } = require('next/navigation');
  const router = useRouter();
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => router.refresh()} className="px-3 py-1 rounded bg-blue-600 text-white">Refresh</button>
    </div>
  );
}

export default async function Page() {
  // server-side prefetch to improve first paint and support offline fallback
  let allFacilities: any = null;
  let marketSnapshot: any = null;
  try {
    allFacilities = await getAllFacilitiesEconomics();
  } catch (e) {
    allFacilities = null;
  }
  try {
    marketSnapshot = await getMarketSnapshot();
  } catch (e) {
    marketSnapshot = null;
  }

  return (
    <main className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Economics Dashboard</h1>
          <RefreshControlsClient />
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-2">Facilities Economics</h2>
            {allFacilities ? (
              <pre className="text-sm overflow-auto">{JSON.stringify(allFacilities, null, 2)}</pre>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold mb-2">Market Snapshot</h2>
            {marketSnapshot ? (
              <pre className="text-sm overflow-auto">{JSON.stringify(marketSnapshot, null, 2)}</pre>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
