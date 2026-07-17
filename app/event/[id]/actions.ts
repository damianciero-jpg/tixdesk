"use server";

import { FieldValue } from "firebase-admin/firestore";
import { customAlphabet } from "nanoid";
import { adminDb } from "@/lib/firebase-admin";

const generateTicketCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  10
);
const generateOrderId = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  12
);

const MAX_TICKETS_PER_ORDER = 6;

export interface PurchaseTicketsInput {
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
}

export interface PurchaseTicketsResult {
  orderId: string;
  ticketIds: string[];
}

/**
 * Single entry point for the checkout flow, run server-side so it can also
 * write ticketsSold on the event doc (which requires an authenticated writer
 * per firestore.rules — buyers aren't authenticated, so this can't run as a
 * client-side Firestore transaction). A Stripe PaymentIntent would be created
 * and confirmed here, before the transaction below runs, so the ticket-issuing
 * logic doesn't need to change when real payments land.
 */
export async function purchaseTickets(
  input: PurchaseTicketsInput
): Promise<PurchaseTicketsResult> {
  const { eventId, buyerName, buyerEmail, quantity } = input;

  if (!buyerName.trim() || !buyerEmail.trim()) {
    throw new Error("Name and email are required");
  }
  if (quantity < 1 || quantity > MAX_TICKETS_PER_ORDER) {
    throw new Error(`Quantity must be between 1 and ${MAX_TICKETS_PER_ORDER}`);
  }

  // --- Stripe payment intent would be created + confirmed here ---

  const orderId = generateOrderId();
  const ticketsCollection = adminDb.collection("tickets");
  const ticketRefs = Array.from({ length: quantity }, () =>
    ticketsCollection.doc()
  );

  await adminDb.runTransaction(async (tx) => {
    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await tx.get(eventRef);

    if (!eventSnap.exists) {
      throw new Error("Event not found");
    }

    const data = eventSnap.data()!;
    if (!data.active) {
      throw new Error("This event is not currently on sale");
    }

    const ticketsSold = (data.ticketsSold as number) ?? 0;
    const ticketsTotal = (data.ticketsTotal as number) ?? 0;

    if (ticketsSold + quantity > ticketsTotal) {
      throw new Error("Not enough tickets remaining for this event");
    }

    tx.update(eventRef, { ticketsSold: ticketsSold + quantity });

    for (const ref of ticketRefs) {
      tx.set(ref, {
        eventId,
        orderId,
        ticketCode: generateTicketCode(),
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
        status: "valid",
        purchaseDate: FieldValue.serverTimestamp(),
        usedDate: null,
        usedBy: null,
      });
    }
  });

  return { orderId, ticketIds: ticketRefs.map((r) => r.id) };
}
