import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured, DOCUMENTS_BUCKET } from "@/utils/supabase";

// GET /api/documents/signed-url?path=leads/lead-xxx/photos-xxx.png
// Returns a temporary signed URL (valid for 1 hour) for viewing a private file.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storagePath = searchParams.get("path");

    if (!storagePath) {
      return NextResponse.json({ error: "path query parameter is required" }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase storage is not configured" },
        { status: 503 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error("Signed URL error:", error);
      return NextResponse.json(
        { error: `Failed to generate signed URL: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error) {
    console.error("GET /api/documents/signed-url error:", error);
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 });
  }
}
