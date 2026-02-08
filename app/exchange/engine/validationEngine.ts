'use client';

import { RawContribution, ValidationResult } from './exchangeTypes';
import { exchangeLog } from './exchangeLog';

class ValidationEngine {
  validate(contrib: RawContribution): ValidationResult {
    const issues: string[] = [];
    const tags: string[] = [];

    if (!contrib.species) issues.push('Missing species');
    if (contrib.payload && Object.keys(contrib.payload).length === 0) issues.push('Empty payload');

    if (this.detectHallucination(contrib)) issues.push('Potential hallucination');
    if (this.unsupportedSpecies(contrib)) issues.push('Unsupported species');
    if (this.insufficientDensity(contrib)) issues.push('Insufficient data density');
    if (this.conflicts(contrib)) issues.push('Conflicts with existing insight');

    const confidence = Math.max(0, 1 - issues.length * 0.15);
    const status: ValidationResult['status'] = issues.length > 0 ? 'rejected' : 'accepted';

    const result: ValidationResult = {
      contributionId: contrib.id,
      confidence,
      status,
      issues,
      tags,
    };

    exchangeLog.add({
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      category: 'validation',
      message: `Validation ${status}`,
      context: { id: contrib.id, issues },
    });

    return result;
  }

  private detectHallucination(contrib: RawContribution): boolean {
    const text = JSON.stringify(contrib.payload).toLowerCase();
    return text.includes('magic') || text.includes('instant');
  }

  private unsupportedSpecies(contrib: RawContribution): boolean {
    const allowed = ['oyster', 'shiitake', 'lions-mane', 'reishi', 'turkey-tail', 'pioppino', 'king-oyster', 'enoki'];
    return !!contrib.species && !allowed.includes(contrib.species);
  }

  private insufficientDensity(contrib: RawContribution): boolean {
    const metrics = contrib.payload?.metrics;
    if (!metrics || typeof metrics.count !== 'number') return true;
    return metrics.count < 5;
  }

  private conflicts(_contrib: RawContribution): boolean {
    // Placeholder: would compare against knowledge graph
    return false;
  }
}

export const validationEngine = new ValidationEngine();
