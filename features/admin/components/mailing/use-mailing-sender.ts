"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendMailingAction } from "@/features/admin/actions/mailing.actions";
import {
  planMailingBatches,
  type MailingOutcome,
} from "@/features/admin/lib/mailing";
import type { RecipientSendStatuses } from "./mailing-recipient-meta";

export type SendRecipient = { ref: string; email: string };

export type SendProgress = {
  phase: "idle" | "running" | "done" | "stopped" | "aborted";
  total: number;
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  /** Selected entries that share a mailbox with an earlier recipient. */
  duplicates: number;
  /** Set when a whole batch could not be processed and the run stopped. */
  message?: string;
};

export const IDLE_PROGRESS: SendProgress = {
  phase: "idle",
  total: 0,
  processed: 0,
  sent: 0,
  failed: 0,
  skipped: 0,
  duplicates: 0,
};

function newRunId() {
  return crypto.randomUUID().replaceAll("-", "");
}

/**
 * Drives a mailing from the browser: the selection is cut into small batches
 * that are sent one request at a time. Progress is visible after every batch,
 * a stalled request never blocks the rest of the UI, and the run can be
 * stopped or simply repeated for whatever failed.
 */
export function useMailingSender({
  onOutcomes,
}: {
  onOutcomes: (outcomes: MailingOutcome[], duplicates: string[]) => void;
}) {
  const [progress, setProgress] = useState<SendProgress>(IDLE_PROGRESS);
  const stopRequested = useRef(false);
  const running = progress.phase === "running";

  useEffect(() => {
    if (!running) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  const start = useCallback(
    async (input: { subject: string; body: string; recipients: SendRecipient[] }) => {
      const plan = planMailingBatches(input.recipients);
      const uniqueRefs = new Set(plan.batches.flat());
      const duplicateRefs = input.recipients
        .filter((recipient) => !uniqueRefs.has(recipient.ref))
        .map((recipient) => recipient.ref);
      // Reused by every batch (and by a manual retry of this same run), so the
      // provider can recognise a repeated request instead of delivering twice.
      const runId = newRunId();

      stopRequested.current = false;
      let current: SendProgress = {
        ...IDLE_PROGRESS,
        phase: "running",
        total: plan.uniqueCount,
        duplicates: plan.duplicateCount,
      };
      setProgress(current);

      const update = (patch: Partial<SendProgress>) => {
        current = { ...current, ...patch };
        setProgress(current);
      };

      for (const batch of plan.batches) {
        if (stopRequested.current) {
          update({ phase: "stopped" });
          return;
        }

        let outcomes: MailingOutcome[];
        let message: string | undefined;
        try {
          const result = await sendMailingAction({
            subject: input.subject,
            body: input.body,
            recipientIds: batch,
            runId,
            confirmation: "yes",
          });
          if (result.status === "error") message = result.message;
          outcomes = result.outcomes;
        } catch {
          message = "Нет связи с сервером. Проверьте соединение и повторите отправку.";
          outcomes = [];
        }

        if (message) {
          const failed: MailingOutcome[] = batch.map((ref) => ({
            ref,
            status: "failed",
            reason: message,
          }));
          onOutcomes(failed, []);
          update({
            phase: "aborted",
            processed: current.processed + batch.length,
            failed: current.failed + batch.length,
            message,
          });
          return;
        }

        onOutcomes(outcomes, []);
        update({
          processed: current.processed + batch.length,
          sent: current.sent + outcomes.filter((o) => o.status === "sent").length,
          failed: current.failed + outcomes.filter((o) => o.status === "failed").length,
          skipped: current.skipped + outcomes.filter((o) => o.status === "skipped").length,
        });
      }

      if (duplicateRefs.length > 0) onOutcomes([], duplicateRefs);
      update({ phase: "done" });
    },
    [onOutcomes],
  );

  const stop = useCallback(() => {
    stopRequested.current = true;
  }, []);

  const reset = useCallback(() => setProgress(IDLE_PROGRESS), []);

  return { progress, running, start, stop, reset };
}

export function applyOutcomes(
  statuses: RecipientSendStatuses,
  outcomes: MailingOutcome[],
  duplicates: string[],
): RecipientSendStatuses {
  const next = { ...statuses };
  for (const outcome of outcomes) {
    next[outcome.ref] = { state: outcome.status, reason: outcome.reason };
  }
  for (const ref of duplicates) {
    next[ref] = { state: "duplicate", reason: "Письмо ушло на этот же адрес другим получателем." };
  }
  return next;
}
