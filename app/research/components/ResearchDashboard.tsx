// @ts-nocheck
'use client';

// Phase 26: Research Dashboard
// Main interface for autonomous research and experimentation

import { useState } from 'react';
// @ts-ignore
import { ExperimentDesignerPanel } from './ExperimentDesignerPanel';
// @ts-ignore
import { ComparisonResultsPanel } from './ComparisonResultsPanel';
// @ts-ignore
import { ResearchInsightsPanel } from './ResearchInsightsPanel';
// @ts-ignore
import { ResearchReportViewer } from './ResearchReportViewer';
// @ts-ignore
import { ResearchHistoryViewer } from './ResearchHistoryViewer';
import type { ExperimentProposal, ComparisonResult, ResearchInsight, ResearchReport } from '../researchTypes';

interface ResearchDashboardProps {
  experiments: ExperimentProposal[];
  comparisons: ComparisonResult[];
  insights: ResearchInsight[];
  reports: ResearchReport[];
  onProposeExperiment: (proposal: ExperimentProposal) => void;
  onApproveExperiment: (experimentId: string) => void;
  onRejectExperiment: (experimentId: string, reason: string) => void;
}

export function ResearchDashboard({
  experiments,
  comparisons,
  insights,
  reports,
  onProposeExperiment,
  onApproveExperiment,
  onRejectExperiment,
}: ResearchDashboardProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'comparisons' | 'insights' | 'reports' | 'history'>('design');

  const pendingExperiments = experiments.filter((e) => e.status === 'pending-approval');
  const activeExperiments = experiments.filter((e) => e.status === 'in-progress');
  const completedExperiments = experiments.filter((e) => e.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Research & Experimentation Engine
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Deterministic research system for designing experiments, comparing outcomes, and generating insights.
          All experiments require operator approval.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {experiments.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Experiments</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingExperiments.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {activeExperiments.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {insights.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Insights Generated</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {reports.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Research Reports</div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('design')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'design'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Experiment Designer
            </button>
            <button
              onClick={() => setActiveTab('comparisons')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'comparisons'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Comparison Results
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'insights'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Research Insights ({insights.filter((i) => i.severity === 'high').length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Research Reports
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'design' && (
            <ExperimentDesignerPanel
              experiments={experiments}
              onProposeExperiment={onProposeExperiment}
              onApproveExperiment={onApproveExperiment}
              onRejectExperiment={onRejectExperiment}
            />
          )}

          {activeTab === 'comparisons' && (
            <ComparisonResultsPanel comparisons={comparisons} experiments={experiments} />
          )}

          {activeTab === 'insights' && <ResearchInsightsPanel insights={insights} />}

          {activeTab === 'reports' && <ResearchReportViewer reports={reports} />}

          {activeTab === 'history' && <ResearchHistoryViewer />}
        </div>
      </div>
    </div>
  );
}
