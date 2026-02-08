import React from 'react';
import { Metadata } from 'next';
import { getAllFacilitiesEconomics, getMarketSnapshot } from '../../../lib/monetization/insights-api';
import { ErrorBoundary } from '../../../ui/components/economics/ErrorBoundary';
import { BatchEconomicsCard, RoomEconomicsCard, FacilityEconomicsCard, ScenarioComparisonView, MarketSnapshotPanel, SimulationSnapshotPanel, ScenarioProjectionView, PredictiveTrendsPanel } from '../../../ui/components/economics';

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

  // sample identifiers for demo; in real UI these are dynamic/route-driven
  const sampleBatchId = 'BATCH-1';
  const sampleRoomId = 'ROOM-1';
  const sampleFacilityId = 'FAC-1';
  const sampleScenarioIds = ['S1', 'S2'];
  const sampleHistorical = [100, 110, 115, 120];
  const kgOpts = {};

  return (
    <main className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Economics Dashboard</h1>
          <RefreshControlsClient />
        </header>

        <ErrorBoundary>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BatchEconomicsCard batchId={sampleBatchId} batchProfits={[]} />
            <RoomEconomicsCard roomId={sampleRoomId} batchProfits={[]} />
            <FacilityEconomicsCard facilityId={sampleFacilityId} batchProfits={[]} />
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <ScenarioComparisonView scenarioIds={sampleScenarioIds} scenariosMap={{}} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <MarketSnapshotPanel marketOutputs={marketSnapshot ? [marketSnapshot.data] : []} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <SimulationSnapshotPanel id={sampleBatchId} type="batch" batchOut={{}} params={{ periods: 3, growthRate: 0.02 }} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <ScenarioProjectionView scenarioId={'SC-EX'} branches={[{ batchIds: ['BATCH-1'], adjustments: { growthRate: 0.03 } }, { batchIds: ['BATCH-2'], adjustments: { growthRate: 0.01 } }]} precomputedBatchOuts={[]} params={{ periods: 4 }} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <PredictiveTrendsPanel entityId={'FAC-1'} historicalValues={sampleHistorical} opts={{ shockPct: 0.05, elasticity: 1 }} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <KnowledgeGraphPreviewPanel opts={kgOpts} />
            </div>
          </section>
        </ErrorBoundary>
      </div>
    </main>
  );
}
