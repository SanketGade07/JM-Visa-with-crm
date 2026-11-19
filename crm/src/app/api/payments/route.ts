import { NextRequest, NextResponse } from "next/server";
import { readLeads, appendActivity } from "@/utils/db";
import { getSupabase } from "@/utils/supabase";
import { createInvoiceNumber } from "@/utils/invoiceNumber";
import { Activity, PaymentDetails } from "@/context/CrmContext";

// GET /api/payments — all payments across all leads with optional filters
// ?status=PENDING|PAID  ?country=USA  ?leadId=xxx  ?from=2026-01-01  ?to=2026-12-31
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const country = searchParams.get("country");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const leads = (await readLeads()).filter((l) => !l.isDeleted);

    type PaymentRow = PaymentDetails & {
      leadId: string;
      leadName: string;
      country: string;
    };

    const rows: PaymentRow[] = [];

    for (const lead of leads) {
      if (leadId && lead.id !== leadId) continue;
      if (country && lead.country !== country) continue;

      for (const p of lead.payments || []) {
        if (from && p.date < from) continue;
        if (to && p.date > to) continue;
        rows.push({ ...p, leadId: lead.id, leadName: lead.name, country: lead.country });
      }
    }

    // Summary totals
    const totalCollected = rows.reduce((acc, r) => acc + r.amountPaid, 0);
    const totalPending = rows.reduce((acc, r) => acc + (r.pendingAmount || 0), 0);

    return NextResponse.json({ payments: rows, totalCollected, totalPending, count: rows.length });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: "Failed to read payments" }, { status: 500 });
  }
}

// POST /api/payments — add a payment to a lead
// Body: { leadId, amountPaid, totalPackage, pendingAmount, paymentMethod }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, amountPaid, totalPackage, pendingAmount, paymentMethod } = body;

    if (!leadId || amountPaid == null) {
      return NextResponse.json({ error: "leadId and amountPaid are required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: leadRow, error: leadError } = await supabase
      .from("leads")
      .select("id, payments")
      .eq("id", leadId)
      .maybeSingle();
    if (leadError || !leadRow) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const today = new Date().toISOString().split("T")[0];
    const invoiceNumber = createInvoiceNumber();
    const existingPayments = Array.isArray(leadRow.payments) ? leadRow.payments : [];

    const payment: PaymentDetails = {
      invoiceNumber,
      date: today,
      amountPaid: Number(amountPaid),
      totalPackage: Number(totalPackage || 0),
      pendingAmount: Number(pendingAmount || 0),
      paymentMethod: paymentMethod || "Cash",
    };

    const { error: updateError } = await supabase
      .from("leads")
      .update({ payments: [...existingPayments, payment], lastUpdated: today })
      .eq("id", leadId);
    if (updateError) console.error("Error saving payment:", updateError);
    const ok = !updateError;
    if (!ok) return NextResponse.json({ error: "Failed to save payment" }, { status: 500 });

    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId,
      type: "payment",
      content: `Payment ₹${amountPaid.toLocaleString()} recorded (${invoiceNumber}) via ${payment.paymentMethod}`,
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || "SYSTEM",
    };
    await appendActivity(activity);

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
