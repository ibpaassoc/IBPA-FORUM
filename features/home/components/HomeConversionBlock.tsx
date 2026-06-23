"use client";

import { useEffect, useState } from "react";
import HomeParticipation from "./HomeParticipation";
import HomePricing from "./HomePricing";
import HomeSlider, { type Tier } from "./HomeSlider";
import TicketModal from "@/features/tickets/components/TicketModal";
import type { EarlyBirdStatus } from "@/features/tickets/types";

export default function HomeConversionBlock() {
  const [tier, setTier] = useState<Tier>("ibpa");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
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

  return (
    <div className="relative">
      <HomeSlider tier={tier} onTierChange={setTier} />

      <HomeParticipation tier={tier} earlyBird={earlyBird} />
      <HomePricing tier={tier} onBuyTickets={() => setIsTicketModalOpen(true)} earlyBird={earlyBird} />

      <TicketModal isOpen={isTicketModalOpen} onClose={() => setIsTicketModalOpen(false)} />
    </div>
  );
}
