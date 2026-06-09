import { NextRequest, NextResponse } from "next/server";
import { updateLeadCredentials } from "@/utils/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, visaCredentials } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing lead id" }, { status: 400 });
    }

    const ok = await updateLeadCredentials(id, visaCredentials ?? null);
    if (!ok) return NextResponse.json({ error: "Failed to update credentials" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/leads/credentials error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
