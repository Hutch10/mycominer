'use client';

import { OptimizationDashboard } from '@/app/optimization/components/OptimizationDashboard';

export default function OptimizationPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <OptimizationDashboard />
      </div>
    </main>
  );
}
