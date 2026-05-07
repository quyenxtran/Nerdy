"use client";

import { useEffect } from "react";
import type { CreateSignalRequest } from "@/lib/contracts";

export function SignalBeacon({ type, entityType, entityId, weight = 0.5, metadata }: CreateSignalRequest) {
  const payload = JSON.stringify({ entityId, entityType, metadata, type, weight });

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/signals", {
      body: payload,
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: controller.signal
    }).catch(() => {
      // Signals are advisory; page rendering should not depend on analytics writes.
    });

    return () => controller.abort();
  }, [payload]);

  return null;
}
