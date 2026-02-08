/**
 * Coach Memory System
 * Client-side localStorage management for sessions, plans, preferences, and history
 */

import {
  CoachMemory,
  UserProfile,
  GrowPlan,
  CoachSession,
  CoachRecommendation,
  GrowingGoal,
} from './coachTypes';

const STORAGE_KEY = 'mushroom-coach-memory';
const SESSION_DURATION_MINUTES = 60;

/**
 * Initialize memory from localStorage or create default
 */
export function initializeMemory(): CoachMemory {
  if (typeof window === 'undefined') {
    return getDefaultMemory();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parseMemory(parsed);
    }
  } catch (e) {
    console.warn('Failed to load coach memory from storage:', e);
  }

  return getDefaultMemory();
}

/**
 * Get default memory structure
 */
function getDefaultMemory(): CoachMemory {
  return {
    userProfile: getDefaultUserProfile(),
    sessions: [],
    savedPlans: [],
    savedRecommendations: [],
    userGoals: [],
    preferences: {
      communicationStyle: 'balanced',
      recommendationCount: 4,
      showAlternatives: true,
      remindOnCriticalIssues: true,
    },
    statistics: {
      sessionsCount: 0,
      totalPlansCreated: 0,
      issuesResolved: 0,
      learningPathsCompleted: 0,
    },
  };
}

/**
 * Get default user profile
 */
function getDefaultUserProfile(): UserProfile {
  return {
    skillLevel: 'beginner',
    experience: 0,
    climate: 'temperate',
    equipment: 'basic',
    space: 'apartment',
    goals: [{ type: 'hobby' }],
    favorites: [],
    interests: [],
    timeAvailable: 'few-hours-weekly',
  };
}

/**
 * Parse and validate memory from storage
 */
function parseMemory(data: any): CoachMemory {
  const memory = getDefaultMemory();

  if (data.userProfile) {
    memory.userProfile = { ...memory.userProfile, ...data.userProfile };
  }
  if (Array.isArray(data.sessions)) {
    memory.sessions = data.sessions.filter((s: CoachSession) => isSessionActive(s));
  }
  if (Array.isArray(data.savedPlans)) {
    memory.savedPlans = data.savedPlans;
  }
  if (Array.isArray(data.savedRecommendations)) {
    memory.savedRecommendations = data.savedRecommendations;
  }
  if (Array.isArray(data.userGoals)) {
    memory.userGoals = data.userGoals;
  }
  if (data.preferences) {
    memory.preferences = { ...memory.preferences, ...data.preferences };
  }
  if (data.statistics) {
    memory.statistics = { ...memory.statistics, ...data.statistics };
  }
  if (data.lastSession) {
    memory.lastSession = data.lastSession;
  }

  return memory;
}

/**
 * Check if session is still active (within duration)
 */
function isSessionActive(session: any): boolean {
  if (!session.lastUpdated) return false;

  const lastUpdate = new Date(session.lastUpdated).getTime();
  const now = new Date().getTime();
  const diffMinutes = (now - lastUpdate) / (1000 * 60);

  return diffMinutes < SESSION_DURATION_MINUTES;
}

/**
 * Save memory to localStorage
 */
export function saveMemory(memory: CoachMemory): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch (e) {
    console.warn('Failed to save coach memory:', e);
  }
}

/**
 * Update user profile
 */
export function updateUserProfile(updates: Partial<UserProfile>): CoachMemory {
  const memory = initializeMemory();
  memory.userProfile = { ...memory.userProfile, ...updates };
  saveMemory(memory);
  return memory;
}

/**
 * Save a new session
 */
export function saveSession(session: CoachSession): CoachMemory {
  const memory = initializeMemory();

  // Replace existing session or add new
  const existingIndex = memory.sessions.findIndex(s => s.id === session.id);
  if (existingIndex >= 0) {
    memory.sessions[existingIndex] = session;
  } else {
    memory.sessions.push(session);
  }

  // Keep only last 5 sessions
  if (memory.sessions.length > 5) {
    memory.sessions = memory.sessions.slice(-5);
  }

  memory.lastSession = {
    id: session.id,
    timestamp: new Date().toISOString(),
  };

  memory.statistics.sessionsCount = memory.statistics.sessionsCount + 1;
  saveMemory(memory);

  return memory;
}

/**
 * Get most recent active session
 */
export function getActiveSession(): CoachSession | null {
  const memory = initializeMemory();

  if (memory.sessions.length === 0) return null;

  // Find most recent active session
  const active = memory.sessions.find(
    s => s.status === 'active' && isSessionActive(s)
  );

  return active || null;
}

/**
 * Get session by ID
 */
export function getSession(id: string): CoachSession | null {
  const memory = initializeMemory();
  return memory.sessions.find(s => s.id === id) || null;
}

/**
 * End current session
 */
export function endSession(id: string): void {
  const memory = initializeMemory();
  const session = memory.sessions.find(s => s.id === id);

  if (session) {
    session.status = 'completed';
    session.lastUpdated = new Date().toISOString();
    saveMemory(memory);
  }
}

/**
 * Save a grow plan
 */
export function savePlan(plan: GrowPlan): CoachMemory {
  const memory = initializeMemory();

  const existingIndex = memory.savedPlans.findIndex(p => p.id === plan.id);
  if (existingIndex >= 0) {
    memory.savedPlans[existingIndex] = plan;
  } else {
    memory.savedPlans.push(plan);
  }

  if (plan.status === 'active') {
    memory.statistics.totalPlansCreated = memory.statistics.totalPlansCreated + 1;
  }

  saveMemory(memory);
  return memory;
}

/**
 * Get all active plans
 */
export function getActivePlans(): GrowPlan[] {
  const memory = initializeMemory();
  return memory.savedPlans.filter(p => p.status === 'active');
}

/**
 * Get plan by ID
 */
export function getPlan(id: string): GrowPlan | null {
  const memory = initializeMemory();
  return memory.savedPlans.find(p => p.id === id) || null;
}

/**
 * Save a recommendation to history
 */
export function saveRecommendation(rec: CoachRecommendation): CoachMemory {
  const memory = initializeMemory();

  // Keep only last 20 recommendations
  memory.savedRecommendations.unshift(rec);
  if (memory.savedRecommendations.length > 20) {
    memory.savedRecommendations = memory.savedRecommendations.slice(0, 20);
  }

  saveMemory(memory);
  return memory;
}

/**
 * Get recommendation history (for current mode)
 */
export function getRecommendationHistory(type?: string): CoachRecommendation[] {
  const memory = initializeMemory();

  if (!type) return memory.savedRecommendations;

  return memory.savedRecommendations.filter(r => r.type === type);
}

/**
 * Add or update a user goal
 */
export function updateGoals(goals: GrowingGoal[]): CoachMemory {
  const memory = initializeMemory();
  memory.userGoals = goals;
  saveMemory(memory);
  return memory;
}

/**
 * Add a favorite species/substrate/page
 */
export function addFavorite(slug: string): CoachMemory {
  const memory = initializeMemory();

  if (!memory.userProfile.favorites.includes(slug)) {
    memory.userProfile.favorites.push(slug);
    saveMemory(memory);
  }

  return memory;
}

/**
 * Remove a favorite
 */
export function removeFavorite(slug: string): CoachMemory {
  const memory = initializeMemory();
  memory.userProfile.favorites = memory.userProfile.favorites.filter(
    f => f !== slug
  );
  saveMemory(memory);
  return memory;
}

/**
 * Add an interest/semantic tag
 */
export function addInterest(tag: string): CoachMemory {
  const memory = initializeMemory();

  if (!memory.userProfile.interests.includes(tag)) {
    memory.userProfile.interests.push(tag);
    saveMemory(memory);
  }

  return memory;
}

/**
 * Update preferences
 */
export function updatePreferences(updates: Partial<CoachMemory['preferences']>): CoachMemory {
  const memory = initializeMemory();
  memory.preferences = { ...memory.preferences, ...updates };
  saveMemory(memory);
  return memory;
}

/**
 * Record completion of a learning path
 */
export function recordPathCompletion(): CoachMemory {
  const memory = initializeMemory();
  memory.statistics.learningPathsCompleted += 1;
  saveMemory(memory);
  return memory;
}

/**
 * Record issue resolution
 */
export function recordIssueResolution(): CoachMemory {
  const memory = initializeMemory();
  memory.statistics.issuesResolved += 1;
  saveMemory(memory);
  return memory;
}

/**
 * Clear all memory (destructive)
 */
export function clearMemory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear coach memory:', e);
  }
}

/**
 * Export memory as JSON for backup
 */
export function exportMemory(): string {
  const memory = initializeMemory();
  return JSON.stringify(memory, null, 2);
}

/**
 * Import memory from JSON
 */
export function importMemory(json: string): boolean {
  try {
    const data = JSON.parse(json);
    const memory = parseMemory(data);
    saveMemory(memory);
    return true;
  } catch (e) {
    console.warn('Failed to import coach memory:', e);
    return false;
  }
}

/**
 * Get memory summary for display
 */
export function getMemorySummary() {
  const memory = initializeMemory();

  return {
    skillLevel: memory.userProfile.skillLevel,
    favoriteCount: memory.userProfile.favorites.length,
    activePlans: memory.savedPlans.filter(p => p.status === 'active').length,
    totalSessions: memory.statistics.sessionsCount,
    issuesResolved: memory.statistics.issuesResolved,
    pathsCompleted: memory.statistics.learningPathsCompleted,
    lastSessionDate: memory.lastSession?.timestamp,
  };
}
