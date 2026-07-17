"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { EventsPanel } from "./EventsPanel";
import { TicketsPanel } from "./TicketsPanel";
import { ApplicationsPanel } from "./ApplicationsPanel";
import { JobPositionsPanel } from "./JobPositionsPanel";

type Tab = "events" | "tickets" | "applications" | "positions";

const TABS: { id: Tab; label: string }[] = [
  { id: "events", label: "Events" },
  { id: "tickets", label: "Tickets" },
  { id: "applications", label: "Applications" },
  { id: "positions", label: "Job Positions" },
];

export function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("events");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">Admin</h1>
        <button
          onClick={() => logout()}
          className="text-sm text-neutral-400 underline"
        >
          Sign out
        </button>
      </div>

      <div className="mb-6 flex gap-2 border-b border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? "border-b-2 border-pink-500 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "events" && <EventsPanel />}
      {tab === "tickets" && <TicketsPanel />}
      {tab === "applications" && <ApplicationsPanel />}
      {tab === "positions" && <JobPositionsPanel />}
    </div>
  );
}
