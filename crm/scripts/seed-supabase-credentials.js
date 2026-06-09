#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
// Load .env from project root if present
try {
  // Force-load .env and override any existing process.env values so local .env takes precedence
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
  console.log('Loaded .env from project root and applied values (override=true).');
} catch (e) {
  // dotenv may not be installed; script will still read process.env if set externally
  console.warn('dotenv not available; relying on environment variables present in the shell.');
}
// Polyfill fetch for Node < 18 using node-fetch when available
if (typeof globalThis.fetch !== 'function') {
  try {
    // node-fetch v2 exports function directly
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nf = require('node-fetch');
    globalThis.fetch = nf;
    // provide minimal Headers/Request/Response if available
    if (nf.Headers) globalThis.Headers = nf.Headers;
    if (nf.Request) globalThis.Request = nf.Request;
    if (nf.Response) globalThis.Response = nf.Response;
  } catch (err) {
    // If node-fetch is not installed, we'll continue and let supabase client fail with informative message
    // but log a hint for the user
    console.warn('node-fetch not found; if you run Node <18 please install node-fetch or upgrade Node.');
  }
}
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Effective SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('Effective SUPABASE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables (or populate .env).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  // quick connectivity check
  try {
    console.log('Testing connectivity to Supabase URL:', SUPABASE_URL);
    const resp = await fetch(SUPABASE_URL, { method: 'GET' });
    console.log('Supabase base URL responded with status', resp.status);
  } catch (err) {
    console.error('Network test to Supabase URL failed:', err && err.stack ? err.stack : err);
  }
})();

// Helper: generate a random password with special characters
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let pwd = '';
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

// Helper: generate credentials based on lead info
function generateCredentials(lead) {
  const firstName = lead.name ? lead.name.split(' ')[0].toLowerCase() : 'user';
  const lastInitial = lead.name ? (lead.name.split(' ')[1]?.[0]?.toLowerCase() || 'x') : 'x';
  const randomNum = Math.floor(Math.random() * 1000);
  return {
    username: `${firstName}.${lastInitial}${randomNum}`,
    password: generatePassword(),
    portalUrl: 'https://visaportal.example.com/login'
  };
}

async function run() {
  const file = path.join(__dirname, '..', 'src', 'data', 'leads.json');
  const raw = fs.readFileSync(file, 'utf8');
  const leads = JSON.parse(raw);

  console.log(`Processing ${leads.length} leads...`);

  for (const lead of leads) {
    // Generate credentials for all leads
    const creds = generateCredentials(lead);
    
    console.log(`Seeding credentials for ${lead.id} (${lead.name})...`);
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({ visaCredentials: creds })
        .eq('id', lead.id);
      
      if (error) {
        const msg = error.message || error;
        console.error(`Failed for ${lead.id}:`, msg);
        
        if (String(msg).includes("Could not find the 'visaCredentials' column") || String(msg).toLowerCase().includes('visaCredentials')) {
          console.log('Detected missing column `visaCredentials`. Attempting to create column using direct DB connection if available...');
          const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_DB_CONNECTION;
          
          if (dbUrl) {
            try {
              const { Client } = require('pg');
              const client = new Client({ connectionString: dbUrl });
              await client.connect();
              await client.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS \"visaCredentials\" jsonb;");
              await client.end();
              console.log('Created column visaCredentials via direct DB connection. Retrying updates...');
              
              // Retry this lead
              const { error: e2 } = await supabase
                .from('leads')
                .update({ visaCredentials: creds })
                .eq('id', lead.id);
              
              if (e2) {
                console.error(`Retry failed for ${lead.id}:`, e2.message || e2);
              } else {
                console.log(`✓ Updated ${lead.id} with auto-generated credentials`);
              }
            } catch (migErr) {
              console.error('Automatic migration failed:', migErr && migErr.stack ? migErr.stack : migErr);
            }
          } else {
            console.log('No direct DB connection. Run this SQL in Supabase SQL editor:\nALTER TABLE leads ADD COLUMN IF NOT EXISTS visaCredentials jsonb;');
          }
        }
      } else {
        console.log(`✓ Updated ${lead.id} with auto-generated credentials`);
      }
    } catch (err) {
      console.error(`Failed for ${lead.id}:`, err && err.stack ? err.stack : err);
    }
  }
  
  console.log('\n✓ Done. All leads should now have visa credentials in Supabase.');
}

run().catch((err) => { console.error(err); process.exit(1); });
