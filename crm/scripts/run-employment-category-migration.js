#!/usr/bin/env node
/**
 * Applies supabase/employment_category_migration.sql to the Supabase Postgres database.
 *
 * Requires DATABASE_URL (Supabase → Settings → Database → Connection string URI)
 * or SUPABASE_DB_PASSWORD with SUPABASE_URL set in .env.
 *
 * Usage: npm run migrate:employment-category
 */
const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch {
  // dotenv optional if vars are exported in shell
}

function extractProjectRef(supabaseUrl) {
  if (!supabaseUrl) return null;
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

function resolveDatabaseUrl() {
  const direct =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.SUPABASE_DB_CONNECTION;
  if (direct) return direct;

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = extractProjectRef(process.env.SUPABASE_URL);
  if (password && ref) {
    const encoded = encodeURIComponent(password);
    return `postgresql://postgres:${encoded}@db.${ref}.supabase.co:5432/postgres`;
  }

  return null;
}

async function verifyViaRest() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, reason: 'missing env' };

  const res = await fetch(`${url}/rest/v1/leads?select=id,employmentCategory&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, reason: `${res.status} ${body}` };
  }
  return { ok: true };
}

async function main() {
  console.log('\n=== employmentCategory column migration ===\n');

  const dbUrl = resolveDatabaseUrl();
  if (!dbUrl) {
    console.error(
      'Missing database connection. Set DATABASE_URL in .env (Supabase → Settings → Database → URI)\n' +
        'or set SUPABASE_DB_PASSWORD with SUPABASE_URL.\n' +
        'Alternatively, paste supabase/employment_category_migration.sql into the Supabase SQL Editor.\n'
    );
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'supabase', 'employment_category_migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const { Client } = require('pg');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log('✓ Migration SQL applied successfully.');
  } catch (err) {
    console.error('✗ Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }

  const result = await verifyViaRest();
  if (result.ok) {
    console.log('✓ Verified: leads.employmentCategory is reachable via Supabase REST.\n');
  } else {
    console.warn(
      `⚠ Migration ran but REST verification failed (${result.reason}) — reload PostgREST schema cache in Supabase if needed.\n`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
