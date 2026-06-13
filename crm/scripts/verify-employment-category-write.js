#!/usr/bin/env node
/**
 * Verifies that writeLeads-style upserts succeed with employmentCategory (no PGRST204).
 *
 * Usage: npm run verify:employment-category
 */
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch {
  // dotenv optional
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  const listRes = await fetch(`${url}/rest/v1/leads?select=id,employmentCategory&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!listRes.ok) {
    const body = await listRes.text();
    console.error('✗ Cannot select employmentCategory:', listRes.status, body);
    process.exit(1);
  }

  const rows = await listRes.json();
  if (!rows.length) {
    console.log('✓ Column exists (select succeeded). No leads to upsert — skipping write test.');
    process.exit(0);
  }

  const lead = rows[0];
  const nextCategory =
    lead.employmentCategory === 'business' ? 'private_job' : 'business';

  const upsertRes = await fetch(`${url}/rest/v1/leads`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([{ id: lead.id, employmentCategory: nextCategory }]),
  });

  if (!upsertRes.ok) {
    const body = await upsertRes.text();
    console.error('✗ Upsert with employmentCategory failed:', upsertRes.status, body);
    process.exit(1);
  }

  const updated = (await upsertRes.json())[0];
  if (updated.employmentCategory !== nextCategory) {
    console.error('✗ Upsert succeeded but value mismatch:', updated.employmentCategory, '!=', nextCategory);
    process.exit(1);
  }

  // Restore original value
  await fetch(`${url}/rest/v1/leads`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify([{ id: lead.id, employmentCategory: lead.employmentCategory ?? 'private_job' }]),
  });

  console.log('✓ employmentCategory column exists and upsert writes succeed.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
