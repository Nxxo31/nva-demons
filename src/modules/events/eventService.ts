import { HiEvent, HiTicket, HiOrder } from "@/types/hiEvents";

// Base URL for Hi.Events API - should be set in environment variables
const HI_EVENTS_API_URL = process.env.HI_EVENTS_API_URL || "https://hi.events/api";

/**
 * Fetch events from Hi.Events API
 */
export async function getEvents(): Promise<HiEvent[]> {
  try {
    const response = await fetch(`${HI_EVENTS_API_URL}/events`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

/**
 * Fetch a single event by ID
 */
export async function getEventById(eventId: string): Promise<HiEvent> {
  try {
    const response = await fetch(`${HI_EVENTS_API_URL}/events/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch event: ${response.status}`);
    }

    const data = await response.json();
    return data.event;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    throw error;
  }
}

/**
 * Create a new event (admin only)
 */
export async function createEvent(eventData: Omit<HiEvent, "id">): Promise<HiEvent> {
  try {
    const response = await fetch(`${HI_EVENTS_API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.status}`);
    }

    const data = await response.json();
    return data.event;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

/**
 * Get tickets for an event
 */
export async function getEventTickets(eventId: string): Promise<HiTicket[]> {
  try {
    const response = await fetch(`${HI_EVENTS_API_URL}/events/${eventId}/tickets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status}`);
    }

    const data = await response.json();
    return data.tickets || [];
  } catch (error) {
    console.error("Error fetching event tickets:", error);
    throw error;
  }
}