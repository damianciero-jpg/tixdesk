"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getApplications } from "@/lib/applications";
import type { JobApplication } from "@/lib/types";

export function ApplicationsPanel() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApplications().then((apps) => {
      setApplications(apps);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-white">Job Applications</h2>

      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-neutral-400">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-t border-neutral-800 align-top text-neutral-200"
                >
                  <td className="px-4 py-3 font-medium">{app.name}</td>
                  <td className="px-4 py-3">{app.email}</td>
                  <td className="px-4 py-3">{app.phone}</td>
                  <td className="px-4 py-3">{app.positionInterest}</td>
                  <td className="max-w-xs px-4 py-3 text-neutral-400">
                    {app.message}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {format(app.submittedDate, "MMM d, h:mm a")}
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
