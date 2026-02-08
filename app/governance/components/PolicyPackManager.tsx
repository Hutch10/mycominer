/**
 * Phase 44: System Governance - Policy Pack Manager Component
 * 
 * Manage and assign policy packs to roles.
 */

'use client';

import React from 'react';
import { PolicyPack } from '../governanceTypes';

interface PolicyPackManagerProps {
  policyPacks: PolicyPack[];
  selectedPackId: string | null;
  onSelectPack: (packId: string) => void;
  onToggleActive?: (packId: string) => void;
}

export function PolicyPackManager({
  policyPacks,
  selectedPackId,
  onSelectPack,
  onToggleActive
}: PolicyPackManagerProps) {
  const selectedPack = policyPacks.find(p => p.id === selectedPackId);
  const activePacks = policyPacks.filter(p => p.active);
  const inactivePacks = policyPacks.filter(p => !p.active);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Policy Pack Manager</h3>
        <div className="text-sm text-gray-600">
          {activePacks.length} active • {inactivePacks.length} inactive
        </div>
      </div>

      {/* Pack List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policyPacks.map(pack => (
          <button
            key={pack.id}
            onClick={() => onSelectPack(pack.id)}
            className={`text-left border rounded p-4 transition-all ${
              selectedPackId === pack.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${!pack.active ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium">{pack.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{pack.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  pack.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {pack.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {pack.scope}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {pack.rules.length} rules
              </span>
              {pack.metadata?.industryStandard && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  {pack.metadata.industryStandard}
                </span>
              )}
              {pack.metadata?.version && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                  v{pack.metadata.version}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Pack Details */}
      {selectedPack && (
        <div className="border border-gray-200 rounded bg-white p-4 mt-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold">{selectedPack.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedPack.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                selectedPack.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {selectedPack.active ? 'Active' : 'Inactive'}
              </span>
              {onToggleActive && (
                <button
                  onClick={() => onToggleActive(selectedPack.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {selectedPack.active ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Scope:</span>{' '}
              <span className="font-medium">{selectedPack.scope}</span>
            </div>
            {selectedPack.metadata?.version && (
              <div>
                <span className="text-gray-600">Version:</span>{' '}
                <span className="font-medium">{selectedPack.metadata.version}</span>
              </div>
            )}
            {selectedPack.metadata?.industryStandard && (
              <div>
                <span className="text-gray-600">Standard:</span>{' '}
                <span className="font-medium">{selectedPack.metadata.industryStandard}</span>
              </div>
            )}
            {selectedPack.metadata?.createdAt && (
              <div>
                <span className="text-gray-600">Created:</span>{' '}
                <span className="font-medium">
                  {new Date(selectedPack.metadata.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Rules */}
          <div className="mt-4">
            <h5 className="font-medium text-sm mb-3">
              Rules ({selectedPack.rules.length})
            </h5>
            <div className="space-y-3">
              {selectedPack.rules.map(rule => (
                <div key={rule.id} className="border border-gray-200 rounded bg-gray-50 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{rule.action}</div>
                      <div className="text-xs text-gray-600 mt-1">{rule.description}</div>
                    </div>
                  </div>

                  {/* Required Roles */}
                  {rule.requiredRoleIds.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-600">Required roles:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.requiredRoleIds.map(roleId => (
                          <span key={roleId} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {roleId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Conditions */}
                  {rule.requiredConditions && rule.requiredConditions.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-600">Conditions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rule.requiredConditions.map((cond, idx) => (
                          <span key={idx} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            {cond.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
