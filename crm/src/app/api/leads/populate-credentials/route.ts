import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();

    // Update all leads that don't have credentials with auto-generated ones
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, visaCredentials")
      .is("visaCredentials", null);

    if (error) {
      console.error("Error fetching leads without credentials:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads", details: error.message },
        { status: 500 }
      );
    }

    const leadsToUpdate = data || [];
    console.log(`Found ${leadsToUpdate.length} leads without credentials`);

    // Generate credentials for each lead
    const updates = leadsToUpdate.map((lead) => {
      const firstName = lead.name ? lead.name.split(" ")[0].toLowerCase() : "user";
      const lastInitial = lead.name ? (lead.name.split(" ")[1]?.[0]?.toLowerCase() || "x") : "x";
      const randomNum = Math.floor(Math.random() * 1000);
      const randomPwd = Math.random().toString(36).slice(2, 14).toUpperCase() + "!@#";

      return {
        id: lead.id,
        visaCredentials: {
          username: `${firstName}.${lastInitial}${randomNum}`,
          password: randomPwd,
          portalUrl: "https://visaportal.example.com/login",
        },
      };
    });

    // Update each lead
    let successCount = 0;
    let failCount = 0;

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("leads")
        .update({ visaCredentials: update.visaCredentials })
        .eq("id", update.id);

      if (updateError) {
        console.error(`Failed to update ${update.id}:`, updateError);
        failCount++;
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      message: "Credentials population complete",
      total: leadsToUpdate.length,
      updated: successCount,
      failed: failCount,
    });
  } catch (error) {
    console.error("Error in populate-credentials:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
