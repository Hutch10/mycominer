import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  RATE_LIMITS,
  type RateLimitResult,
  type RateLimitTier,
} from './inMemoryRateLimit';

export { isDistributedRateLimitConfigured } from './rateLimitConfig';

let mutationLimiter: Ratelimit | null = null;
let strictLimiter: Ratelimit | null = null;

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
  }
  return new Redis({ url, token });
}

function getLimiter(tier: RateLimitTier): Ratelimit {
  const { limit, windowMs } = RATE_LIMITS[tier];
  const windowSec = Math.max(1, Math.round(windowMs / 1000));

  if (tier === 'strict') {
    if (!strictLimiter) {
      strictLimiter = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
        prefix: 'mycominer:rl:strict',
      });
    }
    return strictLimiter;
  }

  if (!mutationLimiter) {
    mutationLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: 'mycominer:rl:mutation',
    });
  }
  return mutationLimiter;
}

export async function checkRateLimitDistributed(
  key: string,
  tier: RateLimitTier
): Promise<RateLimitResult> {
  const limiter = getLimiter(tier);
  const result = await limiter.limit(key);

  if (result.success) {
    return { allowed: true };
  }

  const retryAfterSec = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000)
  );
  return { allowed: false, retryAfterSec };
}
