// Phase 26: Experiment Comparator
// Compares experimental outcomes and generates statistical deltas

import {
  ComparisonResult,
  ComparisonMetric,
  ExperimentProposal,
  HistoricalDataPoint,
} from './researchTypes';
import { researchLog } from './researchLog';

interface ComparisonInput {
  experiment: ExperimentProposal;
  controlData: {
    yieldKg?: number[];
    contaminationRate?: number[];
    colonizationDays?: number[];
    fruitingDays?: number[];
    energyKwh?: number[];
    laborHours?: number[];
  };
  experimentalData: {
    groupId: string;
    yieldKg?: number[];
    contaminationRate?: number[];
    colonizationDays?: number[];
    fruitingDays?: number[];
    energyKwh?: number[];
    laborHours?: number[];
  }[];
}

class ExperimentComparator {
  /**
   * Compare experimental groups against control
   */
  compareExperiment(input: ComparisonInput): ComparisonResult[] {
    const results: ComparisonResult[] = [];

    input.experimentalData.forEach((expGroup) => {
      // Compare each metric
      const metrics: ComparisonMetric[] = [
        'yield-kg',
        'contamination-rate',
        'colonization-days',
        'fruiting-days',
        'energy-kwh',
        'labor-hours',
      ];

      metrics.forEach((metric) => {
        const controlValues = this.getMetricValues(input.controlData, metric);
        const expValues = this.getMetricValues(expGroup, metric);

        if (controlValues.length > 0 && expValues.length > 0) {
          const result = this.generateComparison(
            input.experiment.experimentId,
            input.experiment.controlGroup.groupId,
            expGroup.groupId,
            metric,
            controlValues,
            expValues
          );

          results.push(result);
        }
      });
    });

    // Log comparisons
    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'comparison-generated',
      message: `Generated ${results.length} comparisons for experiment ${input.experiment.experimentId}`,
      context: {
        experimentId: input.experiment.experimentId,
      },
      details: {
        comparisons: results.length,
      },
    });

    return results;
  }

  /**
   * Compare historical data across facilities
   */
  compareHistoricalData(
    metric: ComparisonMetric,
    facility1Data: HistoricalDataPoint[],
    facility2Data: HistoricalDataPoint[]
  ): ComparisonResult {
    const facility1Values = facility1Data
      .map((d) => d.metrics.find((m) => m.metric === metric)?.value)
      .filter((v): v is number => v !== undefined);

    const facility2Values = facility2Data
      .map((d) => d.metrics.find((m) => m.metric === metric)?.value)
      .filter((v): v is number => v !== undefined);

    return this.generateComparison(
      'historical-comparison',
      'facility-1',
      'facility-2',
      metric,
      facility1Values,
      facility2Values
    );
  }

  private generateComparison(
    experimentId: string,
    controlGroupId: string,
    experimentalGroupId: string,
    metric: ComparisonMetric,
    controlValues: number[],
    experimentalValues: number[]
  ): ComparisonResult {
    const controlStats = this.calculateStatistics(controlValues);
    const expStats = this.calculateStatistics(experimentalValues);

    const delta = expStats.mean - controlStats.mean;
    const deltaPercent = controlStats.mean !== 0 ? (delta / controlStats.mean) * 100 : 0;

    let direction: 'increase' | 'decrease' | 'no-change' = 'no-change';
    if (Math.abs(deltaPercent) > 1) {
      direction = delta > 0 ? 'increase' : 'decrease';
    }

    const significance = this.determineSignificance(Math.abs(deltaPercent), controlStats.stdDev);

    return {
      comparisonId: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      experimentId,
      createdAt: new Date().toISOString(),
      controlGroupId,
      experimentalGroupId,
      metric,
      controlValue: controlStats.mean,
      experimentalValue: expStats.mean,
      delta,
      deltaPercent: Math.round(deltaPercent * 10) / 10,
      unit: this.getMetricUnit(metric),
      direction,
      significance,
      dataPoints: {
        controlDataPoints: controlValues,
        experimentalDataPoints: experimentalValues,
      },
      statistics: {
        controlMean: controlStats.mean,
        controlStdDev: controlStats.stdDev,
        experimentalMean: expStats.mean,
        experimentalStdDev: expStats.stdDev,
        sampleSize: Math.min(controlValues.length, experimentalValues.length),
      },
    };
  }

  private getMetricValues(
    data: ComparisonInput['controlData'] | ComparisonInput['experimentalData'][0],
    metric: ComparisonMetric
  ): number[] {
    switch (metric) {
      case 'yield-kg':
        return data.yieldKg || [];
      case 'contamination-rate':
        return data.contaminationRate || [];
      case 'colonization-days':
        return data.colonizationDays || [];
      case 'fruiting-days':
        return data.fruitingDays || [];
      case 'energy-kwh':
        return data.energyKwh || [];
      case 'labor-hours':
        return data.laborHours || [];
      default:
        return [];
    }
  }

  private calculateStatistics(values: number[]): { mean: number; stdDev: number } {
    if (values.length === 0) return { mean: 0, stdDev: 0 };

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }

  private determineSignificance(
    deltaPercent: number,
    stdDev: number
  ): 'high' | 'medium' | 'low' | 'negligible' {
    // Simple heuristic: larger deltas and smaller standard deviations = higher significance
    if (deltaPercent > 20 && stdDev < 5) return 'high';
    if (deltaPercent > 10 && stdDev < 10) return 'medium';
    if (deltaPercent > 5) return 'low';
    return 'negligible';
  }

  private getMetricUnit(metric: ComparisonMetric): string {
    const units: Record<ComparisonMetric, string> = {
      'yield-kg': 'kg',
      'contamination-rate': '%',
      'colonization-days': 'days',
      'fruiting-days': 'days',
      'energy-kwh': 'kWh',
      'labor-hours': 'hours',
      'substrate-efficiency': 'kg/kg',
      'cost-per-kg': '$/kg',
    };
    return units[metric];
  }

  /**
   * Summarize multiple comparisons into key takeaways
   */
  summarizeComparisons(comparisons: ComparisonResult[]): {
    totalComparisons: number;
    significantFindings: ComparisonResult[];
    positiveDeltas: number;
    negativeDeltas: number;
    noChange: number;
    averageDeltaPercent: number;
  } {
    const significantFindings = comparisons.filter(
      (c) => c.significance === 'high' || c.significance === 'medium'
    );

    const positiveDeltas = comparisons.filter((c) => c.direction === 'increase').length;
    const negativeDeltas = comparisons.filter((c) => c.direction === 'decrease').length;
    const noChange = comparisons.filter((c) => c.direction === 'no-change').length;

    const averageDeltaPercent =
      comparisons.length > 0
        ? comparisons.reduce((sum, c) => sum + Math.abs(c.deltaPercent), 0) / comparisons.length
        : 0;

    return {
      totalComparisons: comparisons.length,
      significantFindings,
      positiveDeltas,
      negativeDeltas,
      noChange,
      averageDeltaPercent: Math.round(averageDeltaPercent * 10) / 10,
    };
  }
}

export const experimentComparator = new ExperimentComparator();
