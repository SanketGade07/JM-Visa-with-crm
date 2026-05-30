import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service-role key so CRM staff uploads
// bypass storage RLS. NEVER expose the service role key to the browser — this
// module is only imported from API routes.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

export const DOCUMENTS_BUCKET = process.env.SUPABASE_BUCKET || "crm-documents";

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY);

export const getSupabase = (): SupabaseClient => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
};
