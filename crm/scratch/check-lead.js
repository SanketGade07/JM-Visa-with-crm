const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const leadId = 'lead-9e6da50d-e6583b61d9c1';
  const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).maybeSingle();
  if (error) {
    console.error("Error fetching lead:", error);
  } else {
    console.log("Lead exists in DB:", !!data);
    if (data) {
      console.log("Lead details:", data);
    }
  }
}
main();
