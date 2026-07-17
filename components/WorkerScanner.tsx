"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth-context";
import { getActiveEvents } from "@/lib/events";
import { getTicketsForEvent, scanTicketCode } from "@/lib/tickets";
import type { TixEvent, Ticket } from "@/lib/types";

const RESULT_DISPLAY_MS = 2000;
const SCANNER_ELEMENT_ID = "worker-qr-reader";

type ScanScreen =
  | { kind: "scanning" }
  | { kind: "invalid" }
  | { kind: "valid"; ticket: Ticket; eventName: string }
  | { kind: "already_used"; ticket: Ticket }
  | { kind: "void"; ticket: Ticket };

async function fetchEventCounts(eventId: string) {
  const tickets = await getTicketsForEvent(eventId);
  return {
    total: tickets.length,
    scanned: tickets.filter((t) => t.status === "used").length,
  };
}

export function WorkerScanner() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState<TixEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [screen, setScreen] = useState<ScanScreen>({ kind: "scanning" });
  const [scannedCount, setScannedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const selectedEventIdRef = useRef(selectedEventId);
  const eventsRef = useRef(events);
  const userRef = useRef(user);

  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    getActiveEvents().then((evts) => {
      setEvents(evts);
      if (evts.length > 0) setSelectedEventId(evts[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    fetchEventCounts(selectedEventId).then(({ total, scanned }) => {
      setTotalCount(total);
      setScannedCount(scanned);
    });
  }, [selectedEventId]);

  const handleScan = useCallback(async (ticketCode: string) => {
    if (processingRef.current) return;
    const eventId = selectedEventIdRef.current;
    const currentUser = userRef.current;
    if (!eventId || !currentUser) return;

    processingRef.current = true;

    const result = await scanTicketCode(ticketCode, currentUser.uid);

    if (result.type === "not_found") {
      setScreen({ kind: "invalid" });
    } else if (result.type === "void") {
      setScreen({ kind: "void", ticket: result.ticket });
    } else if (result.type === "already_used") {
      setScreen({ kind: "already_used", ticket: result.ticket });
    } else {
      const event = eventsRef.current.find(
        (e) => e.id === result.ticket.eventId
      );
      setScreen({
        kind: "valid",
        ticket: result.ticket,
        eventName: event?.name ?? "",
      });
      const { total, scanned } = await fetchEventCounts(eventId);
      setTotalCount(total);
      setScannedCount(scanned);
    }

    setTimeout(() => {
      setScreen({ kind: "scanning" });
      processingRef.current = false;
    }, RESULT_DISPLAY_MS);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScan(decodedText),
          () => {
            // ignore per-frame scan failures
          }
        );
      } catch {
        if (!cancelled) {
          setCameraError(
            "Could not access camera. Check permissions and reload."
          );
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      }
    };
  }, [handleScan]);

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="no-print flex items-center justify-between gap-3 bg-neutral-950 px-4 py-3">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-white"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
        <span className="whitespace-nowrap rounded-full bg-neutral-800 px-3 py-1 text-sm font-bold text-white">
          {scannedCount} of {totalCount} scanned
        </span>
        <button
          onClick={() => logout()}
          className="whitespace-nowrap text-sm text-neutral-400 underline"
        >
          Sign out
        </button>
      </div>

      <div className="relative flex-1">
        <div id={SCANNER_ELEMENT_ID} className="h-full w-full" />

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-6 text-center text-red-400">
            {cameraError}
          </div>
        )}

        {screen.kind === "invalid" && (
          <ResultOverlay color="bg-red-600">
            <p className="text-4xl font-black text-white">INVALID TICKET</p>
          </ResultOverlay>
        )}

        {screen.kind === "valid" && (
          <ResultOverlay color="bg-emerald-600">
            <p className="text-4xl font-black text-white">VALID</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {screen.ticket.buyerName}
            </p>
            <p className="text-lg text-white/90">{screen.eventName}</p>
          </ResultOverlay>
        )}

        {screen.kind === "already_used" && (
          <ResultOverlay color="bg-amber-500">
            <p className="text-4xl font-black text-black">ALREADY USED</p>
            {screen.ticket.usedDate && (
              <p className="mt-3 text-lg font-semibold text-black">
                Scanned at {format(screen.ticket.usedDate, "h:mm:ss a")}
              </p>
            )}
          </ResultOverlay>
        )}

        {screen.kind === "void" && (
          <ResultOverlay color="bg-neutral-900 border-4 border-neutral-500">
            <p className="text-4xl font-black text-white">VOIDED</p>
            <p className="mt-3 text-lg font-semibold text-neutral-300">
              Not valid — this ticket has been voided
            </p>
          </ResultOverlay>
        )}
      </div>
    </div>
  );
}

function ResultOverlay({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center ${color}`}
    >
      {children}
    </div>
  );
}
