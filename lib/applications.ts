import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { JobApplication, PositionInterest } from "./types";

const APPLICATIONS_COLLECTION = "jobApplications";

export interface JobApplicationInput {
  name: string;
  email: string;
  phone: string;
  positionInterest: PositionInterest;
  message: string;
}

export async function submitApplication(
  input: JobApplicationInput
): Promise<string> {
  const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
    ...input,
    submittedDate: serverTimestamp(),
  });
  return docRef.id;
}

export async function getApplications(): Promise<JobApplication[]> {
  const q = query(
    collection(db, APPLICATIONS_COLLECTION),
    orderBy("submittedDate", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name as string,
      email: data.email as string,
      phone: data.phone as string,
      positionInterest: data.positionInterest as PositionInterest,
      message: data.message as string,
      submittedDate: (data.submittedDate as Timestamp)?.toDate() ?? new Date(),
    };
  });
}
