"use client";

import Link from "next/link";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Grid2X2,
  X,
} from "lucide-react";
import clsx from "clsx";
import type { SectionNavItem } from "@/shared/components/account/AccountUI";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";

type StatusTone = "neutral" | "blue" | "green" | "amber" | "red";

export type MobileNominationItem = {
  id: string;
  href: string;
  title: string;
  eyebrow?: string;
  statusLabel: string;
  statusTone?: StatusTone;
  progress?: number | null;
  progressLabel?: string;
  missingCount?: number | null;
  missingLabel?: string;
};

export type MobileSectionItem = SectionNavItem & {
  targetId?: string;
};

type NavigationLabels = {
  backLabel: string;
  backHref: string;
  selectorLabel: string;
  drawerTitle: string;
  drawerDescription?: string;
  sectionLabel: string;
  closeLabel: string;
  selectedLabel: string;
};

const focusableSelector =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

const statusClasses: Record<StatusTone, string> = {
  neutral: "border-[rgba(37,42,45,0.1)] bg-white/72 text-[var(--color-ink-soft)]",
  blue: "border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] text-[#356f98]",
  green: "border-emerald-200/80 bg-emerald-50/85 text-emerald-800",
  amber: "border-amber-200/85 bg-amber-50/85 text-amber-800",
  red: "border-red-200/85 bg-red-50/85 text-red-800",
};

function clampProgress(value: number | null | undefined) {
  if (typeof value !== "number") return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function StateMark({ state, active = false }: { state?: SectionNavItem["state"]; active?: boolean }) {
  if (state === "complete") {
    return (
      <span
        className={clsx(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          active ? "bg-white/24 text-white" : "bg-emerald-100 text-emerald-700",
        )}
      >
        <Check aria-hidden size={12} strokeWidth={3} />
        <span className="sr-only">Complete</span>
      </span>
    );
  }

  if (state === "missing") {
    return (
      <span
        className={clsx(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          active ? "bg-white/24 text-white" : "bg-amber-100 text-amber-700",
        )}
      >
        <AlertCircle aria-hidden size={12} strokeWidth={2.5} />
        <span className="sr-only">Needs attention</span>
      </span>
    );
  }

  return <span aria-hidden className={clsx("size-2 shrink-0 rounded-full", active ? "bg-white/80" : "bg-[rgba(37,42,45,0.2)]")} />;
}

function useDialogFocus({
  open,
  onClose,
  dialogRef,
  restoreRef,
}: {
  open: boolean;
  onClose: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  restoreRef: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const restoreTarget = restoreRef.current;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTarget?.focus({ preventScroll: true });
    };
  }, [dialogRef, onClose, open, restoreRef]);
}

export function MobileLayeredNominationNavigation({
  nominations,
  activeNominationId,
  sections,
  activeSectionId,
  onSectionSelect,
  labels,
  progressEventName,
}: {
  nominations: MobileNominationItem[];
  activeNominationId: string;
  sections: MobileSectionItem[];
  activeSectionId?: string;
  onSectionSelect?: (id: string) => void;
  labels: NavigationLabels;
  progressEventName?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [observedSection, setObservedSection] = useState(
    activeSectionId ?? sections[0]?.id ?? "",
  );
  const [liveProgress, setLiveProgress] = useState<{
    progress: number;
    missingCount: number;
  } | null>(null);
  const selectorRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drawerId = useId();
  const titleId = `${drawerId}-title`;
  const displayedNominations = liveProgress
    ? nominations.map((nomination) =>
        nomination.id === activeNominationId
          ? {
              ...nomination,
              progress: liveProgress.progress,
              missingCount: liveProgress.missingCount,
            }
          : nomination,
      )
    : nominations;
  const activeNomination =
    displayedNominations.find((nomination) => nomination.id === activeNominationId) ??
    displayedNominations[0];
  const currentSection = activeSectionId ?? observedSection;

  useDialogFocus({
    open: drawerOpen,
    onClose: () => setDrawerOpen(false),
    dialogRef,
    restoreRef: selectorRef,
  });

  useEffect(() => {
    if (!progressEventName) return;
    function updateProgress(event: Event) {
      const detail = (event as CustomEvent<{ progress?: number; missingCount?: number }>).detail;
      if (typeof detail?.progress !== "number" || typeof detail?.missingCount !== "number") return;
      setLiveProgress({ progress: detail.progress, missingCount: detail.missingCount });
    }
    window.addEventListener(progressEventName, updateProgress);
    return () => window.removeEventListener(progressEventName, updateProgress);
  }, [progressEventName]);

  useEffect(() => {
    if (activeSectionId || !sections.some((section) => section.targetId)) return;
    const targets = sections
      .map((section) => (section.targetId ? document.getElementById(section.targetId) : null))
      .filter((target): target is HTMLElement => target !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const item = sections.find((section) => section.targetId === visible.target.id);
        if (item) setObservedSection(item.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.1, 0.4] },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [activeSectionId, sections]);

  if (!activeNomination) return null;
  const progress = clampProgress(activeNomination.progress);

  function selectSection(item: MobileSectionItem) {
    setObservedSection(item.id);
    if (onSectionSelect) {
      onSectionSelect(item.id);
      return;
    }
    if (!item.targetId) return;
    document.getElementById(item.targetId)?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  function handleSectionKeys(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const backwards = event.key === "ArrowLeft" || event.key === "ArrowUp";
    const nextIndex = (index + (backwards ? -1 : 1) + sections.length) % sections.length;
    const next = sections[nextIndex];
    document.getElementById(`${drawerId}-section-${next.id}`)?.focus();
    selectSection(next);
  }

  return (
    <div className="min-w-0 space-y-3 lg:hidden">
      <div className="flex items-center justify-between gap-3 px-1">
        <Link
          href={labels.backHref}
          className="inline-flex min-h-11 items-center rounded-full px-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]"
        >
          {labels.backLabel}
        </Link>
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-[var(--color-ink-muted)]">
          {nominations.findIndex((item) => item.id === activeNomination.id) + 1}/{nominations.length}
        </span>
      </div>

      <button
        ref={selectorRef}
        type="button"
        aria-expanded={drawerOpen}
        aria-controls={drawerId}
        aria-label={labels.selectorLabel}
        onClick={() => setDrawerOpen(true)}
        className="group relative flex min-h-[88px] w-full min-w-0 items-center gap-3 overflow-hidden rounded-[24px] border border-[rgba(114,160,193,0.24)] bg-white/82 p-3 text-left shadow-[0_18px_50px_rgba(37,42,45,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl transition hover:border-[rgba(114,160,193,0.42)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]"
      >
        <div className="min-w-0 flex-1">
          {activeNomination.eyebrow ? (
            <p className="truncate text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
              {activeNomination.eyebrow}
            </p>
          ) : null}
          <p className="mt-1 line-clamp-2 font-[var(--font-title-family)] text-[1.08rem] font-light leading-[1.15] text-[var(--color-ink)]">
            {activeNomination.title}
          </p>
          <div className="mt-2 flex min-w-0 items-center gap-2 text-[0.66rem] text-[var(--color-ink-soft)]">
            <span className={clsx("truncate", progress !== null && "max-w-[55%]")}>
              {activeNomination.statusLabel}
            </span>
            {progress !== null ? (
              <>
                <span aria-hidden className="size-1 rounded-full bg-[rgba(37,42,45,0.24)]" />
                <span className="shrink-0 font-semibold text-[var(--color-blue)]">
                  {activeNomination.progressLabel ?? "Progress"} {progress}%
                </span>
              </>
            ) : null}
          </div>
        </div>
        {progress !== null ? (
          <div
            role="progressbar"
            aria-label={`${activeNomination.progressLabel ?? "Progress"}: ${progress}%`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="flex min-h-12 min-w-12 shrink-0 flex-col items-center justify-center rounded-[16px] border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-2"
          >
            <span className="text-[0.7rem] font-semibold text-[var(--color-ink)]">{progress}%</span>
            <span className="mt-1 h-1 w-8 overflow-hidden rounded-full bg-[rgba(114,160,193,0.16)]">
              <span className="block h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${progress}%` }} />
            </span>
          </div>
        ) : null}
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/72 text-[var(--color-blue)]">
          <ChevronDown aria-hidden size={18} className="transition group-aria-expanded:rotate-180 motion-reduce:transition-none" />
        </span>
      </button>

      <nav
        role="tablist"
        aria-label={labels.sectionLabel}
        className="grid grid-cols-2 gap-1.5 rounded-[22px] border border-[rgba(114,160,193,0.18)] bg-white/66 p-1.5 shadow-[0_12px_34px_rgba(37,42,45,0.05)] backdrop-blur-xl"
      >
        {sections.map((item, index) => {
          const active = item.id === currentSection;
          return (
            <button
              id={`${drawerId}-section-${item.id}`}
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={item.targetId}
              tabIndex={active ? 0 : -1}
              onClick={() => selectSection(item)}
              onKeyDown={(event) => handleSectionKeys(event, index)}
              className={clsx(
                "flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-[16px] px-2 py-2 text-center text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]",
                active
                  ? "bg-[var(--color-blue)] text-white shadow-[0_10px_24px_rgba(114,160,193,0.26)]"
                  : "bg-white/45 text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)]",
              )}
            >
              <StateMark state={item.state} active={active} />
              <span className="min-w-0 break-words">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-[rgba(221,234,242,0.62)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label={labels.closeLabel}
              className="absolute inset-0 cursor-default"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              ref={dialogRef}
              id={drawerId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative max-h-[min(82vh,680px)] w-full max-w-lg rounded-[30px] border border-[rgba(114,160,193,0.25)] bg-white/94 p-4 shadow-[0_30px_90px_rgba(37,42,45,0.18)] backdrop-blur-2xl before:pointer-events-none before:absolute before:-top-2 before:left-5 before:right-5 before:-z-10 before:h-8 before:rounded-t-[26px] before:border before:border-[rgba(114,160,193,0.16)] before:bg-white/62 after:pointer-events-none after:absolute after:-top-4 after:left-9 after:right-9 after:-z-20 after:h-8 after:rounded-t-[24px] after:border after:border-[rgba(114,160,193,0.12)] after:bg-white/42"
              initial={shouldReduceMotion ? false : { y: 32, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { y: 24, opacity: 0, scale: 0.99 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: PUBLIC_MOTION_EASE }}
            >
              <div className="flex items-start justify-between gap-4 px-1 pb-3">
                <div className="min-w-0">
                  <h2 id={titleId} className="font-[var(--font-title-family)] text-[1.55rem] font-light leading-tight text-[var(--color-ink)]">
                    {labels.drawerTitle}
                  </h2>
                  {labels.drawerDescription ? (
                    <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">{labels.drawerDescription}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label={labels.closeLabel}
                  onClick={() => setDrawerOpen(false)}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.2)] bg-white/78 text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]"
                >
                  <X aria-hidden size={18} />
                </button>
              </div>

              <div className="max-h-[min(64vh,520px)] space-y-2 overflow-y-auto overscroll-contain pr-1">
                {displayedNominations.map((nomination) => {
                  const selected = nomination.id === activeNominationId;
                  const itemProgress = clampProgress(nomination.progress);
                  return (
                    <Link
                      key={nomination.id}
                      href={nomination.href}
                      aria-current={selected ? "page" : undefined}
                      onNavigate={() => setDrawerOpen(false)}
                      className={clsx(
                        "flex min-h-[76px] min-w-0 items-center gap-3 rounded-[22px] border p-3 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]",
                        selected
                          ? "border-[rgba(114,160,193,0.42)] bg-[var(--color-blue-wash)] shadow-[0_12px_28px_rgba(114,160,193,0.12)]"
                          : "border-[rgba(37,42,45,0.08)] bg-white/72 hover:border-[rgba(114,160,193,0.28)] hover:bg-white",
                      )}
                    >
                      <span className={clsx("flex size-7 shrink-0 items-center justify-center rounded-full border", selected ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white" : "border-[rgba(114,160,193,0.22)] bg-white text-transparent")}>
                        <Check aria-hidden size={14} strokeWidth={3} />
                        {selected ? <span className="sr-only">{labels.selectedLabel}</span> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-semibold leading-snug text-[var(--color-ink)]">{nomination.title}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className={clsx("inline-flex rounded-full border px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.08em]", statusClasses[nomination.statusTone ?? "neutral"])}>
                            {nomination.statusLabel}
                          </span>
                          {nomination.missingCount ? (
                            <span className="text-[0.64rem] text-amber-700">{nomination.missingCount} {nomination.missingLabel ?? "missing"}</span>
                          ) : null}
                        </span>
                        {itemProgress !== null ? (
                          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[rgba(114,160,193,0.14)]">
                            <span className="block h-full rounded-full bg-[var(--color-blue)]" style={{ width: `${itemProgress}%` }} />
                          </span>
                        ) : null}
                      </span>
                      {itemProgress !== null ? (
                        <span className="shrink-0 text-[0.66rem] font-semibold text-[var(--color-blue)]">{itemProgress}%</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function useKeyboardVisibility() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function update() {
      const viewport = window.visualViewport;
      const viewportKeyboard = viewport ? window.innerHeight - viewport.height > 150 : false;
      const active = document.activeElement;
      const focusedInput =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active instanceof HTMLElement && active.isContentEditable);
      setVisible(viewportKeyboard || focusedInput);
    }

    update();
    window.visualViewport?.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  return visible;
}

export function MobileActionDock({
  label,
  title,
  badgeCount = 0,
  children,
}: {
  label: string;
  title: string;
  badgeCount?: number;
  children: ReactNode | ((close: () => void) => ReactNode);
}) {
  const shouldReduceMotion = useReducedMotion();
  const keyboardVisible = useKeyboardVisibility();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    function closeForFocusedControl(event: FocusEvent) {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("focusin", closeForFocusedControl);
    return () => document.removeEventListener("focusin", closeForFocusedControl);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (keyboardVisible) return null;
  const closePanel = () => setOpen(false);
  const closeAndRestore = () => {
    setOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="lg:hidden">
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label={title}
            className="fixed bottom-[calc(4.9rem+env(safe-area-inset-bottom))] right-3 z-[62] w-[min(19rem,calc(100vw-1.5rem))] rounded-[26px] border border-[rgba(114,160,193,0.24)] bg-white/94 p-3 shadow-[0_26px_72px_rgba(37,42,45,0.18)] backdrop-blur-2xl"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: PUBLIC_MOTION_EASE }}
          >
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{title}</p>
              <button type="button" aria-label={`Close ${label}`} onClick={closeAndRestore} className="flex size-11 items-center justify-center rounded-full text-[var(--color-ink-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]">
                <X aria-hidden size={16} />
              </button>
            </div>
            <div className="grid gap-2">{typeof children === "function" ? children(closePanel) : children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[61] inline-flex min-h-12 items-center gap-2 rounded-full border border-white/70 bg-[var(--color-blue)] px-4 text-[0.68rem] font-semibold uppercase tracking-[0.11em] text-white shadow-[0_18px_44px_rgba(114,160,193,0.38)] transition hover:-translate-y-0.5 hover:bg-[#5f91b6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.34)] motion-reduce:transition-none"
      >
        <Grid2X2 aria-hidden size={18} />
        {label}
        {badgeCount > 0 ? (
          <span className="flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[0.62rem] font-bold text-[var(--color-blue)]">{badgeCount}</span>
        ) : null}
      </button>
    </div>
  );
}
