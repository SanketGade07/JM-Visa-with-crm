import { NextRequest, NextResponse } from "next/server";
import { readLeads, writeLeads, appendActivity } from "@/utils/db";
import { Lead, Activity } from "@/context/CrmContext";
import { provisionLeadDriveFolder } from "@/lib/provisionLeadDriveFolder";
import { DEFAULT_USA_SLOTS, normalizeLead } from "@/utils/normalizeLead";
import { normalizeLeadStatus } from "@/utils/leadStatusConfig";
import { isCounselorAssigned } from "@/utils/counselorOptions";
import {
  buildEmptyChecklist,
  DEFAULT_EMPLOYMENT_CATEGORY,
  EMPLOYMENT_CATEGORIES,
  type EmploymentCategory,
} from "@/utils/documentChecklistConfig";
import { verifySession, generateId } from "@/utils/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Filters (guide §5.2)
    const status = searchParams.get("status");
    const country = searchParams.get("country");
    const assigned = searchParams.get("assigned");
    const search = searchParams.get("search")?.toLowerCase();
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    // Pagination (guide §13 rule 7)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    let leads = await readLeads();

    // Exclude soft-deleted leads by default
    if (!includeDeleted) {
      leads = leads.filter((l) => !l.isDeleted);
    }

    if (status) leads = leads.filter((l) => l.status === status);
    if (country) leads = leads.filter((l) => l.country === country);
    if (assigned) leads = leads.filter((l) => l.counselor === assigned);
    if (search) {
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.phone.includes(search) ||
          l.email?.toLowerCase().includes(search)
      );
    }

    const total = leads.length;
    const paginated = leads.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ leads: paginated, total, page, limit });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Failed to read leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existingLeads = await readLeads();

    // Bulk sync from CRM frontend
    if (Array.isArray(body.leads)) {
      const incoming = body.leads as Lead[];
      const existingById = new Map(existingLeads.map((l) => [l.id, l]));
      const merged = incoming.map((lead) => {
        const normalized = normalizeLead(lead as unknown as Record<string, unknown>);
        if ("driveFolderId" in lead && lead.driveFolderId !== undefined) {
          return normalized.driveFolderId !== undefined
            ? normalized
            : { ...normalized, driveFolderId: lead.driveFolderId };
        }
        const prev = existingById.get(lead.id);
        return prev?.driveFolderId
          ? { ...normalized, driveFolderId: prev.driveFolderId }
          : normalized;
      });
      const ok = await writeLeads(merged);
      if (!ok) {
        return NextResponse.json({ error: "Failed to write leads" }, { status: 500 });
      }

      const existingIds = new Set(existingLeads.map((l) => l.id));
      const newlyCreated = merged.filter((l) => !existingIds.has(l.id));
      for (const lead of newlyCreated) {
        try {
          await provisionLeadDriveFolder(lead.id);
        } catch (e) {
          console.error("Drive provision failed:", lead.id, e);
        }
      }

      return NextResponse.json({ success: true });
    }

    // Single manual lead creation
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();
    const leadId = body.id || generateId("lead");
    const country = body.country || "UK";
    const employmentCategory: EmploymentCategory =
      typeof body.employmentCategory === "string" &&
      body.employmentCategory in EMPLOYMENT_CATEGORIES
        ? (body.employmentCategory as EmploymentCategory)
        : DEFAULT_EMPLOYMENT_CATEGORY;

    const newLead: Lead = normalizeLead({
      ...body,
      id: leadId,
      name: body.name || body.firstName || "Unnamed Lead",
      email: body.email || "",
      phone: body.phone || body.phoneNumber || "",
      country,
      visaType: body.visaType || body.category || "General Inquiry",
      status: typeof body.status === "string" ? body.status : "NEW_LEAD",
      source: body.source || "MANUAL",
      counselor: body.counselor || "Unassigned",
      dateCreated: body.dateCreated || today,
      lastUpdated: today,
      isDeleted: false,
      employmentCategory,
      checklist: body.checklist || buildEmptyChecklist(employmentCategory),
      payments: body.payments || [],
      notes: body.notes || body.message || "",
      assignedAt: body.assignedAt || (isCounselorAssigned(body.counselor) ? now : undefined),
    });

    if (country === "USA" && !newLead.usaSlots) {
      newLead.usaSlots = { ...DEFAULT_USA_SLOTS, slotLocation: "Delhi" };
    }

    const ok = await writeLeads([newLead]);
    if (!ok) return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });

    const activity: Activity = {
      id: generateId("act"),
      leadId,
      type: "lead_created",
      content: `Lead created manually (source: ${newLead.source})`,
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || "SYSTEM",
    };
    await appendActivity(activity);

    let driveFolderId: string | undefined;
    try {
      const provisioned = await provisionLeadDriveFolder(leadId);
      if (provisioned.ok) {
        driveFolderId = provisioned.driveFolderId;
        newLead.driveFolderId = driveFolderId;
      }
    } catch (e) {
      console.error("Drive provision failed:", leadId, e);
    }

    return NextResponse.json(
      { success: true, lead: newLead, ...(driveFolderId ? { driveFolderId } : {}) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("crm_session")?.value ?? "";
    const session = sessionToken ? await verifySession(sessionToken) : null;
    const role = session?.role ?? null;
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins are allowed to delete leads" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 });
    }
    const ids = idsParam.split(",");

    const { getSupabase } = await import("@/utils/supabase");
    const supabase = getSupabase();

    // Get driveFolderIds for matching leads before deleting them
    const leadsList = await readLeads();
    const driveFolderIds = leadsList
      .filter((l) => ids.includes(l.id) && l.driveFolderId)
      .map((l) => l.driveFolderId) as string[];

    const { error: dbError } = await supabase.from("leads").delete().in("id", ids);
    if (dbError) {
      console.error("Error deleting leads from Supabase:", dbError);
      return NextResponse.json({ error: "Failed to delete leads from database" }, { status: 500 });
    }

    await supabase.from("activities").delete().in("leadId", ids);
    await supabase.from("documents").delete().in("leadId", ids);

    // Cascade deletion to Google Drive folders if configured
    if (driveFolderIds.length > 0) {
      try {
        const { isGoogleDriveConfigured, deleteFolderFromDrive } = await import("@/lib/googleDrive");
        if (isGoogleDriveConfigured()) {
          await Promise.all(
            driveFolderIds.map(async (folderId) => {
              try {
                await deleteFolderFromDrive(folderId);
              } catch (err) {
                console.error(`Failed to delete Google Drive folder ${folderId} during bulk delete:`, err);
              }
            })
          );
        }
      } catch (err) {
        console.error("Failed to process Google Drive deletions during bulk delete:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/leads error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
