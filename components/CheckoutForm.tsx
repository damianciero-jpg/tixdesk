"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { purchaseTickets } from "@/app/event/[id]/actions";

const MAX_QTY = 6;

export function CheckoutForm({
  eventId,
  price,
  remaining,
}: {
  eventId: string;
  price: number;
  remaining: number;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const maxQty = Math.min(MAX_QTY, remaining);
  const total = ((price * quantity) / 100).toFixed(2);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { orderId, ticketIds } = await purchaseTickets({
        eventId,
        buyerName: name.trim(),
        buyerEmail: email.trim(),
        quantity,
      });
      const query = ticketIds.length > 1 ? `?order=${orderId}` : "";
      router.push(`/ticket/${ticketIds[0]}${query}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
      setSubmitting(false);
    }
  }

  if (remaining <= 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center text-neutral-400">
        This event is sold out.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
    >
      <h2 className="mb-4 text-xl font-bold text-white">Get Tickets</h2>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-neutral-400">
          Full Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-pink-500"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-neutral-400">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-pink-500"
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm text-neutral-400">
          Quantity
        </label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-pink-500"
        >
          {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-pink-600 px-4 py-3 text-center font-bold text-white transition hover:bg-pink-500 disabled:opacity-50"
      >
        {submitting
          ? "Processing…"
          : `Complete Order (Demo — no charge) · $${total}`}
      </button>
    </form>
  );
}
