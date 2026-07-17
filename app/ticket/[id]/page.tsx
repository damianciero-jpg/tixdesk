import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import QRCode from "qrcode";
import {
  getTicketAdmin,
  getOrderTicketsAdmin,
  getEventAdmin,
} from "@/lib/tickets-admin";
import { PrintButton } from "@/components/PrintButton";

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { id } = await params;
  const { order } = await searchParams;

  const ticket = await getTicketAdmin(id);
  if (!ticket) {
    notFound();
  }

  const event = await getEventAdmin(ticket.eventId);
  if (!event) {
    notFound();
  }

  const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode, {
    width: 320,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const siblingTickets = order
    ? (await getOrderTicketsAdmin(order)).filter((t) => t.id !== ticket.id)
    : [];

  const isUsed = ticket.status === "used";

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 print:border-black print:bg-white">
        <div className="border-b border-neutral-800 bg-gradient-to-br from-pink-600/20 to-neutral-900 p-6 print:border-black print:bg-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-pink-400 print:text-black">
            {isUsed ? "Ticket Used" : "Ticket Confirmed"}
          </p>
          <h1 className="mt-1 text-2xl font-black text-white print:text-black">
            {event.name}
          </h1>
          <p className="mt-1 text-neutral-300 print:text-black">
            {event.venue}
          </p>
          <p className="text-neutral-400 print:text-black">
            {format(event.date, "EEEE, MMMM d, yyyy")} · Doors {event.doorsTime}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 p-6">
          <span
            className={`rounded-full px-4 py-1 text-sm font-bold ${
              isUsed
                ? "bg-amber-500/20 text-amber-400 print:bg-transparent print:text-black"
                : "bg-emerald-500/20 text-emerald-400 print:bg-transparent print:text-black"
            }`}
          >
            {isUsed ? "USED" : "VALID"}
          </span>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="Ticket QR code"
            className="h-64 w-64 rounded-xl border-4 border-white bg-white"
          />

          <p className="font-mono text-sm tracking-widest text-neutral-400 print:text-black">
            {ticket.ticketCode}
          </p>

          <div className="w-full border-t border-neutral-800 pt-4 text-center print:border-black">
            <p className="text-lg font-semibold text-white print:text-black">
              {ticket.buyerName}
            </p>
            <p className="text-sm text-neutral-400 print:text-black">
              {ticket.buyerEmail}
            </p>
          </div>
        </div>
      </div>

      {siblingTickets.length > 0 && (
        <div className="no-print mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="mb-2 text-sm font-semibold text-neutral-300">
            Your order includes {siblingTickets.length + 1} tickets
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-pink-600 px-3 py-1 text-xs font-semibold text-white">
              This ticket
            </span>
            {siblingTickets.map((t) => (
              <Link
                key={t.id}
                href={`/ticket/${t.id}?order=${order}`}
                className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-semibold text-neutral-300 transition hover:border-pink-500 hover:text-white"
              >
                {t.buyerName}&apos;s ticket
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="no-print mt-6 flex justify-center gap-3">
        <PrintButton />
        <Link
          href="/"
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-pink-500 hover:text-white"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
}
