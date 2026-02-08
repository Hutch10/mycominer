/**
 * Phase 43: System Health - Integrity Finding List
 * Component for displaying integrity scan findings
 */

'use client';

import React from 'react';
import { IntegrityFinding, HealthSeverity } from '../healthTypes';

interface IntegrityFindingListProps {
  findings: IntegrityFinding[];
  onSelectFinding: (finding: IntegrityFinding) => void;
  selectedFindingId?: string;
}

export function IntegrityFindingList({
  findings,
  onSelectFinding,
  selectedFindingId
}: IntegrityFindingListProps) {
  if (findings.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-lg font-medium">
          ✓ No Integrity Issues Detected
        </div>
        <p className="text-green-700 text-sm mt-2">
          All system references and links are valid and consistent.
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

  const getIssueTypeIcon = (issueType: IntegrityFinding['issueType']): string => {
    switch (issueType) {
      case 'missing-kg-node':
        return '🔗';
      case 'broken-kg-edge':
        return '⚠️';
      case 'stale-timeline-reference':
        return '📅';
      case 'orphaned-capa-link':
      case 'orphaned-deviation-link':
        return '🔍';
      case 'missing-sop-asset':
        return '📋';
      case 'outdated-sandbox-workflow':
        return '🧪';
      case 'inconsistent-schema':
        return '📊';
      case 'policy-violation':
        return '🚫';
      default:
        return '⚠️';
    }
  };

  const getCategoryLabel = (category: IntegrityFinding['category']): string => {
    return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Integrity Findings</h3>
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
              <span className="text-xl">{getIssueTypeIcon(finding.issueType)}</span>
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

          {/* Description */}
          <p className="text-sm text-gray-700 mb-2">
            {finding.description}
          </p>

          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              {getCategoryLabel(finding.category)}
            </span>
          </div>

          {/* Affected Items */}
          {finding.affectedItems.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">
                Affected Items: {finding.affectedItems.length}
              </p>
              <div className="pl-4 space-y-1">
                {finding.affectedItems.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="text-xs text-gray-600">
                    • {item.name} ({item.type})
                  </div>
                ))}
                {finding.affectedItems.length > 3 && (
                  <div className="text-xs text-gray-500">
                    ... and {finding.affectedItems.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {finding.recommendation && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
              <p className="text-xs text-blue-800">
                <strong>Recommendation:</strong> {finding.recommendation}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Detected: {new Date(finding.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
