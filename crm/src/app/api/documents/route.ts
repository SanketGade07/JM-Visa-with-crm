import { NextRequest, NextResponse } from "next/server";
import { readDocuments, appendDocument, appendActivity, deleteDocument } from "@/utils/db";
import { getSupabase, isSupabaseConfigured, DOCUMENTS_BUCKET } from "@/utils/supabase";
import {
  deleteFileFromDrive,
  getOrCreateFolder,
  isGoogleDriveConfigured,
  uploadFileToDrive,
} from "@/lib/googleDrive";
import { provisionLeadDriveFolder } from "@/lib/provisionLeadDriveFolder";
import { Document, Activity } from "@/context/CrmContext";

// Drive subfolders (under Clients/{leadFolder}) the uploaded file is filed into.
const CHECKLIST_SUBFOLDER = "document-checklist";
const INVOICE_SUBFOLDER = "invoice";

// Invoice uploads use docTypes like "invoice-<number>" / "invoice-deposit";
// everything else is a checklist document.
function driveSubfolderForDocType(docType: string): string {
  return docType.toLowerCase().startsWith("invoice")
    ? INVOICE_SUBFOLDER
    : CHECKLIST_SUBFOLDER;
}

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

// POST /api/documents — staff uploads a file (multipart). The binary goes to
// Google Drive under Clients/{leadFolder}/{document-checklist|invoice}/; only
// textual metadata is persisted in Supabase. No file is stored in Supabase Storage.
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
    let driveFileId: string | undefined;

    if (fileUrl) {
      // External link (e.g. Google Drive / Dropbox URL) — store metadata only.
      finalFileUrl = fileUrl;
      finalFileName = fileName || "Linked Document";
    } else {
      if (!file) {
        return NextResponse.json({ error: "file or fileUrl is required" }, { status: 400 });
      }

      if (!isGoogleDriveConfigured()) {
        return NextResponse.json(
          {
            error:
              "Google Drive is not configured. Set GOOGLE_OAUTH_* env vars or GOOGLE_SERVICE_ACCOUNT_KEY.",
          },
          { status: 503 }
        );
      }

      // Resolve (and provision when missing) the lead's client folder under Clients/.
      const provision = await provisionLeadDriveFolder(leadId);
      if (!provision.ok) {
        if (provision.code === "not_configured") {
          return NextResponse.json(
            { error: "Google Drive is not configured." },
            { status: 503 }
          );
        }
        if (provision.code === "lead_not_found") {
          return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }
        return NextResponse.json(
          { error: "Failed to resolve client Drive folder" },
          { status: 500 }
        );
      }

      // File into Clients/{leadFolder}/document-checklist or .../invoice.
      const subfolderName = driveSubfolderForDocType(docType);
      const subfolderId = await getOrCreateFolder(
        provision.driveFolderId,
        subfolderName
      );

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadFileToDrive(
        subfolderId,
        file.name,
        buffer,
        file.type || "application/octet-stream"
      );

      driveFileId = uploaded.id;
      finalFileUrl =
        uploaded.webViewLink ||
        `https://drive.google.com/file/d/${uploaded.id}/view`;
      finalFileName = file.name;
    }

    const document: Document = {
      id: `doc-${Date.now()}`,
      leadId,
      docType,
      fileName: finalFileName,
      fileUrl: finalFileUrl,
      ...(driveFileId ? { driveFileId } : {}),
      status: "VERIFIED",
      uploadedBy,
      uploadedAt: new Date().toISOString(),
    };

    const saved = await appendDocument(document);
    if (!saved) {
      return NextResponse.json(
        { error: "Failed to save document metadata" },
        { status: 500 }
      );
    }

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

    // New flow: trash the backing Google Drive file (best-effort — never block
    // the metadata delete if Drive trashing fails).
    if (doc.driveFileId && isGoogleDriveConfigured()) {
      try {
        await deleteFileFromDrive(doc.driveFileId);
      } catch (driveError) {
        console.error("Google Drive trash error:", driveError);
      }
    }

    // Legacy flow: clean up any file that still lives in Supabase Storage
    // (documents uploaded before the Drive migration).
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
