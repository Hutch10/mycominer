// Phase 26: Research Insight Generator
// Analyzes outcomes, patterns, and generates actionable insights

import { ResearchInsight, InsightType, ComparisonResult, ExperimentProposal, HistoricalDataPoint } from './researchTypes';
import { researchLog } from './researchLog';

interface InsightGenerationInput {
  experiments: ExperimentProposal[];
  comparisons: ComparisonResult[];
  historicalData: HistoricalDataPoint[];
}

class ResearchInsightGenerator {
  /**
   * Generate insights from experimental outcomes and patterns
   */
  generateInsights(input: InsightGenerationInput): ResearchInsight[] {
    const insights: ResearchInsight[] = [];

    // 1. Variable impact insights
    insights.push(...this.analyzeVariableImpacts(input.comparisons));

    // 2. Cross-facility pattern insights
    insights.push(...this.analyzeCrossFacilityPatterns(input.historicalData));

    // 3. Historical trend insights
    insights.push(...this.analyzeHistoricalTrends(input.historicalData));

    // 4. Anomaly detection insights
    insights.push(...this.detectAnomalies(input.comparisons));

    // 5. Optimization opportunity insights
    insights.push(...this.identifyOptimizations(input.comparisons));

    // 6. Next experiment suggestions
    insights.push(...this.suggestNextExperiments(input.experiments, input.comparisons));

    // Log insights generated
    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'insight-generated',
      message: `Generated ${insights.length} research insights`,
      context: {},
      details: {
        totalInsights: insights.length,
        byType: this.groupByType(insights),
      },
    });

    return insights;
  }

  private analyzeVariableImpacts(comparisons: ComparisonResult[]): ResearchInsight[] {
    const insights: ResearchInsight[] = [];

    // Group comparisons by metric
    const yieldComparisons = comparisons.filter((c) => c.metric === 'yield-kg');
    const contaminationComparisons = comparisons.filter(
      (c) => c.metric === 'contamination-rate'
    );
    const colonizationComparisons = comparisons.filter(
      (c) => c.metric === 'colonization-days'
    );

    // Analyze yield impacts
    if (yieldComparisons.length > 0) {
      const significantYieldChanges = yieldComparisons.filter(
        (c) => c.significance === 'high' || c.significance === 'medium'
      );

      if (significantYieldChanges.length > 0) {
        significantYieldChanges.forEach((comp) => {
          insights.push({
            insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'variable-impact',
            timestamp: new Date().toISOString(),
            severity: comp.significance === 'high' ? 'high' : 'medium',
            title:
              comp.direction === 'increase'
                ? 'Yield Increase Detected'
                : 'Yield Decrease Detected',
            summary: `Experimental condition showed ${Math.abs(comp.deltaPercent)}% ${comp.direction} in yield compared to control`,
            evidence: [
              `Control average: ${comp.controlValue} ${comp.unit}`,
              `Experimental average: ${comp.experimentalValue} ${comp.unit}`,
              `Delta: ${comp.delta > 0 ? '+' : ''}${comp.delta} ${comp.unit} (${comp.deltaPercent > 0 ? '+' : ''}${comp.deltaPercent}%)`,
              `Sample size: ${comp.statistics.sampleSize}`,
              `Standard deviation: Control ${comp.statistics.controlStdDev.toFixed(2)}, Experimental ${comp.statistics.experimentalStdDev.toFixed(2)}`,
            ],
            whyThisMatters:
              comp.direction === 'increase'
                ? 'This change could improve production output and profitability if replicated consistently.'
                : 'This decrease may indicate suboptimal conditions that should be avoided in future production.',
            suggestedNextSteps:
              comp.direction === 'increase'
                ? [
                    'Replicate experiment with larger sample size',
                    'Test at additional facilities to validate transferability',
                    'Analyze cost-benefit of implementing change at scale',
                  ]
                : [
                    'Review experimental conditions for potential issues',
                    'Consider testing intermediate values between control and experimental',
                    'Document as conditions to avoid',
                  ],
          });
        });
      }
    }

    // Analyze contamination impacts
    if (contaminationComparisons.length > 0) {
      const contaminationIncreases = contaminationComparisons.filter(
        (c) => c.direction === 'increase' && c.significance !== 'negligible'
      );

      if (contaminationIncreases.length > 0) {
        contaminationIncreases.forEach((comp) => {
          insights.push({
            insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'variable-impact',
            timestamp: new Date().toISOString(),
            severity: 'high',
            title: 'Contamination Risk Increase Detected',
            summary: `Experimental condition showed ${comp.deltaPercent}% increase in contamination rate`,
            evidence: [
              `Control contamination rate: ${comp.controlValue}%`,
              `Experimental contamination rate: ${comp.experimentalValue}%`,
              `Increase: +${comp.delta}% (${comp.deltaPercent}% relative increase)`,
            ],
            whyThisMatters:
              'Increased contamination reduces yield, wastes resources, and may indicate unsafe conditions.',
            suggestedNextSteps: [
              'Review sterilization protocols in experimental group',
              'Check for environmental contamination sources',
              'Consider reverting to control conditions',
            ],
          });
        });
      }
    }

    // Analyze colonization speed impacts
    if (colonizationComparisons.length > 0) {
      const fasterColonization = colonizationComparisons.filter(
        (c) => c.direction === 'decrease' && c.significance !== 'negligible'
      );

      if (fasterColonization.length > 0) {
        fasterColonization.forEach((comp) => {
          insights.push({
            insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'optimization-opportunity',
            timestamp: new Date().toISOString(),
            severity: 'medium',
            title: 'Faster Colonization Detected',
            summary: `Experimental condition reduced colonization time by ${Math.abs(comp.deltaPercent)}%`,
            evidence: [
              `Control colonization time: ${comp.controlValue} days`,
              `Experimental colonization time: ${comp.experimentalValue} days`,
              `Time saved: ${Math.abs(comp.delta)} days (${Math.abs(comp.deltaPercent)}% faster)`,
            ],
            whyThisMatters:
              'Faster colonization reduces cycle time, increases throughput, and reduces contamination risk.',
            suggestedNextSteps: [
              'Validate with multiple batches',
              'Check if faster colonization affects fruit quality',
              'Calculate impact on annual production capacity',
            ],
          });
        });
      }
    }

    return insights;
  }

  private analyzeCrossFacilityPatterns(historicalData: HistoricalDataPoint[]): ResearchInsight[] {
    const insights: ResearchInsight[] = [];

    // Group by facility
    const byFacility = new Map<string, HistoricalDataPoint[]>();
    historicalData.forEach((point) => {
      if (!byFacility.has(point.facilityId)) {
        byFacility.set(point.facilityId, []);
      }
      byFacility.get(point.facilityId)!.push(point);
    });

    if (byFacility.size < 2) return insights; // Need at least 2 facilities

    // Compare average yields across facilities
    const facilityYields = new Map<string, number>();
    byFacility.forEach((points, facilityId) => {
      const yields = points
        .flatMap((p) => p.metrics.filter((m) => m.metric === 'yield-kg'))
        .map((m) => m.value);
      if (yields.length > 0) {
        const avgYield = yields.reduce((sum, y) => sum + y, 0) / yields.length;
        facilityYields.set(facilityId, avgYield);
      }
    });

    const yields = Array.from(facilityYields.entries());
    if (yields.length >= 2) {
      const [bestFacility, bestYield] = yields.reduce((best, current) =>
        current[1] > best[1] ? current : best
      );
      const [worstFacility, worstYield] = yields.reduce((worst, current) =>
        current[1] < worst[1] ? current : worst
      );

      const deltaPercent = ((bestYield - worstYield) / worstYield) * 100;

      if (deltaPercent > 10) {
        insights.push({
          insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'cross-facility-pattern',
          timestamp: new Date().toISOString(),
          severity: deltaPercent > 25 ? 'high' : 'medium',
          title: 'Yield Variation Across Facilities',
          summary: `${bestFacility} outperforms ${worstFacility} by ${deltaPercent.toFixed(1)}%`,
          evidence: [
            `${bestFacility} average yield: ${bestYield.toFixed(2)} kg`,
            `${worstFacility} average yield: ${worstYield.toFixed(2)} kg`,
            `Delta: ${deltaPercent.toFixed(1)}%`,
          ],
          whyThisMatters:
            'Understanding facility-level differences can reveal environmental, process, or training factors that affect yield.',
          suggestedNextSteps: [
            `Compare environmental conditions between ${bestFacility} and ${worstFacility}`,
            `Review SOPs and training at both facilities`,
            `Consider knowledge transfer from high-performing to low-performing facilities`,
          ],
        });
      }
    }

    return insights;
  }

  private analyzeHistoricalTrends(historicalData: HistoricalDataPoint[]): ResearchInsight[] {
    const insights: ResearchInsight[] = [];

    // Sort by date
    const sorted = [...historicalData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (sorted.length < 10) return insights; // Need reasonable sample size

    // Analyze yield trend over time
    const yieldPoints = sorted
      .map((point) => {
        const yieldMetric = point.metrics.find((m) => m.metric === 'yield-kg');
        return yieldMetric ? { date: point.timestamp, value: yieldMetric.value } : null;
      })
      .filter((p): p is { date: string; value: number } => p !== null);

    if (yieldPoints.length >= 10) {
      const firstHalf = yieldPoints.slice(0, Math.floor(yieldPoints.length / 2));
      const secondHalf = yieldPoints.slice(Math.floor(yieldPoints.length / 2));

      const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

      const trendPercent = ((secondAvg - firstAvg) / firstAvg) * 100;

      if (Math.abs(trendPercent) > 10) {
        insights.push({
          insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'historical-trend',
          timestamp: new Date().toISOString(),
          severity: Math.abs(trendPercent) > 20 ? 'high' : 'medium',
          title:
            trendPercent > 0
              ? 'Yield Improving Over Time'
              : 'Yield Declining Over Time',
          summary: `Yields have ${trendPercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(trendPercent).toFixed(1)}% over the analyzed period`,
          evidence: [
            `Earlier period average: ${firstAvg.toFixed(2)} kg`,
            `Recent period average: ${secondAvg.toFixed(2)} kg`,
            `Trend: ${trendPercent > 0 ? '+' : ''}${trendPercent.toFixed(1)}%`,
          ],
          whyThisMatters:
            trendPercent > 0
              ? 'Continuous improvement indicates effective learning and optimization.'
              : 'Declining performance may indicate equipment degradation, process drift, or environmental changes.',
          suggestedNextSteps:
            trendPercent > 0
              ? [
                  'Document what changed between periods',
                  'Identify best practices to standardize',
                  'Set new performance benchmarks',
                ]
              : [
                  'Investigate root causes of decline',
                  'Review recent process changes',
                  'Check equipment calibration and maintenance',
                ],
        });
      }
    }

    return insights;
  }

  private detectAnomalies(comparisons: ComparisonResult[]): ResearchInsight[] {
    const insights: ResearchInsight[] = [];

    // Detect unusually high deltas
    const highDeltaComparisons = comparisons.filter(
      (c) => Math.abs(c.deltaPercent) > 50 && c.significance === 'high'
    );

    highDeltaComparisons.forEach((comp) => {
      insights.push({
        insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'anomaly-detection',
        timestamp: new Date().toISOString(),
        severity: 'high',
        title: 'Unusually Large Change Detected',
        summary: `Experimental group showed ${Math.abs(comp.deltaPercent)}% ${comp.direction} in ${comp.metric}`,
        evidence: [
          `Control value: ${comp.controlValue} ${comp.unit}`,
          `Experimental value: ${comp.experimentalValue} ${comp.unit}`,
          `Delta: ${comp.deltaPercent > 0 ? '+' : ''}${comp.deltaPercent}%`,
        ],
        whyThisMatters:
          'Extremely large changes may indicate measurement error, unusual conditions, or breakthrough findings.',
        suggestedNextSteps: [
          'Verify data accuracy and measurement methods',
          'Review experimental conditions for anomalies',
          'Replicate experiment to confirm findings',
        ],
      });
    });

    return insights;
  }

  private identifyOptimizations(comparisons: ComparisonResult[]): ResearchInsight[] {
    const insights: ResearchInsight[] = [];

    // Look for improvements across multiple metrics
    const yieldIncrease = comparisons.find(
      (c) =>
        c.metric === 'yield-kg' &&
        c.direction === 'increase' &&
        c.significance !== 'negligible'
    );
    const energyDecrease = comparisons.find(
      (c) =>
        c.metric === 'energy-kwh' &&
        c.direction === 'decrease' &&
        c.significance !== 'negligible'
    );
    const laborDecrease = comparisons.find(
      (c) =>
        c.metric === 'labor-hours' &&
        c.direction === 'decrease' &&
        c.significance !== 'negligible'
    );

    if (yieldIncrease && (energyDecrease || laborDecrease)) {
      insights.push({
        insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'optimization-opportunity',
        timestamp: new Date().toISOString(),
        severity: 'high',
        title: 'Multi-Metric Optimization Opportunity',
        summary: 'Experimental conditions improved yield while reducing resource consumption',
        evidence: [
          `Yield: +${yieldIncrease.deltaPercent}%`,
          energyDecrease ? `Energy: ${energyDecrease.deltaPercent}%` : '',
          laborDecrease ? `Labor: ${laborDecrease.deltaPercent}%` : '',
        ].filter((e) => e !== ''),
        whyThisMatters:
          'Simultaneous improvements across multiple metrics indicate a highly favorable optimization.',
        suggestedNextSteps: [
          'Fast-track approval for production implementation',
          'Calculate ROI and payback period',
          'Plan rollout across all facilities',
        ],
      });
    }

    return insights;
  }

  private suggestNextExperiments(
    experiments: ExperimentProposal[],
    comparisons: ComparisonResult[]
  ): ResearchInsight[] {
    const insights: ResearchInsight[] = [];

    // Find variables that haven't been tested yet
    const testedVariables = new Set(
      experiments.flatMap((exp) => exp.variables.map((v) => v.variableType))
    );

    const allVariables: Array<{ type: string; description: string }> = [
      { type: 'substrate-composition', description: 'substrate composition' },
      { type: 'temperature', description: 'temperature' },
      { type: 'humidity', description: 'humidity' },
      { type: 'co2-level', description: 'CO2 levels' },
      { type: 'light-schedule', description: 'light schedule' },
      { type: 'inoculation-rate', description: 'inoculation rate' },
    ];

    const untestedVariables = allVariables.filter((v) => !testedVariables.has(v.type as any));

    if (untestedVariables.length > 0) {
      insights.push({
        insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'next-experiment',
        timestamp: new Date().toISOString(),
        severity: 'low',
        title: 'Untested Variables Remain',
        summary: `${untestedVariables.length} variables have not yet been experimentally tested`,
        evidence: untestedVariables.map((v) => `Untested: ${v.description}`),
        whyThisMatters:
          'Testing a wide range of variables helps build comprehensive knowledge and may reveal unexpected optimizations.',
        suggestedNextSteps: untestedVariables.map((v) => `Design experiment testing ${v.description}`),
      });
    }

    // Suggest follow-up experiments for significant findings
    const significantFindings = comparisons.filter((c) => c.significance === 'high');
    if (significantFindings.length > 0) {
      const topFinding = significantFindings[0];
      insights.push({
        insightId: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'next-experiment',
        timestamp: new Date().toISOString(),
        severity: 'medium',
        title: 'Follow-Up Experiment Recommended',
        summary: `Replicate high-significance finding from ${topFinding.metric} comparison`,
        evidence: [
          `Original finding: ${topFinding.deltaPercent}% ${topFinding.direction}`,
          `Significance: ${topFinding.significance}`,
        ],
        whyThisMatters:
          'Replicating significant findings validates their reliability and builds confidence for production implementation.',
        suggestedNextSteps: [
          'Design replication study with larger sample size',
          'Test at additional facilities to assess transferability',
          'Vary experimental conditions slightly to map boundaries of effect',
        ],
      });
    }

    return insights;
  }

  private groupByType(insights: ResearchInsight[]): Record<InsightType, number> {
    const counts: Record<InsightType, number> = {
      'variable-impact': 0,
      'cross-facility-pattern': 0,
      'historical-trend': 0,
      'anomaly-detection': 0,
      'optimization-opportunity': 0,
      'next-experiment': 0,
    };

    insights.forEach((insight) => {
      counts[insight.type]++;
    });

    return counts;
  }
}

export const researchInsightGenerator = new ResearchInsightGenerator();
