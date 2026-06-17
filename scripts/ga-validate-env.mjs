#!/usr/bin/env node
/**
 * Validates production environment variables for GA readiness.
 * Usage: NODE_ENV=production node scripts/ga-validate-env.mjs
 *
 * Reads process.env only — does not print secret values.
 */
const PLACEHOLDER_PATTERNS = [
  /^your[-_]/i,
  /^changeme$/i,
  /^replace[-_]?me$/i,
  /^<.*>$/,
  /^example\./i,
  /^sk_test_000/,
  /^$/,
];

const REQUIRED = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', mustStartWith: 'https://' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', minLength: 20 },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', minLength: 20 },
  { key: 'UPSTASH_REDIS_REST_URL', mustStartWith: 'https://' },
  { key: 'UPSTASH_REDIS_REST_TOKEN', minLength: 10 },
  { key: 'STRIPE_SECRET_KEY', mustStartWith: 'sk_' },
  { key: 'STRIPE_WEBHOOK_SECRET', mustStartWith: 'whsec_' },
];

const FORBIDDEN = [
  {
    key: 'MYCOMINER_DEV_AUTH_HEADERS',
    reject: (v) => v === '1',
    reason: 'Dev auth headers must not be enabled in production',
  },
];

function isPlaceholder(value) {
  if (value === undefined || value === null) return true;
  const trimmed = String(value).trim();
  if (!trimmed) return true;
  return PLACEHOLDER_PATTERNS.some((p) => p.test(trimmed));
}

function validate() {
  const isProd = process.env.NODE_ENV === 'production';
  const results = [];

  if (!isProd) {
    console.warn('WARN: NODE_ENV is not production — running advisory checks only.');
  }

  for (const { key, minLength, mustStartWith } of REQUIRED) {
    const value = process.env[key];
    let pass = true;
    let reason = 'ok';

    if (isPlaceholder(value)) {
      pass = false;
      reason = 'missing or placeholder';
    } else if (minLength && String(value).length < minLength) {
      pass = false;
      reason = `too short (min ${minLength})`;
    } else if (mustStartWith && !String(value).startsWith(mustStartWith)) {
      pass = false;
      reason = `must start with ${mustStartWith}`;
    }

    results.push({ key, pass, reason });
  }

  if (isProd) {
    for (const rule of FORBIDDEN) {
      const value = process.env[rule.key];
      if (rule.reject(value)) {
        results.push({ key: rule.key, pass: false, reason: rule.reason });
      }
    }
  }

  const failed = results.filter((r) => !r.pass);
  console.log('GA environment validation:');
  for (const r of results) {
    console.log(`  ${r.pass ? 'PASS' : 'FAIL'} ${r.key}${r.pass ? '' : ` — ${r.reason}`}`);
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} check(s) failed.`);
    process.exit(1);
  }

  console.log('\nAll environment checks passed.');
}

validate();
