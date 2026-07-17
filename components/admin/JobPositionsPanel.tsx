"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  createPosition,
  deletePosition,
  getAllPositions,
  updatePosition,
} from "@/lib/jobPositions";
import type { JobPosition } from "@/lib/types";

export function JobPositionsPanel() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setPositions(await getAllPositions());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const nextSortOrder =
        positions.length > 0
          ? Math.max(...positions.map((p) => p.sortOrder)) + 1
          : 0;
      await createPosition(title.trim(), nextSortOrder);
      setTitle("");
      await refresh();
    } catch {
      setError("Failed to create position.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(position: JobPosition) {
    await updatePosition(position.id, { active: !position.active });
    refresh();
  }

  async function handleDelete(position: JobPosition) {
    if (!window.confirm(`Delete position "${position.title}"?`)) return;
    await deletePosition(position.id);
    refresh();
  }

  async function move(position: JobPosition, direction: -1 | 1) {
    const sorted = [...positions].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((p) => p.id === position.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const other = sorted[swapIdx];
    await Promise.all([
      updatePosition(position.id, { sortOrder: other.sortOrder }),
      updatePosition(other.id, { sortOrder: position.sortOrder }),
    ]);
    refresh();
  }

  const sortedPositions = [...positions].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-white">Job Positions</h2>

      <form
        onSubmit={handleCreate}
        className="mb-6 flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Position title"
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-pink-500"
        />
        <button
          type="submit"
          disabled={creating || !title.trim()}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500 disabled:opacity-50"
        >
          {creating ? "Adding…" : "+ Add Position"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {loading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : sortedPositions.length === 0 ? (
        <p className="text-neutral-400">No job positions yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sortedPositions.map((position) => (
                <tr
                  key={position.id}
                  className="border-t border-neutral-800 text-neutral-200"
                >
                  <td className="px-4 py-3 font-medium">{position.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        position.active
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-neutral-700 text-neutral-300"
                      }`}
                    >
                      {position.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => move(position, -1)}
                        className="text-xs font-semibold text-neutral-400 hover:text-white"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(position, 1)}
                        className="text-xs font-semibold text-neutral-400 hover:text-white"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => toggleActive(position)}
                        className="text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        {position.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(position)}
                        className="text-xs font-semibold text-red-400 hover:text-red-300"
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
