#!/usr/bin/env node
/**
 * Scans Next.js build output for server-only secrets that must not ship to clients.
 * Exits 1 if any forbidden pattern is found in .next static/client bundles.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const BUILD_DIR = path.join(process.cwd(), '.next');
const CLIENT_SCAN_DIRS = [
  path.join(BUILD_DIR, 'static'),
];
const FORBIDDEN_PATTERNS = [
  { name: 'SUPABASE_SERVICE_ROLE_KEY', regex: /SUPABASE_SERVICE_ROLE_KEY/ },
  { name: 'STRIPE_SECRET_KEY', regex: /STRIPE_SECRET_KEY/ },
  { name: 'STRIPE_WEBHOOK_SECRET', regex: /STRIPE_WEBHOOK_SECRET/ },
  { name: 'UPSTASH_REDIS_REST_TOKEN', regex: /UPSTASH_REDIS_REST_TOKEN/ },
  { name: 'UPSTASH_REDIS_REST_URL', regex: /UPSTASH_REDIS_REST_URL/ },
  { name: 'service_role JWT prefix', regex: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.service_role/ },
  { name: 'Stripe live secret prefix', regex: /sk_live_[A-Za-z0-9]+/ },
  { name: 'Stripe test secret prefix', regex: /sk_test_[A-Za-z0-9]+/ },
];

const SCANNED_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.json', '.map', '.html', '.txt']);

async function collectFiles(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'ENOENT') {
      console.error(`Build directory not found: ${BUILD_DIR}`);
      console.error('Run "npm run build" before scanning.');
      process.exit(1);
    }
    throw err;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, files);
      continue;
    }
    const ext = path.extname(entry.name);
    if (SCANNED_EXTENSIONS.has(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  const buildStat = await stat(BUILD_DIR).catch(() => null);
  if (!buildStat?.isDirectory()) {
    console.error(`Missing build output at ${BUILD_DIR}`);
    process.exit(1);
  }

  const files = [];
  for (const dir of CLIENT_SCAN_DIRS) {
    const dirStat = await stat(dir).catch(() => null);
    if (dirStat?.isDirectory()) {
      await collectFiles(dir, files);
    }
  }

  if (files.length === 0) {
    console.error('No client static bundles found under .next/static');
    process.exit(1);
  }
  const hits = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.regex.test(content)) {
        hits.push({ file: path.relative(process.cwd(), file), pattern: pattern.name });
      }
    }
  }

  if (hits.length > 0) {
    console.error('SECRET SCAN FAILED — server-only material found in client build output:');
    for (const hit of hits) {
      console.error(`  - ${hit.pattern} in ${hit.file}`);
    }
    process.exit(1);
  }

  console.log(`Secret scan passed (${files.length} files scanned).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
