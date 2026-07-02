const path = require('path');
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch {}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const LEAD_DB_COLUMNS = [
  "id",
  "name",
  "email",
  "phone",
  "country",
  "visaType",
  "status",
  "source",
  "counselor",
  "assignedAt",
  "dateCreated",
  "lastUpdated",
  "isDeleted",
  "notes",
  "employmentCategory",
  "checklist",
  "payments",
  "usaSlots",
  "visaCredentials",
  "driveFolderId",
  "passportNumber",
  "passportIssueDate",
  "passportExpiryDate",
  "passportPlaceOfIssue",
  "annualIncome",
];

function serializeLeadForDb(lead, options) {
  const row = {};
  const omitSet = options?.omitColumns || new Set();
  for (const key of LEAD_DB_COLUMNS) {
    if (omitSet.has(key)) continue;
    const value = lead[key];
    if (value !== undefined) {
      row[key] = value;
    }
  }
  return row;
}

async function testGenericSelfHealing() {
  const { data: leads, error: fetchErr } = await supabase.from('leads').select('*').limit(1);
  if (fetchErr || leads.length === 0) {
    console.error("Fetch err or no leads:", fetchErr);
    process.exit(1);
  }

  const lead = leads[0];
  // Add multiple fake/missing columns to test sequential self-healing
  lead.annualIncome = "900000";
  lead.passportNumber = "P1234567";
  lead.passportIssueDate = "2020-01-01";
  lead.passportExpiryDate = "2030-01-01";
  lead.passportPlaceOfIssue = "Mumbai";

  const omittedColumns = new Set();
  let attempts = 0;
  const maxAttempts = 10;
  let finalSuccess = false;

  while (attempts < maxAttempts) {
    const rows = [lead].map((l) => serializeLeadForDb(l, { omitColumns: omittedColumns }));
    console.log(`Attempt ${attempts + 1} - Omitted columns:`, Array.from(omittedColumns));
    
    const { error } = await supabase.from("leads").upsert(rows);

    if (!error) {
      console.log("SUCCESS!");
      finalSuccess = true;
      break;
    }

    const errMsg = typeof error.message === "string" ? error.message : "";
    console.log(`Failed with message: "${errMsg}"`);

    const columnMatch = 
      errMsg.match(/Could not find the '([^']+)' column/) ||
      errMsg.match(/column "([^"]+)" of relation/) ||
      errMsg.match(/column "([^"]+)" does not exist/);

    if (columnMatch && columnMatch[1]) {
      const missingColumn = columnMatch[1];
      console.log(`=> Detected missing column: '${missingColumn}'`);
      omittedColumns.add(missingColumn);
      attempts++;
    } else {
      console.error("Other database error:", error);
      break;
    }
  }

  if (!finalSuccess) {
    console.error("Failed write test.");
    process.exit(1);
  }
}

testGenericSelfHealing();
