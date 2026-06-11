import { NextRequest, NextResponse } from "next/server";
import { readLeads, writeLeads, appendActivity } from "@/utils/db";
import { Lead, Activity } from "@/context/CrmContext";
import { DEFAULT_USA_SLOTS } from "@/utils/normalizeLead";
import {
  buildEmptyChecklist,
  DEFAULT_EMPLOYMENT_CATEGORY,
  EMPLOYMENT_CATEGORIES,
  type EmploymentCategory,
} from "@/utils/documentChecklistConfig";

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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

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
      const ok = await writeLeads(body.leads);
      return ok
        ? NextResponse.json({ success: true })
        : NextResponse.json({ error: "Failed to write leads" }, { status: 500 });
    }

    // Single manual lead creation
    const today = new Date().toISOString().split("T")[0];
    const leadId = `lead-${Date.now()}`;
    const country = body.country || "UK";
    const employmentCategory: EmploymentCategory =
      typeof body.employmentCategory === "string" &&
      body.employmentCategory in EMPLOYMENT_CATEGORIES
        ? (body.employmentCategory as EmploymentCategory)
        : DEFAULT_EMPLOYMENT_CATEGORY;

    const newLead: Lead = {
      id: leadId,
      name: body.name || body.firstName || "Unnamed Lead",
      email: body.email || "",
      phone: body.phone || body.phoneNumber || "",
      country,
      visaType: body.visaType || body.category || "General Inquiry",
      status: body.status || "New Lead",
      source: body.source || "MANUAL",
      counselor: body.counselor || "Unassigned",
      dateCreated: today,
      lastUpdated: today,
      isDeleted: false,
      employmentCategory,
      checklist: buildEmptyChecklist(employmentCategory),
      payments: [],
      notes: body.notes || body.message || "",
    };

    if (country === "USA") {
      newLead.usaSlots = { ...DEFAULT_USA_SLOTS, slotLocation: "Delhi" };
    }

    const ok = await writeLeads([...existingLeads, newLead]);
    if (!ok) return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });

    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId,
      type: "lead_created",
      content: `Lead created manually (source: ${newLead.source})`,
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || "SYSTEM",
    };
    await appendActivity(activity);

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
