import { NextRequest, NextResponse } from "next/server";
import { readActivitiesByLeadId, appendActivity } from "@/utils/db";
import { Activity } from "@/context/CrmContext";
import { getSupabase } from "@/utils/supabase";
import { verifySession } from "@/utils/session";
import { LEAD_DB_COLUMNS, normalizeLead } from "@/utils/normalizeLead";
import { isGoogleDriveConfigured } from "@/lib/googleDrive";
import { provisionLeadDriveFolder } from "@/lib/provisionLeadDriveFolder";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/:id — full lead profile with activity timeline
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  
  const supabase = getSupabase();
  const { data: dbLead, error: fetchError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !dbLead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const lead = normalizeLead(dbLead);

  if (!lead.driveFolderId && isGoogleDriveConfigured()) {
    try {
      const provisioned = await provisionLeadDriveFolder(id);
      if (provisioned.ok) {
        lead.driveFolderId = provisioned.driveFolderId;
      }
    } catch (e) {
      console.error(`Auto-provisioning Drive folder on GET /api/leads/${id} failed:`, e);
    }
  }

  const activities = await readActivitiesByLeadId(id);
  return NextResponse.json({ lead, activities });
}

// PUT /api/leads/:id — update status, assignee, notes, etc.
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  
  const supabase = getSupabase();
  const { data: dbLead, error: fetchError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !dbLead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const prev = normalizeLead(dbLead);
  const today = new Date().toISOString().split("T")[0];

  const patch: Record<string, unknown> = { lastUpdated: today };
  for (const key of LEAD_DB_COLUMNS) {
    if (key === "id" || key === "lastUpdated") continue;
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      patch[key] = body[key];
    }
  }

  const { error: updateError } = await supabase.from("leads").update(patch).eq("id", id);
  if (updateError) {
    console.error("PUT /api/leads error:", updateError);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }

  const updated = normalizeLead({ ...prev, ...patch, id } as Record<string, unknown>);

  // Log status change activity if status changed
  if (body.status && body.status !== prev.status) {
    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId: id,
      type: "status_change",
      content: `Status changed from "${prev.status}" to "${body.status}"`,
      createdAt: new Date().toISOString(),
      createdBy: body.updatedBy || "SYSTEM",
    };
    await appendActivity(activity);
  }

  return NextResponse.json({ success: true, lead: updated });
}

// DELETE /api/leads/:id — hard delete lead completely from database (restricted to ADMIN)
export async function DELETE(req: NextRequest, { params }: Params) {
  const sessionToken = req.cookies.get("crm_session")?.value ?? "";
  const session = sessionToken ? await verifySession(sessionToken) : null;
  const role = session?.role ?? null;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins are allowed to delete leads" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = getSupabase();
  const { data: leadRow, error: leadReadError } = await supabase
    .from("leads")
    .select("id, driveFolderId")
    .eq("id", id)
    .maybeSingle();

  if (leadReadError || !leadRow) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const driveFolderId = leadRow.driveFolderId as string | undefined;

  // Hard delete from database
  const { error: dbError } = await supabase.from("leads").delete().eq("id", id);
  if (dbError) {
    console.error("Error deleting lead from Supabase:", dbError);
    return NextResponse.json({ error: "Failed to delete lead from database" }, { status: 500 });
  }

  // Also clean up related activities and documents
  await supabase.from("activities").delete().eq("leadId", id);
  await supabase.from("documents").delete().eq("leadId", id);

  // Clean up Google Drive folder if exists
  if (driveFolderId) {
    try {
      const { isGoogleDriveConfigured, deleteFolderFromDrive } = await import("@/lib/googleDrive");
      if (isGoogleDriveConfigured()) {
        await deleteFolderFromDrive(driveFolderId);
      }
    } catch (err) {
      console.error(`Failed to delete Google Drive folder ${driveFolderId} for lead ${id}:`, err);
    }
  }

  return NextResponse.json({ success: true });
}
