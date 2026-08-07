"use client";

import { useEffect, useState } from "react";

import type { StripePricingSnapshot } from "@/features/pricing/types";

export function useStripePricing() {
  const [pricing, setPricing] = useState<StripePricingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetch("/api/pricing", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Stripe pricing is unavailable.");
        return (await response.json()) as StripePricingSnapshot;
      })
      .then((snapshot) => {
        if (active) setPricing(snapshot);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { pricing, loading };
}
