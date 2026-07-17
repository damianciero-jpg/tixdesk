# TixDesk

A multi-event ticketing prototype: public storefront + checkout, QR ticket
confirmations, a door-scanning app for staff, and an admin panel — all backed
by Firebase (Firestore + Auth) and deployed on Vercel.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Firebase Firestore + Firebase Auth (email/password)
- `qrcode` for generating ticket QR codes, `html5-qrcode` for scanning them
- No real payment processing yet — see the checklist below

## Setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com).
2. **Enable Firestore** (in production mode) and **Enable Auth** with the
   Email/Password sign-in provider.
3. **Register a Web App** in your Firebase project settings to get the
   `NEXT_PUBLIC_FIREBASE_*` config values below.
4. **Generate a service account key**: Project Settings → Service Accounts →
   Generate new private key. This gives you the `FIREBASE_*` (non-public)
   values below — they're used server-side only, to render the public
   `/ticket/[id]` confirmation page without opening up public Firestore reads
   on the `tickets` collection (see `firestore.rules`).
5. **Create the admin/worker user(s) manually** in the Firebase console
   (Authentication → Users → Add user). There's no self-serve signup — any
   authenticated user can access both `/worker` and `/admin` for now (see the
   TODO in `firestore.rules` and `components/AuthGate.tsx` about role
   separation).
6. **Deploy `firestore.rules`** to your project (Firebase console → Firestore
   → Rules, or `firebase deploy --only firestore:rules` if you have the
   Firebase CLI set up).
7. Copy `.env.example` to `.env.local` and fill in the values below.
   **Never commit `.env.local`.**

### Environment variables

```
# Public — safe to expose to the browser (Firebase client SDK config)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server-only — from the service account JSON, used by the Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`FIREBASE_PRIVATE_KEY` keeps its `\n` escapes as a literal two-character
sequence in `.env.local` — `lib/firebase-admin.ts` unescapes them at runtime.

### Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll need at least one
active event in Firestore for the storefront to show anything — create one
from `/admin` after signing in.

## Routes

| Route | Description |
|---|---|
| `/` | Public storefront — grid of active events |
| `/event/[id]` | Event detail + checkout (demo, no charge) |
| `/ticket/[id]` | Ticket confirmation with QR code |
| `/worker` | Staff-only door scanner (camera-based check-in) |
| `/admin` | Staff-only event/ticket/application management |
| `/careers` | Public job application form |

## Architecture notes

- Checkout (`purchaseTickets` in `app/event/[id]/actions.ts`) runs as a
  **Server Action** using the Firebase Admin SDK, so it can atomically check
  `ticketsTotal` vs `ticketsSold` and write both the event counter and the new
  ticket docs in one transaction — without needing to grant public write
  access to the `events` collection. This is also where a Stripe
  `PaymentIntent` would be created and confirmed, before the transaction runs.
- The worker scan flow (`scanTicketCode` in `lib/tickets.ts`) runs client-side
  under an authenticated Firebase session, and uses its own transaction so two
  simultaneous scans of the same ticket can't both succeed.

---

## BEFORE TAKING REAL PAYMENTS

This app is a prototype. Do **not** point it at real money until you've done
all of the following:

- [ ] **Integrate Stripe.** Add a real `PaymentIntent` create + confirm step
      in `purchaseTickets()` (`app/event/[id]/actions.ts`) before the ticket
      transaction runs, and only issue tickets after payment succeeds
      (e.g. via a webhook, not just the client response).
- [ ] **Tighten `firestore.rules`.** The `tickets` collection currently
      allows public `create` (defense-in-depth backstop only — actual writes
      go through the Admin SDK). Once Stripe is wired up, require a verified
      payment reference before any ticket write is trusted, and consider
      removing the public `create` rule entirely if nothing should write to
      `tickets` from client code.
- [ ] **Rate-limit the ticket purchase endpoint.** `purchaseTickets()` has no
      rate limiting today — add it (e.g. Vercel Firewall / WAF rate limiting,
      or an in-app limiter) before it's reachable with real payments attached.
- [ ] **Add email confirmation via Resend.** Send the buyer their ticket
      (link + QR) by email after a successful purchase instead of relying
      solely on the redirect to `/ticket/[id]`.
- [ ] **Add role separation for staff.** Right now any authenticated Firebase
      user can access both `/worker` and `/admin` (see TODOs in
      `firestore.rules` and `components/AuthGate.tsx`). Add custom claims or
      a `staffRole` field before giving out more accounts than you can trust
      equally.
