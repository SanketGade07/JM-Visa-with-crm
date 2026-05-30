import { NextResponse } from "next/server";
import { readLeads, readExpenses } from "@/utils/db";

// GET /api/reports/summary — dashboard-level KPIs
export async function GET() {
  try {
    const leads = readLeads().filter((l) => !l.isDeleted);
    const expenses = readExpenses();

    // Lead counts by status
    const byStatus: Record<string, number> = {};
    for (const lead of leads) {
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1;
    }

    // Lead counts by source
    const bySource: Record<string, number> = {};
    for (const lead of leads) {
      const src = lead.source || "MANUAL";
      bySource[src] = (bySource[src] || 0) + 1;
    }

    // Lead counts by country
    const byCountry: Record<string, number> = {};
    for (const lead of leads) {
      byCountry[lead.country] = (byCountry[lead.country] || 0) + 1;
    }

    // Financial
    const totalRevenue = leads.reduce(
      (acc, l) => acc + l.payments.reduce((s, p) => s + p.amountPaid, 0),
      0
    );
    const totalPending = leads.reduce(
      (acc, l) => acc + l.payments.reduce((s, p) => s + (p.pendingAmount || 0), 0),
      0
    );
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Conversion rate: Approved / (total non-dropped)
    const approved = leads.filter((l) => l.status === "Approved / Rejected").length;
    const conversionRate = leads.length > 0 ? ((approved / leads.length) * 100).toFixed(1) : "0";

    const dropRate =
      leads.length > 0
        ? (
            (leads.filter((l) => l.status === "Dropped").length / leads.length) *
            100
          ).toFixed(1)
        : "0";

    return NextResponse.json({
      totalLeads: leads.length,
      byStatus,
      bySource,
      byCountry,
      conversionRate: `${conversionRate}%`,
      dropRate: `${dropRate}%`,
      financials: { totalRevenue, totalPending, totalExpenses, netProfit },
    });
  } catch (error) {
    console.error("GET /api/reports/summary error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
