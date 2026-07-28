"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock3, FileCheck2, Loader2, Lock, Save, Send, Sparkles } from "lucide-react";
import type { NominationProgress } from "@/features/account/lib/nomination-progress";
import type { ApplyFieldConfig } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassProgressBar, NoticePanel } from "@/shared/components/account/AccountUI";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";

const MAX_MISSING_LISTED = 6;

/**
 * Sticky requirements panel for the nomination workspace: a warning card
 * listing the missing required items (each one jumps to its section), live
 * completion progress, and only the actions that currently apply. Shown
 * above the content on mobile.
 */
export default function NominationRequirementsSidebar({
  progress,
  locked,
  paymentPaid,
  submitted,
  lastSavedLabel,
  scoreText,
  busyLabel,
  submitDisabled,
  notice,
  error,
  onMissingItem,
  onSaveDraft,
  onSubmit,
}: {
  progress: NominationProgress;
  locked: boolean;
  paymentPaid: boolean;
  submitted: boolean;
  lastSavedLabel: string | null;
  scoreText: string;
  busyLabel: string | null;
  submitDisabled: boolean;
  notice: string;
  error: string;
  onMissingItem: (field: ApplyFieldConfig) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const editor = t.account.editor;
  const busy = busyLabel !== null;
  const complete = progress.missingRequired.length === 0;
  const listedMissing = progress.missingRequired.slice(0, MAX_MISSING_LISTED);
  const extraMissing = progress.missingRequired.length - listedMissing.length;

  return (
    <div className="flex flex-col gap-3.5">
      {complete ? (
        <NoticePanel tone="success" title={editor.allComplete}>
          {!submitted && !locked && paymentPaid ? editor.submitWhenReady : null}
        </NoticePanel>
      ) : (
        <NoticePanel tone="warning" title={editor.requiredBefore}>
          <ul className="mt-1 grid gap-1">
            {listedMissing.map((field) => (
              <li key={field.key}>
                <button
                  type="button"
                  onClick={() => onMissingItem(field)}
                  className="group flex w-full items-start gap-2 rounded-[12px] px-2 py-1 text-left text-[0.82rem] leading-snug text-[#7a5b12] transition hover:bg-amber-100/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50"
                >
                  <span aria-hidden className="mt-[0.42rem] size-1.5 shrink-0 rounded-full bg-amber-500/70" />
                  <span className="underline-offset-2 group-hover:underline">{field.label}</span>
                </button>
              </li>
            ))}
            {extraMissing > 0 ? (
              <li className="px-2 py-1 text-[0.78rem] text-[#7a5b12]/80">
                +{extraMissing} {editor.moreMissing}
              </li>
            ) : null}
          </ul>
          <p className="mt-2 px-2 text-[0.74rem] text-[#7a5b12]/75">{editor.missingHint}</p>
        </NoticePanel>
      )}

      <div className="rounded-[24px] border border-[rgba(114,160,193,0.2)] bg-white/76 p-4 shadow-[0_16px_48px_rgba(37,42,45,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl">
        <GlassProgressBar value={progress.percentage} label={editor.completion} />

        <div className="mt-4 space-y-2 text-[0.82rem] leading-relaxed text-[var(--color-ink-soft)]">
          <p className="flex items-center gap-2">
            <FileCheck2 aria-hidden size={14} className="shrink-0 text-[var(--color-blue)]" />
            {editor.filesAttached}: {progress.uploadedFileCount}
          </p>
          {lastSavedLabel ? (
            <p className="flex items-center gap-2">
              <Clock3 aria-hidden size={14} className="shrink-0 text-[var(--color-blue)]" />
              {editor.lastSaved}: {lastSavedLabel}
            </p>
          ) : null}
          <p className="flex items-center gap-2">
            <Sparkles aria-hidden size={14} className="shrink-0 text-[var(--color-blue)]" />
            {scoreText}
          </p>
        </div>

        <AnimatePresence initial={false}>
          {notice ? (
            <motion.div
              key="notice"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: PUBLIC_MOTION_EASE }}
              className="mt-4"
            >
              <NoticePanel tone="success" role="status">
                {notice}
              </NoticePanel>
            </motion.div>
          ) : null}
          {error ? (
            <motion.div
              key="error"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25, ease: PUBLIC_MOTION_EASE }}
              className="mt-4"
            >
              <NoticePanel tone="error" role="alert">
                {error}
              </NoticePanel>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {locked ? (
          <p className="mt-4 flex items-start gap-2 rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/70 px-4 py-3 text-[0.82rem] leading-relaxed text-[var(--color-ink-soft)]">
            <Lock aria-hidden size={15} className="mt-0.5 shrink-0" />
            {editor.lockedNotice}
          </p>
        ) : (
          <>
            {!paymentPaid ? (
              <div className="mt-4">
                <NoticePanel tone="warning">{editor.paymentPendingNotice}</NoticePanel>
              </div>
            ) : (
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={onSaveDraft}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 px-5 py-2.5 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(37,42,45,0.055)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 aria-hidden size={15} className="animate-spin" />
                  ) : (
                    <Save aria-hidden size={15} />
                  )}
                  {editor.saveDraft}
                </button>
                <button
                  type="button"
                  disabled={busy || submitDisabled}
                  onClick={onSubmit}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.35)] bg-[var(--color-blue)]/92 px-5 py-3 text-[0.72rem] font-semibold uppercase leading-none tracking-[0.12em] text-white shadow-[0_16px_38px_rgba(114,160,193,0.34)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#4d86ad] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 aria-hidden size={15} className="animate-spin" />
                  ) : (
                    <Send aria-hidden size={15} />
                  )}
                  {busyLabel ?? (submitted ? editor.updateSubmission : editor.submit)}
                </button>
                {submitted ? (
                  <p className="text-center text-[0.74rem] leading-relaxed text-[var(--color-ink-muted)]">
                    {editor.submittedHint}
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
