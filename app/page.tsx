import { getActiveEvents } from "@/lib/events";
import { EventCard } from "@/components/EventCard";

export default async function HomePage() {
  const events = await getActiveEvents();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Upcoming Events
        </h1>
        <p className="mt-2 text-neutral-400">
          Grab your tickets before they&apos;re gone.
        </p>
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-neutral-400">
          No events on sale right now. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
