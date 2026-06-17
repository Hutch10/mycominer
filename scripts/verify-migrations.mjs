#!/usr/bin/env node
/**
 * Verifies mycominer migrations apply cleanly on an empty schema.
 * Run against a fresh Postgres database:
 *   DATABASE_URL=postgres://... node scripts/verify-migrations.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Set DATABASE_URL to a clean Postgres instance.');
  process.exit(1);
}

async function runPsql(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-c', sql], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('exit', (code) => (code === 0 ? resolve(undefined) : reject(new Error(`psql exit ${code}`))));
  });
}

async function runFile(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-f', filePath], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('exit', (code) => (code === 0 ? resolve(undefined) : reject(new Error(`psql exit ${code}`))));
  });
}

async function main() {
  await runPsql('drop schema if exists mycominer cascade;');
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    console.log(`Applying ${file}...`);
    await runFile(path.join(migrationsDir, file));
  }

  await runPsql(
    "select count(*) as rpc_count from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'mycominer';"
  );
  console.log('Migration verification complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
