"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, FileBarChart2, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { resultsCopy } from "@/features/categories/components/results-copy";

gsap.registerPlugin(useGSAP);

export default function HomeResultsNotice() {
  const { language } = useLanguage();
  const copy = resultsCopy[language];
  const rootRef = useRef<HTMLElement>(null);

  useGSAP((_, contextSafe) => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const reveal = contextSafe!(() => {
      gsap.fromTo(root.querySelectorAll("[data-notice-reveal]"),
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.11, ease: "power2.out", clearProps: "all" },
      );
    });
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) { reveal(); observer.disconnect(); }
    }, { threshold: 0.2 });
    observer.observe(root);
    return () => observer.disconnect();
  }, { scope: rootRef });

  return (
    <section ref={rootRef} aria-labelledby="home-results-heading" className="relative overflow-hidden px-[var(--page-gutter)] py-16 sm:py-20">
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 overflow-hidden rounded-[28px] border border-[#b9d9eb]/65 bg-[linear-gradient(125deg,rgba(255,255,255,0.88),rgba(237,248,253,0.75))] px-6 py-9 shadow-[0_26px_75px_rgba(85,143,179,0.13),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:rounded-[36px] sm:px-10 sm:py-12 lg:grid-cols-[1fr_260px] lg:px-16 lg:py-16">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#b9d9eb]/35 blur-3xl" />
        <div className="relative" data-notice-reveal>
          <span className="mb-6 grid h-14 w-14 place-items-center rounded-[18px] border border-[#b9d9eb]/55 bg-white/70 text-[#5e91b4] shadow-[0_12px_24px_rgba(88,143,176,0.12)] lg:hidden"><FileBarChart2 size={25} strokeWidth={1.5} aria-hidden="true" /></span>
          <p className="font-[var(--font-accent-family)] text-xl italic text-[#6c9dbe]">— {copy.eyebrow}</p>
          <h2 id="home-results-heading" className="mt-4 max-w-[15ch] font-[var(--font-title-family)] text-[clamp(2.65rem,5.3vw,5rem)] font-normal leading-[.98] tracking-[-.045em] text-[#121b31]">{copy.homeTitle}</h2>
          <p className="mt-6 max-w-[54ch] text-[.98rem] leading-7 text-[#5c6d7e] sm:text-[1.08rem]">{copy.homeText}</p>
          <Link href="/categories#results" className="group mt-9 inline-flex min-h-14 items-center justify-center gap-5 rounded-full border border-[#b9d9eb] bg-white/72 px-7 text-[.75rem] font-semibold uppercase tracking-[.15em] text-[#254f72] shadow-[0_12px_32px_rgba(114,160,193,0.12)] transition duration-300 hover:-translate-y-1 hover:border-[#72a0c1] hover:bg-[#edf7fc] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#4987b3] active:translate-y-0 max-[350px]:gap-3 max-[350px]:px-5 max-[350px]:tracking-[.1em] max-[350px]:whitespace-nowrap sm:px-9">
            {copy.homeButton}<ArrowUpRight size={18} strokeWidth={1.7} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
          </Link>
        </div>
        <div className="relative hidden h-[270px] w-[245px] justify-self-center lg:block" aria-hidden="true" data-notice-reveal>
          <div className="absolute inset-x-5 inset-y-4 rotate-[-10deg] rounded-[27px] border border-[#b9d9eb]/55 bg-white/35 shadow-[0_18px_50px_rgba(114,160,193,.13)] backdrop-blur-lg" />
          <div className="absolute inset-0 rotate-[3deg] rounded-[27px] border border-[#b9d9eb]/70 bg-white/75 p-7 shadow-[0_25px_55px_rgba(91,143,177,.18)] backdrop-blur-xl">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f4fa] text-[#689cbd]"><Trophy size={22} strokeWidth={1.5} /></div>
            {[0,1,2].map((index) => <div key={index} className="mt-5 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#edf6fb] font-[var(--font-title-family)] text-sm text-[#739dba]">{index + 1}</span><span className="h-2 flex-1 rounded-full bg-[#d4e7f1]" /><span className="h-2 w-5 rounded-full bg-[#a8cce0]" /></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
