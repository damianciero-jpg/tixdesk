"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-pink-500 hover:text-white"
    >
      Save / Print
    </button>
  );
}
