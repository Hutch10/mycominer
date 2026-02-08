/**
 * Community & Contribution Layer Types
 * Comprehensive type definitions for grow logs, notes, insights, and community features
 */

// ============================================================================
// GROW LOG TYPES
// ============================================================================

export interface GrowLogEntry {
  id: string;
  timestamp: string;
  species: string; // species slug
  substrate: string; // substrate type
  quantity: number; // number of spawn bags or containers
  inoculationDate: string;
  colonizationStartDate?: string;
  fruitingStartDate?: string;
  harvestDate?: string;
  
  // Environmental tracking
  environmentalParameters: {
    temperature?: number;
    humidity?: number;
    fae?: number; // air exchanges per day
    light?: string; // 'dark', 'low', 'moderate', 'high'
  };
  
  // Observations
  observations: string; // markdown-formatted notes
  issues: string[]; // tags for issues encountered
  tags: string[]; // semantic tags
  photoUrls?: string[]; // client-only URLs
  
  // Outcomes
  yield?: number; // grams or number of fruiting bodies
  qualityRating?: 1 | 2 | 3 | 4 | 5; // user rating
  successNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  linkedPages?: string[]; // slugs of related pages
  isPrivate: boolean;
}

export interface GrowLogStats {
  totalLogs: number;
  totalYield: number;
  successRate: number; // percentage
  favoriteSpecies: string;
  favoriteyields: number;
  averageQualityRating: number;
  mostUsedSubstrate: string;
}

export interface GrowLogFilter {
  species?: string;
  substrate?: string;
  dateRange?: { start: string; end: string };
  tags?: string[];
  minQuality?: number;
  isPrivate?: boolean;
}

// ============================================================================
// NOTES TYPES
// ============================================================================

export interface Note {
  id: string;
  title: string;
  content: string; // markdown
  tags: string[];
  linkedContent: LinkedContent[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  color?: string; // optional color coding
  isPinned?: boolean;
}

export interface LinkedContent {
  type: 'species' | 'guide' | 'troubleshooting' | 'tool' | 'page';
  slug: string;
  title: string;
  context?: string; // brief explanation of link
}

export interface NoteFilter {
  tags?: string[];
  linkedType?: string;
  isPinned?: boolean;
  searchQuery?: string;
}

// ============================================================================
// INSIGHT TYPES
// ============================================================================

export interface Insight {
  id: string;
  type: 'tip' | 'observation' | 'troubleshooting-pattern' | 'species-behavior';
  title: string;
  description: string; // markdown
  
  // Context
  relatedSpecies?: string[];
  relatedSubstrates?: string[];
  relatedIssues?: string[];
  
  // Metadata
  tags: string[];
  confidence: 'low' | 'medium' | 'high'; // user-assessed confidence
  basedOnLogs?: string[]; // IDs of grow logs this insight came from
  linkedPages?: string[]; // slugs of related content
  
  // Community
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  upvotes?: number; // for future community voting
}

export interface InsightSuggestion {
  id: string;
  type: Insight['type'];
  suggestedTags: string[];
  suggestedLinks: { slug: string; title: string }[];
  source: 'grow-log' | 'note' | 'user';
  sourceId: string;
  createdAt: string;
  isReviewed: boolean;
}

// ============================================================================
// KNOWLEDGE GRAPH FEEDBACK TYPES
// ============================================================================

export interface KnowledgeGraphSuggestion {
  id: string;
  type: 'new-tag' | 'new-relationship' | 'new-crosslink';
  suggestion: {
    tag?: string;
    source?: string; // content slug
    target?: string; // content slug
    relationship?: string; // type of relationship
  };
  reasoning: string;
  confidence: number; // 0-1
  sourceType: 'grow-log' | 'note' | 'insight';
  sourceId: string;
  createdAt: string;
  isActioned: boolean;
}

// ============================================================================
// COMMUNITY DATA TYPES
// ============================================================================

export interface CommunityData {
  growLogs: GrowLogEntry[];
  notes: Note[];
  insights: Insight[];
  insightSuggestions: InsightSuggestion[];
  knowledgeGraphSuggestions: KnowledgeGraphSuggestion[];
  preferences: CommunityPreferences;
  statistics: CommunityStatistics;
}

export interface CommunityPreferences {
  shareGrowLogs: boolean; // allow sharing logs with community
  shareInsights: boolean; // allow sharing insights
  allowFeedback: boolean; // allow others to comment
  defaultPrivacy: 'private' | 'community' | 'public';
  photoPreferences: {
    captureEnabled: boolean;
    compressionLevel: number; // 0-100
    autoDelete: boolean; // delete after export
  };
}

export interface CommunityStatistics {
  totalLogs: number;
  totalNotes: number;
  totalInsights: number;
  totalYield: number;
  averageQualityRating: number;
  mostLoggedSpecies: string[];
  commonTags: string[];
  suggestionsGenerated: number;
  suggestionsActioned: number;
}

// ============================================================================
// EXPORT/IMPORT TYPES
// ============================================================================

export interface ExportData {
  version: string;
  exportedAt: string;
  exportedBy: string;
  data: {
    growLogs: GrowLogEntry[];
    notes: Note[];
    insights: Insight[];
  };
  metadata: {
    totalEntries: number;
    dateRange: { start: string; end: string };
  };
}

export interface ImportConfig {
  mergeStrategy: 'replace' | 'merge' | 'skip-duplicates';
  preserveTimestamps: boolean;
  validateData: boolean;
}

export interface ImportResult {
  success: boolean;
  itemsImported: number;
  itemsSkipped: number;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// ADAPTER TYPES (FOR FUTURE SERVER STORAGE)
// ============================================================================

export interface CommunityStorageAdapter {
  // Grow logs
  createGrowLog(log: GrowLogEntry): Promise<GrowLogEntry>;
  updateGrowLog(id: string, updates: Partial<GrowLogEntry>): Promise<GrowLogEntry>;
  deleteGrowLog(id: string): Promise<void>;
  getGrowLogs(filter?: GrowLogFilter): Promise<GrowLogEntry[]>;
  
  // Notes
  createNote(note: Note): Promise<Note>;
  updateNote(id: string, updates: Partial<Note>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  getNotes(filter?: NoteFilter): Promise<Note[]>;
  
  // Insights
  createInsight(insight: Insight): Promise<Insight>;
  updateInsight(id: string, updates: Partial<Insight>): Promise<Insight>;
  deleteInsight(id: string): Promise<void>;
  getInsights(): Promise<Insight[]>;
  
  // Sync
  sync(): Promise<void>;
  isConnected(): boolean;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface CommunityUIState {
  activeTab: 'logs' | 'notes' | 'insights' | 'suggestions';
  filters: {
    growLogs: GrowLogFilter;
    notes: NoteFilter;
  };
  selectedLog?: string;
  selectedNote?: string;
  selectedInsight?: string;
  showCreateModal?: string;
  sortBy?: 'date' | 'quality' | 'yield' | 'species';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// COMMUNITY ACTION TYPES
// ============================================================================

export interface CommunityAction {
  id: string;
  type: 'add-log' | 'add-note' | 'add-insight' | 'add-observation';
  context: {
    species?: string;
    substrate?: string;
    pageSlug?: string;
    pageType?: 'species' | 'guide' | 'troubleshooting' | 'tool';
  };
  label: string;
  description: string;
  icon: string;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
