"use client";

import { BadgeCheck, Layers3, Send, Sparkles } from "lucide-react";

const cards = [
  {
    icon: Layers3,
    title: "Choose your category",
    text: "Select the category and nomination that best represent your professional specialty.",
  },
  {
    icon: BadgeCheck,
    title: "Prepare your profile",
    text: "Complete your contact details, professional experience, and supporting credentials.",
  },
  {
    icon: Send,
    title: "Submit your application",
    text: "Upload the required materials for review by the official IBPA panel.",
  },
  {
    icon: Sparkles,
    title: "Grand Prix eligible",
    text: "Five or more nominations automatically include you in Grand Prix consideration.",
  },
];

export default function ApplyIntroCards() {
  return (
    <section className="relative px-[var(--page-gutter)] py-12">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_22px_70px_rgba(42,66,82,0.09)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:bg-white"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-blue-wash)] opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />

              <div className="relative flex items-start justify-between gap-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-blue)]/15 bg-white/80 text-[var(--color-blue)] shadow-[0_14px_34px_rgba(42,66,82,0.08)] transition duration-500 group-hover:scale-105">
                  <Icon size={18} strokeWidth={1.7} />
                </span>

                <span className="font-[var(--font-title-family)] text-4xl font-light italic leading-none text-[var(--color-ink)]/10">
                  0{index + 1}
                </span>
              </div>

              <h3 className="relative mt-7 max-w-[11rem] font-[var(--font-display)] text-[1.65rem] leading-[0.98] tracking-[-0.045em] text-[var(--color-ink)]">
                {card.title}
              </h3>

              <p className="relative mt-4 text-sm leading-[1.75] text-[var(--color-ink-soft)]">
                {card.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
