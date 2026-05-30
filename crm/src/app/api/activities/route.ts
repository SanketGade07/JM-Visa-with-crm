import { NextRequest, NextResponse } from "next/server";
import { readActivities, appendActivity } from "@/utils/db";
import { Activity } from "@/context/CrmContext";

// GET /api/activities — list all, or ?leadId=xxx for a specific lead's timeline
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    let activities = readActivities();
    if (leadId) activities = activities.filter((a) => a.leadId === leadId);

    // Always return newest-first
    activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return NextResponse.json({ error: "Failed to read activities" }, { status: 500 });
  }
}

// POST /api/activities — append a single activity entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const activity: Activity = {
      id: body.id || `act-${Date.now()}`,
      leadId: body.leadId,
      type: body.type || "note",
      content: body.content || "",
      createdAt: body.createdAt || new Date().toISOString(),
      createdBy: body.createdBy || "SYSTEM",
    };

    if (!activity.leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    appendActivity(activity);
    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}
