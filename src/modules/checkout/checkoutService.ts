import { HiOrder, HiTicketType, HiTicket } from "@/types/hiEvents";

const HI_EVENTS_API_URL = process.env.HI_EVENTS_API_URL || "https://hi.events/api";

/**
 * Create a checkout session for ticket purchase
 * This would typically redirect to Hi.Events checkout or Stripe via Hi.Events
 */
export async function createCheckoutSession(
  eventId: string,
  ticketTypeId: string,
  quantity: number,
  purchaserInfo: {
    name: string;
    email: string;
  }
): Promise<{ sessionId: string; checkoutUrl: string }> {
  try {
    const response = await fetch(`${HI_EVENTS_API_URL}/checkout/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId,
        ticketTypeId,
        quantity,
        purchaserInfo,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create checkout session: ${response.status}`);
    }

    const data = await response.json();
    return {
      sessionId: data.sessionId,
      checkoutUrl: data.checkoutUrl,
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Verify a purchase (after redirect from checkout)
 */
export async function verifyPurchase(
  sessionId: string
): Promise<{ order: HiOrder; tickets: HiTicket[] }> {
  try {
    const response = await fetch(`${HI_EVENTS_API_URL}/checkout/verify/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to verify purchase: ${response.status}`);
    }

    const data = await response.json();
    return {
      order: data.order,
      tickets: data.tickets,
    };
  } catch (error) {
    console.error("Error verifying purchase:", error);
    throw error;
  }
}

/**
 * Get ticket types for an event (for pricing display)
 */
export async function getTicketTypes(eventId: string): Promise<HiTicketType[]> {
  try {
    const response = await fetch(`${HI_EVENTS_API_URL}/events/${eventId}/ticket-types`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket types: ${response.status}`);
    }

    const data = await response.json();
    return data.ticketTypes || [];
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    throw error;
  }
}