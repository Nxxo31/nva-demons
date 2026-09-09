import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/modules/events/eventService";

/**
 * GET /api/events
 * Get all events
 */
export async function GET(request: NextRequest) {
  try {
    const events = await getEvents();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
