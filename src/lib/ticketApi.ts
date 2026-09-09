import { HiEvent, HiTicketType, HiTicket, HiOrder } from "@/types/hiEvents";

const HI_EVENTS_API_URL = process.env.HI_EVENTS_API_URL || "https://hi.events/api";

/**
 * Hi.Events API client
 * Provides methods to interact with the Hi.Events backend
 */
export class HiEventsApi {
  /**
   * Fetch all events
   */
  static async getEvents(): Promise<HiEvent[]> {
    const response = await fetch(`${HI_EVENTS_API_URL}/events`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    return data.events || [];
  }

  /**
   * Fetch a single event by ID
   */
  static async getEventById(eventId: string): Promise<HiEvent> {
    const response = await fetch(`${HI_EVENTS_API_URL}/events/${eventId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.status}`);
    }

    const data = await response.json();
    return data.event;
  }

  /**
   * Fetch ticket types for an event
   */
  static async getTicketTypes(eventId: string): Promise<HiTicketType[]> {
    const response = await fetch(`${HI_EVENTS_API_URL}/events/${eventId}/ticket-types`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket types: ${response.status}`);
    }

    const data = await response.json();
    return data.ticketTypes || [];
  }

  /**
   * Create a checkout session for ticket purchase
   */
  static async createCheckoutSession(
    eventId: string,
    ticketTypeId: string,
    quantity: number,
    purchaserInfo: { name: string; email: string }
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    const response = await fetch(`${HI_EVENTS_API_URL}/checkout/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  }

  /**
   * Verify a purchase after checkout
   */
  static async verifyPurchase(sessionId: string): Promise<{ order: HiOrder; tickets: HiTicket[] }> {
    const response = await fetch(`${HI_EVENTS_API_URL}/checkout/verify/${sessionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to verify purchase: ${response.status}`);
    }

    const data = await response.json();
    return {
      order: data.order,
      tickets: data.tickets,
    };
  }
}

/**
 * Helper function to format currency from cents
 */
export function formatCurrency(cents: number, currency: string = "COP"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency as any,
  }).format(amount);
}

/**
 * Helper function to format date
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
