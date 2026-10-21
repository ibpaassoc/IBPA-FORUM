"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sendMailingAction } from "@/features/admin/actions/mailing.actions";
import type { MailingOutcome } from "@/features/admin/lib/mailing";
import {
  IDLE_PROGRESS,
  runMailingBatches,
  type SendProgress,
  type SendRecipient,
} from "@/features/admin/lib/mailing-runner";
import type { RecipientSendStatuses } from "./mailing-recipient-meta";

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
  // Survives a failed/stopped run so repeating it reuses the same idempotency
  // seed. A clean run clears it, so a deliberate later resend is not swallowed.
  const runRef = useRef<{ id: string; subject: string; body: string } | null>(null);
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
      const previous = runRef.current;
      const run =
        previous && previous.subject === input.subject && previous.body === input.body
          ? previous
          : { id: newRunId(), subject: input.subject, body: input.body };
      runRef.current = run;
      stopRequested.current = false;

      const final = await runMailingBatches({
        recipients: input.recipients,
        send: (recipientIds) =>
          sendMailingAction({
            subject: input.subject,
            body: input.body,
            recipientIds,
            runId: run.id,
            confirmation: "yes",
          }),
        shouldStop: () => stopRequested.current,
        onOutcomes,
        onProgress: setProgress,
      });

      if (final.phase === "done" && final.failed === 0) runRef.current = null;
    },
    [onOutcomes],
  );

  const stop = useCallback(() => {
    stopRequested.current = true;
  }, []);

  return { progress, running, start, stop };
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
    next[ref] = {
      state: "duplicate",
      reason: "Письмо ушло на этот же адрес другим получателем.",
    };
  }
  return next;
}
