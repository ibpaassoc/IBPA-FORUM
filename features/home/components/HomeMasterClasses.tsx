"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, GraduationCap, Sparkles, X } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

type MasterClass = {
  name: string;
  photo: string;
  secondaryPhoto?: string;
  role: string;
  topic: string;
  description: string;
  highlights: readonly string[];
  bonus?: string;
};

const cardLayouts = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-12 lg:grid lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]",
] as const;

export default function HomeMasterClasses() {
  const { t } = useLanguage();
  const c = t.home.masterClassesSection;
  const masterClasses = c.masterClasses as readonly MasterClass[];
  const [openClass, setOpenClass] = useState<number | null>(null);

  useEffect(() => {
    if (openClass === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenClass(null);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openClass]);

  const activeClass = openClass !== null ? masterClasses[openClass] : null;

  return (
    <section className="relative isolate overflow-hidden bg-[#0c1720] py-20 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(185,217,235,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(185,217,235,0.055)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div className="absolute -left-40 top-20 size-[28rem] rounded-full bg-[#2f6f9f]/20 blur-[110px]" />
        <div className="absolute -right-48 bottom-0 size-[32rem] rounded-full bg-[#bda36b]/12 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-8 border-b border-white/10 pb-10 md:mb-16 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:pb-12">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#b9d9eb]">
              <span className="h-px w-10 bg-[#bda36b]" />
              {c.eyebrow}
            </div>

            <h2 className="text-balance text-4xl font-semibold tracking-[-0.045em] text-white md:text-6xl">
              {c.title}
            </h2>

            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-white/65 md:text-lg">
              {c.description}
            </p>
          </div>

          <div className="flex items-center gap-4 md:justify-end">
            <span className="text-5xl font-light tracking-[-0.06em] text-[#bda36b] md:text-7xl">
              {String(masterClasses.length).padStart(2, "0")}
            </span>
            <span className="max-w-28 text-xs font-semibold uppercase leading-5 tracking-[0.2em] text-white/50">
              {c.sessionsLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
          {masterClasses.map((masterClass, index) => (
            <article
              key={masterClass.name}
              className={`${cardLayouts[index] ?? "lg:col-span-6"} group relative min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-[0_30px_90px_rgba(0,0,0,0.2)] backdrop-blur-sm`}
            >
              <div className="relative aspect-[4/3] min-h-[260px] overflow-hidden bg-[#132431] lg:min-h-[340px]">
                <Image
                  src={masterClass.photo}
                  alt={masterClass.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition duration-700 motion-safe:group-hover:scale-[1.025]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,23,32,0.04)_20%,rgba(12,23,32,0.92)_100%)]" />

                {masterClass.secondaryPhoto ? (
                  <div className="absolute right-4 top-4 aspect-[3/4] w-20 overflow-hidden rounded-2xl border border-white/30 bg-[#132431] shadow-2xl sm:w-24">
                    <Image
                      src={masterClass.secondaryPhoto}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#bda36b]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-8 bg-white/25" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b9d9eb]">
                      {c.formatLabel}
                    </span>
                  </div>
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                    {masterClass.name}
                  </h3>
                </div>
              </div>

              <div className="flex min-w-0 flex-col justify-between gap-7 p-6 sm:p-8">
                <div>
                  <p className="text-sm leading-6 text-white/55">
                    {masterClass.role}
                  </p>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#bda36b]">
                    {c.topicLabel}
                  </p>
                  <h4 className="mt-2 text-xl font-semibold leading-snug tracking-[-0.025em] text-white sm:text-2xl">
                    {masterClass.topic}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenClass(index)}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#b9d9eb]/50 hover:bg-white/[0.1]"
                >
                  {c.readMore}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeClass ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] flex items-end justify-center bg-[#050a0e]/75 backdrop-blur-md sm:items-center sm:p-6"
            onClick={() => setOpenClass(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={activeClass.name}
              initial={{ opacity: 0, y: 36, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 36, scale: 0.985 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[94dvh] w-full max-w-5xl overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#101e28]/95 shadow-2xl sm:rounded-[2.5rem]"
            >
              <button
                type="button"
                aria-label={c.closeLabel}
                onClick={() => setOpenClass(null)}
                className="absolute right-4 top-4 z-20 flex size-11 items-center justify-center rounded-full border border-white/15 bg-[#0c1720]/75 text-white backdrop-blur-xl transition hover:bg-[#192d3a]"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="max-h-[94dvh] overflow-y-auto overscroll-contain">
                <div className="grid lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)]">
                  <div className="relative min-h-[300px] overflow-hidden bg-[#132431] lg:min-h-[680px]">
                    <Image
                      src={activeClass.photo}
                      alt={activeClass.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(12,23,32,0.9)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b9d9eb] backdrop-blur-xl">
                        <GraduationCap className="h-4 w-4" />
                        {c.formatLabel}
                      </div>
                      <h3 className="pr-12 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                        {activeClass.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 sm:p-9 lg:p-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b9d9eb]">
                      {c.educatorLabel}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/60">
                      {activeClass.role}
                    </p>

                    <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-[#bda36b]">
                      {c.topicLabel}
                    </p>
                    <h4 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl">
                      {activeClass.topic}
                    </h4>

                    <p className="mt-6 whitespace-pre-line text-sm leading-7 text-white/65 sm:text-base">
                      {activeClass.description}
                    </p>

                    <div className="mt-8 border-t border-white/10 pt-7">
                      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#b9d9eb]">
                        <Sparkles className="h-4 w-4 text-[#bda36b]" />
                        {c.programLabel}
                      </div>
                      <ul className="grid gap-4">
                        {activeClass.highlights.map((highlight) => (
                          <li key={highlight} className="flex gap-3 text-sm leading-6 text-white/70">
                            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#bda36b]/15 text-[#d9c28c]">
                              <Check className="h-3 w-3" />
                            </span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {activeClass.bonus ? (
                      <div className="mt-8 rounded-[1.5rem] border border-[#bda36b]/25 bg-[#bda36b]/10 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9c28c]">
                          {c.bonusLabel}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/70">
                          {activeClass.bonus}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
