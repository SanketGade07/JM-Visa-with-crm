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
  const rows = leads.map((lead) => serializeLeadForDb(lead));
  
  const { error } = await supabase.from("leads").upsert(rows);
  if (error) {
    console.error("CRITICAL: Error writing leads to Supabase:", error);
    return false;
  }
  
  return true;
};

export const updateLeadCredentials = async (
  leadId: string,
  creds: { username?: string; password?: string; portalUrl?: string } | null,
  countryApplications?: Record<string, any>
): Promise<boolean> => {
  const supabase = getSupabase();
  try {
    const visaCredentialsPayload = creds || countryApplications
      ? {
          ...(creds || {}),
          ...(countryApplications ? { countryApplications } : {}),
        }
      : null;

    const payload = { visaCredentials: visaCredentialsPayload };
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

// ── Users (staff directory in Postgres `staff_users`) ───────────────────────
// Leads link by counselor *name* string, not staff id — renaming a staff member
// can orphan assignments; ids/emails can change freely.

const SEED_ONLY_IDS = new Set(["user-admin", "user-counselor"]);

/** Hardcoded fallbacks for local/dev bootstrap only — never auto-written over production. */
export const getSeedUsers = (): CrmUser[] => [
  {
    id: "user-admin",
    name: "Admin User",
    email: "admin@jmvisa.com",
    password: "admin123",
    role: "ADMIN",
    allowedTabs: ROLE_TABS.ADMIN,
    permissions: ["assignLeads"],
    createdAt: new Date().toISOString()
  },
  {
    id: "user-counselor",
    name: "Priya Mehta",
    email: "counselor@jmvisa.com",
    password: "counselor123",
    role: "COUNSELOR",
    allowedTabs: ROLE_TABS.COUNSELOR,
    permissions: [],
    createdAt: new Date().toISOString()
  }
];

/** True when roster looks like wiped seed-only state — orphan reconciler must no-op. */
export const isSeedOnlyStaffRoster = (users: CrmUser[]): boolean =>
  users.length > 0 && users.every((user) => SEED_ONLY_IDS.has(user.id));

type StaffUserRow = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  allowedTabs: string[] | null;
  permissions: string[] | null;
  createdAt: string;
};

function rowToCrmUser(row: StaffUserRow): CrmUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password ?? "",
    role: row.role,
    allowedTabs: Array.isArray(row.allowedTabs) ? row.allowedTabs : [],
    permissions: Array.isArray(row.permissions) ? row.permissions : [],
    createdAt: row.createdAt || new Date().toISOString(),
  };
}

async function mirrorUsersToStorage(users: CrmUser[]): Promise<void> {
  const supabase = getSupabase();
  const bucket = process.env.SUPABASE_BUCKET || "crm-documents";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const payload = Buffer.from(JSON.stringify(users, null, 2));

  // Best-effort mirrors — Postgres is source of truth; failures must not block writes.
  await supabase.storage
    .from(bucket)
    .upload("system/users.json", payload, { contentType: "application/json", upsert: true })
    .catch((err) => console.warn("users.json mirror failed:", err));

  await supabase.storage
    .from(bucket)
    .upload(`system/backups/users-${stamp}.json`, payload, {
      contentType: "application/json",
      upsert: false,
    })
    .catch((err) => console.warn("users.json storage backup failed:", err));
}

export const readUsers = async (): Promise<CrmUser[]> => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("staff_users")
    .select("id, name, email, password, role, allowedTabs, permissions, createdAt")
    .order("createdAt", { ascending: true });

  if (error) {
    console.error("Error reading staff_users from Postgres:", error);
    // Fail closed: do NOT seed/overwrite. Callers (login) treat empty as auth failure.
    return [];
  }

  if (!data || data.length === 0) {
    console.warn("staff_users is empty — refusing auto-seed (prevents wiping production roster)");
    return [];
  }

  const parsed = (data as StaffUserRow[]).map(rowToCrmUser);
  const { users: migrated, changed } = migrateUsers(parsed);
  if (changed) {
    await writeUsers(migrated);
  }
  return migrated;
};

export const writeUsers = async (users: CrmUser[]): Promise<boolean> => {
  const supabase = getSupabase();

  if (!users.length) {
    console.error("Refusing to write empty staff roster");
    return false;
  }

  try {
    const { data: current, error: readError } = await supabase.from("staff_users").select("*");
    if (readError) {
      console.error("Error reading staff_users before write:", readError);
      return false;
    }

    if (current && current.length > 0) {
      const { error: backupError } = await supabase.from("staff_users_backups").insert({
        snapshot: current,
        reason: "writeUsers",
      });
      if (backupError) {
        console.warn("staff_users_backups insert failed:", backupError);
      }

      // Keep last 30 DB backups
      const { data: oldBackups } = await supabase
        .from("staff_users_backups")
        .select("id")
        .order("created_at", { ascending: false })
        .range(30, 1000);
      if (oldBackups && oldBackups.length > 0) {
        await supabase
          .from("staff_users_backups")
          .delete()
          .in(
            "id",
            oldBackups.map((row: { id: number }) => row.id)
          );
      }
    }

    const rows = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password || "",
      role: user.role,
      allowedTabs: user.allowedTabs ?? [],
      permissions: user.permissions ?? [],
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase.from("staff_users").upsert(rows, {
      onConflict: "id",
    });
    if (upsertError) {
      console.error("Error upserting staff_users:", upsertError);
      return false;
    }

    const keepIds = new Set(users.map((user) => user.id));
    const toDelete = (current || [])
      .map((row: { id: string }) => row.id)
      .filter((id: string) => !keepIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase.from("staff_users").delete().in("id", toDelete);
      if (deleteError) {
        console.error("Error deleting removed staff_users:", deleteError);
        return false;
      }
    }

    void mirrorUsersToStorage(users);
    return true;
  } catch (err) {
    console.error("Exception writing staff_users:", err);
    return false;
  }
};

