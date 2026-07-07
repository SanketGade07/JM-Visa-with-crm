import { NextRequest, NextResponse } from "next/server";
import { readLeads, writeLeads, readActivities, appendActivity } from "@/utils/db";
import { Activity, VisaStatus } from "@/context/CrmContext";
import { normalizeLeadStatus } from "@/utils/leadStatusConfig";
import { getSupabase } from "@/utils/supabase";
import { verifySession } from "@/utils/session";
import { normalizeLead } from "@/utils/normalizeLead";

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
  const activities = (await readActivities()).filter((a) => a.leadId === id);
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

  const updated = {
    ...prev,
    ...body, // Overwrite with any updated properties sent by the client
    id,      // Force identity consistency
    lastUpdated: today,
  };

  const ok = await writeLeads([updated]);
  if (!ok) return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });

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
  const leads = await readLeads();
  const index = leads.findIndex((l) => l.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const lead = leads[index];
  const driveFolderId = lead.driveFolderId;

  // Hard delete from database
  const supabase = getSupabase();
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
