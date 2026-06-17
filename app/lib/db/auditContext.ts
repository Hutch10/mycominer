import type { PersistenceAuthContext } from '../auth/persistenceAuth';

export type AuditContext = Pick<PersistenceAuthContext, 'userId' | 'requestId'>;

export function toAuditContext(ctx: PersistenceAuthContext): AuditContext {
  return {
    userId: ctx.userId,
    requestId: ctx.requestId,
  };
}
