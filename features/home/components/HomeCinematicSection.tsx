"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomeCinematicSection() {
  return (
    <section className="bg-[var(--color-white)]">
      <div className="relative overflow-hidden border-y border-[var(--border-default)]">
        <div className="relative min-h-[clamp(360px,52vw,640px)]">
          <Image
            src="/images/events/DSC00192.jpg"
            alt="Large IBPA event showcase with a formal stage and audience atmosphere"
            fill
            sizes="100vw"
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2048%2032'%20fill='none'%3E%3Crect%20width='48'%20height='32'%20fill='%23eaf4fb'/%3E%3Cpath%20d='M0%2020C8%2016%2013%2014%2019%2016C25%2018%2031%2024%2038%2022C42%2021%2045%2018%2048%2017V32H0V20Z'%20fill='%2372a0c1'%20fill-opacity='0.3'/%3E%3C/svg%3E"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,16,20,0.5),rgba(12,16,20,0.18)_46%,rgba(12,16,20,0.08))]" />

          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-[var(--content-width)] items-end px-[var(--page-gutter)] py-[clamp(1.5rem,4vw,3.5rem)]">
              <div className="max-w-3xl text-white">
                <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                  Live event atmosphere
                </p>
                <h2 className="mt-[var(--space-sm)] font-[var(--font-display)] text-[clamp(2rem,4vw,3.8rem)] font-light leading-[1.05] text-white">
                  Editorial visuals with ceremony, crowd energy, and a luxury finish.
                </h2>
                <p className="mt-[var(--space-md)] max-w-2xl text-sm leading-[1.75] text-white/80 sm:text-base">
                  The platform now uses real photography to carry the brand story across awards, judging, and community pages.
                </p>
                <div className="mt-[var(--space-lg)] flex flex-wrap gap-[var(--space-sm)]">
                  <Link href="/grand-prix" className="ibpa-button ibpa-button-white">
                    Explore Grand Prix
                  </Link>
                  <Link href="/jury" className="ibpa-button ibpa-button-ghost">
                    Meet the Jury
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
