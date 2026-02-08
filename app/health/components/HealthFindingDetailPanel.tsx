/**
 * Phase 43: System Health - Health Finding Detail Panel
 * Component for displaying detailed information about a health finding
 */

'use client';

import React from 'react';
import { DriftFinding, IntegrityFinding, HealthReference } from '../healthTypes';

interface HealthFindingDetailPanelProps {
  finding: DriftFinding | IntegrityFinding | null;
  onClose: () => void;
  onExplainFinding?: (findingId: string) => void;
  onOpenRelatedIncident?: (findingId: string) => void;
  onOpenRelatedPattern?: (findingId: string) => void;
  onOpenTrainingModule?: (category: string) => void;
  onOpenKnowledgePack?: (topic: string) => void;
}

export function HealthFindingDetailPanel({
  finding,
  onClose,
  onExplainFinding,
  onOpenRelatedIncident,
  onOpenRelatedPattern,
  onOpenTrainingModule,
  onOpenKnowledgePack
}: HealthFindingDetailPanelProps) {
  if (!finding) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
        Select a finding to view details
      </div>
    );
  }

  const isDriftFinding = 'driftType' in finding;

  const renderReference = (ref: HealthReference, idx: number) => (
    <div key={idx} className="flex items-center space-x-2 text-sm">
      <span className="text-gray-500 capitalize">{ref.type.replace(/-/g, ' ')}:</span>
      <span className="font-medium text-blue-600">{ref.name}</span>
      {ref.timestamp && (
        <span className="text-xs text-gray-400">
          ({new Date(ref.timestamp).toLocaleDateString()})
        </span>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Finding Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {/* Basic Info */}
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            {finding.assetName}
          </h4>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span className="capitalize">{finding.assetType.replace(/-/g, ' ')}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
              finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
              finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {finding.severity}
            </span>
          </div>
        </div>

        {/* Rationale/Description */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            {isDriftFinding ? 'Rationale' : 'Description'}
          </h5>
          <p className="text-sm text-gray-800">
            {isDriftFinding ? (finding as DriftFinding).rationale : (finding as IntegrityFinding).description}
          </p>
        </div>

        {/* Drift-specific Details */}
        {isDriftFinding && (
          <>
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Drift Details</h5>
              <div className="bg-gray-50 rounded p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Drift Type:</span>
                  <span className="font-medium capitalize">{(finding as DriftFinding).driftType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fields Changed:</span>
                  <span className="font-medium">{(finding as DriftFinding).fieldsDrifted.length}</span>
                </div>
                {(finding as DriftFinding).lastKnownGoodTimestamp && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Known Good:</span>
                    <span className="font-medium">
                      {new Date((finding as DriftFinding).lastKnownGoodTimestamp!).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Field Changes */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Changed Fields</h5>
              <div className="space-y-2">
                {(finding as DriftFinding).diff.slice(0, 5).map((diff, idx) => (
                  <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="font-medium text-sm text-gray-900">{diff.field}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      <span className="text-red-600">- {JSON.stringify(diff.baselineValue)}</span>
                      <br />
                      <span className="text-green-600">+ {JSON.stringify(diff.currentValue)}</span>
                    </div>
                  </div>
                ))}
                {(finding as DriftFinding).diff.length > 5 && (
                  <p className="text-xs text-gray-500">
                    ... and {(finding as DriftFinding).diff.length - 5} more changes
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Integrity-specific Details */}
        {!isDriftFinding && (
          <>
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Issue Type</h5>
              <p className="text-sm text-gray-800 capitalize">
                {(finding as IntegrityFinding).issueType.replace(/-/g, ' ')}
              </p>
            </div>

            {/* Affected Items */}
            {(finding as IntegrityFinding).affectedItems.length > 0 && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Affected Items ({(finding as IntegrityFinding).affectedItems.length})
                </h5>
                <div className="space-y-2">
                  {(finding as IntegrityFinding).affectedItems.map((item, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded p-2">
                      <div className="font-medium text-sm text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-600">{item.type}</div>
                      <div className="text-xs text-red-700 mt-1">{item.issue}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {(finding as IntegrityFinding).recommendation && (
              <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendation</h5>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-900">
                    {(finding as IntegrityFinding).recommendation}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* References */}
        {finding.references.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">References</h5>
            <div className="space-y-2">
              {finding.references.map(renderReference)}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Actions</h5>
          <div className="space-y-2">
            {onExplainFinding && (
              <button
                onClick={() => onExplainFinding(finding.id)}
                className="w-full text-left px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-sm text-purple-800 transition-colors"
              >
                💡 Explain This Finding
              </button>
            )}
            {onOpenRelatedIncident && (
              <button
                onClick={() => onOpenRelatedIncident(finding.id)}
                className="w-full text-left px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded text-sm text-orange-800 transition-colors"
              >
                🔍 Open Related Incident
              </button>
            )}
            {onOpenRelatedPattern && (
              <button
                onClick={() => onOpenRelatedPattern(finding.id)}
                className="w-full text-left px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded text-sm text-green-800 transition-colors"
              >
                📊 Open Related Pattern
              </button>
            )}
            {onOpenTrainingModule && (
              <button
                onClick={() => onOpenTrainingModule(finding.category)}
                className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-sm text-blue-800 transition-colors"
              >
                🎓 Open Training Module
              </button>
            )}
            {onOpenKnowledgePack && (
              <button
                onClick={() => onOpenKnowledgePack(finding.assetType)}
                className="w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-sm text-indigo-800 transition-colors"
              >
                📚 Open Knowledge Pack
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Metadata</h5>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Finding ID: {finding.id}</div>
            <div>Tenant: {finding.tenantId}</div>
            {finding.facilityId && <div>Facility: {finding.facilityId}</div>}
            <div>Detected: {new Date(finding.timestamp).toLocaleString()}</div>
            <div className="capitalize">Category: {finding.category.replace(/-/g, ' ')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
