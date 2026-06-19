import { Activity } from "@/context/CrmContext";
import {
  ensureLeadClientFolder,
  isGoogleDriveConfigured,
  validateFolderAccess,
} from "@/lib/googleDrive";
import { appendActivity, readLeads, updateLeadDriveFolderId } from "@/utils/db";

export type ProvisionLeadDriveFolderResult =
  | { ok: true; driveFolderId: string; folderName: string }
  | { ok: false; code: "not_configured" | "lead_not_found" | "save_failed" };

/** Provision a per-lead Drive folder under Root/Clients/{lead name}. Idempotent when driveFolderId exists. */
export async function provisionLeadDriveFolder(
  leadId: string
): Promise<ProvisionLeadDriveFolderResult> {
  if (!isGoogleDriveConfigured()) {
    return { ok: false, code: "not_configured" };
  }

  const leads = await readLeads();
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) {
    return { ok: false, code: "lead_not_found" };
  }

  if (lead.driveFolderId) {
    const existing = await validateFolderAccess(lead.driveFolderId);
    return {
      ok: true,
      driveFolderId: existing.folderId,
      folderName: existing.folderName,
    };
  }

  const { folderId, folderName } = await ensureLeadClientFolder(lead.name);

  const saved = await updateLeadDriveFolderId(leadId, folderId);
  if (!saved) {
    return { ok: false, code: "save_failed" };
  }

  const activity: Activity = {
    id: `act-${Date.now()}`,
    leadId,
    type: "note",
    content: "Drive folder created for lead",
    createdAt: new Date().toISOString(),
    createdBy: "ADMIN",
  };
  await appendActivity(activity);

  return { ok: true, driveFolderId: folderId, folderName };
}
