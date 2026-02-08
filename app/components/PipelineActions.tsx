// Pipeline Action Buttons Component
// Quick-action buttons for dev mode pipelines

'use client';

import { useState } from 'react';
import { devMode } from '@/app/config/developerMode';
import {
  runWorkflowPipelineDev,
  runResourcePipelineDev,
  type WorkflowPipelineResult,
  type ResourcePipelineResult,
} from '@/app/config/devModePipelines';

interface PipelineActionsProps {
  type: 'workflow' | 'resource';
  onResult?: (result: any) => void;
}

export function PipelineActions({ type, onResult }: PipelineActionsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<WorkflowPipelineResult | ResourcePipelineResult | null>(null);
  const config = devMode.getConfig();

  if (!config.enabled) return null;

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      if (type === 'workflow') {
        const workflowResult = runWorkflowPipelineDev({
          species: 'oyster',
          targetYieldKg: 50,
          facilityId: 'facility-1',
          roomIds: ['room-1', 'room-2'],
        });
        setResult(workflowResult);
        onResult?.(workflowResult);
      } else if (type === 'resource') {
        // Would need actual workflow plan
        // const resourceResult = runResourcePipelineDev({...});
        // setResult(resourceResult);
      }
    } catch (error) {
      console.error('Pipeline error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Run Button */}
      <button
        onClick={handleRunPipeline}
        disabled={isRunning}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition"
      >
        {isRunning ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Running Pipeline...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Run Full {type === 'workflow' ? 'Workflow' : 'Resource'} Pipeline
          </span>
        )}
      </button>

      {/* Result Summary */}
      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between mb-2">
            <div className="font-medium text-green-900 dark:text-green-300">
              Pipeline Complete!
            </div>
            {(result as any).autoApproved && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                AUTO-APPROVED
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm text-green-800 dark:text-green-400">
            <div>• Confidence: {(result as any).summary.confidence}%</div>
            
            {type === 'workflow' && (
              <div>• Conflicts: {(result as WorkflowPipelineResult).summary.conflictCount}</div>
            )}
            
            {type === 'resource' && (
              <div>• Shortages: {(result as ResourcePipelineResult).summary.shortageCount}</div>
            )}
            
            {(result as any).skippedSteps.length > 0 && (
              <div>• Skipped: {(result as any).skippedSteps.join(', ')}</div>
            )}
            
            {(result as any).summary.autoApprovalReason && (
              <div>• Reason: {(result as any).summary.autoApprovalReason}</div>
            )}
            
            <div className="font-medium">• Time Saved: {(result as any).summary.timesSaved}</div>
          </div>
        </div>
      )}
    </div>
  );
}
