#!/usr/bin/env node
/**
 * Runs local engineering verification checks for GA evidence collection.
 * Does not require production secrets or DATABASE_URL.
 *
 * Usage: node scripts/ga-verify-local.mjs
 */
import { spawnSync } from 'node:child_process';
import { execSync } from 'node:child_process';

const steps = [
  { name: 'type-check', cmd: 'npm', args: ['run', 'type-check'] },
  { name: 'test', cmd: 'npm', args: ['test'] },
  { name: 'build', cmd: 'npm', args: ['run', 'build'] },
  { name: 'secret-scan', cmd: 'node', args: ['scripts/scan-client-secrets.mjs'] },
];

function gitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

console.log('GA local verification package');
console.log(`Commit: ${gitCommit()}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

let failed = 0;
for (const step of steps) {
  process.stdout.write(`[RUN] ${step.name}... `);
  const result = spawnSync(step.cmd, step.args, { stdio: 'pipe', shell: process.platform === 'win32' });
  if (result.status === 0) {
    console.log('PASS');
  } else {
    console.log('FAIL');
    if (result.stderr?.length) process.stderr.write(result.stderr);
    if (result.stdout?.length) process.stdout.write(result.stdout);
    failed += 1;
  }
}

console.log('');
if (failed > 0) {
  console.error(`${failed} step(s) failed. Record results in docs/operations/ga-evidence-package.md`);
  process.exit(1);
}

console.log('All local checks passed.');
console.log('Next: run remote checks (DATABASE_URL, production env) per ga-evidence-package.md');
process.exit(0);
