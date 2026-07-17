import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getEvent } from "@/lib/events";
import { CheckoutForm } from "@/components/CheckoutForm";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const remaining = event.ticketsTotal - event.ticketsSold;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        <div className="aspect-[21/9] w-full bg-neutral-800">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl font-black text-neutral-700">
              {event.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            {event.name}
          </h1>
          <div className="mt-3 space-y-1 text-neutral-300">
            <p className="font-medium">{event.venue}</p>
            <p>{format(event.date, "EEEE, MMMM d, yyyy")}</p>
            <p>Doors: {event.doorsTime}</p>
          </div>
          <p className="mt-6 whitespace-pre-line text-neutral-400">
            {event.description}
          </p>
        </div>

        <div className="md:col-span-1">
          <CheckoutForm
            eventId={event.id}
            price={event.price}
            remaining={remaining}
          />
        </div>
      </div>
    </div>
  );
}
