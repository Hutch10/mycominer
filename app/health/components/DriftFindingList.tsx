/**
 * Phase 43: System Health - Drift Finding List
 * Component for displaying drift detection findings
 */

'use client';

import React from 'react';
import { DriftFinding, HealthSeverity } from '../healthTypes';

interface DriftFindingListProps {
  findings: DriftFinding[];
  onSelectFinding: (finding: DriftFinding) => void;
  selectedFindingId?: string;
}

export function DriftFindingList({
  findings,
  onSelectFinding,
  selectedFindingId
}: DriftFindingListProps) {
  if (findings.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-lg font-medium">
          ✓ No Configuration Drift Detected
        </div>
        <p className="text-green-700 text-sm mt-2">
          All monitored configurations match their approved baselines.
        </p>
      </div>
    );
  }

  const getSeverityColor = (severity: HealthSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDriftTypeIcon = (driftType: DriftFinding['driftType']): string => {
    switch (driftType) {
      case 'added':
        return '➕';
      case 'removed':
        return '➖';
      case 'modified':
        return '✏️';
      case 'version-mismatch':
        return '🔄';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Configuration Drift Findings</h3>
        <span className="text-sm text-gray-600">
          {findings.length} finding{findings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {findings.map((finding) => (
        <div
          key={finding.id}
          onClick={() => onSelectFinding(finding)}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedFindingId === finding.id
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:bg-gray-50'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getDriftTypeIcon(finding.driftType)}</span>
              <div>
                <h4 className="font-medium text-gray-900">
                  {finding.assetName}
                </h4>
                <p className="text-xs text-gray-500 capitalize">
                  {finding.assetType.replace(/-/g, ' ')}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(finding.severity)}`}>
              {finding.severity}
            </span>
          </div>

          {/* Rationale */}
          <p className="text-sm text-gray-700 mb-3">
            {finding.rationale}
          </p>

          {/* Drift Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500">Drift Type:</span>
              <span className="ml-2 font-medium capitalize">{finding.driftType}</span>
            </div>
            <div>
              <span className="text-gray-500">Fields Changed:</span>
              <span className="ml-2 font-medium">{finding.fieldsDrifted.length}</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Detected: {new Date(finding.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
