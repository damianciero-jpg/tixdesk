import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { TixEvent } from "./types";

const EVENTS_COLLECTION = "events";

function toEvent(id: string, data: Record<string, unknown>): TixEvent {
  return {
    id,
    name: data.name as string,
    description: data.description as string,
    venue: data.venue as string,
    date: (data.date as Timestamp).toDate(),
    doorsTime: data.doorsTime as string,
    price: data.price as number,
    ticketsTotal: data.ticketsTotal as number,
    ticketsSold: data.ticketsSold as number,
    imageUrl: data.imageUrl as string | undefined,
    active: data.active as boolean,
  };
}

export async function getActiveEvents(): Promise<TixEvent[]> {
  const q = query(
    collection(db, EVENTS_COLLECTION),
    where("active", "==", true),
    orderBy("date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getAllEvents(): Promise<TixEvent[]> {
  const q = query(collection(db, EVENTS_COLLECTION), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toEvent(d.id, d.data()));
}

export async function getEvent(id: string): Promise<TixEvent | null> {
  const ref = doc(db, EVENTS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toEvent(snap.id, snap.data());
}

export interface EventInput {
  name: string;
  description: string;
  venue: string;
  date: Date;
  doorsTime: string;
  price: number;
  ticketsTotal: number;
  imageUrl?: string;
  active: boolean;
}

export async function createEvent(input: EventInput): Promise<string> {
  const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
    name: input.name,
    description: input.description,
    venue: input.venue,
    date: Timestamp.fromDate(input.date),
    doorsTime: input.doorsTime,
    price: input.price,
    ticketsTotal: input.ticketsTotal,
    ticketsSold: 0,
    imageUrl: input.imageUrl ?? "",
    active: input.active,
  });
  return docRef.id;
}

export async function updateEvent(
  id: string,
  input: Partial<EventInput>
): Promise<void> {
  const ref = doc(db, EVENTS_COLLECTION, id);
  const update: Record<string, unknown> = { ...input };
  if (input.date) update.date = Timestamp.fromDate(input.date);
  await updateDoc(ref, update);
}

export async function setEventActive(id: string, active: boolean): Promise<void> {
  await updateDoc(doc(db, EVENTS_COLLECTION, id), { active });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, EVENTS_COLLECTION, id));
}
