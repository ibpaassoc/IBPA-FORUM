"use client";

import type { LucideIcon } from "lucide-react";

import Reveal from "@/shared/components/public/Reveal";

type PlaceholderSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  surface?: "white" | "blue-tint";
};

/**
 * Reserved-space section for content the client will supply later
 * (e.g. forum program, speakers lineup). Renders a calm placeholder
 * rather than leaving an empty gap.
 */
export default function PlaceholderSection({
  eyebrow,
  title,
  description,
  icon: Icon,
  surface = "white",
}: PlaceholderSectionProps) {
  const sectionBg =
    surface === "blue-tint"
      ? "bg-[linear-gradient(160deg,#f2f8fb,#ffffff)]"
      : "bg-white";

  return (
    <section className={`relative overflow-hidden ${sectionBg} py-20 md:py-28`}>
      <div className="page-section relative">
        <Reveal>
          <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[34px] border border-dashed border-[#72a0c1]/35 bg-white/55 px-6 py-14 text-center backdrop-blur-xl md:py-20">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#72a0c1]/10 text-[#72a0c1] ring-1 ring-[#72a0c1]/12">
              <Icon className="h-6 w-6" strokeWidth={1.6} />
            </span>

            <p className="page-eyebrow mt-6 text-[#72a0c1]">{eyebrow}</p>

            <h2 className="mt-4 font-[var(--font-display)] text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] tracking-[-0.04em] text-[#1e2430]">
              {title}
            </h2>

            <p className="mt-4 max-w-md text-[1rem] leading-7 text-[#5d6877]">
              {description}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
