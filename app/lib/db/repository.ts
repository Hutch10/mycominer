import { getSupabaseAdmin } from '../supabase/admin';
import type { Database, Json } from '../supabase/database.types';
import type { AuditContext } from './auditContext';
import {
  decodeCursor,
  encodeCursor,
  type PaginatedResult,
  type PaginationParams,
} from './pagination';
import { shouldUseInMemoryPersistence } from './persistenceBackend';
import { db as memoryDb } from './inMemoryDb';

const schema = () => getSupabaseAdmin().schema('mycominer');

type WorkflowRow = Database['mycominer']['Tables']['workflows']['Row'];
type WorkflowRunRow = Database['mycominer']['Tables']['workflow_runs']['Row'];

function toWorkflowRecord(row: WorkflowRow) {
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    description: row.description ?? undefined,
    steps: row.steps as Array<{ id: string; type: string; config?: Record<string, unknown> }>,
    enabled: row.enabled,
    createdAt: row.created_at,
  };
}

function toWorkflowRunRecord(row: WorkflowRunRow) {
  return {
    id: row.id,
    orgId: row.org_id,
    workflowId: row.workflow_id,
    status: row.status,
    input: row.input as Record<string, unknown>,
    scheduledAt: row.scheduled_at,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    createdAt: row.created_at,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function memoryInsertAudit(
  audit: AuditContext,
  entry: {
    eventType: string;
    workflowId?: string;
    runId?: string;
    payload?: Record<string, unknown>;
  }
) {
  memoryDb.insert('orchestration_log', {
    id: crypto.randomUUID(),
    eventType: entry.eventType,
    workflowId: entry.workflowId,
    runId: entry.runId,
    actorId: audit.userId,
    requestId: audit.requestId,
    payload: entry.payload ?? {},
    timestamp: new Date().toISOString(),
  });
}

function memoryCreateWorkflowWithLog(
  orgId: string,
  data: {
    id?: string;
    name: string;
    description?: string;
    steps: Array<{ id: string; type: string; config?: Record<string, unknown> }>;
    enabled?: boolean;
  },
  audit: AuditContext
) {
  const id = data.id ?? crypto.randomUUID();
  const saved = memoryDb.insert('workflows', {
    ...data,
    id,
    orgId,
    createdAt: new Date().toISOString(),
  });
  memoryInsertAudit(audit, {
    eventType: 'workflow_created',
    workflowId: String(saved.id),
    payload: saved as Record<string, unknown>,
  });
  return saved;
}

function memoryScheduleRunWithLog(
  orgId: string,
  data: {
    workflowId: string;
    input?: Record<string, unknown>;
    runId?: string;
  },
  audit: AuditContext
) {
  const workflow = memoryDb.find('workflows', { id: data.workflowId, orgId });
  if (workflow.length === 0) {
    throw new Error('workflow_not_found');
  }

  const id = data.runId ?? crypto.randomUUID();
  const run = memoryDb.insert('workflow_runs', {
    id,
    orgId,
    workflowId: data.workflowId,
    status: 'scheduled',
    input: data.input ?? {},
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  memoryInsertAudit(audit, {
    eventType: 'run_scheduled',
    workflowId: data.workflowId,
    runId: String(run.id),
    payload: { input: data.input ?? {} },
  });
  return run;
}

function memoryCancelRunWithLog(orgId: string, runId: string, audit: AuditContext) {
  const existing = memoryDb.findById('workflow_runs', runId) as
    | { orgId?: string; workflowId?: string }
    | undefined;
  if (!existing || existing.orgId !== orgId) {
    return null;
  }

  const run = memoryDb.update('workflow_runs', runId, {
    status: 'cancelling',
    cancelledAt: new Date().toISOString(),
  });
  if (!run) {
    return null;
  }

  memoryInsertAudit(audit, {
    eventType: 'run_cancel_requested',
    workflowId: String(existing.workflowId),
    runId,
    payload: { requestedAt: new Date().toISOString() },
  });
  return run;
}

export const db = {
  async recordAuditEvent(
    audit: AuditContext,
    event: {
      eventType: string;
      workflowId?: string;
      runId?: string;
      payload?: Record<string, unknown>;
    }
  ) {
    if (shouldUseInMemoryPersistence()) {
      return memoryInsertAudit(audit, event);
    }

    const { error } = await schema().from('orchestration_log').insert({
      event_type: event.eventType,
      workflow_id: event.workflowId ?? null,
      run_id: event.runId ?? null,
      actor_id: audit.userId,
      request_id: audit.requestId,
      payload: (event.payload ?? {}) as Json,
    });

    if (error) throw error;
  },

  async createWorkflowWithLog(
    orgId: string,
    data: {
      id?: string;
      name: string;
      description?: string;
      steps: Array<{ id: string; type: string; config?: Record<string, unknown> }>;
      enabled?: boolean;
    },
    audit: AuditContext
  ) {
    if (shouldUseInMemoryPersistence()) {
      return memoryCreateWorkflowWithLog(orgId, data, audit);
    }

    const workflowId = data.id && isUuid(data.id) ? data.id : null;
    const { data: result, error } = await schema().rpc('create_workflow_with_log', {
      p_org_id: orgId,
      p_name: data.name,
      p_description: data.description ?? null,
      p_steps: data.steps as Json,
      p_enabled: data.enabled ?? true,
      p_workflow_id: workflowId,
      p_actor_id: audit.userId,
      p_request_id: audit.requestId,
      p_payload: data as unknown as Json,
    });

    if (error) throw error;
    return toWorkflowRecord(result as WorkflowRow);
  },

  async findWorkflowById(orgId: string, id: string) {
    if (shouldUseInMemoryPersistence()) {
      const row = memoryDb.findById('workflows', id);
      if (!row || row.orgId !== orgId) {
        return undefined;
      }
      return row;
    }

    const { data, error } = await schema()
      .from('workflows')
      .select()
      .eq('id', id)
      .eq('org_id', orgId)
      .maybeSingle();

    if (error) throw error;
    return data ? toWorkflowRecord(data) : undefined;
  },

  async workflowExists(orgId: string, id: string) {
    if (shouldUseInMemoryPersistence()) {
      const row = memoryDb.findById('workflows', id);
      return Boolean(row && row.orgId === orgId);
    }

    const { data, error } = await schema()
      .from('workflows')
      .select('id')
      .eq('id', id)
      .eq('org_id', orgId)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  },

  async scheduleRunWithLog(
    orgId: string,
    data: {
      workflowId: string;
      input?: Record<string, unknown>;
      runId?: string;
    },
    audit: AuditContext
  ) {
    if (shouldUseInMemoryPersistence()) {
      return memoryScheduleRunWithLog(orgId, data, audit);
    }

    const runId = data.runId && isUuid(data.runId) ? data.runId : null;
    const { data: result, error } = await schema().rpc('schedule_run_with_log', {
      p_org_id: orgId,
      p_workflow_id: data.workflowId,
      p_input: (data.input ?? {}) as Json,
      p_run_id: runId,
      p_actor_id: audit.userId,
      p_request_id: audit.requestId,
    });

    if (error) {
      if (error.message.includes('workflow_not_found')) {
        throw new Error('workflow_not_found');
      }
      throw error;
    }

    return toWorkflowRunRecord(result as WorkflowRunRow);
  },

  async cancelRunWithLog(orgId: string, runId: string, audit: AuditContext) {
    if (shouldUseInMemoryPersistence()) {
      return memoryCancelRunWithLog(orgId, runId, audit);
    }

    const { data: result, error } = await schema().rpc('cancel_run_with_log', {
      p_org_id: orgId,
      p_run_id: runId,
      p_actor_id: audit.userId,
      p_request_id: audit.requestId,
    });

    if (error) {
      if (error.message.includes('run_not_found')) {
        return null;
      }
      throw error;
    }

    return toWorkflowRunRecord(result as WorkflowRunRow);
  },

  async findWorkflowRunById(orgId: string, id: string) {
    if (shouldUseInMemoryPersistence()) {
      const row = memoryDb.findById('workflow_runs', id);
      if (!row || row.orgId !== orgId) {
        return undefined;
      }
      return row;
    }

    const { data, error } = await schema()
      .from('workflow_runs')
      .select()
      .eq('id', id)
      .eq('org_id', orgId)
      .maybeSingle();

    if (error) throw error;
    return data ? toWorkflowRunRecord(data) : undefined;
  },

  async listWorkflowRuns(
    orgId: string,
    workflowId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<ReturnType<typeof toWorkflowRunRecord>>> {
    const workflow = await this.findWorkflowById(orgId, workflowId);
    if (!workflow) {
      return { items: [], hasMore: false, nextCursor: null };
    }

    if (shouldUseInMemoryPersistence()) {
      const all = memoryDb
        .find('workflow_runs', { workflowId, orgId })
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      const slice = all.slice(0, pagination.limit + 1);
      const hasMore = slice.length > pagination.limit;
      const items = slice.slice(0, pagination.limit).map((row) => ({
        id: String(row.id),
        orgId: String(row.orgId),
        workflowId: String(row.workflowId),
        status: String(row.status),
        input: (row.input as Record<string, unknown>) ?? {},
        scheduledAt: String(row.scheduledAt),
        startedAt: row.startedAt ? String(row.startedAt) : undefined,
        completedAt: row.completedAt ? String(row.completedAt) : undefined,
        cancelledAt: row.cancelledAt ? String(row.cancelledAt) : undefined,
        createdAt: String(row.createdAt ?? row.scheduledAt),
      }));
      const last = items[items.length - 1];
      return {
        items,
        hasMore,
        nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
      };
    }

    let query = schema()
      .from('workflow_runs')
      .select()
      .eq('workflow_id', workflowId)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(pagination.limit + 1);

    if (pagination.cursor) {
      const decoded = decodeCursor(pagination.cursor);
      if (decoded) {
        query = query.or(
          `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`
        );
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = data ?? [];
    const hasMore = rows.length > pagination.limit;
    const page = rows.slice(0, pagination.limit).map(toWorkflowRunRecord);
    const last = page[page.length - 1];

    return {
      items: page,
      hasMore,
      nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
    };
  },

  async beginMarketplaceCheckout(
    record: {
      org_id: string;
      item_id: string;
      gross: number;
      fees: number;
      taxes: number;
      net: number;
      idempotency_key: string;
    },
    audit: AuditContext
  ) {
    if (shouldUseInMemoryPersistence()) {
      const existing = memoryDb
        .all('marketplace_checkout_sessions')
        .find(
          (row) =>
            row.org_id === record.org_id && row.idempotency_key === record.idempotency_key
        );
      if (existing) {
        return existing;
      }
      const session = memoryDb.insert('marketplace_checkout_sessions', {
        id: crypto.randomUUID(),
        ...record,
        status: 'pending',
        charge_id: null,
        revenue_id: null,
        createdAt: new Date().toISOString(),
      });
      memoryInsertAudit(audit, {
        eventType: 'marketplace_checkout_started',
        payload: { session_id: session.id, item_id: record.item_id },
      });
      return session;
    }

    const { data, error } = await schema().rpc('begin_marketplace_checkout', {
      p_org_id: record.org_id,
      p_item_id: record.item_id,
      p_gross: record.gross,
      p_fees: record.fees,
      p_taxes: record.taxes,
      p_net: record.net,
      p_idempotency_key: record.idempotency_key,
      p_actor_id: audit.userId,
      p_request_id: audit.requestId,
    });
    if (error) throw error;
    return data as Record<string, unknown>;
  },

  async recordMarketplaceCharge(
    orgId: string,
    sessionId: string,
    chargeId: string,
    audit: AuditContext
  ) {
    if (shouldUseInMemoryPersistence()) {
      const updated = memoryDb.update('marketplace_checkout_sessions', sessionId, {
        status: 'charged',
        charge_id: chargeId,
      });
      if (!updated) throw new Error('checkout_session_not_found');
      memoryInsertAudit(audit, {
        eventType: 'marketplace_charge_recorded',
        payload: { session_id: sessionId, charge_id: chargeId },
      });
      return updated;
    }

    const { data, error } = await schema().rpc('record_marketplace_charge', {
      p_org_id: orgId,
      p_session_id: sessionId,
      p_charge_id: chargeId,
      p_actor_id: audit.userId,
      p_request_id: audit.requestId,
    });
    if (error) throw error;
    return data as Record<string, unknown>;
  },

  async completeMarketplaceCheckout(
    orgId: string,
    sessionId: string,
    audit: AuditContext,
    options: {
      developer_id?: string | null;
      period: string;
      payload?: Record<string, unknown>;
    }
  ) {
    if (shouldUseInMemoryPersistence()) {
      const session = memoryDb.findById('marketplace_checkout_sessions', sessionId);
      if (!session || session.org_id !== orgId) {
        throw new Error('checkout_session_not_found');
      }
      if (session.status === 'completed' && session.revenue_id) {
        const revenue = memoryDb.findById('marketplace_revenue', String(session.revenue_id));
        return { session, revenue, idempotentReplay: true };
      }
      if (!session.charge_id) {
        throw new Error('checkout_not_charged');
      }

      const rev = memoryDb.insert('marketplace_revenue', {
        id: crypto.randomUUID(),
        item_id: session.item_id,
        org_id: orgId,
        gross: session.gross,
        fees: session.fees,
        taxes: session.taxes,
        net: session.net,
        period: options.period,
        idempotency_key: session.idempotency_key,
        createdAt: new Date().toISOString(),
      });
      const updatedSession = memoryDb.update('marketplace_checkout_sessions', sessionId, {
        status: 'completed',
        revenue_id: rev.id,
      });
      memoryInsertAudit(audit, {
        eventType: 'marketplace_revenue_recorded',
        payload: {
          ...(options.payload ?? {}),
          revenue_id: rev.id,
          session_id: sessionId,
          charge_id: session.charge_id,
        },
      });
      return { session: updatedSession, revenue: rev, idempotentReplay: false };
    }

    const { data, error } = await schema().rpc('complete_marketplace_checkout', {
      p_org_id: orgId,
      p_session_id: sessionId,
      p_developer_id: options.developer_id ?? null,
      p_period: options.period,
      p_actor_id: audit.userId,
      p_request_id: audit.requestId,
      p_payload: (options.payload ?? {}) as Json,
    });
    if (error) throw error;

    const parsed = data as {
      session: Record<string, unknown>;
      revenue: Database['mycominer']['Tables']['marketplace_revenue']['Row'];
      idempotent_replay: boolean;
    };
    return {
      session: parsed.session,
      revenue: parsed.revenue,
      idempotentReplay: parsed.idempotent_replay,
    };
  },

  async markCheckoutNeedsReconciliation(
    orgId: string,
    sessionId: string,
    failureReason: string,
    audit: AuditContext
  ) {
    if (shouldUseInMemoryPersistence()) {
      const updated = memoryDb.update('marketplace_checkout_sessions', sessionId, {
        status: 'needs_reconciliation',
        failure_reason: failureReason,
      });
      if (!updated) return null;
      memoryInsertAudit(audit, {
        eventType: 'marketplace_checkout_needs_reconciliation',
        payload: {
          session_id: sessionId,
          charge_id: updated.charge_id,
          failure_reason: failureReason,
        },
      });
      return updated;
    }

    const { data, error } = await schema().rpc('mark_checkout_needs_reconciliation', {
      p_org_id: orgId,
      p_session_id: sessionId,
      p_failure_reason: failureReason,
      p_actor_id: audit.userId,
      p_request_id: audit.requestId,
    });
    if (error) throw error;
    return data as Record<string, unknown>;
  },

  /** @deprecated Use begin/record/complete checkout session flow */
  async checkoutMarketplaceWithLog(
    record: {
      item_id: string;
      org_id: string;
      developer_id?: string | null;
      gross: number;
      fees: number;
      taxes: number;
      net: number;
      period: string;
      idempotency_key?: string | null;
    },
    audit: AuditContext,
    payload?: Record<string, unknown>
  ) {
    if (shouldUseInMemoryPersistence()) {
      if (record.idempotency_key) {
        const existing = memoryDb
          .all('marketplace_revenue')
          .find(
            (row) =>
              row.org_id === record.org_id && row.idempotency_key === record.idempotency_key
          );
        if (existing) {
          return { revenue: existing, idempotentReplay: true };
        }
      }

      const rev = memoryDb.insert('marketplace_revenue', {
        id: crypto.randomUUID(),
        ...record,
        createdAt: new Date().toISOString(),
      });
      memoryInsertAudit(audit, {
        eventType: 'marketplace_revenue_recorded',
        payload: { ...(payload ?? {}), revenue_id: rev.id },
      });
      return { revenue: rev, idempotentReplay: false };
    }

    const { data: result, error } = await schema().rpc('checkout_marketplace_with_log', {
      p_org_id: record.org_id,
      p_item_id: record.item_id,
      p_developer_id: record.developer_id ?? null,
      p_gross: record.gross,
      p_fees: record.fees,
      p_taxes: record.taxes,
      p_net: record.net,
      p_period: record.period,
      p_idempotency_key: record.idempotency_key ?? null,
      p_actor_id: audit.userId,
      p_request_id: audit.requestId,
      p_payload: (payload ?? {}) as Json,
    });

    if (error) throw error;

    const parsed = result as {
      revenue: Database['mycominer']['Tables']['marketplace_revenue']['Row'];
      idempotent_replay: boolean;
    };

    return {
      revenue: parsed.revenue,
      idempotentReplay: parsed.idempotent_replay,
    };
  },

  async listInvoicesByOrg(
    orgId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Database['mycominer']['Tables']['invoices']['Row']>> {
    return this.listOrgScopedRows('invoices', orgId, pagination);
  },

  async listRewardTokensByOrg(
    orgId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Database['mycominer']['Tables']['reward_tokens']['Row']>> {
    return this.listOrgScopedRows('reward_tokens', orgId, pagination);
  },

  async listLicenseTokensByOrg(
    orgId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Database['mycominer']['Tables']['license_tokens']['Row']>> {
    return this.listOrgScopedRows('license_tokens', orgId, pagination);
  },

  async getTokenPurchaseReplay(
    orgId: string,
    idempotencyKey: string
  ): Promise<Record<string, unknown> | null> {
    if (shouldUseInMemoryPersistence()) {
      const row = memoryDb.findById(
        'token_purchase_idempotency',
        `${orgId}:${idempotencyKey}`
      );
      return (row?.responseJson as Record<string, unknown> | undefined) ?? null;
    }

    const { data, error } = await schema().rpc('get_token_purchase_replay', {
      p_org_id: orgId,
      p_idempotency_key: idempotencyKey,
    });

    if (error) throw error;
    if (!data) return null;
    return data as Record<string, unknown>;
  },

  async saveTokenPurchaseReplay(
    orgId: string,
    idempotencyKey: string,
    response: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (shouldUseInMemoryPersistence()) {
      const id = `${orgId}:${idempotencyKey}`;
      const existing = memoryDb.findById('token_purchase_idempotency', id);
      if (existing) {
        return existing.responseJson as Record<string, unknown>;
      }
      memoryDb.insert('token_purchase_idempotency', {
        id,
        orgId,
        idempotencyKey,
        responseJson: response,
        createdAt: new Date().toISOString(),
      });
      return response;
    }

    const { data, error } = await schema().rpc('save_token_purchase_replay', {
      p_org_id: orgId,
      p_idempotency_key: idempotencyKey,
      p_response_json: response as Json,
    });

    if (error) throw error;
    return data as Record<string, unknown>;
  },

  async listOrgScopedRows<T extends { created_at: string; id: string }>(
    table: 'invoices' | 'reward_tokens' | 'license_tokens',
    orgId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<T>> {
    if (shouldUseInMemoryPersistence()) {
      const all = memoryDb
        .all(table)
        .filter((row) => row.org_id === orgId || row.orgId === orgId)
        .sort((a, b) =>
          String(b.createdAt ?? b.created_at).localeCompare(String(a.createdAt ?? a.created_at))
        );
      const items = all.slice(0, pagination.limit) as unknown as T[];
      return { items, hasMore: all.length > pagination.limit, nextCursor: null };
    }

    let query = schema()
      .from(table)
      .select()
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(pagination.limit + 1);

    if (pagination.cursor) {
      const decoded = decodeCursor(pagination.cursor);
      if (decoded) {
        query = query.or(
          `created_at.lt.${decoded.createdAt},and(created_at.eq.${decoded.createdAt},id.lt.${decoded.id})`
        );
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as unknown as T[];
    const hasMore = rows.length > pagination.limit;
    const items = rows.slice(0, pagination.limit);
    const last = items[items.length - 1];

    return {
      items,
      hasMore,
      nextCursor: hasMore && last ? encodeCursor(last.created_at, last.id) : null,
    };
  },
};
