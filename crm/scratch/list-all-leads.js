const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('leads').select('id, name, email, country, visaType, status');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Total leads in DB:", data.length);
    console.log("Leads:", data);
  }
}
main();
