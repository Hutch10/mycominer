'use client';

/**
 * Phase 62: Federation Marketplace & Multi-Tenant Insights
 * 
 * Multi-federation insights, benchmarking, and cross-tenant analytics dashboard.
 */

import { useState } from 'react';
import type {
  Federation,
  FederationBenchmark,
  FederationInsight,
  FederationMetric,
  FederationTrend,
} from './federationTypes';

export default function FederationMarketplacePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'benchmarks' | 'insights' | 'trends' | 'federations'>('overview');
  const [selectedFederation, setSelectedFederation] = useState<string>('fed-mycology-network');

  // Mock data
  const mockFederations: Federation[] = [
    {
      federationId: 'fed-mycology-network',
      name: 'Mycology Network Federation',
      description: 'Global network of mushroom cultivation facilities',
      tenantIds: ['tenant-alpha', 'tenant-beta', 'tenant-gamma', 'tenant-delta', 'tenant-epsilon'],
      createdAt: new Date('2025-01-01'),
      privacyLevel: 'strict',
      sharingAgreement: {
        allowedCategories: ['performance-metrics', 'compliance-rates', 'workflow-efficiency', 'quality-metrics'],
        anonymizationLevel: 'full',
        aggregationThreshold: 5,
        excludedFields: ['operator-names', 'facility-addresses', 'financial-details'],
        retentionDays: 365,
      },
      status: 'active',
    },
    {
      federationId: 'fed-research-consortium',
      name: 'Research Consortium',
      description: 'Academic and research institutions collaborating on cultivation techniques',
      tenantIds: ['tenant-alpha', 'tenant-zeta', 'tenant-eta'],
      createdAt: new Date('2025-06-15'),
      privacyLevel: 'moderate',
      sharingAgreement: {
        allowedCategories: ['performance-metrics', 'quality-metrics', 'training-completion'],
        anonymizationLevel: 'partial',
        aggregationThreshold: 3,
        excludedFields: ['operator-names'],
        retentionDays: 730,
      },
      status: 'active',
    },
  ];

  const mockBenchmarks: FederationBenchmark[] = [
    {
      benchmarkId: 'bm-001',
      tenantId: 'tenant-alpha',
      federationId: 'fed-mycology-network',
      category: 'performance-metrics',
      metricName: 'overall-efficiency',
      tenantValue: 87.5,
      federationMedian: 82.3,
      federationP25: 75.1,
      federationP75: 88.9,
      tenantPercentile: 68,
      comparisonStatus: 'above-average',
      gap: 5.2,
      timestamp: new Date(),
    },
    {
      benchmarkId: 'bm-002',
      tenantId: 'tenant-alpha',
      federationId: 'fed-mycology-network',
      category: 'compliance-rates',
      metricName: 'compliance-score',
      tenantValue: 94.2,
      federationMedian: 91.5,
      federationP25: 87.0,
      federationP75: 95.2,
      tenantPercentile: 72,
      comparisonStatus: 'above-average',
      gap: 2.7,
      timestamp: new Date(),
    },
    {
      benchmarkId: 'bm-003',
      tenantId: 'tenant-alpha',
      federationId: 'fed-mycology-network',
      category: 'workflow-efficiency',
      metricName: 'workflow-completion-rate',
      tenantValue: 78.3,
      federationMedian: 85.7,
      federationP25: 79.5,
      federationP75: 91.2,
      tenantPercentile: 35,
      comparisonStatus: 'below-average',
      gap: -7.4,
      timestamp: new Date(),
    },
  ];

  const mockInsights: FederationInsight[] = [
    {
      insightId: 'insight-001',
      federationId: 'fed-mycology-network',
      type: 'performance-opportunity',
      title: 'Workflow Efficiency Below Federation Average',
      description: 'Your workflow completion rate (78.3%) is below the federation median (85.7%), ranking in the 35th percentile. Improving this could increase overall productivity.',
      severity: 'recommendation',
      affectedCategories: ['workflow-efficiency'],
      evidence: [],
      recommendations: [
        'Use Phase 49 Simulation Mode to identify process bottlenecks',
        'Review SOP execution times and optimization opportunities',
        'Consider workload orchestration adjustments (Phase 57)',
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      insightId: 'insight-002',
      federationId: 'fed-mycology-network',
      type: 'efficiency-leader',
      title: 'Top Performer in Compliance',
      description: 'Excellent work! Your compliance score (94.2%) ranks in the top 28% (72nd percentile) across the federation.',
      severity: 'info',
      affectedCategories: ['compliance-rates'],
      evidence: [],
      recommendations: [],
      createdAt: new Date(),
    },
  ];

  const mockStats = {
    totalFederations: 2,
    totalTenants: 7,
    yourRank: 3,
    categoriesShared: 4,
    lastUpdated: new Date(),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            🌐 Federation Marketplace
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Multi-tenant benchmarking & cross-federation insights • Phase 62
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {(['overview', 'benchmarks', 'insights', 'trends', 'federations'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StatCard label="Federations" value={mockStats.totalFederations} icon="🌐" />
              <StatCard label="Total Tenants" value={mockStats.totalTenants} icon="🏢" />
              <StatCard label="Your Rank" value={`#${mockStats.yourRank}`} icon="🏆" />
              <StatCard label="Categories Shared" value={mockStats.categoriesShared} icon="📊" />
              <StatCard label="Last Updated" value="2 min ago" icon="🕐" />
            </div>

            {/* Federation Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Active Federations
              </h2>
              <div className="space-y-3">
                {mockFederations.map((fed) => (
                  <div
                    key={fed.federationId}
                    onClick={() => setSelectedFederation(fed.federationId)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedFederation === fed.federationId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {fed.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {fed.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                          <span>👥 {fed.tenantIds.length} tenants</span>
                          <span>🔒 {fed.privacyLevel} privacy</span>
                          <span>✓ {fed.sharingAgreement.allowedCategories.length} categories</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        fed.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {fed.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quick Insights
              </h2>
              <div className="space-y-3">
                {mockInsights.map((insight) => (
                  <div
                    key={insight.insightId}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.severity === 'recommendation'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {insight.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Performance Benchmarks
            </h2>
            <div className="space-y-4">
              {mockBenchmarks.map((benchmark) => (
                <div
                  key={benchmark.benchmarkId}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {benchmark.metricName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {benchmark.category}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      benchmark.comparisonStatus === 'above-average'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : benchmark.comparisonStatus === 'below-average'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {benchmark.comparisonStatus.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {benchmark.tenantValue.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Your Value
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {benchmark.federationMedian.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Federation Median
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {benchmark.tenantPercentile}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Percentile Rank
                      </div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${
                        benchmark.gap >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {benchmark.gap >= 0 ? '+' : ''}{benchmark.gap.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Gap from Median
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Federation Insights
            </h2>
            <div className="space-y-4">
              {mockInsights.map((insight) => (
                <div
                  key={insight.insightId}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {insight.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      insight.severity === 'recommendation'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : insight.severity === 'warning'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {insight.severity}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {insight.description}
                  </p>

                  {insight.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                        Recommendations:
                      </h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Trend Analysis
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Trend analysis visualization coming soon. Will show time-series data for key metrics
              comparing your facility against federation benchmarks.
            </p>
          </div>
        )}

        {activeTab === 'federations' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Federation Details
            </h2>
            <div className="space-y-4">
              {mockFederations.map((fed) => (
                <div
                  key={fed.federationId}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    {fed.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {fed.description}
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                        Configuration
                      </h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Members:</dt>
                          <dd className="text-gray-900 dark:text-gray-100">{fed.tenantIds.length} tenants</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Privacy Level:</dt>
                          <dd className="text-gray-900 dark:text-gray-100 capitalize">{fed.privacyLevel}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Anonymization:</dt>
                          <dd className="text-gray-900 dark:text-gray-100 capitalize">
                            {fed.sharingAgreement.anonymizationLevel}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600 dark:text-gray-400">Min Threshold:</dt>
                          <dd className="text-gray-900 dark:text-gray-100">
                            {fed.sharingAgreement.aggregationThreshold} tenants
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                        Shared Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {fed.sharingAgreement.allowedCategories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{label}</div>
    </div>
  );
}
