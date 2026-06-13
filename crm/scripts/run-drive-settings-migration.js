#!/usr/bin/env node
/**
 * Applies supabase/drive_settings_migration.sql to the Supabase Postgres database.
 *
 * Requires DATABASE_URL (Supabase → Settings → Database → Connection string URI)
 * or SUPABASE_DB_PASSWORD with SUPABASE_URL set in .env.
 *
 * Usage: npm run drive:migrate-settings
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

function extractFolderId(input) {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : trimmed;
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
  if (!url || !key) return false;

  const res = await fetch(`${url}/rest/v1/app_settings?select=key&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return res.ok;
}

async function main() {
  console.log('\n=== Drive app_settings migration ===\n');

  const dbUrl = resolveDatabaseUrl();
  if (!dbUrl) {
    console.error(
      'Missing database connection. Set DATABASE_URL in .env (Supabase → Settings → Database → URI)\n' +
        'or set SUPABASE_DB_PASSWORD with SUPABASE_URL.\n'
    );
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'supabase', 'drive_settings_migration.sql');
  let sql = fs.readFileSync(sqlPath, 'utf8');

  const rootId = extractFolderId(process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID);
  if (rootId) {
    sql = sql.replace(/YOUR_ROOT_FOLDER_ID/g, rootId);
    console.log(`Using GOOGLE_DRIVE_ROOT_FOLDER_ID seed: ${rootId}`);
  } else {
    console.log('No GOOGLE_DRIVE_ROOT_FOLDER_ID — seed row keeps placeholder (set via Drive tab later).');
  }

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

  const ok = await verifyViaRest();
  if (ok) {
    console.log('✓ Verified: public.app_settings is reachable via Supabase REST.\n');
  } else {
    console.warn('⚠ Migration ran but REST verification failed — reload PostgREST schema cache in Supabase if needed.\n');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
