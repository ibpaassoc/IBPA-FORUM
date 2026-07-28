"use client";

import { useEffect, useState } from "react";
import type { TicketDiscountStatus } from "@/features/tickets/types";

/**
 * Fetches the active automatic ticket discount and exposes it in one place for
 * all ticket-pricing surfaces.
 */
export function useTicketDiscount() {
  const [ticketDiscount, setTicketDiscount] = useState<TicketDiscountStatus>({
    enabled: false,
    kind: null,
    discount: null,
  });

  useEffect(() => {
    fetch("/api/ticket-discount", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: TicketDiscountStatus) => setTicketDiscount(data))
      .catch(() => {});
  }, []);

  const discount = ticketDiscount.enabled ? ticketDiscount.discount : null;

  return { ticketDiscount, discount };
}
