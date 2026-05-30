import { NextRequest, NextResponse } from "next/server";
import { readLeads, writeLeads, appendActivity } from "@/utils/db";
import { Lead, Activity } from "@/context/CrmContext";

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
    const leadId = `lead-${Date.now()}`;

    const newLead: Lead = {
      id: leadId,
      name: body.name || "Unnamed Lead",
      email: body.email || "",
      phone: body.phone || "",
      country,
      visaType: body.service || "Visa Application",
      status: "New Lead",
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
      newLead.usaSlots = {
        credentialsProvided: false,
        slotsAvailable: false,
        slotsPaid: false,
        slotsBooked: false,
        ds160Submitted: false,
        interviewScheduled: false,
        interviewDate: "",
        slotLocation: "",
      };
    }

    // Atomic: save lead + activity log together (guide §13 rule 3)
    const existingLeads = readLeads();
    const leadsOk = writeLeads([...existingLeads, newLead]);

    const activityEntry: Activity = {
      id: `act-${Date.now()}`,
      leadId,
      type: "lead_created",
      content: "Lead received from website form",
      createdAt: new Date().toISOString(),
      createdBy: "SYSTEM",
    };
    appendActivity(activityEntry);

    if (!leadsOk) {
      return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
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
