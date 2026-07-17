import "server-only";
import { adminDb } from "./firebase-admin";
import type { Ticket, TicketStatus, TixEvent } from "./types";

function toTicket(id: string, data: FirebaseFirestore.DocumentData): Ticket {
  return {
    id,
    eventId: data.eventId as string,
    orderId: (data.orderId as string) ?? "",
    ticketCode: data.ticketCode as string,
    buyerName: data.buyerName as string,
    buyerEmail: data.buyerEmail as string,
    status: data.status as TicketStatus,
    purchaseDate: data.purchaseDate?.toDate() ?? new Date(),
    usedDate: data.usedDate ? data.usedDate.toDate() : null,
    usedBy: (data.usedBy as string | null) ?? null,
  };
}

function toEvent(id: string, data: FirebaseFirestore.DocumentData): TixEvent {
  return {
    id,
    name: data.name as string,
    description: data.description as string,
    venue: data.venue as string,
    date: data.date.toDate(),
    doorsTime: data.doorsTime as string,
    price: data.price as number,
    ticketsTotal: data.ticketsTotal as number,
    ticketsSold: data.ticketsSold as number,
    imageUrl: data.imageUrl as string | undefined,
    active: data.active as boolean,
  };
}

/** Server-only: bypasses Firestore rules to render the public ticket confirmation page. */
export async function getTicketAdmin(id: string): Promise<Ticket | null> {
  const snap = await adminDb.collection("tickets").doc(id).get();
  if (!snap.exists) return null;
  return toTicket(snap.id, snap.data()!);
}

export async function getOrderTicketsAdmin(orderId: string): Promise<Ticket[]> {
  const snap = await adminDb
    .collection("tickets")
    .where("orderId", "==", orderId)
    .get();
  return snap.docs.map((d) => toTicket(d.id, d.data()));
}

export async function getEventAdmin(id: string): Promise<TixEvent | null> {
  const snap = await adminDb.collection("events").doc(id).get();
  if (!snap.exists) return null;
  return toEvent(snap.id, snap.data()!);
}
