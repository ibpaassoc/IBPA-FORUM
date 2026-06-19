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
    title: "Expand your reach",
    text: "Five or more nominations automatically include you in Grand Prix consideration.",
  },
];

export default function ApplyIntroCards() {
  return (
    <section className="px-[var(--page-gutter)] py-10">
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="premium-glass p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-blue-soft)] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
                <Icon size={18} strokeWidth={1.7} />
              </span>

              <h3 className="mt-5 font-[var(--font-display)] text-[1.55rem] leading-[1.02] tracking-[-0.03em] text-[var(--color-ink)]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.8] text-[var(--color-ink-soft)]">
                {card.text}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
