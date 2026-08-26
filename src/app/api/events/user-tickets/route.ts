import { NextRequest, NextResponse } from "next/server";
import { getUserTickets } from "@/modules/events/eventService";

/**
 * GET /api/events/user-tickets
 * Returns tickets purchased by the current user.
 * Optional query param: ?email=foo@bar.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || undefined;

    const tickets = await getUserTickets(email);
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Failed to fetch user tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch user tickets" },
      { status: 500 }
    );
  }
}
