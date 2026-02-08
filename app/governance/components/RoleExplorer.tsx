/**
 * Phase 44: System Governance - Role Explorer Component
 * 
 * Browse and inspect all roles, their permissions, and policy packs.
 */

'use client';

import React from 'react';
import { Role, Permission, PermissionScope } from '../governanceTypes';

interface RoleExplorerProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
}

export function RoleExplorer({ roles, selectedRoleId, onSelectRole }: RoleExplorerProps) {
  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const activeRoles = roles.filter(r => r.active);
  const inactiveRoles = roles.filter(r => !r.active);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Role Explorer</h3>
        <div className="text-sm text-gray-600">
          {activeRoles.length} active • {inactiveRoles.length} inactive
        </div>
      </div>

      {/* Role List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Roles */}
        <div className="space-y-2">
          <div className="font-medium text-sm text-gray-700">Active Roles</div>
          <div className="border border-gray-200 rounded bg-white divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {activeRoles.map(role => (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                  selectedRoleId === role.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="font-medium text-sm">{role.name}</div>
                <div className="text-xs text-gray-600 mt-1">{role.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {role.permissions.length} permissions
                  </span>
                  {role.policyPackIds && role.policyPackIds.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {role.policyPackIds.length} policy packs
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inactive Roles */}
        {inactiveRoles.length > 0 && (
          <div className="space-y-2">
            <div className="font-medium text-sm text-gray-700">Inactive Roles</div>
            <div className="border border-gray-200 rounded bg-white divide-y divide-gray-100 max-h-96 overflow-y-auto opacity-60">
              {inactiveRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-sm line-through">{role.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{role.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Role Details */}
      {selectedRole && (
        <div className="border border-gray-200 rounded bg-white p-4 mt-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold">{selectedRole.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedRole.description}</p>
            </div>
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              selectedRole.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {selectedRole.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Scope:</span>{' '}
              <span className="font-medium">{selectedRole.scope}</span>
            </div>
            {selectedRole.tenantId && (
              <div>
                <span className="text-gray-600">Tenant ID:</span>{' '}
                <span className="font-mono text-xs">{selectedRole.tenantId}</span>
              </div>
            )}
            {selectedRole.facilityId && (
              <div>
                <span className="text-gray-600">Facility ID:</span>{' '}
                <span className="font-mono text-xs">{selectedRole.facilityId}</span>
              </div>
            )}
          </div>

          {/* Permissions */}
          <div className="mt-4">
            <h5 className="font-medium text-sm mb-2">
              Permissions ({selectedRole.permissions.length})
            </h5>
            <div className="space-y-2">
              {selectedRole.permissions.map((perm, idx) => (
                <PermissionCard key={idx} permission={perm} />
              ))}
            </div>
          </div>

          {/* Policy Packs */}
          {selectedRole.policyPackIds && selectedRole.policyPackIds.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium text-sm mb-2">
                Policy Packs ({selectedRole.policyPackIds.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedRole.policyPackIds.map(packId => (
                  <span key={packId} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {packId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PermissionCard({ permission }: { permission: Permission }) {
  return (
    <div className="border border-gray-200 rounded bg-gray-50 p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-sm">{permission.action}</div>
          <div className="text-xs text-gray-600 mt-1">{permission.description}</div>
        </div>
        <ScopeBadge scope={permission.scope} />
      </div>
      
      {/* Additional metadata */}
      <div className="flex flex-wrap gap-2 mt-2">
        {permission.engines && permission.engines.length > 0 && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
            Engines: {permission.engines.join(', ')}
          </span>
        )}
        {permission.assetTypes && permission.assetTypes.length > 0 && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
            Assets: {permission.assetTypes.join(', ')}
          </span>
        )}
        {permission.conditions && permission.conditions.length > 0 && (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
            {permission.conditions.length} conditions
          </span>
        )}
      </div>
    </div>
  );
}

function ScopeBadge({ scope }: { scope: PermissionScope }) {
  const colors: Record<PermissionScope, string> = {
    'global': 'bg-red-100 text-red-700',
    'tenant': 'bg-blue-100 text-blue-700',
    'facility': 'bg-green-100 text-green-700',
    'room': 'bg-purple-100 text-purple-700',
    'engine': 'bg-orange-100 text-orange-700',
    'asset-type': 'bg-yellow-100 text-yellow-700'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[scope]}`}>
      {scope}
    </span>
  );
}
