"use client";

import { useEffect, useState, type FormEvent } from "react";
import { submitApplication } from "@/lib/applications";
import { getActivePositions } from "@/lib/jobPositions";
import type { PositionInterest } from "@/lib/types";

export default function CareersPage() {
  const [positions, setPositions] = useState<string[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [positionInterest, setPositionInterest] =
    useState<PositionInterest>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getActivePositions().then((fetched) => {
      const titles = fetched.map((p) => p.title);
      const options = [...titles.filter((t) => t !== "Other"), "Other"];
      setPositions(options);
      setPositionInterest(options[0]);
      setPositionsLoading(false);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitApplication({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        positionInterest,
        message: message.trim(),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong submitting your application. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl font-black text-white">Thanks, {name}!</h1>
        <p className="mt-3 text-neutral-400">
          We&apos;ve received your application and will be in touch if there&apos;s
          a fit.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-black text-white sm:text-4xl">
        Join the Team
      </h1>
      <p className="mt-2 mb-8 text-neutral-400">
        We&apos;re always looking for great people to help run our events.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
      >
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

        <div className="mb-4">
          <label className="mb-1 block text-sm text-neutral-400">Phone</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-pink-500"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-neutral-400">
            Position of Interest
          </label>
          <select
            value={positionInterest}
            onChange={(e) => setPositionInterest(e.target.value)}
            disabled={positionsLoading}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-pink-500 disabled:opacity-50"
          >
            {positionsLoading ? (
              <option>Loading…</option>
            ) : (
              positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-neutral-400">
            Message
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-pink-500"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-pink-600 px-4 py-3 font-bold text-white transition hover:bg-pink-500 disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
