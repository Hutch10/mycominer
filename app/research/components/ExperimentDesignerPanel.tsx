'use client';

// Phase 26: Experiment Designer Panel
// Interface for designing and proposing new experiments

import { useState } from 'react';
import type { ExperimentProposal } from '../researchTypes';
import { researchEngine } from '../researchEngine';

interface ExperimentDesignerPanelProps {
  experiments: ExperimentProposal[];
  onProposeExperiment: (proposal: ExperimentProposal) => void;
  onApproveExperiment: (experimentId: string) => void;
  onRejectExperiment: (experimentId: string, reason: string) => void;
}

export function ExperimentDesignerPanel({
  experiments,
  onProposeExperiment,
  onApproveExperiment,
  onRejectExperiment,
}: ExperimentDesignerPanelProps) {
  const [showDesigner, setShowDesigner] = useState(false);
  const [hypothesis, setHypothesis] = useState('');
  const [objective, setObjective] = useState('');
  const [species, setSpecies] = useState('oyster');
  const [facilityId, setFacilityId] = useState('facility-north');
  const [durationDays, setDurationDays] = useState(30);

  const pendingExperiments = experiments.filter((e) => e.status === 'pending-approval');

  const handleDesignExperiment = () => {
    const proposal = researchEngine.proposeExperiment({
      hypothesis,
      objective,
      species,
      facilityId,
      variables: [
        {
          type: 'temperature',
          controlValue: 20,
          experimentalValue: 22,
          rationale: 'Testing slightly higher temperature for potential faster colonization',
        },
      ],
      substrateRecipe: 'Hardwood sawdust + wheat bran (80:20)',
      durationDays,
    });

    onProposeExperiment(proposal);
    setShowDesigner(false);
    setHypothesis('');
    setObjective('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Experiment Designer
        </h2>
        <button
          onClick={() => setShowDesigner(!showDesigner)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {showDesigner ? 'Cancel' : '+ Design New Experiment'}
        </button>
      </div>

      {showDesigner && (
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            New Experiment Proposal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Hypothesis
              </label>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="e.g., Increasing temperature by 2°C will reduce colonization time by 10%"
                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Objective
              </label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g., Optimize colonization speed"
                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Species
                </label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="oyster">Oyster</option>
                  <option value="shiitake">Shiitake</option>
                  <option value="lions-mane">Lion's Mane</option>
                  <option value="reishi">Reishi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Facility
                </label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="facility-north">North Facility</option>
                  <option value="facility-south">South Facility</option>
                  <option value="facility-east">East Facility</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Duration (days)
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <button
              onClick={handleDesignExperiment}
              disabled={!hypothesis || !objective}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Generate Experiment Proposal
            </button>
          </div>
        </div>
      )}

      {/* Pending approvals */}
      {pendingExperiments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Pending Approval ({pendingExperiments.length})
          </h3>
          <div className="space-y-3">
            {pendingExperiments.map((exp) => (
              <div
                key={exp.experimentId}
                className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {exp.hypothesis}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exp.objective} • {exp.species} • {exp.facilityId}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                    {exp.status}
                  </span>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <div className="font-medium">Variables:</div>
                  {exp.variables.map((v, idx) => (
                    <div key={idx} className="ml-4">
                      • {v.variableType}: {String(v.controlValue)} → {String(v.experimentalValue)}
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <div className="font-medium">Safety Checks:</div>
                  {exp.safetyChecks.map((check, idx) => (
                    <div key={idx} className="ml-4 flex items-center">
                      <span
                        className={
                          check.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {check.passed ? '✓' : '✗'}
                      </span>
                      <span className="ml-2">{check.checkType}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onApproveExperiment(exp.experimentId)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onRejectExperiment(exp.experimentId, 'Manual rejection')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent experiments */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Recent Experiments
        </h3>
        <div className="space-y-2">
          {experiments.slice(0, 5).map((exp) => (
            <div
              key={exp.experimentId}
              className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {exp.hypothesis}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {exp.species} • {exp.durationDays} days
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    exp.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : exp.status === 'in-progress'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {exp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
