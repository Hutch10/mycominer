/**
 * Grow Log System (Client-Side)
 * Track species, substrates, environmental parameters, observations, and outcomes
 */

import type { GrowLogEntry, GrowLogStats, GrowLogFilter, ValidationResult } from './communityTypes';

const STORAGE_KEY = 'mushroom-grow-logs';

/**
 * Initialize or retrieve grow logs from localStorage
 */
export function getGrowLogs(): GrowLogEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save grow logs to localStorage
 */
export function saveGrowLogs(logs: GrowLogEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

/**
 * Create a new grow log
 */
export function createGrowLog(entry: Omit<GrowLogEntry, 'id' | 'createdAt' | 'updatedAt'>): GrowLogEntry {
  const newEntry: GrowLogEntry = {
    ...entry,
    id: `log-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const logs = getGrowLogs();
  logs.unshift(newEntry);
  saveGrowLogs(logs);
  
  return newEntry;
}

/**
 * Update an existing grow log
 */
export function updateGrowLog(id: string, updates: Partial<GrowLogEntry>): GrowLogEntry | null {
  const logs = getGrowLogs();
  const log = logs.find(l => l.id === id);
  
  if (!log) return null;
  
  const updated: GrowLogEntry = {
    ...log,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  const index = logs.findIndex(l => l.id === id);
  logs[index] = updated;
  saveGrowLogs(logs);
  
  return updated;
}

/**
 * Delete a grow log
 */
export function deleteGrowLog(id: string): boolean {
  const logs = getGrowLogs();
  const filtered = logs.filter(l => l.id !== id);
  
  if (filtered.length === logs.length) return false;
  
  saveGrowLogs(filtered);
  return true;
}

/**
 * Get a single grow log by ID
 */
export function getGrowLogById(id: string): GrowLogEntry | null {
  const logs = getGrowLogs();
  return logs.find(l => l.id === id) || null;
}

/**
 * Filter grow logs
 */
export function filterGrowLogs(filter: GrowLogFilter): GrowLogEntry[] {
  let logs = getGrowLogs();
  
  if (filter.species) {
    logs = logs.filter(l => l.species === filter.species);
  }
  
  if (filter.substrate) {
    logs = logs.filter(l => l.substrate === filter.substrate);
  }
  
  if (filter.tags && filter.tags.length > 0) {
    logs = logs.filter(l => 
      filter.tags!.some(tag => l.tags.includes(tag))
    );
  }
  
  if (filter.minQuality !== undefined) {
    logs = logs.filter(l => (l.qualityRating || 0) >= (filter.minQuality as number));
  }
  
  if (filter.dateRange) {
    const start = new Date(filter.dateRange.start).getTime();
    const end = new Date(filter.dateRange.end).getTime();
    logs = logs.filter(l => {
      const logDate = new Date(l.inoculationDate).getTime();
      return logDate >= start && logDate <= end;
    });
  }
  
  if (filter.isPrivate !== undefined) {
    logs = logs.filter(l => l.isPrivate === filter.isPrivate);
  }
  
  return logs;
}

/**
 * Get grow log statistics
 */
export function getGrowLogStats(): GrowLogStats {
  const logs = getGrowLogs();
  
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      totalYield: 0,
      successRate: 0,
      favoriteSpecies: '',
      favoriteyields: 0,
      averageQualityRating: 0,
      mostUsedSubstrate: '',
    };
  }
  
  // Count by species
  const speciesCounts: Record<string, number> = {};
  const substrateCounts: Record<string, number> = {};
  let totalYield = 0;
  let totalQuality = 0;
  let qualityCount = 0;
  let successCount = 0;
  
  logs.forEach(log => {
    speciesCounts[log.species] = (speciesCounts[log.species] || 0) + 1;
    substrateCounts[log.substrate] = (substrateCounts[log.substrate] || 0) + 1;
    
    if (log.yield) totalYield += log.yield;
    if (log.qualityRating) {
      totalQuality += log.qualityRating;
      qualityCount++;
    }
    if (log.qualityRating && log.qualityRating >= 4) {
      successCount++;
    }
  });
  
  const favoriteSpecies = Object.entries(speciesCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  const mostUsedSubstrate = Object.entries(substrateCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  
  return {
    totalLogs: logs.length,
    totalYield,
    successRate: (successCount / logs.length) * 100,
    favoriteSpecies,
    favoriteyields: logs.filter(l => l.species === favoriteSpecies).reduce((sum, l) => sum + (l.yield || 0), 0),
    averageQualityRating: qualityCount > 0 ? totalQuality / qualityCount : 0,
    mostUsedSubstrate,
  };
}

/**
 * Get all unique species from grow logs
 */
export function getLoggedSpecies(): string[] {
  const logs = getGrowLogs();
  return [...new Set(logs.map(l => l.species))];
}

/**
 * Get all unique substrates from grow logs
 */
export function getLoggedSubstrates(): string[] {
  const logs = getGrowLogs();
  return [...new Set(logs.map(l => l.substrate))];
}

/**
 * Get all tags from grow logs
 */
export function getLogTags(): string[] {
  const logs = getGrowLogs();
  const allTags = logs.flatMap(l => l.tags);
  return [...new Set(allTags)];
}

/**
 * Link a grow log to a page
 */
export function linkLogToPage(logId: string, pageSlug: string): GrowLogEntry | null {
  const log = getGrowLogById(logId);
  if (!log) return null;
  
  if (!log.linkedPages) log.linkedPages = [];
  if (!log.linkedPages.includes(pageSlug)) {
    log.linkedPages.push(pageSlug);
  }
  
  return updateGrowLog(logId, { linkedPages: log.linkedPages });
}

/**
 * Get grow logs linked to a page
 */
export function getLogsForPage(pageSlug: string): GrowLogEntry[] {
  const logs = getGrowLogs();
  return logs.filter(l => l.linkedPages?.includes(pageSlug));
}

/**
 * Validate grow log entry
 */
export function validateGrowLog(log: Partial<GrowLogEntry>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!log.species) errors.push('Species is required');
  if (!log.substrate) errors.push('Substrate is required');
  if (!log.inoculationDate) errors.push('Inoculation date is required');
  if (log.quantity && log.quantity <= 0) errors.push('Quantity must be greater than 0');
  
  if (log.harvestDate && log.inoculationDate) {
    const inocDate = new Date(log.inoculationDate).getTime();
    const harvestDate = new Date(log.harvestDate).getTime();
    if (harvestDate <= inocDate) {
      warnings.push('Harvest date should be after inoculation date');
    }
  }
  
  if (log.observations && log.observations.length > 5000) {
    warnings.push('Observations are quite long; consider keeping them concise');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Export grow logs to JSON
 */
export function exportGrowLogs(logsToExport?: GrowLogEntry[]): string {
  const logs = logsToExport || getGrowLogs();
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: logs,
    metadata: {
      totalLogs: logs.length,
      dateRange: logs.length > 0
        ? {
            start: logs[logs.length - 1].inoculationDate,
            end: logs[0].inoculationDate,
          }
        : null,
    },
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Import grow logs from JSON
 */
export function importGrowLogs(jsonData: string, mergeStrategy: 'replace' | 'merge' = 'merge'): { success: boolean; count: number; errors: string[] } {
  try {
    const data = JSON.parse(jsonData);
    const importedLogs = data.data || [];
    
    if (mergeStrategy === 'replace') {
      saveGrowLogs(importedLogs);
      return { success: true, count: importedLogs.length, errors: [] };
    } else {
      const existing = getGrowLogs();
      const merged = [...existing, ...importedLogs];
      saveGrowLogs(merged);
      return { success: true, count: importedLogs.length, errors: [] };
    }
  } catch (error) {
    return {
      success: false,
      count: 0,
      errors: [error instanceof Error ? error.message : 'Import failed'],
    };
  }
}
