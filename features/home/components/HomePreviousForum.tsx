"use client";

import { Play, CalendarDays, MapPin, Trophy, Sparkles } from "lucide-react";

export default function PreviousForumSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      <div className="absolute left-[-12%] top-10 h-72 w-72 rounded-full bg-[#b9d9eb]/35 blur-3xl" />
      <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-[#72a0c1]/15 blur-3xl" />

      <div className="page-section relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        {/* Info */}
        <div className="max-w-xl">
          <p className="page-eyebrow text-[#72a0c1]">Previous Event</p>

          <h2 className="mt-4 font-(--font-display) text-[clamp(2.6rem,5vw,5.7rem)] leading-[0.9] tracking-[-0.05em] text-[#10182a]">
            Beauty Business Forum 2025
          </h2>

          <div className="mt-7 space-y-3 text-[#10182a]/75">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 shadow-[0_14px_36px_rgba(114,160,193,0.14)] backdrop-blur-xl">
                <Trophy size={17} className="text-[#72a0c1]" />
              </span>
              <span className="text-base font-medium">
                Премия Top Beauty Master
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 shadow-[0_14px_36px_rgba(114,160,193,0.14)] backdrop-blur-xl">
                <CalendarDays size={17} className="text-[#72a0c1]" />
              </span>
              <span className="text-base font-medium">November 7–8, 2025</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-[#b9d9eb]/70 bg-white/70 shadow-[0_14px_36px_rgba(114,160,193,0.14)] backdrop-blur-xl">
                <MapPin size={17} className="text-[#72a0c1]" />
              </span>
              <span className="text-base font-medium">
                San Francisco, California
              </span>
            </div>
          </div>

          <div className="mt-8 border-l border-[#72a0c1]/45 pl-5">
            <p className="font-(--font-cursive) text-[1.35rem] leading-7 text-[#46677f]">
              A look back at the atmosphere, professional community, and
              industry moments that shaped our previous forum.
            </p>
          </div>
        </div>

        {/* Video */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-[3rem] bg-[#b9d9eb]/25 blur-2xl" />

          <div className="premium-glass relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/55 p-2 shadow-[0_28px_80px_rgba(16,24,42,0.12)] backdrop-blur-2xl">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-[#10182a]">
              <video
                className="h-full w-full object-cover"
                src="/videos/forum-2025.MOV"
                poster="/images/forum-2025-poster.jpg"
                controls
                playsInline
                preload="metadata"
              />

              <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/35 bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl">
                <Sparkles size={14} />
                Forum Video
              </div>

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_36%,rgba(16,24,42,0.22)_100%)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
