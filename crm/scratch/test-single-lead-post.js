const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Port implementation of signSession to Node (standard JWT signed with HMAC SHA-256 using service role key)
const crypto = require('crypto');

function encodeClaims(claimsObj) {
  const str = JSON.stringify(claimsObj);
  const encoded = Buffer.from(str).toString('base64');
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signSession(payload) {
  const header = encodeClaims({ alg: "HS256", typ: "JWT" });
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 10;
  const claims = encodeClaims({ ...payload, exp });
  
  const signingInput = `${header}.${claims}`;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-jwt-secret-fallback-key-should-be-replaced-in-prod";
  // The signSession padEnd(32, "0") behavior:
  const key = secret.padEnd(32, "0");
  const signature = crypto.createHmac('sha256', key).update(signingInput).digest('base64')
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  
  return `${signingInput}.${signature}`;
}

async function testSinglePost() {
  const url = "http://localhost:3000/api/leads";
  const frontendId = `lead-test-single-${Date.now()}`;
  
  const dummyLead = {
    id: frontendId,
    name: "Test Single Manual",
    email: "test-single@example.com",
    phone: "+91 99999 88888",
    country: "USA",
    visaType: "Tourist Visa",
    status: "NEW_LEAD",
    source: "MANUAL",
    counselor: "Unassigned",
    employmentCategory: "private_job",
    passportNumber: "P1234567",
    passportIssueDate: "2020-01-01",
    passportExpiryDate: "2030-01-01",
    passportPlaceOfIssue: "Delhi",
    annualIncome: "1200000",
    referredBy: "Self"
  };

  const sessionToken = signSession({
    id: "user-admin",
    name: "Admin User",
    email: "admin@jmvisa.com",
    role: "ADMIN"
  });

  console.log(`Sending POST to ${url} with single lead object (ID: ${frontendId})...`);
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Cookie": `crm_session=${sessionToken}`
    },
    body: JSON.stringify(dummyLead),
  });

  console.log(`Response Status: ${res.status}`);
  const data = await res.json();
  console.log("Response Data:", data);

  const returnedId = data.lead?.id;
  console.log(`Frontend ID: ${frontendId}, Returned ID: ${returnedId}`);

  if (returnedId) {
    // Attempt to update it using PUT
    const putUrl = `${url}/${returnedId}`;
    console.log(`\nSending PUT to ${putUrl} to update status to IN_PROGRESS...`);
    const putRes = await fetch(putUrl, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Cookie": `crm_session=${sessionToken}`
      },
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    console.log(`PUT Status: ${putRes.status}`);
    console.log("PUT Response:", await putRes.json());

    // Check if the original frontendId was saved
    if (frontendId !== returnedId) {
      console.log(`\nChecking if original frontendId (${frontendId}) exists in DB...`);
      const { data: dbLead } = await supabase.from('leads').select('*').eq('id', frontendId).maybeSingle();
      console.log(`Lead with frontendId exists:`, !!dbLead);
      
      console.log(`Checking if returnedId (${returnedId}) exists in DB...`);
      const { data: dbLeadReturned } = await supabase.from('leads').select('*').eq('id', returnedId).maybeSingle();
      console.log(`Lead with returnedId exists:`, !!dbLeadReturned);
      console.log(`Returned Lead Passport Number in DB:`, dbLeadReturned?.passportNumber);

      // Clean up the returnedId from DB
      await supabase.from('leads').delete().eq('id', returnedId);
      console.log(`Cleaned up returnedId.`);
    } else {
      // Clean up
      await supabase.from('leads').delete().eq('id', frontendId);
      console.log(`Cleaned up frontendId.`);
    }
  }
}

testSinglePost().catch(console.error);
