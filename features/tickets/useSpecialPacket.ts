"use client";

import { useEffect, useState } from "react";
import type { SpecialPacketStatus } from "@/features/tickets/types";

const FALLBACK: SpecialPacketStatus = {
  enabled: false,
};

export function useSpecialPacket() {
  const [status, setStatus] = useState<SpecialPacketStatus>(FALLBACK);

  useEffect(() => {
    let active = true;
    void fetch("/api/tickets/special-packet", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return FALLBACK;
        return (await response.json()) as SpecialPacketStatus;
      })
      .then((next) => {
        if (active) setStatus(next);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return status;
}
