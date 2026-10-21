import {
  planMailingBatches,
  type MailingBatchResult,
  type MailingOutcome,
} from "@/features/admin/lib/mailing";

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

const NETWORK_ERROR =
  "Нет связи с сервером. Проверьте соединение и повторите отправку.";

/**
 * Sends a selection one small batch at a time. A batch the server could not
 * process at all marks its recipients failed and stops the run (they stay
 * selected, so repeating the run retries exactly those); a stop request is
 * honoured between batches.
 */
export async function runMailingBatches({
  recipients,
  send,
  shouldStop,
  onOutcomes,
  onProgress,
}: {
  recipients: SendRecipient[];
  send: (recipientIds: string[]) => Promise<MailingBatchResult>;
  shouldStop: () => boolean;
  onOutcomes: (outcomes: MailingOutcome[], duplicates: string[]) => void;
  onProgress: (progress: SendProgress) => void;
}): Promise<SendProgress> {
  const plan = planMailingBatches(recipients);
  const uniqueRefs = new Set(plan.batches.flat());
  const duplicateRefs = recipients
    .filter((recipient) => !uniqueRefs.has(recipient.ref))
    .map((recipient) => recipient.ref);

  let current: SendProgress = {
    ...IDLE_PROGRESS,
    phase: "running",
    total: plan.uniqueCount,
    duplicates: plan.duplicateCount,
  };
  const update = (patch: Partial<SendProgress>) => {
    current = { ...current, ...patch };
    onProgress(current);
    return current;
  };
  update({});

  for (const batch of plan.batches) {
    if (shouldStop()) return update({ phase: "stopped" });

    let outcomes: MailingOutcome[] = [];
    let message: string | undefined;
    try {
      const result = await send(batch);
      outcomes = result.outcomes;
      if (result.status === "error") message = result.message ?? NETWORK_ERROR;
    } catch {
      message = NETWORK_ERROR;
    }

    if (message) {
      onOutcomes(
        batch.map((ref) => ({ ref, status: "failed" as const, reason: message })),
        [],
      );
      return update({
        phase: "aborted",
        processed: current.processed + batch.length,
        failed: current.failed + batch.length,
        message,
      });
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
  return update({ phase: "done" });
}
