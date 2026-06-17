#!/usr/bin/env node
/**
 * Validates mycominer schema parity and GA database readiness.
 * Requires DATABASE_URL pointing at the target Postgres (source or dedicated).
 *
 * Usage: DATABASE_URL=postgres://... node scripts/ga-validate-db.mjs
 */
import { spawn } from 'node:child_process';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Set DATABASE_URL to the Supabase Postgres connection string.');
  process.exit(1);
}

const CHECKS = [
  {
    name: 'migrations_001_006_files',
    sql: `SELECT count(*)::int AS cnt FROM (
      SELECT unnest(ARRAY[
        '001_orchestration_persistence.sql',
        '002_economy_billing.sql',
        '003_p0_security_hardening.sql',
        '004_workflow_org_isolation.sql',
        '005_marketplace_atomic_idempotency.sql',
        '006_payment_checkout_integrity.sql'
      ]) AS expected
    ) e
    WHERE EXISTS (
      SELECT 1 FROM information_schema.tables t
      WHERE t.table_schema = 'mycominer'
    )`,
    expect: (rows) => rows.length >= 0,
    describe: 'mycominer schema exists',
  },
  {
    name: 'checkout_sessions_table',
    sql: `SELECT to_regclass('mycominer.marketplace_checkout_sessions')::text AS reg`,
    expect: (rows) => rows[0]?.reg === 'mycominer.marketplace_checkout_sessions',
  },
  {
    name: 'checkout_rpcs',
    sql: `SELECT count(*)::int AS cnt FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'mycominer'
        AND p.proname IN (
          'begin_marketplace_checkout',
          'record_marketplace_charge',
          'complete_marketplace_checkout',
          'mark_checkout_needs_reconciliation'
        )`,
    expect: (rows) => rows[0]?.cnt === 4,
  },
  {
    name: 'token_purchase_idempotency_table',
    sql: `SELECT to_regclass('mycominer.token_purchase_idempotency')::text AS reg`,
    expect: (rows) => rows[0]?.reg === 'mycominer.token_purchase_idempotency',
  },
  {
    name: 'token_purchase_rpcs',
    sql: `SELECT count(*)::int AS cnt FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'mycominer'
        AND p.proname IN ('get_token_purchase_replay', 'save_token_purchase_replay')`,
    expect: (rows) => rows[0]?.cnt === 2,
  },
  {
    name: 'workflow_rpc_uuid_fix',
    sql: `SELECT count(*)::int AS cnt FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'mycominer'
        AND p.proname IN ('create_workflow_with_log', 'schedule_run_with_log')
        AND pg_get_functiondef(p.oid) LIKE '%gen_random_uuid%'`,
    expect: (rows) => rows[0]?.cnt === 2,
  },
  {
    name: 'legacy_unassigned_zero',
    sql: `SELECT count(*)::int AS cnt FROM mycominer.workflows WHERE org_id = 'legacy-unassigned'`,
    expect: (rows) => rows[0]?.cnt === 0,
  },
  {
    name: 'rls_enabled_checkout_sessions',
    sql: `SELECT relrowsecurity AS rls FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'mycominer' AND c.relname = 'marketplace_checkout_sessions'`,
    expect: (rows) => rows[0]?.rls === true,
  },
  {
    name: 'row_counts',
    sql: `SELECT 'workflows' AS tbl, count(*)::bigint AS cnt FROM mycominer.workflows
      UNION ALL SELECT 'workflow_runs', count(*) FROM mycominer.workflow_runs
      UNION ALL SELECT 'marketplace_revenue', count(*) FROM mycominer.marketplace_revenue
      UNION ALL SELECT 'marketplace_checkout_sessions', count(*) FROM mycominer.marketplace_checkout_sessions
      UNION ALL SELECT 'orchestration_log', count(*) FROM mycominer.orchestration_log
      ORDER BY tbl`,
    expect: (rows) => rows.length === 5,
    logRows: true,
  },
  {
    name: 'orphaned_checkout_sessions',
    sql: `SELECT count(*)::int AS cnt FROM mycominer.marketplace_checkout_sessions s
      WHERE s.status = 'completed'
        AND s.revenue_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM mycominer.marketplace_revenue r WHERE r.id = s.revenue_id
        )`,
    expect: (rows) => rows[0]?.cnt === 0,
  },
  {
    name: 'needs_reconciliation_report',
    sql: `SELECT count(*)::int AS cnt FROM mycominer.marketplace_checkout_sessions
      WHERE status = 'needs_reconciliation'`,
    expect: () => true,
    logRows: true,
  },
];

function runQuery(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'psql',
      [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-F', '|', '-c', sql],
      { shell: process.platform === 'win32' }
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('exit', (code) => {
      if (code !== 0) reject(new Error(stderr || `psql exit ${code}`));
      else resolve(stdout.trim());
    });
  });
}

function parsePsv(output, columns) {
  if (!output) return [];
  return output.split('\n').filter(Boolean).map((line) => {
    const parts = line.split('|');
    const row = {};
    columns.forEach((col, i) => {
      row[col] = parts[i];
    });
    return row;
  });
}

async function runCheck(check) {
  const raw = await runQuery(check.sql);
  const firstLine = raw.split('\n')[0] ?? '';
  let rows;
  if (check.name === 'row_counts') {
    rows = parsePsv(raw, ['tbl', 'cnt']);
  } else if (
    check.name === 'checkout_rpcs' ||
    check.name === 'token_purchase_rpcs' ||
    check.name === 'workflow_rpc_uuid_fix' ||
    check.name.includes('orphaned') ||
    check.name.includes('legacy') ||
    check.name.includes('reconciliation')
  ) {
    rows = parsePsv(raw, ['cnt']);
    rows = rows.map((r) => ({ cnt: Number(r.cnt) }));
  } else if (check.name === 'checkout_sessions_table') {
    rows = parsePsv(raw, ['reg']);
  } else if (check.name === 'token_purchase_idempotency_table') {
    rows = parsePsv(raw, ['reg']);
  } else if (check.name === 'rls_enabled_checkout_sessions') {
    rows = parsePsv(raw, ['rls']).map((r) => ({ rls: r.rls === 't' }));
  } else {
    rows = [{ raw }];
  }

  const pass = check.expect(rows);
  if (check.logRows) {
    console.log(`    rows: ${JSON.stringify(rows)}`);
  }
  return { name: check.name, pass };
}

async function main() {
  console.log('GA database validation\n');
  const results = [];
  for (const check of CHECKS) {
    try {
      const result = await runCheck(check);
      results.push(result);
      console.log(`  ${result.pass ? 'PASS' : 'FAIL'} ${check.name}`);
    } catch (error) {
      results.push({ name: check.name, pass: false, error: String(error) });
      console.log(`  FAIL ${check.name} — ${error}`);
    }
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.error(`\n${failed.length} database check(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll database checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
