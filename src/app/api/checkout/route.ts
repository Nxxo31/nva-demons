import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/modules/checkout/checkoutService";

/**
 * POST /api/checkout/create-session
 * Create a checkout session for ticket purchase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, ticketTypeId, quantity, purchaserInfo } = body;

    // Validate required fields
    if (!eventId || !ticketTypeId || !quantity || !purchaserInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(
      eventId,
      ticketTypeId,
      quantity,
      purchaserInfo
    );

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
