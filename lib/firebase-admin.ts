import { cert, getApps, getApp, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Server-only: used to read the `tickets` collection for the public
// /ticket/[id] confirmation page without opening up public Firestore read
// access to that collection (see firestore.rules).
function getAdminApp(): App {
  if (getApps().length) return getApp();

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = getFirestore(getAdminApp());
