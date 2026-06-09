import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/utils/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    
    // Fetch first 10 leads with all fields
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch leads", details: error.message },
        { status: 500 }
      );
    }

    // Detailed analysis
    const analysis = {
      totalLeads: data?.length || 0,
      leadsWithCredsObject: data?.filter(l => typeof l.visaCredentials === 'object' && l.visaCredentials !== null).length || 0,
      leadsWithCredsString: data?.filter(l => typeof l.visaCredentials === 'string').length || 0,
      leadsWithCredsNull: data?.filter(l => l.visaCredentials === null).length || 0,
      leadsWithCredsUndefined: data?.filter(l => l.visaCredentials === undefined).length || 0,
      firstLeadFull: data?.[0],
      firstLeadWithCreds: data?.find(l => l.visaCredentials),
    };

    console.log("🔍 Debug Analysis:", JSON.stringify(analysis, null, 2));

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
