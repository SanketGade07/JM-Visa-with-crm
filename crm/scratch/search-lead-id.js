const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase.from('leads').select('id, name');
  if (error) {
    console.error("Error:", error);
  } else {
    const matches = data.filter(l => l.id.includes('9e6d') || l.id.includes('e6583b61d9c1') || l.id.includes('a50d'));
    console.log("Matching leads:", matches);
  }
}
main();
