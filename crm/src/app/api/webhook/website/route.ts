import { NextRequest, NextResponse } from "next/server";
import { writeLeads, appendActivity } from "@/utils/db";
import { getSupabase } from "@/utils/supabase";
import { Lead, Activity } from "@/context/CrmContext";
import { provisionLeadDriveFolder } from "@/lib/provisionLeadDriveFolder";
import { DEFAULT_USA_SLOTS, normalizeLead } from "@/utils/normalizeLead";
import { generateId } from "@/utils/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate webhook secret (guide §5.1)
    const configuredSecret = process.env.WEBHOOK_SECRET || "test_webhook_secret";
    if (body.secret !== configuredSecret) {
      console.warn("Unauthorized webhook attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Normalize country to CRM department key
    const rawCountry = (body.countryInterest || "").toUpperCase().trim();
    let country: Lead["country"] = "Europe";
    if (rawCountry.includes("UK") || rawCountry.includes("UNITED KINGDOM") || rawCountry.includes("BRITAIN")) {
      country = "UK";
    } else if (rawCountry.includes("USA") || rawCountry.includes("UNITED STATES") || rawCountry.includes("AMERICA")) {
      country = "USA";
    } else if (rawCountry.includes("CANADA")) {
      country = "Canada";
    }

    const today = new Date().toISOString().split("T")[0];
    const leadId = generateId("lead");

    const newLead: Lead = {
      id: leadId,
      name: body.name || "Unnamed Lead",
      email: body.email || "",
      phone: body.phone || "",
      country,
      visaType: body.service || "Visa Application",
      status: "NEW_LEAD",
      source: "WEBSITE",
      counselor: "Unassigned",
      dateCreated: today,
      lastUpdated: today,
      isDeleted: false,
      checklist: {
        passport: false,
        visaForm: false,
        businessDocs: false,
        salarySlips: false,
        bankStatement: false,
        itr: false,
        offerLetter: false,
        casOrI20: false,
        travelHistory: false,
        sopOrCoverLetter: false,
        photos: false,
        insurance: false,
        biometricsCompleted: false,
        visaFeesPaid: false,
      },
      payments: [],
      notes: `Received via website form\nSource: ${body.source || "WEBSITE"}\nService: ${body.service || "N/A"}\n\n${body.message || body.notes || ""}`.trim(),
    };

    if (country === "USA") {
      newLead.usaSlots = { ...DEFAULT_USA_SLOTS };
    }

    const digits = String(newLead.phone || "").replace(/\D/g, "");
    const last10 = digits.slice(-10);
    if (last10.length >= 8) {
      const supabase = getSupabase();
      let from = 0;
      let existingRow: { id: string } | undefined;
      for (;;) {
        const { data: phoneRows, error: phoneError } = await supabase
          .from("leads")
          .select("id, phone")
          .eq("isDeleted", false)
          .order("id", { ascending: true })
          .range(from, from + 999);
        if (phoneError) {
          console.error("Webhook phone lookup failed:", phoneError);
          return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
        }
        const page = phoneRows || [];
        existingRow = page.find((row) =>
          String(row.phone || "").replace(/\D/g, "").endsWith(last10)
        );
        if (existingRow || page.length < 1000) break;
        from += 1000;
      }
      if (existingRow) {
        const { data: noteRow } = await supabase
          .from("leads")
          .select("notes")
          .eq("id", existingRow.id)
          .maybeSingle();
        const noteLine = `Another website enquiry on ${today}: ${body.message || body.service || "Website form"}`.trim();
        const notes = [noteRow?.notes, noteLine].filter(Boolean).join("\n\n");
        await supabase.from("leads").update({ notes, lastUpdated: today }).eq("id", existingRow.id);
        await appendActivity({
          id: generateId("act"),
          leadId: existingRow.id,
          type: "note",
          content: "Repeat website enquiry added to the existing lead",
          createdAt: new Date().toISOString(),
          createdBy: "SYSTEM",
        });
        return NextResponse.json({ success: true, leadId: existingRow.id, duplicate: true }, { status: 200 });
      }
    }

    const leadsOk = await writeLeads([
      normalizeLead(newLead as unknown as Record<string, unknown>),
    ]);

    if (!leadsOk) {
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }

    const activityEntry: Activity = {
      id: generateId("act"),
      leadId,
      type: "lead_created",
      content: "Lead received from website form",
      createdAt: new Date().toISOString(),
      createdBy: "SYSTEM",
    };
    await appendActivity(activityEntry);

    try {
      await provisionLeadDriveFolder(leadId);
    } catch (e) {
      console.error("Drive provision failed:", leadId, e);
    }

    console.log(`Webhook lead created: ${newLead.name} (${leadId})`);
    return NextResponse.json({ success: true, leadId }, { status: 201 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.WEBSITE_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
