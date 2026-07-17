"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { getAllEvents } from "@/lib/events";
import { getTicketsForEvent, setTicketStatus } from "@/lib/tickets";
import type { TixEvent, Ticket, TicketStatus } from "@/lib/types";

const STATUS_STYLES: Record<TicketStatus, string> = {
  valid: "bg-emerald-500/20 text-emerald-400",
  used: "bg-amber-500/20 text-amber-400",
  void: "bg-neutral-700 text-neutral-300",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  valid: "Valid",
  used: "Used",
  void: "Void",
};

export function TicketsPanel() {
  const [events, setEvents] = useState<TixEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function refreshTickets(eventId: string) {
    setLoading(true);
    setTickets(await getTicketsForEvent(eventId));
    setLoading(false);
  }

  useEffect(() => {
    getAllEvents().then((evts) => {
      setEvents(evts);
      if (evts.length > 0) setSelectedEventId(evts[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    refreshTickets(selectedEventId);
  }, [selectedEventId]);

  async function handleSetStatus(ticket: Ticket, status: TicketStatus) {
    if (status === "void" && !window.confirm(`Void ticket ${ticket.ticketCode}? It will no longer be accepted at the door.`)) {
      return;
    }
    await setTicketStatus(ticket.id, status);
    refreshTickets(selectedEventId);
  }

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(
      (t) =>
        t.buyerName.toLowerCase().includes(q) ||
        t.ticketCode.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Tickets</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-white"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buyer or ticket code…"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-white outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="text-neutral-400">No tickets sold for this event yet.</p>
      ) : filteredTickets.length === 0 ? (
        <p className="text-neutral-400">No tickets match your search.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-3">Ticket Code</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Purchased</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-t border-neutral-800 text-neutral-200"
                >
                  <td className="px-4 py-3 font-mono">{ticket.ticketCode}</td>
                  <td className="px-4 py-3">{ticket.buyerName}</td>
                  <td className="px-4 py-3">{ticket.buyerEmail}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {format(ticket.purchaseDate, "MMM d, h:mm a")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {ticket.usedDate
                      ? format(ticket.usedDate, "MMM d, h:mm a")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[ticket.status]}`}
                    >
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      {ticket.status !== "used" && (
                        <button
                          onClick={() => handleSetStatus(ticket, "used")}
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                        >
                          Mark as used
                        </button>
                      )}
                      {ticket.status !== "valid" && (
                        <button
                          onClick={() => handleSetStatus(ticket, "valid")}
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          Mark as valid
                        </button>
                      )}
                      {ticket.status !== "void" && (
                        <button
                          onClick={() => handleSetStatus(ticket, "void")}
                          className="text-xs font-semibold text-red-400 hover:text-red-300"
                        >
                          Void
                        </button>
                      )}
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
