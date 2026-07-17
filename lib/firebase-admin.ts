import { cert, getApps, getApp, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Server-only: used to read the `tickets` collection for the public
// /ticket/[id] confirmation page without opening up public Firestore read
// access to that collection (see firestore.rules).
function getAdminApp(): App {
  if (getApps().length) return getApp();

  // Vercel's env var UI can mangle literal \n sequences in multi-line-looking
  // secrets, so prefer a base64-encoded key (no special characters to corrupt)
  // and fall back to the raw escaped key for local/other environments.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY_B64
    ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64")
        .toString("utf-8")
        .replace(/\\n/g, "\n")
    : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export const adminDb = getFirestore(getAdminApp());
