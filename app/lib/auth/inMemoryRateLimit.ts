type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export const RATE_LIMITS = {
  mutation: { limit: 60, windowMs: 60_000 },
  strict: { limit: 20, windowMs: 60_000 },
} as const;

export type RateLimitTier = keyof typeof RATE_LIMITS;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function checkRateLimitInMemory(
  key: string,
  tier: RateLimitTier
): RateLimitResult {
  const { limit, windowMs } = RATE_LIMITS[tier];
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return { allowed: true };
}

export function rateLimitKey(
  userId: string,
  method: string,
  pathname: string,
  tier: RateLimitTier
): string {
  return `${userId}:${method}:${pathname}:${tier}`;
}

export function resetRateLimitsForTests(): void {
  buckets.clear();
}
