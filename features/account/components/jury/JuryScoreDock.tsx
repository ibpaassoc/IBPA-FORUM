"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  JuryScoreActions,
  JuryScoreControl,
  JuryScoreFeedback,
  JuryScoreProgressBar,
  type JuryScoring,
} from "@/features/account/components/jury/JuryReviewScorecard";

const focusableSelector =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Phone scoring surface: a persistent summary dock pinned to the bottom of the
 * review workspace that expands into a bottom sheet. The sheet shows one
 * criterion at a time with large controls so scoring never competes with the
 * submitted material for screen space.
 */
export default function JuryScoreDock({
  scoring,
  open,
  index,
  onOpen,
  onClose,
  onIndexChange,
}: {
  scoring: JuryScoring;
  open: boolean;
  /** Criterion shown in the sheet — owned by the workspace so the mobile
   *  scorecard tab can open the sheet on a specific criterion. */
  index: number;
  onOpen: () => void;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;
  const sheetRef = useRef<HTMLDivElement>(null);
  const dockButtonRef = useRef<HTMLButtonElement>(null);
  const sheetId = useId();
  const titleId = `${sheetId}-title`;
  const criterion = scoring.criteria[index] ?? scoring.criteria[0];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const restoreTarget = dockButtonRef.current;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      sheetRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        sheetRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
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
  }, [onClose, open]);

  if (!criterion) return null;

  return (
    <div className="lg:hidden">
      {/* Spacer so the docked bar never covers the last of the page content. */}
      <div aria-hidden className="h-24" />

      <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-[rgba(114,160,193,0.22)] bg-white/94 pb-[env(safe-area-inset-bottom)] shadow-[0_-14px_40px_rgba(37,42,45,0.12)] backdrop-blur-2xl">
        <button
          ref={dockButtonRef}
          type="button"
          aria-expanded={open}
          aria-controls={sheetId}
          onClick={() => (open ? onClose() : onOpen())}
          className="flex w-full items-center gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[rgba(114,160,193,0.3)]"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
              {copy.title}
            </span>
            <span className="mt-1.5 block">
              <JuryScoreProgressBar scoring={scoring} />
            </span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block font-[var(--font-title-family)] text-[1.6rem] font-light leading-none text-[var(--color-blue)]">
              {scoring.total}
              <span className="text-[0.5em] text-[var(--color-ink-soft)]">
                {" "}
                / {scoring.maximumTotal}
              </span>
            </span>
            <span className="mt-0.5 block text-[0.62rem] text-[var(--color-ink-soft)]">
              {scoring.presentScoreCount} {copy.scoredOf} {scoring.criteria.length}
            </span>
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 text-[var(--color-blue)]">
            {open ? (
              <ChevronDown aria-hidden size={18} />
            ) : (
              <ChevronUp aria-hidden size={18} />
            )}
            <span className="sr-only">{open ? copy.closeSheet : copy.openSheet}</span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[75] flex items-end justify-center bg-[rgba(221,234,242,0.62)] backdrop-blur-sm"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label={copy.closeSheet}
              className="absolute inset-0 cursor-default"
              onClick={onClose}
            />
            <motion.div
              ref={sheetRef}
              id={sheetId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[30px] border-t border-[rgba(114,160,193,0.25)] bg-white/96 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-24px_70px_rgba(37,42,45,0.2)] backdrop-blur-2xl"
              initial={shouldReduceMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={shouldReduceMotion ? undefined : { y: "100%" }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: PUBLIC_MOTION_EASE }}
            >
              <div className="sticky top-0 z-10 border-b border-[rgba(37,42,45,0.08)] bg-white/94 px-4 pb-3 pt-2 backdrop-blur-xl">
                <div className="mx-auto h-1.5 w-14 rounded-full bg-[#abc2d2]/55" />
                <div className="mt-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <h2
                      id={titleId}
                      className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]"
                    >
                      {copy.title}
                    </h2>
                    <p className="mt-1.5">
                      <JuryScoreProgressBar scoring={scoring} />
                    </p>
                  </div>
                  <p className="shrink-0 text-right">
                    <span className="block font-[var(--font-title-family)] text-[1.6rem] font-light leading-none text-[var(--color-blue)]">
                      {scoring.total}
                      <span className="text-[0.5em] text-[var(--color-ink-soft)]">
                        {" "}
                        / {scoring.maximumTotal}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[0.62rem] text-[var(--color-ink-soft)]">
                      {scoring.presentScoreCount} {copy.scoredOf} {scoring.criteria.length}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={copy.closeSheet}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 text-[var(--color-ink-soft)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]"
                  >
                    <ChevronDown aria-hidden size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 px-4 py-5">
                <JuryScoreFeedback scoring={scoring} />

                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                    {fill(copy.criterionPosition, {
                      index: index + 1,
                      total: scoring.criteria.length,
                    })}
                  </p>
                  <label
                    htmlFor={`score-${criterion.key}`}
                    className="mt-2 block font-[var(--font-title-family)] text-[1.6rem] font-light leading-tight text-[var(--color-ink)]"
                  >
                    {criterion.label}
                  </label>
                  <p className="mt-1.5 text-[0.8rem] leading-6 text-[var(--color-ink-soft)]">
                    {criterion.description}
                  </p>
                  <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-blue)]">
                    0–{criterion.maxScore} {copy.pointsRange}
                  </p>
                </div>

                <JuryScoreControl criterion={criterion} scoring={scoring} size="large" />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onIndexChange(Math.max(0, index - 1))}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.28)] bg-white/82 px-4 text-[0.72rem] font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft aria-hidden size={16} />
                    {copy.previous}
                  </button>
                  <button
                    type="button"
                    disabled={index >= scoring.criteria.length - 1}
                    onClick={() => onIndexChange(Math.min(scoring.criteria.length - 1, index + 1))}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.28)] bg-white/82 px-4 text-[0.72rem] font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copy.next}
                    <ChevronRight aria-hidden size={16} />
                  </button>
                </div>

                {scoring.isComplete ? null : (
                  <>
                    <label
                      htmlFor="jury-comment-mobile"
                      className="rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-3.5"
                    >
                      <span className="text-[0.95rem] font-medium text-[var(--color-ink)]">
                        {copy.note}{" "}
                        <span className="text-xs font-normal text-[var(--color-ink-soft)]">
                          ({copy.optional})
                        </span>
                      </span>
                      <textarea
                        id="jury-comment-mobile"
                        value={scoring.comment}
                        disabled={scoring.busy}
                        onChange={(event) => scoring.setComment(event.target.value)}
                        rows={3}
                        maxLength={5000}
                        placeholder={copy.notePlaceholder}
                        className="mt-2.5 w-full resize-y rounded-[16px] border border-[rgba(114,160,193,0.2)] bg-white/82 px-3.5 py-2.5 text-sm leading-6 text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>
                    <JuryScoreActions scoring={scoring} />
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
