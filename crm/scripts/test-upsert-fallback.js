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
  for (const key of LEAD_DB_COLUMNS) {
    if (options?.omitAssignedAt && key === "assignedAt") continue;
    if (options?.omitAnnualIncome && key === "annualIncome") continue;
    const value = lead[key];
    if (value !== undefined) {
      row[key] = value;
    }
  }
  return row;
}

async function testUpsertFallback() {
  const { data: leads, error: fetchErr } = await supabase.from('leads').select('*').limit(1);
  if (fetchErr || leads.length === 0) {
    console.error("Fetch err or no leads:", fetchErr);
    process.exit(1);
  }

  const lead = leads[0];
  lead.annualIncome = "900000"; // Test value

  const upsert = async (opts) => {
    const rows = [lead].map((l) => serializeLeadForDb(l, opts));
    return supabase.from("leads").upsert(rows);
  };

  const opts = { omitAssignedAt: false, omitAnnualIncome: false };
  console.log("1. Running first upsert...");
  let { error } = await upsert(opts);
  console.log("First upsert error code:", error?.code, "msg:", error?.message);

  if (error) {
    const errMsg = typeof error.message === "string" ? error.message : "";
    const isMissingAssignedAt = errMsg.includes("assignedAt") || errMsg.includes("assignedat");
    const isMissingAnnualIncome = errMsg.includes("annualIncome") || errMsg.includes("annualincome");

    console.log("Checking triggers:", { isMissingAssignedAt, isMissingAnnualIncome });

    if (isMissingAssignedAt || isMissingAnnualIncome) {
      if (isMissingAssignedAt) {
        console.warn("omitAssignedAt = true");
        opts.omitAssignedAt = true;
      }
      if (isMissingAnnualIncome) {
        console.warn("omitAnnualIncome = true");
        opts.omitAnnualIncome = true;
      }

      console.log("2. Retrying upsert with options:", opts);
      ({ error } = await upsert(opts));
      console.log("Second upsert error code:", error?.code, "msg:", error?.message);
    }
  }

  if (error) {
    console.error("FAIL:", error);
  } else {
    console.log("SUCCESS!");
  }
}

testUpsertFallback();
