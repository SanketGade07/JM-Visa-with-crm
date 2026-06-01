import { NextResponse } from "next/server";
import { readLeads } from "@/utils/db";

// GET /api/reports/by-country — breakdown per destination country
export async function GET() {
  try {
    const leads = (await readLeads()).filter((l) => !l.isDeleted);
    const countries = ["UK", "USA", "Canada", "Europe"] as const;

    const report = countries.map((country) => {
      const countryLeads = leads.filter((l) => l.country === country);
      const revenue = countryLeads.reduce(
        (acc, l) => acc + l.payments.reduce((s, p) => s + p.amountPaid, 0),
        0
      );
      const byStatus: Record<string, number> = {};
      for (const l of countryLeads) {
        byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      }

      return {
        country,
        total: countryLeads.length,
        revenue,
        approved: countryLeads.filter((l) => l.status === "Approved / Rejected").length,
        dropped: countryLeads.filter((l) => l.status === "Dropped").length,
        byStatus,
      };
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("GET /api/reports/by-country error:", error);
    return NextResponse.json({ error: "Failed to generate country report" }, { status: 500 });
  }
}
