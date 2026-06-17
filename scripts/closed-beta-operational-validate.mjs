#!/usr/bin/env node
/**
 * Closed Beta operational validation runner.
 * Requires DATABASE_URL for psql-based checks; optional API smoke via BASE_URL + dev auth headers.
 *
 * Usage:
 *   node scripts/closed-beta-operational-validate.mjs
 *   DATABASE_URL=postgres://... node scripts/closed-beta-operational-validate.mjs
 *   BASE_URL=https://your-deploy.vercel.app MYCOMINER_DEV_AUTH_HEADERS=1 node scripts/closed-beta-operational-validate.mjs
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

const results = [];

function record(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function runNodeScript(script, env = {}) {
  const result = spawnSync('node', [script], {
    stdio: 'pipe',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });
  return { ok: result.status === 0, stdout: result.stdout?.toString() ?? '', stderr: result.stderr?.toString() ?? '' };
}

console.log('Closed Beta operational validation');
console.log(`Timestamp: ${new Date().toISOString()}\n`);

console.log('1. Deploy environment variables');
for (const key of REQUIRED_ENV) {
  const value = process.env[key]?.trim();
  record(`env:${key}`, Boolean(value), value ? 'set' : 'missing');
}
record(
  'env:MYCOMINER_MIGRATION_VERSION',
  process.env.MYCOMINER_MIGRATION_VERSION === '008',
  process.env.MYCOMINER_MIGRATION_VERSION ?? 'unset'
);

console.log('\n2. Database validation scripts');
if (process.env.DATABASE_URL?.trim()) {
  const verify = runNodeScript('scripts/verify-migrations.mjs');
  record('verify-migrations.mjs', verify.ok, verify.ok ? '' : verify.stderr.slice(0, 200));
  const gaDb = runNodeScript('scripts/ga-validate-db.mjs');
  record('ga-validate-db.mjs', gaDb.ok, gaDb.ok ? '' : gaDb.stderr.slice(0, 200));
} else {
  record('verify-migrations.mjs', false, 'DATABASE_URL not set');
  record('ga-validate-db.mjs', false, 'DATABASE_URL not set');
}

console.log('\n3. Deployment fingerprint (build metadata default)');
const fpSource = readFileSync(path.join(process.cwd(), 'app/lib/deploy/fingerprint.ts'), 'utf8');
const defaultOk = /MYCOMINER_MIGRATION_VERSION\?\.trim\(\) \|\| '008'/.test(fpSource);
record('fingerprint.default_migration_version', defaultOk, defaultOk ? '008' : 'unexpected default');

console.log('\n4. Optional API smoke (BASE_URL)');
const baseUrl = process.env.BASE_URL?.replace(/\/$/, '');
if (baseUrl) {
  const headers = {
    'Content-Type': 'application/json',
    'x-mycominer-user-id': process.env.SMOKE_USER_ID ?? 'closed-beta-smoke',
    'x-mycominer-org-id': process.env.SMOKE_ORG_ID ?? 'org-smoke',
  };
  try {
    const health = await fetch(`${baseUrl}/api/agent`, { method: 'GET' });
    record('api:agent_health', health.ok, String(health.status));
  } catch (error) {
    record('api:agent_health', false, error instanceof Error ? error.message : String(error));
  }
} else {
  record('api:smoke_skipped', false, 'BASE_URL not set');
}

const failed = results.filter((r) => !r.pass);
console.log(`\nSummary: ${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) {
  console.error('\nOperational validation incomplete. See docs/operations/closed-beta-operational-log.md');
  process.exit(1);
}
console.log('\nAll operational checks passed.');
process.exit(0);
