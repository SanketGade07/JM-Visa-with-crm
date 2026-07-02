const path = require('path');
const fs = require('fs');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch {
  // ignore
}

async function testApi() {
  const url = "http://localhost:3000/api/leads";
  
  // We need to fetch leads from mock or database first to send them
  // Or we can just send a single dummy lead in the array
  const dummyLead = {
    id: `lead-test-${Date.now()}`,
    name: "Test API Fallback",
    email: "test-api@example.com",
    phone: "+91 99999 99999",
    country: "UK",
    visaType: "Work Visa",
    status: "NEW_LEAD",
    source: "MANUAL",
    counselor: "Unassigned",
    dateCreated: "2026-07-02",
    lastUpdated: "2026-07-02",
    isDeleted: false,
    employmentCategory: "private_job",
    checklist: {},
    payments: [],
    notes: "API test sync",
    annualIncome: "800000" // This should trigger the fallback
  };

  console.log("Sending POST to /api/leads with leads array...");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leads: [dummyLead] }),
  });

  const status = res.status;
  const text = await res.text();
  console.log(`Response Status: ${status}`);
  console.log("Response Text:", text);
}

testApi().catch(console.error);
