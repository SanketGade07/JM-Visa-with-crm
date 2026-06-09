import { getSupabase } from "@/utils/supabase";
import { Lead, Meeting, Activity, Expense, Document, CrmUser } from "@/context/CrmContext";

// ── Leads ────────────────────────────────────────────────────────────────────
export const readLeads = async (): Promise<Lead[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("leads").select("*");
  if (error) {
    console.error("Error reading leads from Supabase:", error);
    return [];
  }
  
  // Map lowercase visacredentials column to camelCase visaCredentials property
  const leadsData = (data || []).map((lead: any) => ({
    ...lead,
    visaCredentials: lead.visacredentials || lead.visaCredentials,
  })) as Lead[];
  
  // Log sample credential data for debugging
  const leadsWithCreds = leadsData.filter(l => l.visaCredentials);
  console.log(`📊 readLeads() returned ${leadsData.length} total leads`);
  console.log(`✓ ${leadsWithCreds.length} leads have visaCredentials`);
  if (leadsWithCreds.length > 0) {
    console.log(`📌 Sample credential (first lead with creds):`, leadsWithCreds[0].visaCredentials);
  } else {
    console.log(`⚠️ No leads with credentials found`);
    if (leadsData.length > 0) {
      console.log(`📌 Sample lead structure:`, leadsData[0]);
    }
  }
  
  return leadsData;
};

export const writeLeads = async (leads: Lead[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("leads").upsert(leads);
  if (error) {
    console.error("Error writing leads to Supabase:", error);
    return false;
  }
  return true;
};

export const updateLeadCredentials = async (
  leadId: string,
  creds: { username?: string; password?: string; portalUrl?: string } | null
): Promise<boolean> => {
  const supabase = getSupabase();
  try {
    const payload = creds ? { visaCredentials: creds } : { visaCredentials: null };
    const { error } = await supabase.from("leads").update(payload).eq("id", leadId);
    if (error) {
      console.error("Error updating lead credentials in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception updating lead credentials:", err);
    return false;
  }
};

// ── Meetings ─────────────────────────────────────────────────────────────────
export const readMeetings = async (): Promise<Meeting[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("meetings").select("*");
  if (error) {
    console.error("Error reading meetings from Supabase:", error);
    return [];
  }
  return (data || []) as Meeting[];
};

export const writeMeetings = async (meetings: Meeting[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("meetings").upsert(meetings);
  if (error) {
    console.error("Error writing meetings to Supabase:", error);
    return false;
  }
  return true;
};

// ── Activity Log ──────────────────────────────────────────────────────────────
export const readActivities = async (): Promise<Activity[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("activities").select("*");
  if (error) {
    console.error("Error reading activities from Supabase:", error);
    return [];
  }
  return (data || []) as Activity[];
};

export const writeActivities = async (activities: Activity[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("activities").upsert(activities);
  if (error) {
    console.error("Error writing activities to Supabase:", error);
    return false;
  }
  return true;
};

export const appendActivity = async (activity: Activity): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("activities").insert(activity);
  if (error) {
    console.error("Error appending activity to Supabase:", error);
    return false;
  }
  return true;
};

// ── Expenses ──────────────────────────────────────────────────────────────────
export const readExpenses = async (): Promise<Expense[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("expenses").select("*");
  if (error) {
    console.error("Error reading expenses from Supabase:", error);
    return [];
  }
  return (data || []) as Expense[];
};

export const writeExpenses = async (expenses: Expense[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("expenses").upsert(expenses);
  if (error) {
    console.error("Error writing expenses to Supabase:", error);
    return false;
  }
  return true;
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const readDocuments = async (): Promise<Document[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("documents").select("*");
  if (error) {
    console.error("Error reading documents from Supabase:", error);
    return [];
  }
  return (data || []) as Document[];
};

export const writeDocuments = async (documents: Document[]): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").upsert(documents);
  if (error) {
    console.error("Error writing documents to Supabase:", error);
    return false;
  }
  return true;
};

export const appendDocument = async (doc: Document): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").insert(doc);
  if (error) {
    console.error("Error appending document to Supabase:", error);
    return false;
  }
  return true;
};

// ── Users (Dynamic Staff Accounts in Storage) ───────────────────────────────
export const getSeedUsers = (): CrmUser[] => [
  {
    id: "user-admin",
    name: "Admin User",
    email: "admin@jmvisa.com",
    password: "admin123",
    role: "ADMIN",
    allowedTabs: ["Dashboard", "Leads", "FollowUps", "Countries", "USASlots", "Checklist", "Submissions", "Payments", "Meetings", "DropLeads", "Staff"],
    createdAt: new Date().toISOString()
  },
  {
    id: "user-manager",
    name: "Manager User",
    email: "manager@jmvisa.com",
    password: "manager123",
    role: "MANAGER",
    allowedTabs: ["Dashboard", "Leads", "FollowUps", "Countries", "USASlots", "Checklist", "Submissions", "Payments", "Meetings", "DropLeads", "Staff"],
    createdAt: new Date().toISOString()
  },
  {
    id: "user-counselor",
    name: "Priya Mehta",
    email: "counselor@jmvisa.com",
    password: "counselor123",
    role: "COUNSELOR",
    allowedTabs: ["Dashboard", "Leads", "FollowUps", "Countries", "Meetings", "DropLeads"],
    createdAt: new Date().toISOString()
  }
];

export const readUsers = async (): Promise<CrmUser[]> => {
  const supabase = getSupabase();
  const bucket = process.env.SUPABASE_BUCKET || "crm-documents";
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download("system/users.json");

    if (error) {
      console.log("Could not read users from storage, checking/seeding defaults...", error.message);
      // Try to write default seed users if it wasn't found
      const seeds = getSeedUsers();
      await writeUsers(seeds);
      return seeds;
    }
    
    const text = await data.text();
    return JSON.parse(text) as CrmUser[];
  } catch (err) {
    console.error("Failed to read/parse users.json:", err);
    return getSeedUsers();
  }
};

export const writeUsers = async (users: CrmUser[]): Promise<boolean> => {
  const supabase = getSupabase();
  const bucket = process.env.SUPABASE_BUCKET || "crm-documents";
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload("system/users.json", Buffer.from(JSON.stringify(users, null, 2)), {
        contentType: "application/json",
        upsert: true,
      });

    if (error) {
      console.error("Error writing users to Supabase storage:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception writing users to storage:", err);
    return false;
  }
};

