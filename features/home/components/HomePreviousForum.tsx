"use client";

import { useRef, useState } from "react";
import { CalendarDays, MapPin, Pause, Play, Trophy, Volume2, VolumeX } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Reveal, StaggerContainer } from "@/shared/components/public";

const FORUM_VIDEO_ID = "1175624606";

export default function PreviousForumSection() {
  const { t } = useLanguage();
  const c = t.home.previousForum;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  const postVimeoMessage = (method: string, value?: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ method, value }),
      "https://player.vimeo.com",
    );
  };

  const togglePause = () => {
    if (paused) {
      postVimeoMessage("play");
      setPaused(false);
    } else {
      postVimeoMessage("pause");
      setPaused(true);
    }
  };

  const toggleMute = () => {
    if (muted) {
      postVimeoMessage("setVolume", 1);
      setMuted(false);
    } else {
      postVimeoMessage("setVolume", 0);
      setMuted(true);
    }
  };

  return (
    <section className="landing-section relative overflow-hidden py-20 md:py-28">
      <div className="absolute left-[-12%] top-10 h-72 w-72 rounded-full bg-[#b9d9eb]/16 blur-2xl" />

      <div className="page-section relative grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-center">
        <Reveal>
          <div className="max-w-2xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-4 font-(--font-display) text-[clamp(2.7rem,5vw,5.9rem)] leading-[0.9] tracking-[-0.055em] text-[#10182a]">
              {c.title}
            </h2>

            <StaggerContainer className="mt-8 grid gap-3 sm:max-w-xl" stagger={0.07} delay={0.1}>
              {[
                { icon: Trophy, text: c.award },
                { icon: CalendarDays, text: c.date },
                { icon: MapPin, text: c.location },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.text}
                    className="group flex items-center gap-3 rounded-full border border-[#b9d9eb]/55 bg-white/60 px-3 py-2 shadow-[0_12px_34px_rgba(114,160,193,0.08)] backdrop-blur-xl transition duration-200 hover:border-[#72a0c1]/45 hover:bg-white/80"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-[#f7fbfd]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(114,160,193,0.14)]">
                      <Icon size={17} className="text-[#72a0c1]" />
                    </span>

                    <span className="text-sm font-medium tracking-[-0.01em] text-[#10182a]/75 sm:text-base">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </StaggerContainer>

            <Reveal delay={0.18}>
              <div className="mt-9 max-w-xl border-l border-[#72a0c1]/45 pl-5">
                <p className="font-(--font-cursive) text-[1.35rem] leading-7 text-[#46677f]">
                  {c.quote}
                </p>
              </div>
            </Reveal>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="relative mx-auto w-full max-w-[390px] lg:mr-0">
          <div className="absolute -left-12 top-20 h-40 w-40 rounded-full border border-[#b9d9eb]/45" />
          <div className="absolute -right-7 bottom-20 h-32 w-32 rounded-full bg-[#b9d9eb]/22 blur-xl" />
          <div className="absolute -inset-8 rounded-[4rem] bg-[#72a0c1]/8 blur-2xl" />

          <div className="relative aspect-[9/16] overflow-hidden rounded-[40px] bg-[#EEF5F9] shadow-[0_24px_80px_rgba(39,54,72,0.14)] md:rounded-[56px]">
            <iframe
              ref={iframeRef}
              src={`https://player.vimeo.com/video/${FORUM_VIDEO_ID}?app_id=122963&autoplay=1&muted=1&background=1&controls=0&title=0&byline=0&portrait=0&playsinline=1`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              title={c.videoTitle}
            />

            <div className="pointer-events-none absolute inset-0 bg-black/10" />

            <div className="absolute right-4 top-4 z-10 flex gap-3 md:right-5 md:top-5">
              <button
                type="button"
                aria-label={paused ? c.playLabel : c.pauseLabel}
                onClick={togglePause}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/50 md:h-12 md:w-12"
              >
                {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} />}
              </button>

              <button
                type="button"
                aria-label={muted ? c.unmuteLabel : c.muteLabel}
                onClick={toggleMute}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-all hover:bg-black/50 md:h-12 md:w-12"
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
