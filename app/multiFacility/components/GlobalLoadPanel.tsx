'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { MultiFacilityState } from '../multiFacilityTypes';
import { multiFacilityEngine } from '../multiFacilityEngine';

interface GlobalLoadPanelProps {
  state: MultiFacilityState;
}

export const GlobalLoadPanel: React.FC<GlobalLoadPanelProps> = ({ state }) => {
  const loadSummary = multiFacilityEngine.getGlobalLoadSummary(state);

  // Prepare chart data
  const chartData = loadSummary.facilities.map((f) => ({
    facility: f.facilityId.replace('facility-', ''),
    load: f.load,
  }));

  const imbalanceScore = loadSummary.maxLoad - loadSummary.minLoad;
  const imbalanceSeverity =
    imbalanceScore > 40 ? 'high' : imbalanceScore > 20 ? 'medium' : 'low';
  const imbalanceColor = {
    high: 'text-rose-600 bg-rose-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-emerald-600 bg-emerald-50',
  }[imbalanceSeverity];

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Global Load Distribution</h3>
        <p className="text-sm text-gray-600">Cross-facility utilization analysis</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <p className="text-xs text-gray-600 mb-1">Average Load</p>
          <p className="text-2xl font-bold text-indigo-600">{loadSummary.avgLoad}%</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <p className="text-xs text-gray-600 mb-1">Peak Load</p>
          <p className="text-2xl font-bold text-rose-600">{loadSummary.maxLoad}%</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-indigo-100">
          <p className="text-xs text-gray-600 mb-1">Min Load</p>
          <p className="text-2xl font-bold text-emerald-600">{loadSummary.minLoad}%</p>
        </div>
        <div className={`rounded-lg p-3 border ${imbalanceColor.includes('text') ? 'border-current' : 'border-gray-200'}`}>
          <p className="text-xs text-gray-600 mb-1">Imbalance Score</p>
          <p className={`text-2xl font-bold ${imbalanceColor.split(' ')[0]}`}>
            {imbalanceScore}%
          </p>
        </div>
      </div>

      {/* Load Distribution Chart */}
      <div className="bg-white rounded-lg p-4 border border-indigo-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Facility Load Comparison</h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="facility" stroke="#6b7280" style={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
              formatter={(value) => `${value}%`}
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
            />
            <Bar dataKey="load" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-indigo-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Analysis</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          {loadSummary.maxLoad > 80 && (
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span>One or more facilities approaching capacity limits; load balancing recommended</span>
            </li>
          )}
          {imbalanceSeverity === 'high' && (
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>Significant load imbalance detected; consider cross-facility optimization</span>
            </li>
          )}
          {loadSummary.avgLoad < 50 && (
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>Global utilization is low; opportunity to increase production</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
