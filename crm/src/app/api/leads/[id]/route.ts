import { NextRequest, NextResponse } from "next/server";
import { readLeads, writeLeads, readActivities, appendActivity } from "@/utils/db";
import { Activity, VisaStatus } from "@/context/CrmContext";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/:id — full lead profile with activity timeline
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const leads = await readLeads();
  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const activities = (await readActivities()).filter((a) => a.leadId === id);
  return NextResponse.json({ lead, activities });
}

// PUT /api/leads/:id — update status, assignee, notes, etc.
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const leads = await readLeads();
  const index = leads.findIndex((l) => l.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const prev = leads[index];
  const today = new Date().toISOString().split("T")[0];

  const updated = {
    ...prev,
    ...(body.status !== undefined && { status: body.status as VisaStatus }),
    ...(body.counselor !== undefined && { counselor: body.counselor }),
    ...(body.notes !== undefined && { notes: body.notes }),
    ...(body.email !== undefined && { email: body.email }),
    ...(body.phone !== undefined && { phone: body.phone }),
    ...(body.visaType !== undefined && { visaType: body.visaType }),
    lastUpdated: today,
  };

  leads[index] = updated;
  const ok = await writeLeads(leads);
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

// DELETE /api/leads/:id — soft delete only (guide §13 rule 5)
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const leads = await readLeads();
  const index = leads.findIndex((l) => l.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  leads[index] = {
    ...leads[index],
    status: "Dropped",
    isDeleted: true,
    lastUpdated: new Date().toISOString().split("T")[0],
  };

  const ok = await writeLeads(leads);
  if (!ok) return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });

  const activity: Activity = {
    id: `act-${Date.now()}`,
    leadId: id,
    type: "status_change",
    content: "Lead soft-deleted (Dropped)",
    createdAt: new Date().toISOString(),
    createdBy: "SYSTEM",
  };
  await appendActivity(activity);

  return NextResponse.json({ success: true });
}
