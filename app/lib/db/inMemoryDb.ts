/**
 * In-Memory Database Stub
 * 
 * Lightweight in-memory data store for development/testing.
 * In production, replace with actual database (PostgreSQL, MongoDB, etc.)
 */

interface DbRecord {
  id: string;
  [key: string]: any;
}

class InMemoryDb {
  private tables: Map<string, Map<string, DbRecord>> = new Map();

  /**
   * Initialize a table
   */
  private ensureTable(tableName: string): void {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
    }
  }

  /**
   * Insert a record
   */
  insert(tableName: string, record: DbRecord): DbRecord {
    this.ensureTable(tableName);
    const table = this.tables.get(tableName)!;
    table.set(record.id, record);
    return record;
  }

  /**
   * Find record by ID
   */
  findById(tableName: string, id: string): DbRecord | undefined {
    this.ensureTable(tableName);
    return this.tables.get(tableName)?.get(id);
  }

  /**
   * Update a record
   */
  update(tableName: string, id: string, updates: Partial<DbRecord>): DbRecord | undefined {
    this.ensureTable(tableName);
    const record = this.tables.get(tableName)?.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates };
    this.tables.get(tableName)?.set(id, updated);
    return updated;
  }

  /**
   * Find records by query
   */
  find(tableName: string, query: Record<string, any>): DbRecord[] {
    this.ensureTable(tableName);
    const records = Array.from(this.tables.get(tableName)?.values() || []);
    return records.filter(record => {
      return Object.entries(query).every(([key, value]) => record[key] === value);
    });
  }

  /**
   * Get all records from table
   */
  all(tableName: string): DbRecord[] {
    this.ensureTable(tableName);
    return Array.from(this.tables.get(tableName)?.values() || []);
  }
}

export const db = new InMemoryDb();
