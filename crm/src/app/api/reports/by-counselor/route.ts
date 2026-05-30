import { NextResponse } from "next/server";
import { readLeads, readMeetings } from "@/utils/db";

// GET /api/reports/by-counselor — per-staff performance metrics
export async function GET() {
  try {
    const leads = readLeads().filter((l) => !l.isDeleted);
    const meetings = readMeetings();

    const counselorMap = new Map<string, {
      total: number;
      converted: number;
      dropped: number;
      revenue: number;
      meetings: number;
    }>();

    for (const lead of leads) {
      const name = lead.counselor || "Unassigned";
      const existing = counselorMap.get(name) ?? { total: 0, converted: 0, dropped: 0, revenue: 0, meetings: 0 };
      existing.total += 1;
      if (lead.status === "Approved / Rejected") existing.converted += 1;
      if (lead.status === "Dropped") existing.dropped += 1;
      existing.revenue += lead.payments.reduce((s, p) => s + p.amountPaid, 0);
      counselorMap.set(name, existing);
    }

    for (const meeting of meetings) {
      const name = meeting.counselorAssigned || "Unassigned";
      const existing = counselorMap.get(name) ?? { total: 0, converted: 0, dropped: 0, revenue: 0, meetings: 0 };
      existing.meetings += 1;
      counselorMap.set(name, existing);
    }

    const report = Array.from(counselorMap.entries()).map(([counselor, stats]) => ({
      counselor,
      ...stats,
      conversionRate:
        stats.total > 0 ? `${((stats.converted / stats.total) * 100).toFixed(1)}%` : "0%",
    }));

    return NextResponse.json(report);
  } catch (error) {
    console.error("GET /api/reports/by-counselor error:", error);
    return NextResponse.json({ error: "Failed to generate counselor report" }, { status: 500 });
  }
}
