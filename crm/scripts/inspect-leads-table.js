const path = require('path');
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
} catch {}

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Leads column keys:", Object.keys(data[0] || {}));
  }
}
main();
