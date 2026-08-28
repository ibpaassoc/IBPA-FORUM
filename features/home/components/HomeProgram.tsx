"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import {
  CalendarDays,
  Clock3,
  Coffee,
  DoorOpen,
  Flag,
  GraduationCap,
  MapPin,
  Mic2,
  Music2,
  PartyPopper,
  Trophy,
  UserRound,
  Wine,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n/translations";
import { Reveal } from "@/shared/components/public";

type ProgramCopy = Translations["home"]["program"];
type ProgramDay = ProgramCopy["days"][number];
type ProgramEvent = ProgramDay["mainStage"][number];

const eventIcons: Record<ProgramEvent["kind"], LucideIcon> = {
  doors: DoorOpen,
  opening: Flag,
  talk: UserRound,
  break: Coffee,
  address: Mic2,
  awards: Trophy,
  performance: Music2,
  entertainment: PartyPopper,
};

export default function HomeProgram() {
  const { t } = useLanguage();
  const c = t.home.program;
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const activeDay = c.days[activeDayIndex];

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    let nextIndex = activeDayIndex;

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = c.days.length - 1;
    if (event.key === "ArrowLeft") {
      nextIndex = (activeDayIndex - 1 + c.days.length) % c.days.length;
    }
    if (event.key === "ArrowRight") {
      nextIndex = (activeDayIndex + 1) % c.days.length;
    }

    setActiveDayIndex(nextIndex);
    const tabs = event.currentTarget.querySelectorAll<HTMLButtonElement>("[role='tab']");
    tabs[nextIndex]?.focus();
  };

  return (
    <section
      id="program"
      aria-labelledby="program-title"
      className="landing-section relative overflow-hidden py-16 md:py-20 lg:py-24"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#b9d9eb]/20 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#72a0c1]/10 blur-3xl" />
      </div>

      <div className="page-section relative">
        <Reveal>
          <div className="rounded-[1.75rem] border border-[#cfe8f6] bg-white/72 p-5 shadow-[0_24px_70px_rgba(114,160,193,0.1)] backdrop-blur-xl md:rounded-[2.25rem] md:p-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.92fr)] lg:items-end lg:gap-10">
            <div>
              <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>
              <h2
                id="program-title"
                className="mt-4 max-w-4xl font-[var(--font-display)] text-[clamp(2.5rem,12vw,3.4rem)] leading-[0.92] tracking-[-0.055em] text-[#10182a] md:text-[clamp(2.8rem,5.6vw,5.8rem)] md:leading-[0.9] md:tracking-[-0.065em]"
              >
                {c.title}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#10182a]/58 md:text-base md:leading-7">
                {c.description}
              </p>
            </div>

            <div className="mt-8 lg:mt-0">
              <div className="mb-5 grid gap-2.5 text-sm text-[#10182a]/70 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4 text-[#72a0c1]" aria-hidden />
                  {c.dateRange}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-[#72a0c1]" aria-hidden />
                  {c.location}
                </span>
              </div>

              <div
                role="tablist"
                aria-label={c.tabsLabel}
                onKeyDown={handleTabKeyDown}
                className="grid grid-cols-2 rounded-[1.35rem] border border-[#b9d9eb] bg-[#f2f8fb]/88 p-1.5"
              >
                {c.days.map((day, index) => {
                  const isActive = index === activeDayIndex;

                  return (
                    <button
                      key={day.date}
                      id={`program-tab-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`program-panel-${index}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveDayIndex(index)}
                      className={`min-h-14 cursor-pointer rounded-[1rem] px-4 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#72a0c1] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-[#72a0c1] text-white shadow-[0_12px_28px_rgba(114,160,193,0.25)]"
                          : "text-[#10182a] hover:bg-white/80"
                      }`}
                    >
                      <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.18em] opacity-70">
                        {day.dayLabel}
                      </span>
                      <span className="mt-1 block text-sm font-semibold">{day.date}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>

        <div
          id={`program-panel-${activeDayIndex}`}
          role="tabpanel"
          aria-labelledby={`program-tab-${activeDayIndex}`}
          aria-label={`${c.scheduleLabel}: ${activeDay.date}`}
          className="mt-6"
        >
          <div className="hidden md:block">
            <DesktopSchedule day={activeDay} tracks={c.tracks} />
          </div>
          <div className="md:hidden">
            <MobileSchedule day={activeDay} tracks={c.tracks} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileSchedule({
  day,
  tracks,
}: {
  day: ProgramDay;
  tracks: ProgramCopy["tracks"];
}) {
  const hasGalaDinner = day.galaDinner.length > 0;

  return (
    <div className="rounded-[1.6rem] border border-[#cfe8f6] bg-white/52 p-3 shadow-[0_18px_48px_rgba(114,160,193,0.08)] backdrop-blur-xl">
      <MobileTrackLabel icon={Mic2} title={tracks.mainStage} />

      <div className="mt-3 space-y-3">
        {day.mainStage.map((event) => (
          <MobileEventRow key={`${event.time}-${event.speaker}-${event.title}`} event={event} />
        ))}

        <MobileMasterClasses
          time={day.masterClasses.time}
          sessions={day.masterClasses.sessions}
          title={tracks.masterClasses}
        />

        {hasGalaDinner ? (
          <>
            <MobileTrackLabel icon={Wine} title={tracks.galaDinner} dark />
            {day.galaDinner.map((event) => (
              <MobileEventRow key={`${event.time}-${event.speaker}-${event.title}`} event={event} dark />
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}

function MobileTrackLabel({
  icon: Icon,
  title,
  dark = false,
}: {
  icon: LucideIcon;
  title: string;
  dark?: boolean;
}) {
  return (
    <div className="grid grid-cols-[3.6rem_1.1rem_minmax(0,1fr)] gap-2">
      <div />
      <div className="flex justify-center">
        <span className={`mt-3 size-2.5 rounded-full ring-4 ${dark ? "bg-[#173f73] ring-[#173f73]/12" : "bg-[#72a0c1] ring-[#72a0c1]/12"}`} />
      </div>
      <div
        className={`flex min-h-11 items-center gap-2.5 rounded-[1rem] border px-3.5 py-2.5 ${
          dark
            ? "border-[#173966] bg-[linear-gradient(135deg,#10182a,#173f73)] text-white"
            : "border-[#cfe8f6] bg-[#f2f8fb]/90 text-[#173f73]"
        }`}
      >
        <Icon className="size-4 shrink-0" strokeWidth={1.6} aria-hidden />
        <h3 className="font-[var(--font-display)] text-lg tracking-[-0.025em]">{title}</h3>
      </div>
    </div>
  );
}

function MobileEventRow({ event, dark = false }: { event: ProgramEvent; dark?: boolean }) {
  const Icon = eventIcons[event.kind];

  return (
    <article className="grid grid-cols-[3.6rem_1.1rem_minmax(0,1fr)] items-stretch gap-2">
      <MobileTime value={event.time} dark={dark} />

      <div className="relative flex justify-center">
        <span
          aria-hidden
          className={`absolute bottom-[-0.75rem] top-0 w-px ${dark ? "bg-[#173f73]/45" : "bg-[#72a0c1]/35"}`}
        />
        <span
          className={`relative mt-4 flex size-4 items-center justify-center rounded-full border-[3px] bg-white ${
            dark ? "border-[#173f73]" : "border-[#72a0c1]"
          }`}
        />
      </div>

      <div
        className={`flex min-w-0 items-start gap-2.5 rounded-[1.05rem] border px-3 py-3 shadow-[0_10px_26px_rgba(114,160,193,0.06)] ${
          dark
            ? "border-white/10 bg-[linear-gradient(135deg,#15345f,#10284a)] text-white"
            : event.kind === "break"
              ? "border-[#b9d9eb] bg-[#eef7fc]/92 text-[#10182a]"
              : "border-[#d9ebf5] bg-white/84 text-[#10182a]"
        }`}
      >
        <span
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${
            dark ? "bg-white/10 text-[#c9e6f7]" : "bg-[#f2f8fb] text-[#72a0c1]"
          }`}
        >
          <Icon className="size-3.5" strokeWidth={1.7} aria-hidden />
        </span>

        <p className={`min-w-0 text-[0.73rem] leading-[1.2rem] ${dark ? "text-white/78" : "text-[#10182a]/68"}`}>
          {event.speaker ? (
            <strong className={`block font-semibold ${dark ? "text-white" : "text-[#10182a]"}`}>
              {event.speaker}
            </strong>
          ) : null}
          {event.title}
        </p>
      </div>
    </article>
  );
}

function MobileMasterClasses({
  time,
  sessions,
  title,
}: {
  time: string;
  sessions: ProgramDay["masterClasses"]["sessions"];
  title: string;
}) {
  return (
    <article className="grid grid-cols-[3.6rem_1.1rem_minmax(0,1fr)] items-stretch gap-2">
      <MobileTime value={time} />

      <div className="relative flex justify-center">
        <span aria-hidden className="absolute bottom-[-0.75rem] top-0 w-px bg-[#72a0c1]/35" />
        <span className="relative mt-4 flex size-4 items-center justify-center rounded-full border-[3px] border-[#72a0c1] bg-white" />
      </div>

      <div className="overflow-hidden rounded-[1.15rem] border border-[#b9d9eb] bg-[linear-gradient(145deg,rgba(239,248,253,0.96),rgba(255,255,255,0.86))] shadow-[0_14px_34px_rgba(114,160,193,0.1)]">
        <header className="flex items-center gap-2.5 border-b border-[#cfe8f6] px-3.5 py-3 text-[#173f73]">
          <GraduationCap className="size-4 shrink-0" strokeWidth={1.6} aria-hidden />
          <h3 className="font-[var(--font-display)] text-lg tracking-[-0.025em]">{title}</h3>
        </header>

        <div className="space-y-2 p-2.5">
          {sessions.map((session) => (
            <div
              key={`${session.speaker}-${session.title}`}
              className="rounded-[0.95rem] border border-[#d9ebf5] bg-white/86 px-3 py-3"
            >
              <p className="text-[0.72rem] leading-[1.18rem] text-[#10182a]/68">
                <strong className="block font-semibold text-[#10182a]">{session.speaker}</strong>
                {session.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function MobileTime({ value, dark = false }: { value: string; dark?: boolean }) {
  const parts = value.split("–");

  return (
    <time className={`pt-3 text-center text-[0.65rem] font-semibold leading-4 tabular-nums ${dark ? "text-[#173f73]" : "text-[#2f6f9f]"}`}>
      <span className="block">{parts[0]}</span>
      {parts[1] ? (
        <>
          <span aria-hidden className="block leading-2 opacity-45">–</span>
          <span className="block">{parts[1]}</span>
        </>
      ) : null}
    </time>
  );
}

function DesktopSchedule({
  day,
  tracks,
}: {
  day: ProgramDay;
  tracks: ProgramCopy["tracks"];
}) {
  const hasGalaDinner = day.galaDinner.length > 0;

  return (
    <div
      className={`grid items-start gap-4 ${
        hasGalaDinner
          ? "md:grid-cols-2 xl:grid-cols-[1.08fr_0.98fr_0.92fr]"
          : "md:grid-cols-[1.08fr_0.92fr]"
      }`}
    >
      <ScheduleTrack icon={Mic2} title={tracks.mainStage}>
        <div className="space-y-2.5 p-3 lg:p-4">
          {day.mainStage.map((event) => (
            <DesktopEventRow key={`${event.time}-${event.speaker}-${event.title}`} event={event} />
          ))}
        </div>
      </ScheduleTrack>

      <ScheduleTrack icon={GraduationCap} title={tracks.masterClasses} tone="blue">
        <div className="p-3 lg:p-4">
          <div className="mb-3 flex items-center gap-3 rounded-[1.15rem] border border-[#b9d9eb]/70 bg-[#eef7fc] px-4 py-3 text-[#2f6f9f]">
            <Clock3 className="size-4 shrink-0" aria-hidden />
            <span className="text-sm font-semibold tabular-nums">{day.masterClasses.time}</span>
          </div>

          <div className="space-y-2.5">
            {day.masterClasses.sessions.map((session) => (
              <article
                key={`${session.speaker}-${session.title}`}
                className="rounded-[1.25rem] border border-[#cfe8f6] bg-white/78 p-4 shadow-[0_10px_28px_rgba(114,160,193,0.07)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#f2f8fb] text-[#72a0c1]">
                    <UserRound className="size-4" aria-hidden />
                  </span>
                  <p className="text-[0.78rem] leading-5 text-[#10182a]/68">
                    <strong className="font-semibold text-[#10182a]">{session.speaker}</strong>
                    <span aria-hidden> — </span>
                    {session.title}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </ScheduleTrack>

      {hasGalaDinner ? (
        <ScheduleTrack icon={Wine} title={tracks.galaDinner} tone="dark" className="md:col-span-2 xl:col-span-1">
          <div className="space-y-2.5 p-3 lg:p-4">
            {day.galaDinner.map((event) => (
              <DesktopEventRow key={`${event.time}-${event.speaker}-${event.title}`} event={event} dark />
            ))}
          </div>
        </ScheduleTrack>
      ) : null}
    </div>
  );
}

function ScheduleTrack({
  icon: Icon,
  title,
  children,
  tone = "plain",
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  tone?: "plain" | "blue" | "dark";
  className?: string;
}) {
  const headerClass =
    tone === "dark"
      ? "border-[#173966] bg-[linear-gradient(135deg,#10182a,#173f73)] text-white"
      : tone === "blue"
        ? "border-[#c5e1f0] bg-[linear-gradient(135deg,#edf7fc,#dceef8)] text-[#173f73]"
        : "border-[#cfe8f6] bg-white/88 text-[#10182a]";

  return (
    <section
      className={`overflow-hidden rounded-[1.75rem] border border-[#cfe8f6] bg-white/62 shadow-[0_20px_56px_rgba(114,160,193,0.08)] backdrop-blur-xl ${className}`}
    >
      <header className={`flex min-h-16 items-center justify-center gap-3 border-b px-5 py-4 ${headerClass}`}>
        <Icon className="size-5" strokeWidth={1.5} aria-hidden />
        <h3 className="font-[var(--font-display)] text-xl tracking-[-0.025em]">{title}</h3>
      </header>
      {children}
    </section>
  );
}

function DesktopEventRow({ event, dark = false }: { event: ProgramEvent; dark?: boolean }) {
  const Icon = eventIcons[event.kind];

  return (
    <article
      className={`grid grid-cols-[5.2rem_minmax(0,1fr)] overflow-hidden rounded-[1.15rem] border ${
        dark
          ? "border-white/12 bg-[linear-gradient(135deg,#15345f,#10284a)] text-white shadow-[0_12px_28px_rgba(16,24,42,0.16)]"
          : event.kind === "break"
            ? "border-[#b9d9eb] bg-[#eef7fc]/90 text-[#10182a]"
            : "border-[#d9ebf5] bg-white/82 text-[#10182a]"
      }`}
    >
      <time
        className={`flex items-center justify-center border-r px-2 py-3 text-center text-[0.68rem] font-semibold tabular-nums ${
          dark ? "border-white/12 text-white/78" : "border-[#d9ebf5] text-[#2f6f9f]"
        }`}
      >
        {event.time}
      </time>

      <div className="flex min-w-0 items-start gap-3 px-3 py-3">
        <span
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${
            dark ? "bg-white/10 text-[#c9e6f7]" : "bg-[#f2f8fb] text-[#72a0c1]"
          }`}
        >
          <Icon className="size-3.5" strokeWidth={1.7} aria-hidden />
        </span>

        <p className={`min-w-0 text-[0.74rem] leading-5 ${dark ? "text-white/78" : "text-[#10182a]/66"}`}>
          {event.speaker ? (
            <strong className={dark ? "font-semibold text-white" : "font-semibold text-[#10182a]"}>
              {event.speaker}
            </strong>
          ) : null}
          {event.speaker && event.title ? <span aria-hidden> — </span> : null}
          {event.title}
        </p>
      </div>
    </article>
  );
}
