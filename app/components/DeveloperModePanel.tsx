// Developer Mode Control Panel Component
// Settings panel for enabling/disabling developer mode

'use client';

import { useState, useEffect } from 'react';
import { devMode } from '@/app/config/developerMode';

export function DeveloperModePanel() {
  const [config, setConfig] = useState(devMode.getConfig());
  const [showSettings, setShowSettings] = useState(false);

  const handleToggleDev = () => {
    if (config.enabled) {
      devMode.disable();
    } else {
      devMode.enable();
    }
    setConfig(devMode.getConfig());
  };

  const handleLogLevelChange = (level: 'minimal' | 'normal' | 'verbose') => {
    devMode.updateConfig({ logLevel: level });
    setConfig(devMode.getConfig());
  };

  const handleThresholdChange = (type: string, value: number) => {
    const thresholds = { ...config.autoApproveThresholds };
    if (type === 'strategy') thresholds.strategyConfidence = value;
    if (type === 'workflow') thresholds.workflowConfidence = value;
    if (type === 'resource') thresholds.resourceConfidence = value;

    devMode.updateConfig({ autoApproveThresholds: thresholds });
    setConfig(devMode.getConfig());
  };

  const handleRiskLevelChange = (level: 'low' | 'medium' | 'high') => {
    devMode.updateConfig({
      autoApproveThresholds: {
        ...config.autoApproveThresholds,
        riskLevel: level,
      },
    });
    setConfig(devMode.getConfig());
  };

  const summary = devMode.getAutoApprovalSummary();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Developer Mode
          </h3>
          
          {config.enabled && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-medium rounded">
              ACTIVE
            </span>
          )}
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>
      </div>

      {/* Main Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded mb-4">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            Enable Developer Mode
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Auto-approve safe operations, skip optional audits
          </div>
        </div>

        <button
          onClick={handleToggleDev}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            config.enabled
              ? 'bg-blue-600'
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              config.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Active Features */}
      {config.enabled && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Active Features:
          </div>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>✓ Auto-approve ALLOW decisions (confidence ≥ thresholds)</li>
            <li>✓ Auto-approve WARN decisions (low-medium risk only)</li>
            <li>✓ Skip optional audits when no conflicts detected</li>
            <li>✓ Skip simulations unless explicitly requested</li>
            <li>✓ Collapsed multi-step flows</li>
            <li>✓ Minimal logging (errors/warnings only)</li>
          </ul>
        </div>
      )}

      {/* Safety Boundaries */}
      <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
        <div className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
          Safety Boundaries (Always Enforced):
        </div>
        <ul className="text-sm text-green-800 dark:text-green-400 space-y-1">
          <li>✓ BLOCK decisions require manual approval</li>
          <li>✓ Conflict detection always runs</li>
          <li>✓ Contamination checks always run</li>
          <li>✓ All actions logged for audit</li>
          <li>✓ Deterministic algorithms unchanged</li>
        </ul>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Log Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Log Level
            </label>
            <div className="flex gap-2">
              {(['minimal', 'normal', 'verbose'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => handleLogLevelChange(level)}
                  className={`px-3 py-1 rounded text-sm ${
                    config.logLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Thresholds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-Approval Confidence Thresholds
            </label>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Strategy: {config.autoApproveThresholds.strategyConfidence}%
                </span>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={config.autoApproveThresholds.strategyConfidence}
                  onChange={(e) => handleThresholdChange('strategy', Number(e.target.value))}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Workflow: {config.autoApproveThresholds.workflowConfidence}%
                </span>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={config.autoApproveThresholds.workflowConfidence}
                  onChange={(e) => handleThresholdChange('workflow', Number(e.target.value))}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Resource: {config.autoApproveThresholds.resourceConfidence}%
                </span>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={config.autoApproveThresholds.resourceConfidence}
                  onChange={(e) => handleThresholdChange('resource', Number(e.target.value))}
                  className="w-32"
                />
              </div>
            </div>
          </div>

          {/* Max Risk Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Risk Level for Auto-Approval
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => handleRiskLevelChange(level)}
                  className={`px-3 py-1 rounded text-sm ${
                    config.autoApproveThresholds.riskLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Configuration:
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>• Auto-approve if confidence ≥ {summary.workflowThreshold}% (workflow)</div>
              <div>• Auto-approve if confidence ≥ {summary.strategyThreshold}% (strategy)</div>
              <div>• Auto-approve if confidence ≥ {summary.resourceThreshold}% (resource)</div>
              <div>• Max risk level: {summary.maxRisk}</div>
              <div>• Log level: {config.logLevel}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
