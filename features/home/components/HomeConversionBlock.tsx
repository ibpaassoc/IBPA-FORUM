"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeDollarSign } from "lucide-react";
import HomeParticipation from "./HomeParticipation";
import HomePricing from "./HomePricing";
import TicketModal from "@/features/tickets/components/TicketModal";
import type { EarlyBirdStatus } from "@/features/tickets/types";

export type Tier = "ibpa" | "standard";

export default function HomeConversionBlock() {
  const [tier, setTier] = useState<Tier>("ibpa");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [earlyBird, setEarlyBird] = useState<EarlyBirdStatus>({ enabled: false, discount: null });

  useEffect(() => {
    fetch("/api/early-bird")
      .then((r) => r.json())
      .then((data: EarlyBirdStatus) => setEarlyBird(data))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* ── Sticky tier toggle ── */}
      <div
        className="sticky z-[90]"
        style={{ top: "var(--site-header-height)" }}
        data-testid="conversion-sticky-bar"
      >
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]/96 py-3 shadow-[0_2px_12px_rgba(3,2,19,0.06)] backdrop-blur-md">
          <div className="page-section flex items-center justify-center gap-3 sm:justify-between">

            {/* Left: icon + context label */}
            <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
              <BadgeDollarSign
                size={16}
                strokeWidth={1.5}
                className="shrink-0 text-[var(--color-ink-soft)]"
              />
              <div className="min-w-0">
                <p className="text-[0.67rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-soft)]">
                  Showing prices for
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tier}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="truncate text-[0.8rem] font-medium text-[var(--color-ink)]"
                  >
                    {tier === "ibpa"
                      ? "IBPA Members — member discounts applied"
                      : "Standard (non-member) rates"}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Right: segmented toggle — larger & more prominent */}
            <div
              role="group"
              aria-label="Select pricing tier"
              data-testid="pricing-tier-toggle"
              className="relative flex shrink-0 rounded-[var(--radius-pill)] border-2 border-[var(--border-default)] bg-[var(--surface-muted)] p-1"
            >
              {/* Animated sliding pill */}
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
                className={`relative z-10 rounded-[var(--radius-pill)] px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-150 sm:px-5 ${
                  tier === "ibpa"
                    ? "text-white"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                IBPA Member
              </button>

              <button
                onClick={() => setTier("standard")}
                className={`relative z-10 rounded-[var(--radius-pill)] px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-150 sm:px-5 ${
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
      <HomeParticipation tier={tier} earlyBird={earlyBird} />
      <HomePricing tier={tier} onBuyTickets={() => setIsTicketModalOpen(true)} earlyBird={earlyBird} />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />
    </div>
  );
}
