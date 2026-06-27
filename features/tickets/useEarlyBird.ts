"use client";

import { useEffect, useState } from "react";
import type { EarlyBirdStatus } from "@/features/tickets/types";

/**
 * Fetches the current Early Bird status from `/api/early-bird` and exposes the
 * active discount (or `null` when disabled). Shared by every client surface that
 * displays Early Bird pricing so the fetch logic lives in exactly one place.
 */
export function useEarlyBird() {
  const [earlyBird, setEarlyBird] = useState<EarlyBirdStatus>({
    enabled: false,
    discount: null,
  });

  useEffect(() => {
    fetch("/api/early-bird")
      .then((r) => r.json())
      .then((data: EarlyBirdStatus) => setEarlyBird(data))
      .catch(() => {});
  }, []);

  const discount = earlyBird.enabled ? earlyBird.discount : null;

  return { earlyBird, discount };
}
