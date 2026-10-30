import { getSupabase } from "@/utils/supabase";
import {
  getRootFolderId,
  getOrCreateFolder,
  isGoogleDriveConfigured,
  uploadFileToDrive,
} from "@/lib/googleDrive";

export const CRM_BACKUP_TABLES = [
  "leads",
  "activities",
  "meetings",
  "documents",
  "expenses",
  "app_settings",
  "staff_users",
] as const;

export type CrmBackupReason = "manual" | "daily" | "auto" | "pre-restore";

export type CrmSnapshotCounts = Record<(typeof CRM_BACKUP_TABLES)[number], number>;

export type CrmSnapshotListItem = {
  id: number;
  reason: string;
  counts: CrmSnapshotCounts;
  storagePath: string | null;
  driveFileId: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type CrmSnapshotPayload = {
  version: number;
  capturedAt?: string;
  leads: unknown[];
  activities: unknown[];
  meetings: unknown[];
  documents: unknown[];
  expenses: unknown[];
  app_settings: unknown[];
  staff_users: unknown[];
};

const AUTO_REASONS = new Set(["daily", "auto"]);
const MAX_AUTO_SNAPSHOTS = 30;

function emptyCounts(): CrmSnapshotCounts {
  return {
    leads: 0,
    activities: 0,
    meetings: 0,
    documents: 0,
    expenses: 0,
    app_settings: 0,
    staff_users: 0,
  };
}

export function computeCounts(payload: CrmSnapshotPayload): CrmSnapshotCounts {
  const counts = emptyCounts();
  for (const key of CRM_BACKUP_TABLES) {
    const value = payload[key];
    counts[key] = Array.isArray(value) ? value.length : 0;
  }
  return counts;
}

export async function buildSnapshotPayload(): Promise<CrmSnapshotPayload> {
  const supabase = getSupabase();
  const [
    leads,
    activities,
    meetings,
    documents,
    expenses,
    appSettings,
    staffUsers,
  ] = await Promise.all([
    supabase.from("leads").select("*"),
    supabase.from("activities").select("*"),
    supabase.from("meetings").select("*"),
    supabase.from("documents").select("*"),
    supabase.from("expenses").select("*"),
    supabase.from("app_settings").select("*"),
    supabase.from("staff_users").select("*"),
  ]);

  const firstError =
    leads.error ||
    activities.error ||
    meetings.error ||
    documents.error ||
    expenses.error ||
    appSettings.error ||
    staffUsers.error;
  if (firstError) {
    throw new Error(`Failed to read CRM tables for backup: ${firstError.message}`);
  }

  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    leads: leads.data ?? [],
    activities: activities.data ?? [],
    meetings: meetings.data ?? [],
    documents: documents.data ?? [],
    expenses: expenses.data ?? [],
    app_settings: appSettings.data ?? [],
    staff_users: staffUsers.data ?? [],
  };
}

async function mirrorSnapshotToStorage(
  snapshotId: number,
  payload: CrmSnapshotPayload
): Promise<string | null> {
  const supabase = getSupabase();
  const bucket = process.env.SUPABASE_BUCKET || "crm-documents";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `system/backups/crm-snapshot-${snapshotId}-${stamp}.json`;
  const body = Buffer.from(JSON.stringify(payload));

  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType: "application/json",
    upsert: false,
  });
  if (error) {
    console.warn("CRM snapshot Storage upload failed:", error.message);
    return null;
  }
  return path;
}

async function mirrorSnapshotToDrive(
  snapshotId: number,
  payload: CrmSnapshotPayload
): Promise<string | null> {
  if (!isGoogleDriveConfigured()) return null;
  try {
    const rootId = await getRootFolderId();
    if (!rootId) return null;
    const folderId = await getOrCreateFolder(rootId, "CRM Backups");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const uploaded = await uploadFileToDrive(
      folderId,
      `crm-snapshot-${snapshotId}-${stamp}.json`,
      Buffer.from(JSON.stringify(payload)),
      "application/json"
    );
    return uploaded.id;
  } catch (error) {
    console.warn("CRM snapshot Drive upload failed:", error);
    return null;
  }
}

async function pruneAutoSnapshots(): Promise<void> {
  const supabase = getSupabase();
  const { data: oldRows, error } = await supabase
    .from("crm_snapshots")
    .select("id, reason")
    .in("reason", ["daily", "auto"])
    .order("created_at", { ascending: false })
    .range(MAX_AUTO_SNAPSHOTS, 5000);

  if (error || !oldRows?.length) return;

  const ids = oldRows.map((row: { id: number }) => row.id);
  await supabase.from("crm_snapshots").delete().in("id", ids);
}

export async function createCrmSnapshot(options: {
  reason: CrmBackupReason;
  createdBy?: string | null;
}): Promise<CrmSnapshotListItem> {
  const payload = await buildSnapshotPayload();
  const counts = computeCounts(payload);
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("crm_snapshots")
    .insert({
      reason: options.reason,
      payload,
      counts,
      created_by: options.createdBy ?? null,
    })
    .select("id, reason, counts, storage_path, drive_file_id, created_by, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to insert crm_snapshots row");
  }

  const storagePath = await mirrorSnapshotToStorage(data.id, payload);
  const driveFileId = await mirrorSnapshotToDrive(data.id, payload);

  if (storagePath || driveFileId) {
    await supabase
      .from("crm_snapshots")
      .update({
        storage_path: storagePath,
        drive_file_id: driveFileId,
      })
      .eq("id", data.id);
  }

  if (AUTO_REASONS.has(options.reason)) {
    await pruneAutoSnapshots();
  }

  return {
    id: data.id,
    reason: data.reason,
    counts: (data.counts as CrmSnapshotCounts) || counts,
    storagePath: storagePath ?? data.storage_path ?? null,
    driveFileId: driveFileId ?? data.drive_file_id ?? null,
    createdBy: data.created_by ?? null,
    createdAt: data.created_at,
  };
}

export async function listCrmSnapshots(limit = 50): Promise<CrmSnapshotListItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("crm_snapshots")
    .select("id, reason, counts, storage_path, drive_file_id, created_by, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    id: row.id,
    reason: row.reason,
    counts: (row.counts as CrmSnapshotCounts) || emptyCounts(),
    storagePath: row.storage_path ?? null,
    driveFileId: row.drive_file_id ?? null,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
  }));
}

export async function getLatestSnapshotAgeHours(): Promise<number | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("crm_snapshots")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.created_at) return null;
  const ageMs = Date.now() - new Date(data.created_at).getTime();
  return ageMs / (1000 * 60 * 60);
}

export async function maybeCreateDailySnapshot(createdBy?: string | null): Promise<{
  created: boolean;
  snapshot?: CrmSnapshotListItem;
}> {
  const ageHours = await getLatestSnapshotAgeHours();
  if (ageHours !== null && ageHours < 20) {
    return { created: false };
  }
  const snapshot = await createCrmSnapshot({
    reason: ageHours === null ? "manual" : "daily",
    createdBy: createdBy ?? "system",
  });
  // First-ever snapshot uses manual label so it is never pruned; subsequent are daily.
  if (ageHours === null) {
    // Re-label would be nicer as daily for first after setup — keep as manual seed backup.
  }
  return { created: true, snapshot };
}

export async function restoreCrmSnapshot(options: {
  snapshotId: number;
  confirm: string;
  restoredBy?: string | null;
}): Promise<{
  ok: boolean;
  restoredSnapshotId: number;
  preRestoreSnapshotId: number;
  counts: CrmSnapshotCounts;
}> {
  if (options.confirm !== "RESTORE") {
    throw new Error('confirm must be "RESTORE"');
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("restore_crm_from_snapshot", {
    p_snapshot_id: options.snapshotId,
    p_confirm: options.confirm,
    p_restored_by: options.restoredBy ?? "admin",
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = data as {
    ok?: boolean;
    restoredSnapshotId?: number;
    preRestoreSnapshotId?: number;
    counts?: CrmSnapshotCounts;
  };

  return {
    ok: Boolean(result?.ok),
    restoredSnapshotId: Number(result?.restoredSnapshotId ?? options.snapshotId),
    preRestoreSnapshotId: Number(result?.preRestoreSnapshotId ?? 0),
    counts: result?.counts || emptyCounts(),
  };
}
