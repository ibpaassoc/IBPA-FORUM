"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

import Reveal from "@/shared/components/public/Reveal";

export type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  eyebrow: string;
  title: string;
  items: readonly FaqItem[];
  /** Section background. Defaults to plain white. */
  surface?: "white" | "blue-tint";
  /** Index of the item open on first render. Use null for all closed. */
  defaultOpenIndex?: number | null;
};

export default function FaqAccordion({
  eyebrow,
  title,
  items,
  surface = "white",
  defaultOpenIndex = 0,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  const sectionBg =
    surface === "blue-tint"
      ? "bg-[linear-gradient(160deg,#f2f8fb,#ffffff)]"
      : "bg-white";

  return (
    <section className={`relative overflow-hidden ${sectionBg} py-20 md:py-28`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#b9d9eb]/18 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="max-w-3xl">
            <p className="page-eyebrow text-[#72a0c1]">{eyebrow}</p>

            <h2 className="mt-5 font-(--font-display) text-[clamp(2.5rem,5.2vw,5rem)] leading-[0.95] tracking-[-0.055em] text-[#1e2430]">
              {title}
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mx-auto mt-12 flex max-w-[880px] flex-col gap-3">
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              const panelId = `faq-panel-${index}-${item.question.slice(0, 8)}`;

              return (
                <li
                  key={item.question}
                  className={`overflow-hidden rounded-[24px] border bg-white/70 backdrop-blur-xl transition-colors duration-300 ${
                    isOpen
                      ? "border-[#72a0c1]/35 shadow-[0_18px_44px_rgba(114,160,193,0.14)]"
                      : "border-[#b9d9eb]/45 hover:border-[#72a0c1]/30"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 px-6 py-5 text-left"
                  >
                    <span className="text-[1.02rem] font-medium leading-snug tracking-[-0.02em] text-[#1e2430] sm:text-[1.12rem]">
                      {item.question}
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#72a0c1]/25 text-[#72a0c1] transition-all duration-300 ${
                        isOpen ? "rotate-45 bg-[#72a0c1]/12" : "bg-white/80"
                      }`}
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.22 },
                        }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 pr-12 text-[0.98rem] leading-7 text-[#5d6877]">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
