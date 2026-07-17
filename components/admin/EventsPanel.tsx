"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { deleteEvent, getAllEvents, setEventActive } from "@/lib/events";
import type { TixEvent } from "@/lib/types";
import { EventForm } from "./EventForm";

export function EventsPanel() {
  const [events, setEvents] = useState<TixEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TixEvent | null>(null);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    setEvents(await getAllEvents());
    setLoading(false);
  }

  useEffect(() => {
    getAllEvents().then((evts) => {
      setEvents(evts);
      setLoading(false);
    });
  }, []);

  async function toggleActive(event: TixEvent) {
    await setEventActive(event.id, !event.active);
    refresh();
  }

  async function handleDelete(event: TixEvent) {
    if (event.ticketsSold > 0) return;
    if (!window.confirm(`Delete "${event.name}"? This cannot be undone.`)) {
      return;
    }
    await deleteEvent(event.id);
    refresh();
  }

  if (creating) {
    return (
      <EventForm
        onSaved={() => {
          setCreating(false);
          refresh();
        }}
        onCancel={() => setCreating(false)}
      />
    );
  }

  if (editing) {
    return (
      <EventForm
        event={editing}
        onSaved={() => {
          setEditing(null);
          refresh();
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Events</h2>
        <button
          onClick={() => setCreating(true)}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500"
        >
          + New Event
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-neutral-400">No events yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Venue</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Sold</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-t border-neutral-800 text-neutral-200"
                >
                  <td className="px-4 py-3 font-medium">{event.name}</td>
                  <td className="px-4 py-3">
                    {format(event.date, "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">{event.venue}</td>
                  <td className="px-4 py-3">
                    ${(event.price / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {event.ticketsSold} / {event.ticketsTotal}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        event.active
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-neutral-700 text-neutral-300"
                      }`}
                    >
                      {event.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(event)}
                        className="text-xs font-semibold text-pink-400 hover:text-pink-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(event)}
                        className="text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        {event.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        disabled={event.ticketsSold > 0}
                        title={
                          event.ticketsSold > 0
                            ? "Can't delete an event with tickets sold. Deactivate it instead."
                            : undefined
                        }
                        className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:text-neutral-600 disabled:hover:text-neutral-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
