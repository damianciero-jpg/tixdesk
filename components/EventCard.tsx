import Link from "next/link";
import { format } from "date-fns";
import type { TixEvent } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 20;

export function EventCard({ event }: { event: TixEvent }) {
  const remaining = event.ticketsTotal - event.ticketsSold;
  const soldOut = remaining <= 0;

  return (
    <Link
      href={`/event/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-pink-600/60 hover:shadow-lg hover:shadow-pink-600/10"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
        {event.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-black text-neutral-700">
            {event.name.charAt(0)}
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="rounded-full bg-neutral-950 px-4 py-1 text-sm font-bold tracking-wide text-white">
              SOLD OUT
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-bold text-white">{event.name}</h3>
        <p className="text-sm text-neutral-400">{event.venue}</p>
        <p className="text-sm text-neutral-400">
          {format(event.date, "EEE, MMM d · h:mm a")}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-pink-500">
            ${(event.price / 100).toFixed(2)}
          </span>
          {!soldOut && remaining <= LOW_STOCK_THRESHOLD && (
            <span className="text-xs font-semibold text-amber-400">
              Only {remaining} left
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
