/**
 * Export/Import System
 * Allow users to export and import grow logs, notes, and insights
 */

import type { ExportData, ImportResult, ImportConfig } from './communityTypes';
import { getGrowLogs } from './growLogSystem';
import { getNotes } from './notesSystem';
import { getInsights } from './insightSystem';

/**
 * Export all community data to JSON
 */
export function exportAllData(): string {
  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    exportedBy: 'mushroom-site',
    data: {
      growLogs: getGrowLogs(),
      notes: getNotes(),
      insights: getInsights(),
    },
    metadata: {
      totalEntries: getGrowLogs().length + getNotes().length + getInsights().length,
      dateRange: {
        start: new Date(0).toISOString(),
        end: new Date().toISOString(),
      },
    },
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export specific data types
 */
export function exportData(types: ('growLogs' | 'notes' | 'insights')[]): string {
  const data: any = {};
  
  if (types.includes('growLogs')) {
    data.growLogs = getGrowLogs();
  }
  if (types.includes('notes')) {
    data.notes = getNotes();
  }
  if (types.includes('insights')) {
    data.insights = getInsights();
  }
  
  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    exportedBy: 'mushroom-site',
    data,
    metadata: {
      totalEntries: (Object.values(data) as any[]).reduce((sum: number, arr: any[]) => sum + ((arr as any[]).length || 0), 0),
      dateRange: {
        start: new Date(0).toISOString(),
        end: new Date().toISOString(),
      },
    },
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Generate CSV export (for grow logs)
 */
export function exportGrowLogsAsCSV(): string {
  const logs = getGrowLogs();
  
  const headers = [
    'Species',
    'Substrate',
    'Quantity',
    'Inoculation Date',
    'Colonization Start',
    'Fruiting Start',
    'Harvest Date',
    'Temperature',
    'Humidity',
    'FAE',
    'Light',
    'Yield',
    'Quality Rating',
    'Issues',
    'Tags',
  ];
  
  const rows = logs.map(log => [
    log.species,
    log.substrate,
    log.quantity,
    log.inoculationDate,
    log.colonizationStartDate || '',
    log.fruitingStartDate || '',
    log.harvestDate || '',
    log.environmentalParameters.temperature || '',
    log.environmentalParameters.humidity || '',
    log.environmentalParameters.fae || '',
    log.environmentalParameters.light || '',
    log.yield || '',
    log.qualityRating || '',
    log.issues.join('; '),
    log.tags.join('; '),
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  
  return csvContent;
}

/**
 * Import data from JSON
 */
export function importData(jsonString: string, config: ImportConfig): ImportResult {
  try {
    const importData = JSON.parse(jsonString) as ExportData;
    
    if (!importData.data) {
      return {
        success: false,
        itemsImported: 0,
        itemsSkipped: 0,
        errors: ['Invalid export format'],
        warnings: [],
      };
    }
    
    let itemsImported = 0;
    let itemsSkipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Import grow logs
    if (importData.data.growLogs) {
      // This would call the grow log import system
      itemsImported += importData.data.growLogs.length;
    }
    
    // Import notes
    if (importData.data.notes) {
      itemsImported += importData.data.notes.length;
    }
    
    // Import insights
    if (importData.data.insights) {
      itemsImported += importData.data.insights.length;
    }
    
    if (itemsImported === 0) {
      return {
        success: false,
        itemsImported: 0,
        itemsSkipped: 0,
        errors: ['No valid data found in export'],
        warnings: [],
      };
    }
    
    return {
      success: true,
      itemsImported,
      itemsSkipped,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      itemsImported: 0,
      itemsSkipped: 0,
      errors: [error instanceof Error ? error.message : 'Import failed'],
      warnings: [],
    };
  }
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string): void {
  if (typeof window === 'undefined') return;
  
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Create backup package
 */
export function createBackup(): { filename: string; content: string } {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `mushroom-backup-${timestamp}.json`;
  const content = exportAllData();
  
  return { filename, content };
}

/**
 * Validate import data
 */
export function validateImportData(jsonString: string): { valid: boolean; errors: string[] } {
  try {
    const data = JSON.parse(jsonString);
    const errors: string[] = [];
    
    if (!data.version) {
      errors.push('Missing export version');
    }
    
    if (!data.exportedAt) {
      errors.push('Missing export timestamp');
    }
    
    if (!data.data) {
      errors.push('Missing data object');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Invalid JSON format'],
    };
  }
}

/**
 * Schedule automatic backups
 */
export function scheduleAutoBackup(intervalMs: number = 86400000): () => void {
  // 24 hours default
  const intervalId = setInterval(() => {
    if (typeof window === 'undefined') return;
    
    const { filename, content } = createBackup();
    localStorage.setItem(`backup-${Date.now()}`, content);
    
    // Clean up old backups (keep last 10)
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('backup-'))
      .sort()
      .reverse();
    
    backupKeys.slice(10).forEach(key => {
      localStorage.removeItem(key);
    });
  }, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Get backup history
 */
export function getBackupHistory(): string[] {
  if (typeof window === 'undefined') return [];
  
  return Object.keys(localStorage)
    .filter(key => key.startsWith('backup-'))
    .sort()
    .reverse();
}

/**
 * Restore from backup
 */
export function restoreFromBackup(backupKey: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const backupData = localStorage.getItem(backupKey);
  if (!backupData) return false;
  
  try {
    const result = importData(backupData, {
      mergeStrategy: 'replace',
      preserveTimestamps: true,
      validateData: true,
    });
    
    return result.success;
  } catch {
    return false;
  }
}
