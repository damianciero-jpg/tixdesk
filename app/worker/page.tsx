"use client";

import { AuthGate } from "@/components/AuthGate";
import { WorkerScanner } from "@/components/WorkerScanner";

export default function WorkerPage() {
  return (
    <AuthGate>
      <WorkerScanner />
    </AuthGate>
  );
}
