import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { JobPosition } from "./types";

const JOB_POSITIONS_COLLECTION = "jobPositions";

function toPosition(id: string, data: Record<string, unknown>): JobPosition {
  return {
    id,
    title: data.title as string,
    active: data.active as boolean,
    sortOrder: data.sortOrder as number,
  };
}

export async function getActivePositions(): Promise<JobPosition[]> {
  const q = query(
    collection(db, JOB_POSITIONS_COLLECTION),
    where("active", "==", true),
    orderBy("sortOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPosition(d.id, d.data()));
}

export async function getAllPositions(): Promise<JobPosition[]> {
  const q = query(
    collection(db, JOB_POSITIONS_COLLECTION),
    orderBy("sortOrder", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPosition(d.id, d.data()));
}

export async function createPosition(
  title: string,
  sortOrder: number
): Promise<string> {
  const docRef = await addDoc(collection(db, JOB_POSITIONS_COLLECTION), {
    title,
    active: true,
    sortOrder,
  });
  return docRef.id;
}

export interface JobPositionUpdate {
  title?: string;
  active?: boolean;
  sortOrder?: number;
}

export async function updatePosition(
  id: string,
  update: JobPositionUpdate
): Promise<void> {
  await updateDoc(doc(db, JOB_POSITIONS_COLLECTION, id), { ...update });
}

export async function deletePosition(id: string): Promise<void> {
  await deleteDoc(doc(db, JOB_POSITIONS_COLLECTION, id));
}
