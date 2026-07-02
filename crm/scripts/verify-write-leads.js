const path = require('path');
const fs = require('fs');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch {
  // ignore
}

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWrite() {
  // Fetch existing leads to write back
  const { data: leads, error: fetchErr } = await supabase.from('leads').select('*');
  if (fetchErr) {
    console.error("Error fetching leads:", fetchErr);
    process.exit(1);
  }

  console.log(`Fetched ${leads.length} leads. Trying to write one back...`);
  if (leads.length === 0) {
    console.log("No leads to test with.");
    process.exit(0);
  }

  // Attempt to write using our schema columns (with annualIncome)
  const leadToTest = leads[0];
  // Add annualIncome property to lead
  leadToTest.annualIncome = "120000";

  console.log("Testing upsert with annualIncome...");
  const { data, error: upsertErr } = await supabase.from('leads').upsert([leadToTest]);
  if (upsertErr) {
    console.error("Upsert failed with error details:");
    console.error(JSON.stringify(upsertErr, null, 2));
  } else {
    console.log("Upsert with annualIncome succeeded!");
  }
}

testWrite().catch(console.error);
