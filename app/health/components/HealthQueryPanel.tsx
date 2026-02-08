/**
 * Phase 43: System Health - Health Query Panel
 * Component for building and executing health queries
 */

'use client';

import React, { useState } from 'react';
import {
  HealthQuery,
  HealthCategory,
  HealthSeverity
} from '../healthTypes';

interface HealthQueryPanelProps {
  tenantId: string;
  facilityId?: string;
  userId: string;
  onExecuteQuery: (query: HealthQuery) => void;
  isLoading?: boolean;
}

export function HealthQueryPanel({
  tenantId,
  facilityId,
  userId,
  onExecuteQuery,
  isLoading = false
}: HealthQueryPanelProps) {
  const [queryType, setQueryType] = useState<HealthQuery['queryType']>('full-scan');
  const [selectedCategories, setSelectedCategories] = useState<HealthCategory[]>([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState<string[]>([]);
  const [severityThreshold, setSeverityThreshold] = useState<HealthSeverity>('low');
  const [description, setDescription] = useState('');

  const categories: HealthCategory[] = [
    'configuration-drift',
    'sop-workflow-mismatch',
    'stale-orphaned-references',
    'kg-link-integrity',
    'sandbox-scenario-staleness',
    'forecast-metadata-drift',
    'compliance-record-consistency',
    'cross-engine-schema-alignment',
    'tenant-federation-policy-violations'
  ];

  const assetTypes = [
    'sop',
    'workflow',
    'resource',
    'facility',
    'sandbox-scenario',
    'forecast'
  ];

  const handleExecuteQuery = () => {
    const query: HealthQuery = {
      id: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      tenantId,
      facilityId,
      userId,
      queryType,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      assetTypes: selectedAssetTypes.length > 0 ? selectedAssetTypes : undefined,
      severityThreshold,
      description: description || `Health scan: ${queryType}`
    };

    onExecuteQuery(query);
  };

  const toggleCategory = (category: HealthCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAssetType = (assetType: string) => {
    setSelectedAssetTypes(prev =>
      prev.includes(assetType)
        ? prev.filter(a => a !== assetType)
        : [...prev, assetType]
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Health Query Builder</h2>

      {/* Query Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Query Type
        </label>
        <select
          value={queryType}
          onChange={(e) => setQueryType(e.target.value as HealthQuery['queryType'])}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="full-scan">Full System Scan</option>
          <option value="drift-only">Drift Detection Only</option>
          <option value="integrity-only">Integrity Scan Only</option>
          <option value="category-specific">Category-Specific</option>
          <option value="asset-specific">Asset-Specific</option>
        </select>
      </div>

      {/* Categories */}
      {(queryType === 'category-specific' || queryType === 'full-scan') && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Health Categories
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="capitalize">{category.replace(/-/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Asset Types */}
      {(queryType === 'asset-specific' || queryType === 'drift-only') && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asset Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {assetTypes.map((assetType) => (
              <label key={assetType} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedAssetTypes.includes(assetType)}
                  onChange={() => toggleAssetType(assetType)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="capitalize">{assetType.replace(/-/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Severity Threshold */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Severity
        </label>
        <select
          value={severityThreshold}
          onChange={(e) => setSeverityThreshold(e.target.value as HealthSeverity)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value="info">Info and above</option>
          <option value="low">Low and above</option>
          <option value="medium">Medium and above</option>
          <option value="high">High and above</option>
          <option value="critical">Critical only</option>
        </select>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Weekly health check for production"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Execute Button */}
      <button
        onClick={handleExecuteQuery}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Running Health Scan...' : 'Execute Health Scan'}
      </button>
    </div>
  );
}
