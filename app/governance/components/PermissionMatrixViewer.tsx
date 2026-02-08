/**
 * Phase 44: System Governance - Permission Matrix Viewer Component
 * 
 * Visual matrix showing which roles can perform which actions.
 */

'use client';

import React from 'react';
import { Role, GovernanceAction, Permission } from '../governanceTypes';

interface PermissionMatrixViewerProps {
  roles: Role[];
  actions: GovernanceAction[];
}

export function PermissionMatrixViewer({ roles, actions }: PermissionMatrixViewerProps) {
  const activeRoles = roles.filter(r => r.active);

  // Build matrix
  const matrix: Record<string, Record<string, boolean>> = {};
  for (const role of activeRoles) {
    matrix[role.id] = {};
    for (const action of actions) {
      matrix[role.id][action] = role.permissions.some(p => p.action === action);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Permission Matrix</h3>
        <div className="text-sm text-gray-600">
          {activeRoles.length} roles × {actions.length} actions
        </div>
      </div>

      {/* Matrix */}
      <div className="border border-gray-200 rounded bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-medium text-gray-700 border-r border-gray-200">
                Role
              </th>
              {actions.map(action => (
                <th
                  key={action}
                  className="px-2 py-3 text-left font-medium text-gray-700 min-w-[120px]"
                  title={action}
                >
                  <div className="truncate">{action.split(':')[1] || action}</div>
                  <div className="text-xs text-gray-500 font-normal truncate">
                    {action.split(':')[0]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activeRoles.map(role => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="sticky left-0 bg-white px-4 py-3 font-medium border-r border-gray-200">
                  <div className="truncate" title={role.name}>
                    {role.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{role.scope}</div>
                </td>
                {actions.map(action => (
                  <td key={action} className="px-2 py-3 text-center">
                    {matrix[role.id][action] ? (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">Permission granted</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">Permission denied</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {activeRoles.map(role => {
          const grantedCount = actions.filter(action => matrix[role.id][action]).length;
          const grantRate = actions.length > 0 ? (grantedCount / actions.length) * 100 : 0;

          return (
            <div key={role.id} className="border border-gray-200 rounded bg-white p-3">
              <div className="font-medium text-sm truncate" title={role.name}>
                {role.name}
              </div>
              <div className="text-2xl font-bold mt-1">{grantedCount}</div>
              <div className="text-xs text-gray-600">
                {grantRate.toFixed(0)}% of actions permitted
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
