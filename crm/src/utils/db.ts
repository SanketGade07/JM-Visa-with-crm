import { getSupabase } from "@/utils/supabase";
import { Lead, Meeting, Activity, Expense, Document, CrmUser, type StaffRole } from "@/context/CrmContext";
import { normalizeLead, serializeLeadForDb } from "@/utils/normalizeLead";
import { ROLE_TABS, normalizePermissions } from "@/utils/crmConstants";

/** Drop deprecated manager accounts and reassign MANAGER role users to COUNSELOR. */
function migrateUsers(users: CrmUser[]): { users: CrmUser[]; changed: boolean } {
  let changed = false;
  const migrated = users
    .filter((user) => {
      if (user.id === "user-manager") {
        changed = true;
        return false;
      }
      return true;
    })
    .map((user) => {
      if (user.role === "MANAGER") {
        changed = true;
        return { ...user, role: "COUNSELOR" as StaffRole };
      }
      return user;
    });

  const withTabs = migrated.map((user) => {
    const roleTabs = ROLE_TABS[user.role as StaffRole];
    let next = user;

    const allowed = user.allowedTabs ?? [];
    const toAdd = roleTabs?.filter((tab) => !allowed.includes(tab)) ?? [];
    if (toAdd.length > 0) {
      changed = true;
      next = { ...next, allowedTabs: [...allowed, ...toAdd] };
    }

    const normalizedPermissions = normalizePermissions(user.permissions, user.role);
    const existingPermissions = Array.isArray(user.permissions) ? user.permissions : [];
    if (
      normalizedPermissions.length !== existingPermissions.length ||
      normalizedPermissions.some((perm, index) => perm !== existingPermissions[index])
    ) {
      changed = true;
      next = { ...next, permissions: normalizedPermissions };
    }

    return next;
  });

  return { users: withTabs, changed };
}

// ── Leads ────────────────────────────────────────────────────────────────────
export const readLeads = async (): Promise<Lead[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("leads").select("*");
  if (error) {
    console.error("Error reading leads from Supabase:", error);
    return [];
  }
  
  const leadsData = (data || []).map((row: Record<string, unknown>) => normalizeLead(row));
  
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

  const omittedColumns = new Set<string>();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const rows = leads.map((lead) => serializeLeadForDb(lead, { omitColumns: omittedColumns }));
    const { error } = await supabase.from("leads").upsert(rows);

    if (!error) {
      return true;
    }

    const errMsg = typeof error.message === "string" ? error.message : "";
    const columnMatch =
      errMsg.match(/Could not find the '([^']+)' column/) ||
      errMsg.match(/column "([^"]+)" of relation/) ||
      errMsg.match(/column "([^"]+)" does not exist/);

    if (columnMatch && columnMatch[1]) {
      const missingColumn = columnMatch[1];
      console.warn(`Column '${missingColumn}' is missing from the Supabase table — retrying without it.`);
      omittedColumns.add(missingColumn);
      attempts++;
    } else {
      console.error("Error writing leads to Supabase:", error);
      return false;
    }
  }

  console.error("Failed to write leads to Supabase: reached maximum retry attempts");
  return false;
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

export const updateLeadDriveFolderId = async (
  leadId: string,
  driveFolderId: string | null
): Promise<boolean> => {
  const supabase = getSupabase();
  try {
    const payload = { driveFolderId };
    const { error } = await supabase.from("leads").update(payload).eq("id", leadId);
    if (error) {
      console.error("Error updating lead driveFolderId in Supabase:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Exception updating lead driveFolderId:", err);
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
  let { error } = await supabase.from("documents").insert(doc);

  // Fall back gracefully if the optional driveFileId column hasn't been added
  // yet (run supabase/document_drive_file_id_migration.sql to enable it).
  if (
    error &&
    (error.code === "PGRST204" || error.code === "42703") &&
    typeof error.message === "string" &&
    error.message.toLowerCase().includes("drivefileid")
  ) {
    console.warn(
      "documents.driveFileId column missing — saving without it. Run: supabase/document_drive_file_id_migration.sql"
    );
    const { driveFileId, ...rest } = doc;
    void driveFileId;
    ({ error } = await supabase.from("documents").insert(rest));
  }

  if (error) {
    console.error("Error appending document to Supabase:", error);
    return false;
  }
  return true;
};

export const deleteDocument = async (id: string): Promise<boolean> => {
  const supabase = getSupabase();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) {
    console.error("Error deleting document from Supabase:", error);
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
    allowedTabs: ["Dashboard", "Leads", "USASlots", "Submissions", "Payments", "DropLeads", "Staff", "Drive"],
    permissions: ["assignLeads"],
    createdAt: new Date().toISOString()
  },
  {
    id: "user-counselor",
    name: "Priya Mehta",
    email: "counselor@jmvisa.com",
    password: "counselor123",
    role: "COUNSELOR",
    allowedTabs: ["Dashboard", "Leads", "DropLeads"],
    permissions: [],
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
    const parsed = JSON.parse(text) as CrmUser[];
    const { users: migrated, changed } = migrateUsers(parsed);
    if (changed) {
      await writeUsers(migrated);
    }
    return migrated;
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

