export type PageKind = 'species' | 'substrate' | 'troubleshooting' | 'guide' | 'advanced-module';

export type Audience = 'beginner' | 'intermediate' | 'advanced';

export type ContentSeed = {
  kind: PageKind;
  id: string;
  title: string;
  summary: string;
  primaryTag: string;
  audience: Audience;
  path?: string;
  species?: string;
  constraints?: string[];
  goal?: string;
};

export type GeneratedSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type GeneratedMetadata = {
  title: string;
  description: string;
  keywords: string[];
  tags: string[];
};

export type RelatedLink = {
  title: string;
  href: string;
};

export type KnowledgeGraphNode = {
  id: string;
  label: string;
  type: string;
  tags?: string[];
};

export type KnowledgeGraphEdge = {
  from: string;
  to: string;
  relation: string;
  rationale: string;
};

export type SafetyReport = {
  status: 'pass' | 'fail';
  issues: string[];
  warnings: string[];
};

export type AuditSnapshot = {
  deterministicHash: string;
  generatedAt: string;
  engineVersion: string;
};

export type GeneratedContent = {
  seed: ContentSeed;
  slug: string;
  path: string;
  metadata: GeneratedMetadata;
  sections: GeneratedSection[];
  related: RelatedLink[];
  tags: string[];
  knowledgeGraph: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
  };
  safety: SafetyReport;
  audit: AuditSnapshot;
};

export type MetadataAuditReport = {
  missing: string[];
  warnings: string[];
  suggestions: string[];
  generatedMetadata: GeneratedMetadata;
};

export type TagSuggestionReport = {
  proposed: string[];
  unused: string[];
  redundantPairs: string[][];
  mergeCandidates: string[][];
  splitCandidates: string[];
  validationIssues: string[];
};

export type ClusterProposal = {
  name: string;
  rationale: string;
  members: string[];
  crossLinks: string[];
};

export type ClusterGeneratorReport = {
  proposals: ClusterProposal[];
  imbalanceWarnings: string[];
  crossLinkSuggestions: string[];
  visualization: {
    nodes: string[];
    edges: { from: string; to: string; weight: number }[];
  };
};

export type DiffLine = {
  type: 'context' | 'add' | 'remove';
  value: string;
};

export type DiffChunk = {
  header: string;
  lines: DiffLine[];
};

export type AuditRecord = {
  id: string;
  targetPath: string;
  action: 'create' | 'update';
  status: 'pending' | 'accepted' | 'rejected';
  summary: string;
  diff?: DiffChunk[];
  generatedAt: string;
  lastModified?: string;
  actor: string;
};

export type AuditorStatusUpdate = Pick<AuditRecord, 'id' | 'status'>;

export interface UpdateAuditorAPI {
  recordGeneration(targetPath: string, action: AuditRecord['action'], summary: string, diff?: DiffChunk[]): AuditRecord;
  listRecords(): AuditRecord[];
  diffText(base: string, next: string): DiffChunk[];
  markStatus(id: string, status: AuditRecord['status']): AuditRecord | undefined;
}
