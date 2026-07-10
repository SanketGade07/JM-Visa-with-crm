const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch (e) {
  console.log("Error loading dotenv:", e);
}

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function check() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log("Fetching ALL leads in DB...");
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, email, isDeleted");
    
  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }
  
  console.log(`Total leads in DB: ${leads.length}`);
  const match = leads.find(l => l.id.includes("1783353598897") || l.id === "lead-1783353598897");
  if (match) {
    console.log("FOUND MATCHING LEAD:", match);
  } else {
    console.log("No exact or partial matching lead ID '1783353598897' found.");
  }
  
  console.log("\nAll Lead IDs currently in DB:");
  console.log(leads.map(l => ({ id: l.id, name: l.name })));
}

check().catch(console.error);
