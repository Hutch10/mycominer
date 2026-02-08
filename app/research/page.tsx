'use client';

// Phase 26: Research & Experimentation Engine - Main Page
// Demonstrates autonomous research capabilities with mock data

import { useState } from 'react';
import { ResearchDashboard } from './components/ResearchDashboard';
import type { ExperimentProposal, ComparisonResult, ResearchInsight, ResearchReport } from './researchTypes';

export default function ResearchPage() {
  // Mock experiment data
  const [experiments, setExperiments] = useState<ExperimentProposal[]>([
    {
      experimentId: 'exp-001',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      status: 'completed',
      hypothesis: 'Increasing temperature by 2°C will reduce colonization time by 10%',
      objective: 'Optimize colonization speed',
      species: 'oyster',
      facilityId: 'facility-north',
      controlGroup: {
        groupId: 'control-001',
        name: 'Control Group',
        description: 'Baseline conditions',
        conditions: [
          {
            conditionId: 'cond-control-temp-1',
            variableId: 'temp',
            value: 20,
            isControl: true,
            facilityId: 'facility-north',
            roomId: 'room-1',
          },
        ],
        facilityId: 'facility-north',
        species: 'oyster',
        substrateRecipe: 'Hardwood sawdust + wheat bran (80:20)',
        expectedDurationDays: 30,
        resourceRequirements: {
          substrateKg: 50,
          laborHours: 20,
          energyKwh: 100,
          equipmentIds: ['autoclave'],
        },
      },
      experimentalGroups: [
        {
          groupId: 'exp-group-001',
          name: 'Experimental Group',
          description: 'Higher temperature',
          conditions: [
            {
              conditionId: 'cond-exp-temp-1',
              variableId: 'temp',
              value: 22,
              isControl: false,
              facilityId: 'facility-north',
              roomId: 'room-2',
            },
          ],
          variablesChanged: ['var-001'],
          facilityId: 'facility-north',
          species: 'oyster',
          substrateRecipe: 'Hardwood sawdust + wheat bran (80:20)',
          expectedDurationDays: 30,
          resourceRequirements: {
            substrateKg: 50,
            laborHours: 20,
            energyKwh: 100,
            equipmentIds: ['autoclave'],
          },
        },
      ],
      variables: [
        {
          variableId: 'var-001',
          variableType: 'temperature',
          name: 'Temperature',
          description: 'Room temperature',
          controlValue: 20,
          experimentalValue: 22,
          rationale: 'Testing slightly higher temperature for potential faster colonization',
          expectedDelta: 'May reduce colonization time',
          safetyRange: { min: 10, max: 30 },
        },
      ],
      durationDays: 30,
      safetyChecks: [
        { checkType: 'safety-range-check', passed: true, details: 'All values within safety ranges' },
        { checkType: 'resource-availability', passed: true, details: 'Resources available' },
        { checkType: 'contamination-risk', passed: true, details: 'No high-risk changes' },
      ],
      rollbackFeasibility: {
        canRollback: true,
        rollbackSteps: ['Stop experiment', 'Return to SOP temperature'],
        rollbackRisks: ['Potential yield loss from mid-cycle changes'],
      },
      estimatedCost: { substrateCost: 250, laborCost: 400, energyCost: 30, totalCost: 680 },
      dataCollectionPlan: {
        metrics: ['yield-kg', 'contamination-rate', 'colonization-days'],
        frequency: 'Daily temperature checks, weekly yield measurements',
        responsibleParty: 'Research Team',
      },
    },
    {
      experimentId: 'exp-002',
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-01-20T14:00:00Z',
      status: 'pending-approval',
      hypothesis: 'Increasing humidity to 85% will improve fruit quality without increasing contamination',
      objective: 'Optimize fruiting conditions',
      species: 'lions-mane',
      facilityId: 'facility-south',
      controlGroup: {
        groupId: 'control-002',
        name: 'Control Group',
        description: 'Baseline humidity',
        conditions: [
          {
            conditionId: 'cond-control-humidity-1',
            variableId: 'humidity',
            value: 75,
            isControl: true,
            facilityId: 'facility-south',
            roomId: 'room-3',
          },
        ],
        facilityId: 'facility-south',
        species: 'lions-mane',
        substrateRecipe: 'Hardwood sawdust',
        expectedDurationDays: 21,
        resourceRequirements: {
          substrateKg: 40,
          laborHours: 15,
          energyKwh: 80,
          equipmentIds: ['humidifier'],
        },
      },
      experimentalGroups: [
        {
          groupId: 'exp-group-002',
          name: 'Experimental Group',
          description: 'Higher humidity',
          conditions: [
            {
              conditionId: 'cond-exp-humidity-1',
              variableId: 'humidity',
              value: 85,
              isControl: false,
              facilityId: 'facility-south',
              roomId: 'room-4',
            },
          ],
          variablesChanged: ['var-002'],
          facilityId: 'facility-south',
          species: 'lions-mane',
          substrateRecipe: 'Hardwood sawdust',
          expectedDurationDays: 21,
          resourceRequirements: {
            substrateKg: 40,
            laborHours: 15,
            energyKwh: 80,
            equipmentIds: ['humidifier'],
          },
        },
      ],
      variables: [
        {
          variableId: 'var-002',
          variableType: 'humidity',
          name: 'Humidity',
          description: 'Relative humidity',
          controlValue: 75,
          experimentalValue: 85,
          rationale: 'Higher humidity may improve fruit quality for Lion\'s Mane',
          expectedDelta: 'May improve fruit size and texture',
          safetyRange: { min: 40, max: 95 },
        },
      ],
      durationDays: 21,
      safetyChecks: [
        { checkType: 'safety-range-check', passed: true, details: 'Humidity within safe range' },
        { checkType: 'resource-availability', passed: true, details: 'Equipment available' },
        { checkType: 'contamination-risk', passed: true, details: 'Monitor for increased contamination' },
      ],
      rollbackFeasibility: {
        canRollback: true,
        rollbackSteps: ['Reduce humidity gradually', 'Monitor for stress'],
        rollbackRisks: ['Minor stress on fruiting bodies'],
      },
      estimatedCost: { substrateCost: 200, laborCost: 300, energyCost: 25, totalCost: 525 },
      dataCollectionPlan: {
        metrics: ['yield-kg', 'contamination-rate', 'fruit-quality'],
        frequency: 'Twice daily humidity readings, daily visual inspection',
        responsibleParty: 'South Facility Team',
      },
    },
  ]);

  // Mock comparison results
  const [comparisons] = useState<ComparisonResult[]>([
    {
      comparisonId: 'comp-001',
      experimentId: 'exp-001',
      createdAt: '2024-02-14T10:00:00Z',
      controlGroupId: 'control-001',
      experimentalGroupId: 'exp-group-001',
      metric: 'colonization-days',
      controlValue: 18,
      experimentalValue: 16,
      delta: -2,
      deltaPercent: -11.1,
      unit: 'days',
      direction: 'decrease',
      significance: 'high',
      dataPoints: {
        controlDataPoints: [18, 19, 17, 18, 18],
        experimentalDataPoints: [16, 15, 17, 16, 16],
      },
      statistics: {
        controlMean: 18,
        controlStdDev: 0.7,
        experimentalMean: 16,
        experimentalStdDev: 0.7,
        sampleSize: 5,
      },
    },
    {
      comparisonId: 'comp-002',
      experimentId: 'exp-001',
      createdAt: '2024-02-14T10:00:00Z',
      controlGroupId: 'control-001',
      experimentalGroupId: 'exp-group-001',
      metric: 'yield-kg',
      controlValue: 4.5,
      experimentalValue: 4.8,
      delta: 0.3,
      deltaPercent: 6.7,
      unit: 'kg',
      direction: 'increase',
      significance: 'medium',
      dataPoints: {
        controlDataPoints: [4.4, 4.6, 4.5, 4.5, 4.5],
        experimentalDataPoints: [4.7, 4.9, 4.8, 4.8, 4.8],
      },
      statistics: {
        controlMean: 4.5,
        controlStdDev: 0.07,
        experimentalMean: 4.8,
        experimentalStdDev: 0.07,
        sampleSize: 5,
      },
    },
    {
      comparisonId: 'comp-003',
      experimentId: 'exp-001',
      createdAt: '2024-02-14T10:00:00Z',
      controlGroupId: 'control-001',
      experimentalGroupId: 'exp-group-001',
      metric: 'contamination-rate',
      controlValue: 2.0,
      experimentalValue: 1.8,
      delta: -0.2,
      deltaPercent: -10.0,
      unit: '%',
      direction: 'decrease',
      significance: 'low',
      dataPoints: {
        controlDataPoints: [2, 2, 2, 2, 2],
        experimentalDataPoints: [2, 2, 1, 2, 2],
      },
      statistics: {
        controlMean: 2.0,
        controlStdDev: 0,
        experimentalMean: 1.8,
        experimentalStdDev: 0.4,
        sampleSize: 5,
      },
    },
  ]);

  // Mock insights
  const [insights] = useState<ResearchInsight[]>([
    {
      insightId: 'insight-001',
      type: 'optimization-opportunity',
      timestamp: '2024-02-14T11:00:00Z',
      severity: 'high',
      title: 'Faster Colonization with Higher Temperature',
      summary: 'Experimental conditions reduced colonization time by 11.1% with minimal impact on contamination',
      evidence: [
        'Control colonization time: 18 days',
        'Experimental colonization time: 16 days',
        'Time saved: 2 days (11.1% faster)',
        'Contamination rate remained low (1.8% vs 2.0%)',
      ],
      whyThisMatters:
        'Faster colonization reduces cycle time, increases throughput, and reduces contamination risk window.',
      suggestedNextSteps: [
        'Replicate experiment with larger sample size',
        'Test at South and East facilities to validate transferability',
        'Calculate impact on annual production capacity',
      ],
    },
    {
      insightId: 'insight-002',
      type: 'variable-impact',
      timestamp: '2024-02-14T11:00:00Z',
      severity: 'medium',
      title: 'Yield Increase Detected',
      summary: 'Experimental condition showed 6.7% increase in yield compared to control',
      evidence: [
        'Control average: 4.5 kg',
        'Experimental average: 4.8 kg',
        'Delta: +0.3 kg (+6.7%)',
        'Sample size: 5',
      ],
      whyThisMatters:
        'This change could improve production output and profitability if replicated consistently.',
      suggestedNextSteps: [
        'Replicate experiment with larger sample size',
        'Test at additional facilities to validate transferability',
        'Analyze cost-benefit of implementing change at scale',
      ],
    },
    {
      insightId: 'insight-003',
      type: 'next-experiment',
      timestamp: '2024-02-14T11:30:00Z',
      severity: 'low',
      title: 'Follow-Up Experiment Recommended',
      summary: 'Replicate high-significance finding from colonization-days comparison',
      evidence: [
        'Original finding: -11.1% decrease',
        'Significance: high',
      ],
      whyThisMatters:
        'Replicating significant findings validates their reliability and builds confidence for production implementation.',
      suggestedNextSteps: [
        'Design replication study with larger sample size',
        'Test at additional facilities to assess transferability',
        'Vary experimental conditions slightly to map boundaries of effect',
      ],
    },
  ]);

  // Mock reports
  const [reports] = useState<ResearchReport[]>([
    {
      reportId: 'report-001',
      generatedAt: '2024-02-14T12:00:00Z',
      coveringPeriod: {
        start: '2024-01-15T10:00:00Z',
        end: '2024-02-14T12:00:00Z',
      },
      experiments: ['exp-001'],
      methodology: {
        experimentCount: 1,
        totalComparisons: 3,
        insightsGenerated: 3,
        approach:
          'Deterministic experimental design with control groups, statistical comparison of outcomes, and pattern-based insight generation. All experiments require operator approval before execution.',
      },
      results: {
        significantFindings: [
          {
            metric: 'colonization-days',
            delta: '-11.1%',
            direction: 'decrease',
            significance: 'high',
          },
          {
            metric: 'yield-kg',
            delta: '+6.7%',
            direction: 'increase',
            significance: 'medium',
          },
        ],
        positiveChanges: 2,
        negativeChanges: 0,
        noChanges: 1,
        averageDeltaPercent: 9.3,
      },
      insights: {
        high: insights.filter((i) => i.severity === 'high'),
        medium: insights.filter((i) => i.severity === 'medium'),
        low: insights.filter((i) => i.severity === 'low'),
      },
      conclusions: [
        'Analyzed 3 comparisons across experimental conditions.',
        'Identified 2 significant findings with high or medium confidence.',
        '67% of experimental conditions showed improvement over control.',
        'Found 1 optimization opportunities with potential for production implementation.',
      ],
      recommendations: [
        'Address 1 high-severity insights immediately.',
        'Faster Colonization with Higher Temperature: Replicate experiment with larger sample size',
        'Prioritize implementing validated optimization opportunities.',
        'Continue systematic experimentation with suggested variables.',
      ],
      nextExperiments: [
        'Design replication study with larger sample size',
        'Test at additional facilities to assess transferability',
        'Vary experimental conditions slightly to map boundaries of effect',
      ],
    },
  ]);

  const handleProposeExperiment = (proposal: ExperimentProposal) => {
    setExperiments([proposal, ...experiments]);
  };

  const handleApproveExperiment = (experimentId: string) => {
    setExperiments(
      experiments.map((exp) =>
        exp.experimentId === experimentId ? { ...exp, status: 'approved' } : exp
      )
    );
  };

  const handleRejectExperiment = (experimentId: string, _reason: string) => {
    setExperiments(
      experiments.map((exp) =>
        exp.experimentId === experimentId ? { ...exp, status: 'rejected' } : exp
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ResearchDashboard
        experiments={experiments}
        comparisons={comparisons}
        insights={insights}
        reports={reports}
        onProposeExperiment={handleProposeExperiment}
        onApproveExperiment={handleApproveExperiment}
        onRejectExperiment={handleRejectExperiment}
      />
    </div>
  );
}
