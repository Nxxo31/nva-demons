export interface HiEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  startTime: string;
  endTime: string;
  location: string;
  imageUrl?: string;
  ticketTypes: HiTicketType[];
  status: "draft" | "published" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface HiTicketType {
  id: string;
  name: string;
  description: string;
  price: number; // in cents or base currency unit
  currency: string;
  quantityAvailable: number;
  quantitySold: number;
  benefits: string[];
}

export interface HiTicket {
  id: string;
  eventId: string;
  ticketTypeId: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaseDate: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  qrCode: string;
}

export interface HiOrder {
  id: string;
  eventId: string;
  userId?: string;
  totalAmount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  items: HiOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface HiOrderItem {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
}