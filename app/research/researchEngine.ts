// Phase 26: Research Engine
// Main orchestrator for autonomous research and experimentation

import {
  ExperimentProposal,
  ResearchReport,
  ResearchEngineInput,
  ComparisonResult,
  ResearchInsight,
  VariableType,
} from './researchTypes';
import { experimentDesigner } from './experimentDesigner';
import { experimentComparator } from './experimentComparator';
import { researchInsightGenerator } from './researchInsightGenerator';
import { researchLog } from './researchLog';

interface ExperimentDesignInput {
  hypothesis: string;
  objective: string;
  species: string;
  facilityId: string;
  variables: Array<{
    type: VariableType;
    controlValue: number | string;
    experimentalValues?: (number | string)[];
    experimentalValue?: number | string;
    rationale: string;
  }>;
  substrateRecipe: string;
  durationDays: number;
}

class ResearchEngine {
  /**
   * Design a new experiment (proposal-only, requires approval)
   */
  proposeExperiment(input: ExperimentDesignInput): ExperimentProposal {
    const normalizedInput = {
      ...input,
      variables: input.variables.map((v) => ({
        type: v.type,
        controlValue: v.controlValue,
        experimentalValues:
          v.experimentalValues ?? (v.experimentalValue !== undefined ? [v.experimentalValue] : []),
        rationale: v.rationale,
      })),
    };

    const proposal = experimentDesigner.designExperiment(normalizedInput as any);

    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'experiment-designed',
      message: `Experiment proposal created: ${input.hypothesis}`,
      context: {
        experimentId: proposal.experimentId,
        facilityId: input.facilityId,
      },
      details: {
        hypothesis: input.hypothesis,
        objective: input.objective,
        variableCount: input.variables.length,
      },
    });

    return proposal;
  }

  /**
   * Approve an experiment for execution
   */
  approveExperiment(experimentId: string): void {
    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'approved',
      message: `Experiment approved for execution`,
      context: {
        experimentId,
      },
      details: {},
    });
  }

  /**
   * Reject an experiment proposal
   */
  rejectExperiment(experimentId: string, reason: string): void {
    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'rejected',
      message: `Experiment rejected: ${reason}`,
      context: {
        experimentId,
      },
      details: {
        rejectionReason: reason,
      },
    });
  }

  /**
   * Mark experiment as started
   */
  startExperiment(experimentId: string): void {
    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'started',
      message: `Experiment started`,
      context: {
        experimentId,
      },
      details: {},
    });
  }

  /**
   * Mark experiment as completed
   */
  completeExperiment(experimentId: string): void {
    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'completed',
      message: `Experiment completed`,
      context: {
        experimentId,
      },
      details: {},
    });
  }

  /**
   * Compare experimental outcomes against control
   */
  compareExperiment(input: {
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
  }): ComparisonResult[] {
    const comparisons = experimentComparator.compareExperiment(input);

    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'comparison-generated',
      message: `Generated ${comparisons.length} comparisons`,
      context: {
        experimentId: input.experiment.experimentId,
      },
      details: {
        comparisonCount: comparisons.length,
      },
    });

    return comparisons;
  }

  /**
   * Generate insights from experiments and historical data
   */
  generateInsights(input: ResearchEngineInput): ResearchInsight[] {
    // Extract experiments from execution plans and optimization proposals
    const experiments: ExperimentProposal[] = [];

    // Generate insights
    const historicalData = (input.historicalData ?? []) as any[];

    const insights = researchInsightGenerator.generateInsights({
      experiments,
      comparisons: [], // Would come from completed experiments
      historicalData,
    });

    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'insight-generated',
      message: `Generated ${insights.length} research insights`,
      context: {},
      details: {
        insightCount: insights.length,
      },
    });

    return insights;
  }

  /**
   * Generate a comprehensive research report
   */
  generateReport(input: {
    experiments: ExperimentProposal[];
    comparisons: ComparisonResult[];
    insights: ResearchInsight[];
  }): ResearchReport {
    const { experiments, comparisons, insights } = input;

    // Summarize comparisons
    const summary = experimentComparator.summarizeComparisons(comparisons);

    // Group insights by type
    const insightsByType = {
      'variable-impact': insights.filter((i) => i.type === 'variable-impact'),
      'cross-facility-pattern': insights.filter((i) => i.type === 'cross-facility-pattern'),
      'historical-trend': insights.filter((i) => i.type === 'historical-trend'),
      'anomaly-detection': insights.filter((i) => i.type === 'anomaly-detection'),
      'optimization-opportunity': insights.filter((i) => i.type === 'optimization-opportunity'),
      'next-experiment': insights.filter((i) => i.type === 'next-experiment'),
    };

    // Build report
    const report: ResearchReport = {
      reportId: `report-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      coveringPeriod: {
        start: experiments.length > 0 ? experiments[0].createdAt : new Date().toISOString(),
        end: new Date().toISOString(),
      },
      experiments: experiments.map((exp) => exp.experimentId),
      methodology: {
        experimentCount: experiments.length,
        totalComparisons: comparisons.length,
        insightsGenerated: insights.length,
        approach:
          'Deterministic experimental design with control groups, statistical comparison of outcomes, and pattern-based insight generation. All experiments require operator approval before execution.',
      },
      results: {
        significantFindings: summary.significantFindings.map((f) => ({
          metric: f.metric,
          delta: `${f.deltaPercent > 0 ? '+' : ''}${f.deltaPercent}%`,
          direction: f.direction,
          significance: f.significance,
        })),
        positiveChanges: summary.positiveDeltas,
        negativeChanges: summary.negativeDeltas,
        noChanges: summary.noChange,
        averageDeltaPercent: summary.averageDeltaPercent,
      },
      insights: {
        high: insights.filter((i) => i.severity === 'high'),
        medium: insights.filter((i) => i.severity === 'medium'),
        low: insights.filter((i) => i.severity === 'low'),
      },
      conclusions: this.generateConclusions(summary, insightsByType),
      recommendations: this.generateRecommendations(insights),
      nextExperiments: insightsByType['next-experiment'].flatMap(
        (i) => i.suggestedNextSteps
      ),
    };

    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'report-generated',
      message: `Research report generated`,
      context: {},
      details: {
        reportId: report.reportId,
        experimentsCovered: experiments.length,
        insightsIncluded: insights.length,
      },
    });

    return report;
  }

  private generateConclusions(
    summary: {
      totalComparisons: number;
      significantFindings: ComparisonResult[];
      positiveDeltas: number;
      negativeDeltas: number;
      noChange: number;
      averageDeltaPercent: number;
    },
    insightsByType: Record<string, ResearchInsight[]>
  ): string[] {
    const conclusions: string[] = [];

    if (summary.totalComparisons === 0) {
      conclusions.push('No experimental data available for analysis.');
      return conclusions;
    }

    conclusions.push(
      `Analyzed ${summary.totalComparisons} comparisons across experimental conditions.`
    );

    if (summary.significantFindings.length > 0) {
      conclusions.push(
        `Identified ${summary.significantFindings.length} significant findings with high or medium confidence.`
      );
    }

    const improvementRate =
      (summary.positiveDeltas / summary.totalComparisons) * 100;
    if (improvementRate > 50) {
      conclusions.push(
        `${improvementRate.toFixed(0)}% of experimental conditions showed improvement over control.`
      );
    } else if (improvementRate < 30) {
      conclusions.push(
        `Only ${improvementRate.toFixed(0)}% of experimental conditions showed improvement, suggesting control conditions are well-optimized.`
      );
    }

    if (insightsByType['optimization-opportunity'].length > 0) {
      conclusions.push(
        `Found ${insightsByType['optimization-opportunity'].length} optimization opportunities with potential for production implementation.`
      );
    }

    if (insightsByType['anomaly-detection'].length > 0) {
      conclusions.push(
        `Detected ${insightsByType['anomaly-detection'].length} anomalies requiring further investigation.`
      );
    }

    return conclusions;
  }

  private generateRecommendations(insights: ResearchInsight[]): string[] {
    const recommendations: string[] = [];

    const highSeverityInsights = insights.filter((i) => i.severity === 'high');
    if (highSeverityInsights.length > 0) {
      recommendations.push(
        `Address ${highSeverityInsights.length} high-severity insights immediately.`
      );

      highSeverityInsights.forEach((insight) => {
        recommendations.push(
          `${insight.title}: ${insight.suggestedNextSteps[0]}`
        );
      });
    }

    const optimizationInsights = insights.filter(
      (i) => i.type === 'optimization-opportunity'
    );
    if (optimizationInsights.length > 0) {
      recommendations.push(
        'Prioritize implementing validated optimization opportunities.'
      );
    }

    const nextExperimentInsights = insights.filter(
      (i) => i.type === 'next-experiment'
    );
    if (nextExperimentInsights.length > 0) {
      recommendations.push(
        'Continue systematic experimentation with suggested variables.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue current operational practices.');
      recommendations.push('Monitor performance for emerging patterns.');
    }

    return recommendations;
  }

  /**
   * Get research log entries
   */
  getLog(category?: string): any[] {
    return researchLog.list(category as any);
  }

  /**
   * Export research data
   */
  exportData(): {
    log: any[];
    timestamp: string;
  } {
    const data = {
      log: researchLog.export(),
      timestamp: new Date().toISOString(),
    };

    researchLog.add({
      entryId: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'export',
      message: `Research data exported`,
      context: {},
      details: {
        logEntries: data.log.length,
      },
    });

    return data;
  }
}

export const researchEngine = new ResearchEngine();
