import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/modules/events/eventService";

/**
 * GET /api/events/[id]
 * Get a specific event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await getEventById(params.id);
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
