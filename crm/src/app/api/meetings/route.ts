import { NextRequest, NextResponse } from "next/server";
import { readMeetings, writeMeetings } from "@/utils/db";
import { Meeting } from "@/context/CrmContext";

export async function GET() {
  try {
    const meetings = readMeetings();
    return NextResponse.json(meetings, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("GET /api/meetings error:", error);
    return NextResponse.json({ error: "Failed to read meetings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existingMeetings = readMeetings();

    // 1. Sync full state from the CRM frontend
    if (body && Array.isArray(body.meetings)) {
      const success = writeMeetings(body.meetings);
      if (success) {
        return NextResponse.json({ success: true, message: "Meetings synchronized successfully" });
      } else {
        return NextResponse.json({ error: "Failed to write meetings to disk" }, { status: 500 });
      }
    }

    // 2. Add a single meeting
    const clientName = body.clientName || "Unnamed Client";
    const reminderText = body.reminderText || "";
    const counselorAssigned = body.counselorAssigned || "Unassigned";
    const notes = body.notes || "";
    const meetingDate = body.meetingDate || new Date().toISOString().split("T")[0];

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      meetingDate,
      clientName,
      reminderText,
      counselorAssigned,
      notes,
    };

    const updatedMeetings = [...existingMeetings, newMeeting];
    const success = writeMeetings(updatedMeetings);

    if (success) {
      return NextResponse.json({ success: true, meeting: newMeeting }, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      return NextResponse.json({ error: "Failed to append meeting to disk" }, { status: 500 });
    }
  } catch (error) {
    console.error("POST /api/meetings error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
