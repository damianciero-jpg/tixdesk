"use client";

import { useState, type FormEvent } from "react";
import { createEvent, updateEvent } from "@/lib/events";
import type { TixEvent } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-pink-500";

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventForm({
  event,
  onSaved,
  onCancel,
}: {
  event?: TixEvent;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(event?.name ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [date, setDate] = useState(
    event ? toDatetimeLocal(event.date) : ""
  );
  const [doorsTime, setDoorsTime] = useState(event?.doorsTime ?? "");
  const [price, setPrice] = useState(
    event ? (event.price / 100).toFixed(2) : ""
  );
  const [ticketsTotal, setTicketsTotal] = useState(
    event ? String(event.ticketsTotal) : ""
  );
  const [imageUrl, setImageUrl] = useState(event?.imageUrl ?? "");
  const [active, setActive] = useState(event?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const input = {
        name: name.trim(),
        description: description.trim(),
        venue: venue.trim(),
        date: new Date(date),
        doorsTime: doorsTime.trim(),
        price: Math.round(Number(price) * 100),
        ticketsTotal: Number(ticketsTotal),
        imageUrl: imageUrl.trim(),
        active,
      };

      if (event) {
        await updateEvent(event.id, input);
      } else {
        await createEvent(input);
      }
      onSaved();
    } catch {
      setError("Failed to save event.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
    >
      <h3 className="mb-4 text-lg font-bold text-white">
        {event ? "Edit Event" : "New Event"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Venue">
          <input
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Date &amp; Time">
          <input
            required
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Doors Time">
          <input
            required
            placeholder="e.g. 9:00 PM"
            value={doorsTime}
            onChange={(e) => setDoorsTime(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Price (USD)">
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Tickets Total">
          <input
            required
            type="number"
            min="1"
            value={ticketsTotal}
            onChange={(e) => setTicketsTotal(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Image URL (optional)" full>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Description" full>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-neutral-300">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active (visible on storefront)
      </label>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white transition hover:bg-pink-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Event"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-700 px-4 py-2 font-semibold text-neutral-300 transition hover:border-neutral-500"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-sm text-neutral-400">{label}</label>
      {children}
    </div>
  );
}
