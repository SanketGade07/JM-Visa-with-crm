import { NextRequest, NextResponse } from "next/server";
import { readDocuments, appendDocument, appendActivity, deleteDocument } from "@/utils/db";
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

      // Store the storage path (not a public URL) so we can generate signed URLs on demand
      finalFileUrl = `storage://${objectPath}`;
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

// DELETE /api/documents?id=doc-xxx — remove a checklist document (file or link)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const docs = await readDocuments();
    const doc = docs.find((d) => d.id === id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.fileUrl.startsWith("storage://") && isSupabaseConfigured()) {
      const objectPath = doc.fileUrl.replace("storage://", "");
      const supabase = getSupabase();
      const { error: storageError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .remove([objectPath]);
      if (storageError) {
        console.error("Supabase storage delete error:", storageError);
      }
    }

    const deleted = await deleteDocument(id);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
    }

    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId: doc.leadId,
      type: "document",
      content: `Document "${doc.docType}" removed`,
      createdAt: new Date().toISOString(),
      createdBy: "SYSTEM",
    };
    await appendActivity(activity);

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    console.error("DELETE /api/documents error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
