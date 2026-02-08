'use client';

export type ContributionKind = 'pattern' | 'correlation' | 'optimization' | 'anomaly';
export type SourceKind = 'facility' | 'research' | 'agent';

export interface RawContribution {
  id: string;
  source: SourceKind;
  facilityId?: string;
  deviceIds?: string[];
  timestamp?: number;
  roomIds?: string[];
  species?: string;
  stage?: string;
  payload: Record<string, any>;
  kind: ContributionKind;
}

export interface AnonymizedContribution {
  id: string;
  kind: ContributionKind;
  source: SourceKind;
  species?: string;
  stage?: string;
  timeBucket?: string;
  summary: Record<string, any>;
}

export interface ValidationResult {
  contributionId: string;
  confidence: number; // 0-1
  status: 'pending' | 'accepted' | 'rejected';
  issues: string[];
  tags: string[];
}

export interface GlobalInsight {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  confidence: number;
  kind: ContributionKind;
  relatedSpecies?: string;
  relatedStage?: string;
}

export interface ExchangeLogEntry {
  id: string;
  timestamp: number;
  category: 'contribution' | 'validation' | 'anonymization' | 'routing' | 'notification';
  message: string;
  context?: Record<string, any>;
}
