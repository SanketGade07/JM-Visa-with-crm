import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), "public/uploads");

    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json([], { status: 200 });
    }

    const files = fs.readdirSync(uploadsDir).map((file) => ({
      mediaUrl: `/uploads/${file}`,
      type: file.endsWith(".mp4") || file.endsWith(".mov") ? "video" : "image",
    }));

    return NextResponse.json(files, { status: 200 });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Error fetching media!" }, { status: 500 });
  }
}
