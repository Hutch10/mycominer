import {
  SubstrateInventoryProfile,
  ThroughputEstimate,
  YieldRangeEstimate,
} from './forecastingTypes';

export interface YieldRangeInput {
  facilityId: string;
  throughput: ThroughputEstimate[];
  substrate: SubstrateInventoryProfile;
}

export function calculateYieldRanges(input: YieldRangeInput): YieldRangeEstimate[] {
  const substrateBatches = Math.floor(input.substrate.volumeUnits / input.substrate.batchSizeUnits);
  const completionFactor = input.substrate.historicalCompletionRate;

  return input.throughput.map((estimate) => {
    const maxBatches = Math.min(estimate.batchesMax, substrateBatches);
    const minBatches = Math.min(estimate.batchesMin, maxBatches);

    const volumeMax = Math.max(0, Math.floor(maxBatches * input.substrate.batchSizeUnits * completionFactor));
    const volumeMin = Math.max(0, Math.floor(volumeMax * 0.85));

    const explain = [
      `Substrate-bound batches: ${minBatches}-${maxBatches}`,
      `Batch size: ${input.substrate.batchSizeUnits} units`,
      `Completion factor: ${(completionFactor * 100).toFixed(0)}%`,
    ].join(' | ');

    return {
      facilityId: input.facilityId,
      workflowId: estimate.workflowId,
      workflowName: estimate.workflowName,
      volumeMin,
      volumeMax,
      batchesMin: minBatches,
      batchesMax: maxBatches,
      explain,
    };
  });
}
