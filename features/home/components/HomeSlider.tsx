"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeDollarSign } from "lucide-react";

export type Tier = "ibpa" | "standard";

type HomeSliderProps = {
  tier: Tier;
  onTierChange: (tier: Tier) => void;
};

export default function HomeSlider({ tier, onTierChange }: HomeSliderProps) {
  const [headerOffset, setHeaderOffset] = useState<number | null>(null);

  useEffect(() => {
    const header =
      document.querySelector<HTMLElement>("[data-site-header]") ||
      document.querySelector<HTMLElement>("header");

    if (!header) return;

    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = Math.round(header.getBoundingClientRect().height);
        setHeaderOffset(height);
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(header);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="sticky z-[90]"
      style={{
        top:
          headerOffset !== null
            ? `${headerOffset}px`
            : "var(--site-header-height)",
      }}
      data-testid="conversion-sticky-bar"
    >
      <div className="border-b border-[#b9d9eb]/45 bg-white/82 py-3 backdrop-blur-2xl shadow-[0_12px_32px_rgba(114,160,193,0.10)]">
        <div className="page-section flex items-center justify-center gap-3 sm:justify-between">
          <div className="hidden min-w-0 items-center gap-2.5 sm:flex">
            <BadgeDollarSign
              size={16}
              strokeWidth={1.5}
              className="shrink-0 text-[var(--color-ink-soft)]"
            />

            <div className="min-w-0">
              <p className="text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                Showing prices for
              </p>

              <AnimatePresence mode="wait">
                <motion.p
                  key={tier}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="truncate text-[0.82rem] font-medium text-[var(--color-ink)]"
                >
                  {tier === "ibpa"
                    ? "IBPA Members — member discounts applied"
                    : "Standard non-member rates"}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div
            role="group"
            aria-label="Select pricing tier"
            data-testid="pricing-tier-toggle"
            className="relative flex rounded-full border border-[#b9d9eb]/60 bg-white/60 p-1.5 backdrop-blur-2xl shadow-[0_10px_40px_rgba(122,152,175,0.10)]"
          >
            <motion.div
              layout
              aria-hidden
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="pointer-events-none absolute inset-y-1.5 rounded-full border border-[#8eb6d3]/55 bg-gradient-to-b from-white/95 via-[#fafdff] to-[#eef7fc] shadow-[0_0_0_1px_rgba(255,255,255,0.65),0_8px_24px_rgba(122,152,175,0.15),0_0_36px_rgba(122,152,175,0.18)] backdrop-blur-xl"
              style={
                tier === "ibpa"
                  ? { left: 6, right: "50%" }
                  : { left: "50%", right: 6 }
              }
            >
              <span className="absolute inset-x-5 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-[#72a0c1]/90 to-transparent" />
              <span className="absolute inset-0 rounded-full bg-[#72a0c1]/5" />
              <span className="absolute inset-x-6 top-[2px] h-[40%] rounded-full bg-gradient-to-b from-white/70 to-transparent" />
            </motion.div>

            <button
              type="button"
              onClick={() => onTierChange("ibpa")}
              className={`relative z-10 min-w-[138px] rounded-full px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all duration-500 ${
                tier === "ibpa"
                  ? "text-[#24394b]"
                  : "text-[var(--color-ink-soft)] hover:text-[#24394b]"
              }`}
            >
              IBPA MEMBER
            </button>

            <button
              type="button"
              onClick={() => onTierChange("standard")}
              className={`relative z-10 min-w-[138px] rounded-full px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all duration-500 ${
                tier === "standard"
                  ? "text-[#24394b]"
                  : "text-[var(--color-ink-soft)] hover:text-[#24394b]"
              }`}
            >
              STANDARD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
