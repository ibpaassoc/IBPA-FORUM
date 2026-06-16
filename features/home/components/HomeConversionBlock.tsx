"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import HomeParticipation from "./HomeParticipation";
import HomePricing from "./HomePricing";
import TicketModal from "@/features/tickets/components/TicketModal";

export type Tier = "ibpa" | "standard";

export default function HomeConversionBlock() {
  const [tier, setTier] = useState<Tier>("ibpa");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  return (
    <div className="relative">
      {/* ── Sticky tier toggle ── */}
      <div className="sticky top-[70px] z-30">
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]/94 py-3 backdrop-blur-md">
          <div className="page-section flex items-center justify-center gap-4 sm:justify-between">
            {/* Label */}
            <p className="hidden text-[0.69rem] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-soft)] sm:block">
              {tier === "ibpa" ? "IBPA Member pricing active" : "Standard pricing active"}
            </p>

            {/* Animated segmented toggle */}
            <div
              role="group"
              aria-label="Select pricing tier"
              className="relative flex rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-muted)] p-1"
            >
              {/* Animated sliding pill — layout-animated by Framer Motion */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-y-1 rounded-[var(--radius-pill)] bg-[var(--color-ink)]"
                layout
                style={
                  tier === "ibpa"
                    ? { left: "4px", right: "50%" }
                    : { left: "50%", right: "4px" }
                }
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />

              <button
                onClick={() => setTier("ibpa")}
                className={`relative z-10 rounded-[var(--radius-pill)] px-6 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-150 ${
                  tier === "ibpa"
                    ? "text-white"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                IBPA Member
              </button>
              <button
                onClick={() => setTier("standard")}
                className={`relative z-10 rounded-[var(--radius-pill)] px-6 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-150 ${
                  tier === "standard"
                    ? "text-white"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                Standard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sections driven by tier ── */}
      <HomeParticipation tier={tier} />
      <HomePricing tier={tier} onBuyTickets={() => setIsTicketModalOpen(true)} />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </div>
  );
}
