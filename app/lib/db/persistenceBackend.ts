import { isSupabaseConfigured } from '../supabase/admin';
import { isDistributedRateLimitConfigured } from '../auth/rateLimitConfig';

export class PersistenceBackendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PersistenceBackendError';
  }
}

export function isProductionPersistence(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function shouldUseInMemoryPersistence(): boolean {
  if (isProductionPersistence()) {
    return false;
  }
  return !isSupabaseConfigured();
}

export function requirePersistenceBackend(): void {
  if (isProductionPersistence() && process.env.MYCOMINER_DEV_AUTH_HEADERS === '1') {
    throw new PersistenceBackendError(
      'MYCOMINER_DEV_AUTH_HEADERS must not be enabled in production.'
    );
  }
  if (isProductionPersistence() && !isSupabaseConfigured()) {
    throw new PersistenceBackendError(
      'Persistence backend unavailable: Supabase must be configured in production.'
    );
  }
  if (isProductionPersistence() && !isDistributedRateLimitConfigured()) {
    throw new PersistenceBackendError(
      'Distributed rate limiting required in production: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    );
  }
}
