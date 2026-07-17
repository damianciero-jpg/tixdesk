import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Ticket, TicketStatus } from "./types";

const TICKETS_COLLECTION = "tickets";

function toTicket(id: string, data: Record<string, unknown>): Ticket {
  return {
    id,
    eventId: data.eventId as string,
    orderId: (data.orderId as string) ?? "",
    ticketCode: data.ticketCode as string,
    buyerName: data.buyerName as string,
    buyerEmail: data.buyerEmail as string,
    status: data.status as TicketStatus,
    purchaseDate: (data.purchaseDate as Timestamp)?.toDate() ?? new Date(),
    usedDate: data.usedDate ? (data.usedDate as Timestamp).toDate() : null,
    usedBy: (data.usedBy as string | null) ?? null,
  };
}

export async function getTicketsForEvent(eventId: string): Promise<Ticket[]> {
  const q = query(
    collection(db, TICKETS_COLLECTION),
    where("eventId", "==", eventId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => toTicket(d.id, d.data()))
    .sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
}

export type ScanResult =
  | { type: "not_found" }
  | { type: "void"; ticket: Ticket }
  | { type: "already_used"; ticket: Ticket }
  | { type: "valid"; ticket: Ticket };

export async function scanTicketCode(
  ticketCode: string,
  workerUid: string
): Promise<ScanResult> {
  const q = query(
    collection(db, TICKETS_COLLECTION),
    where("ticketCode", "==", ticketCode.trim().toUpperCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    return { type: "not_found" };
  }

  const ticketRef = snap.docs[0].ref;

  return runTransaction(db, async (tx) => {
    const ticketSnap = await tx.get(ticketRef);
    if (!ticketSnap.exists()) {
      return { type: "not_found" };
    }

    const ticket = toTicket(ticketSnap.id, ticketSnap.data());

    if (ticket.status === "void") {
      return { type: "void", ticket };
    }

    if (ticket.status === "used") {
      return { type: "already_used", ticket };
    }

    tx.update(ticketRef, {
      status: "used" as TicketStatus,
      usedDate: serverTimestamp(),
      usedBy: workerUid,
    });

    return {
      type: "valid",
      ticket: { ...ticket, status: "used", usedDate: new Date(), usedBy: workerUid },
    };
  });
}

export async function setTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === "used") {
    update.usedDate = serverTimestamp();
  } else if (status === "valid") {
    update.usedDate = null;
    update.usedBy = null;
  }
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), update);
}
