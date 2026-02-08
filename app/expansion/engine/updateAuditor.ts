import { AuditRecord, DiffChunk, DiffLine, UpdateAuditorAPI } from './expansionTypes';

interface PersistedAuditRecord extends AuditRecord {
  lastModified: string;
}

class UpdateAuditor implements UpdateAuditorAPI {
  private records: PersistedAuditRecord[] = [];
  private seq = 0;

  recordGeneration(targetPath: string, action: AuditRecord['action'], summary: string, diff?: DiffChunk[]): AuditRecord {
    const id = `audit-${++this.seq}`;
    const now = new Date().toISOString();
    const record: PersistedAuditRecord = {
      id,
      targetPath,
      action,
      status: 'pending',
      summary,
      diff,
      generatedAt: now,
      lastModified: now,
      actor: 'expansion-engine',
    };
    this.records.push(record);
    // Persist to localStorage if available
    if (typeof window !== 'undefined') {
      this.persistRecords();
    }
    return record;
  }

  listRecords(): AuditRecord[] {
    return this.records.map(({ lastModified, ...rest }) => rest);
  }

  markStatus(id: string, status: AuditRecord['status']): AuditRecord | undefined {
    const record = this.records.find((r) => r.id === id);
    if (record) {
      record.status = status;
      record.lastModified = new Date().toISOString();
      if (typeof window !== 'undefined') {
        this.persistRecords();
      }
    }
    return record ? { ...record, lastModified: undefined as any } : undefined;
  }

  private persistRecords(): void {
    try {
      const json = JSON.stringify(this.records);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('expansion-audit-records', json);
      }
    } catch (e) {
      console.warn('Failed to persist audit records:', e);
    }
  }

  loadRecords(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const json = localStorage.getItem('expansion-audit-records');
        if (json) {
          this.records = JSON.parse(json);
          const maxSeq = this.records.reduce((acc, r) => {
            const num = parseInt(r.id.replace('audit-', ''), 10);
            return Math.max(acc, isNaN(num) ? 0 : num);
          }, 0);
          this.seq = maxSeq;
        }
      }
    } catch (e) {
      console.warn('Failed to load audit records:', e);
    }
  }

  clearRecords(): void {
    this.records = [];
    this.seq = 0;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('expansion-audit-records');
    }
  }

  exportRecords(): string {
    return JSON.stringify(this.records, null, 2);
  }

  diffText(base: string, next: string): DiffChunk[] {
    const baseLines = base.split('\n');
    const nextLines = next.split('\n');
    const max = Math.max(baseLines.length, nextLines.length);
    const lines: DiffLine[] = [];

    for (let i = 0; i < max; i++) {
      const before = baseLines[i];
      const after = nextLines[i];
      if (before === after) {
        if (before !== undefined) lines.push({ type: 'context', value: before });
      } else {
        if (before !== undefined) lines.push({ type: 'remove', value: before });
        if (after !== undefined) lines.push({ type: 'add', value: after });
      }
    }

    return [{ header: 'proposed changes', lines }];
  }
}

export const updateAuditor = new UpdateAuditor();
