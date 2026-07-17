export interface TixEvent {
  id: string;
  name: string;
  description: string;
  venue: string;
  date: Date;
  doorsTime: string;
  price: number; // cents
  ticketsTotal: number;
  ticketsSold: number;
  imageUrl?: string;
  active: boolean;
}

export type TicketStatus = "valid" | "used" | "void";

export interface Ticket {
  id: string;
  eventId: string;
  orderId: string;
  ticketCode: string;
  buyerName: string;
  buyerEmail: string;
  status: TicketStatus;
  purchaseDate: Date;
  usedDate: Date | null;
  usedBy: string | null;
}

export type PositionInterest = string;

export interface JobPosition {
  id: string;
  title: string;
  active: boolean;
  sortOrder: number;
}

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  positionInterest: PositionInterest;
  message: string;
  submittedDate: Date;
}
