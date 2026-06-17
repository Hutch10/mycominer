import { isProductionPersistence } from '../db/persistenceBackend';
import { checkRateLimitDistributed } from './distributedRateLimit';
import { isDistributedRateLimitConfigured } from './rateLimitConfig';
import {
  checkRateLimitInMemory,
  rateLimitKey,
  resetRateLimitsForTests,
  RATE_LIMITS,
  type RateLimitResult,
  type RateLimitTier,
} from './inMemoryRateLimit';

export { rateLimitKey, resetRateLimitsForTests, RATE_LIMITS, type RateLimitTier };

export function shouldUseDistributedRateLimit(): boolean {
  return isProductionPersistence() && isDistributedRateLimitConfigured();
}

export async function enforceRateLimit(
  key: string,
  tier: RateLimitTier
): Promise<RateLimitResult> {
  if (shouldUseDistributedRateLimit()) {
    return checkRateLimitDistributed(key, tier);
  }
  return checkRateLimitInMemory(key, tier);
}

/** @deprecated Use enforceRateLimit for route handlers. Kept for unit tests. */
export function checkRateLimit(
  key: string,
  tier: RateLimitTier
): RateLimitResult {
  return checkRateLimitInMemory(key, tier);
}
