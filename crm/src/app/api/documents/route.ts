import { NextRequest, NextResponse } from "next/server";
import { readDocuments, appendDocument, appendActivity } from "@/utils/db";
import { getSupabase, isSupabaseConfigured, DOCUMENTS_BUCKET } from "@/utils/supabase";
import { Document, Activity } from "@/context/CrmContext";

// GET /api/documents — list all, or ?leadId=xxx for one lead's files
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    let docs = await readDocuments();
    if (leadId) docs = docs.filter((d) => d.leadId === leadId);
    docs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

    return NextResponse.json(docs);
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ error: "Failed to read documents" }, { status: 500 });
  }
}

// POST /api/documents — staff uploads a file (multipart), stored in Supabase Storage
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileUrl = formData.get("fileUrl") as string | null;
    const fileName = formData.get("fileName") as string | null;
    const leadId = formData.get("leadId") as string | null;
    const docType = (formData.get("docType") as string) || "other";
    const uploadedBy = (formData.get("uploadedBy") as string) || "SYSTEM";

    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    let finalFileUrl = "";
    let finalFileName = "";

    if (fileUrl) {
      finalFileUrl = fileUrl;
      finalFileName = fileName || "Linked Document";
    } else {
      if (!file) {
        return NextResponse.json({ error: "file or fileUrl is required" }, { status: 400 });
      }

      if (!isSupabaseConfigured()) {
        return NextResponse.json(
          { error: "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env" },
          { status: 503 }
        );
      }

      const supabase = getSupabase();

      // Build a unique storage path: leads/<leadId>/<docType>-<timestamp>.<ext>
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const objectPath = `leads/${leadId}/${docType}-${Date.now()}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(objectPath, arrayBuffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
      }

      // Public URL (bucket must be public, or swap for a signed URL)
      const { data: publicUrlData } = supabase.storage
        .from(DOCUMENTS_BUCKET)
        .getPublicUrl(objectPath);

      finalFileUrl = publicUrlData.publicUrl;
      finalFileName = file.name;
    }

    const document: Document = {
      id: `doc-${Date.now()}`,
      leadId,
      docType,
      fileName: finalFileName,
      fileUrl: finalFileUrl,
      status: "VERIFIED",
      uploadedBy,
      uploadedAt: new Date().toISOString(),
    };

    await appendDocument(document);

    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId,
      type: "document",
      content: `Document "${docType}" verified via ${fileUrl ? `URL link` : `upload (${finalFileName})`}`,
      createdAt: new Date().toISOString(),
      createdBy: uploadedBy,
    };
    await appendActivity(activity);

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
