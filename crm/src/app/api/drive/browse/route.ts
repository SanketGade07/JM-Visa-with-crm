import { NextRequest, NextResponse } from "next/server";
import {
  clearDriveCache,
  createBlankFile,
  createFolder,
  createGoogleFile,
  deleteFileFromDrive,
  deleteFolderFromDrive,
  DriveFileItem,
  getRootFolderId,
  GoogleFileType,
  isGoogleDriveConfigured,
  listFolderContents,
  renameFileInDrive,
  renameFolderInDrive,
  uploadFileToDrive,
} from "@/lib/googleDrive";
import {
  driveErrorResponse,
  forbiddenResponse,
  getSessionRole,
  requireAdmin,
  unauthorizedResponse,
} from "@/utils/driveAuth";

export interface DriveItem extends DriveFileItem {
  previewUrl?: string | null;
}

function toDriveItem(item: DriveFileItem): DriveItem {
  return {
    ...item,
    previewUrl: item.isFolder
      ? null
      : `/api/drive/view?fileId=${encodeURIComponent(item.id)}`,
  };
}

function assertAdmin(req: NextRequest): NextResponse | null {
  const role = requireAdmin(req);
  if (!role) {
    return getSessionRole(req) ? forbiddenResponse() : unauthorizedResponse();
  }
  return null;
}

function assertDriveConfigured(): NextResponse | null {
  if (!isGoogleDriveConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google Drive is not configured. Set GOOGLE_OAUTH_* env vars or GOOGLE_SERVICE_ACCOUNT_KEY.",
      },
      { status: 503 }
    );
  }
  return null;
}

// GET /api/drive/browse?folderId= — list folder contents
export async function GET(req: NextRequest) {
  const authError = assertAdmin(req);
  if (authError) return authError;

  const configError = assertDriveConfigured();
  if (configError) return configError;

  try {
    const { searchParams } = new URL(req.url);
    let folderId = searchParams.get("folderId");

    if (!folderId) {
      folderId = await getRootFolderId();
      if (!folderId) {
        return NextResponse.json(
          { error: "Drive root folder is not configured" },
          { status: 400 }
        );
      }
    }

    const items = await listFolderContents(folderId);
    return NextResponse.json(items.map(toDriveItem));
  } catch (error) {
    return driveErrorResponse(error, "GET /api/drive/browse");
  }
}

// POST /api/drive/browse — create folder/file or upload binary
export async function POST(req: NextRequest) {
  const authError = assertAdmin(req);
  if (authError) return authError;

  const configError = assertDriveConfigured();
  if (configError) return configError;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const parentId = formData.get("parentId") as string | null;

      if (!file || !parentId) {
        return NextResponse.json(
          { error: "file and parentId are required" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await uploadFileToDrive(
        parentId,
        file.name,
        buffer,
        file.type || "application/octet-stream"
      );

      return NextResponse.json(
        {
          success: true,
          file: {
            id: uploaded.id,
            name: file.name,
            webViewLink: uploaded.webViewLink,
            webContentLink: uploaded.webContentLink,
            previewUrl: `/api/drive/view?fileId=${encodeURIComponent(uploaded.id)}`,
          },
        },
        { status: 201 }
      );
    }

    const body = await req.json();
    const parentId = body.parentId as string | undefined;
    const folderName = body.folderName as string | undefined;
    const fileName = body.fileName as string | undefined;
    const blankFile = Boolean(body.blankFile);
    const type = body.type as GoogleFileType | undefined;

    if (!parentId) {
      return NextResponse.json({ error: "parentId is required" }, { status: 400 });
    }

    if (blankFile) {
      if (!fileName?.trim()) {
        return NextResponse.json({ error: "fileName is required" }, { status: 400 });
      }
      const trimmed = fileName.trim();
      const created = await createBlankFile(parentId, trimmed);
      return NextResponse.json(
        {
          success: true,
          file: {
            id: created.id,
            name: trimmed,
            webViewLink: created.webViewLink,
            webContentLink: created.webContentLink,
            previewUrl: `/api/drive/view?fileId=${encodeURIComponent(created.id)}`,
          },
        },
        { status: 201 }
      );
    }

    if (!folderName?.trim()) {
      return NextResponse.json(
        { error: "parentId and folderName are required" },
        { status: 400 }
      );
    }

    if (type) {
      const created = await createGoogleFile(parentId, folderName.trim(), type);
      return NextResponse.json(
        {
          success: true,
          file: {
            id: created.id,
            name: folderName.trim(),
            webViewLink: created.webViewLink,
            previewUrl: `/api/drive/view?fileId=${encodeURIComponent(created.id)}`,
          },
        },
        { status: 201 }
      );
    }

    const folderId = await createFolder(parentId, folderName.trim());
    return NextResponse.json(
      {
        success: true,
        folder: {
          id: folderId,
          name: folderName.trim(),
          isFolder: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return driveErrorResponse(error, "POST /api/drive/browse");
  }
}

// PATCH /api/drive/browse — rename file or folder
export async function PATCH(req: NextRequest) {
  const authError = assertAdmin(req);
  if (authError) return authError;

  const configError = assertDriveConfigured();
  if (configError) return configError;

  try {
    const body = await req.json();
    const id = body.id as string | undefined;
    const newName = body.newName as string | undefined;
    const isFolder = Boolean(body.isFolder);

    if (!id || !newName?.trim()) {
      return NextResponse.json({ error: "id and newName are required" }, { status: 400 });
    }

    if (isFolder) {
      await renameFolderInDrive(id, newName.trim());
    } else {
      await renameFileInDrive(id, newName.trim());
    }

    clearDriveCache();
    return NextResponse.json({ success: true, id, name: newName.trim() });
  } catch (error) {
    return driveErrorResponse(error, "PATCH /api/drive/browse");
  }
}

// DELETE /api/drive/browse?id=&isFolder= — trash file or folder
export async function DELETE(req: NextRequest) {
  const authError = assertAdmin(req);
  if (authError) return authError;

  const configError = assertDriveConfigured();
  if (configError) return configError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const isFolder = searchParams.get("isFolder") === "true";

    if (!id) {
      return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
    }

    if (isFolder) {
      await deleteFolderFromDrive(id);
    } else {
      await deleteFileFromDrive(id);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return driveErrorResponse(error, "DELETE /api/drive/browse");
  }
}
