/**
 * Coach System Type Definitions
 * Defines all interfaces for the AI-assisted cultivation coaching system
 */

// User Profile and Preferences
export interface UserProfile {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  experience: number; // months of cultivation experience
  climate: 'tropical' | 'temperate' | 'arid' | 'cold';
  equipment: 'minimal' | 'basic' | 'moderate' | 'professional';
  space: 'apartment' | 'house' | 'greenhouse' | 'farm';
  goals: GrowingGoal[];
  favorites: string[]; // page slugs
  interests: string[]; // semantic tags
  timeAvailable: 'minimal' | 'few-hours-weekly' | 'hours-daily' | 'full-time';
}

export interface GrowingGoal {
  type: 'food' | 'medicine' | 'hobby' | 'income' | 'learning';
  targetSpecies?: string[];
  quantity?: string;
  timeline?: string;
}

// Coach Recommendation
export interface CoachRecommendation {
  id: string;
  type: 'species' | 'substrate' | 'environment' | 'troubleshooting' | 'action' | 'learning';
  title: string;
  description: string;
  reasoning: string;
  confidenceScore: number; // 0-1
  relatedPages: RelatedPage[];
  actions?: CoachAction[];
  parameters?: Record<string, any>;
  alternatives?: CoachRecommendation[];
  estimatedDifficulty: 'easy' | 'moderate' | 'challenging';
  estimatedTime?: string; // e.g., "2 hours", "1 week"
}

export interface RelatedPage {
  slug: string;
  title: string;
  type: string;
}

export interface CoachAction {
  id: string;
  label: string;
  description: string;
  actionType: 'navigate' | 'read' | 'purchase' | 'monitor' | 'adjust' | 'contact';
  target?: string; // URL or page slug
  icon?: string;
  priority: 'low' | 'medium' | 'high';
}

// Environmental Parameters
export interface EnvironmentalParams {
  temperature: {
    min: number;
    max: number;
    optimal: number;
    unit: 'celsius' | 'fahrenheit';
  };
  humidity: {
    min: number;
    max: number;
    optimal: number;
  };
  fae: {
    frequency: string; // e.g., "3-4 times daily"
    duration: string;
    method: string;
  };
  light: {
    required: boolean;
    duration?: string; // e.g., "12 hours"
    intensity?: string;
    type?: string;
  };
  substrate: {
    type: string;
    moisture: string;
    colonizationDays: number;
    fruiting: string;
  };
}

// Grow Plan
export interface GrowPlan {
  id: string;
  name: string;
  species: string;
  substrate: string;
  startDate: string; // ISO date
  estimatedCompletionDate: string;
  stages: GrowStage[];
  notes: string;
  createdAt: string;
  lastUpdated: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
}

export interface GrowStage {
  stage: 'preparation' | 'inoculation' | 'colonization' | 'fruiting' | 'harvest' | 'cleanup';
  duration: number; // days
  startDate?: string;
  endDate?: string;
  tasks: StageTask[];
  parameters: EnvironmentalParams;
  milestones: string[];
  commonIssues: string[];
}

export interface StageTask {
  id: string;
  title: string;
  description: string;
  dueDay: number; // relative to stage start
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

// Troubleshooting
export interface TroubleshootingSymptom {
  symptom: string;
  description: string;
  possibleCauses: TroubleshootingDiagnosis[];
  immediateActions: CoachAction[];
  preventiveMeasures: string[];
  relatedPages: RelatedPage[];
}

export interface TroubleshootingDiagnosis {
  id: string;
  cause: string;
  likelihood: number; // 0-1
  symptoms: string[];
  solutions: CoachAction[];
  estimatedRecoveryTime?: string;
  preventiveMeasures?: string[];
}

// Coach Session
export interface CoachSession {
  id: string;
  createdAt: string;
  lastUpdated: string;
  mode: CoachMode;
  conversationHistory: ConversationTurn[];
  context: SessionContext;
  recommendations: CoachRecommendation[];
  currentStep?: number;
  status: 'active' | 'completed' | 'paused';
}

export type CoachMode = 
  | 'species-advisor' 
  | 'substrate-advisor' 
  | 'environment-advisor' 
  | 'troubleshooting-advisor' 
  | 'grow-planner'
  | 'general-guidance';

export interface ConversationTurn {
  id: string;
  timestamp: string;
  type: 'user' | 'coach';
  content: string;
  metadata?: {
    intent?: string;
    entities?: string[];
    confidence?: number;
  };
}

export interface SessionContext {
  userProfile: UserProfile;
  currentSpecies?: string;
  currentSubstrate?: string;
  currentStage?: string;
  recentPages?: string[];
  activePlan?: string;
  focusArea?: string;
  relatedMetadata?: Record<string, any>;
}

// Coach Memory (Client-side Storage)
export interface CoachMemory {
  userProfile: UserProfile;
  sessions: CoachSession[];
  lastSession?: {
    id: string;
    timestamp: string;
  };
  savedPlans: GrowPlan[];
  savedRecommendations: CoachRecommendation[];
  userGoals: GrowingGoal[];
  preferences: {
    communicationStyle: 'concise' | 'detailed' | 'balanced';
    recommendationCount: number; // 3-5
    showAlternatives: boolean;
    remindOnCriticalIssues: boolean;
  };
  statistics: {
    sessionsCount: number;
    lastSessionDate?: string;
    totalPlansCreated: number;
    issuesResolved: number;
    learningPathsCompleted: number;
  };
}

// Coach Metadata (extracted from pages)
export interface CoachPageMetadata {
  slug: string;
  title: string;
  category: string;
  subcategory?: string;
  semanticTags: string[];
  relatedSpecies?: string[];
  relatedSubstrates?: string[];
  environmentalParams?: Partial<EnvironmentalParams>;
  commonIssues?: string[];
  skillLevel?: string;
  estimatedReadTime?: number;
}

// Coach Context (used when launching coach from a page)
export interface CoachLaunchContext {
  mode?: CoachMode;
  sourceSlug?: string;
  sourceTitle?: string;
  preSelectedSpecies?: string;
  preSelectedSubstrate?: string;
  preSelectedIssue?: string;
  focusArea?: string;
}
