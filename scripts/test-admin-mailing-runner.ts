import assert from "node:assert/strict";
import type { MailingBatchResult, MailingOutcome } from "@/features/admin/lib/mailing";
import {
  DEFAULT_MAILING_FILTERS,
  recipientMatches,
  type FilterableRecipient,
} from "@/features/admin/lib/mailing-filters";
import {
  runMailingBatches,
  type SendProgress,
} from "@/features/admin/lib/mailing-runner";

function recipients(count: number, prefix = "ticket") {
  return Array.from({ length: count }, (_, index) => ({
    ref: `${prefix}:t${index}`,
    email: `person${index}@example.com`,
  }));
}

function allSent(ids: string[]): MailingBatchResult {
  return {
    status: "success",
    outcomes: ids.map((ref) => ({ ref, status: "sent" as const })),
  };
}

async function run(
  selection: ReturnType<typeof recipients>,
  send: (ids: string[]) => Promise<MailingBatchResult>,
  shouldStop: () => boolean = () => false,
) {
  const handled: MailingOutcome[] = [];
  const duplicates: string[] = [];
  const snapshots: SendProgress[] = [];
  const final = await runMailingBatches({
    recipients: selection,
    send,
    shouldStop,
    onOutcomes: (outcomes, dupes) => {
      handled.push(...outcomes);
      duplicates.push(...dupes);
    },
    onProgress: (progress) => snapshots.push(progress),
  });
  return { final, handled, duplicates, snapshots };
}

async function main() {
  // A large selection is delivered completely, in 20-recipient requests,
  // reporting progress after every batch (the "stuck after 10" regression).
  {
    const batches: string[][] = [];
    const { final, snapshots } = await run(recipients(95), async (ids) => {
      batches.push(ids);
      return allSent(ids);
    });
    assert.deepEqual(batches.map((batch) => batch.length), [20, 20, 20, 20, 15]);
    assert.equal(final.phase, "done");
    assert.equal(final.sent, 95);
    assert.equal(final.processed, 95);
    assert.equal(final.failed, 0);
    assert.deepEqual(
      snapshots.map((snapshot) => snapshot.processed),
      [0, 20, 40, 60, 80, 95, 95],
      "progress is reported after each batch",
    );
  }

  // Mailboxes shared by several recipients are sent once; the rest are
  // reported back as duplicates so the UI can drop them from the selection.
  {
    const selection = [
      { ref: "account:a", email: "Same@Example.com" },
      { ref: "ticket:t", email: "same@example.com" },
      { ref: "ticket:u", email: "other@example.com" },
    ];
    const sentRefs: string[] = [];
    const { final, duplicates } = await run(selection, async (ids) => {
      sentRefs.push(...ids);
      return allSent(ids);
    });
    assert.deepEqual(sentRefs, ["account:a", "ticket:u"]);
    assert.deepEqual(duplicates, ["ticket:t"]);
    assert.equal(final.duplicates, 1);
    assert.equal(final.total, 2);
  }

  // Per-recipient failures do not stop the run and are counted.
  {
    const { final, handled } = await run(recipients(30), async (ids) => ({
      status: "success",
      outcomes: ids.map((ref, index) =>
        index % 10 === 0
          ? { ref, status: "failed" as const, reason: "rate limited" }
          : { ref, status: "sent" as const },
      ),
    }));
    assert.equal(final.phase, "done");
    assert.equal(final.failed, 3);
    assert.equal(final.sent, 27);
    assert.equal(handled.filter((outcome) => outcome.status === "failed").length, 3);
  }

  // A batch the server cannot process aborts the run, marks that batch failed
  // and leaves later batches untouched so they remain selected.
  {
    let call = 0;
    const { final, handled } = await run(recipients(65), async (ids) => {
      call += 1;
      if (call === 2) return { status: "error", message: "boom", outcomes: [] };
      return allSent(ids);
    });
    assert.equal(call, 2, "no further batches after a hard failure");
    assert.equal(final.phase, "aborted");
    assert.equal(final.message, "boom");
    assert.equal(final.sent, 20);
    assert.equal(final.failed, 20);
    assert.equal(handled.length, 40);
    assert.ok(handled.slice(20).every((outcome) => outcome.status === "failed"));
  }

  // A thrown request (network drop) is treated the same way.
  {
    const { final } = await run(recipients(5), async () => {
      throw new Error("network");
    });
    assert.equal(final.phase, "aborted");
    assert.equal(final.failed, 5);
    assert.match(final.message ?? "", /связи/);
  }

  // Stopping is honoured between batches.
  {
    let call = 0;
    let stop = false;
    const { final } = await run(
      recipients(60),
      async (ids) => {
        call += 1;
        stop = true;
        return allSent(ids);
      },
      () => stop,
    );
    assert.equal(call, 1);
    assert.equal(final.phase, "stopped");
    assert.equal(final.sent, 20);
  }

  // Filters: search, registration, completion and ticket source/access.
  {
    const base: FilterableRecipient = {
      group: "APPLICANT",
      fullName: "Анна Петрова",
      email: "anna@example.com",
      registrationState: { key: "registered" },
      completionPercentage: 40,
      ticket: null,
    };
    assert.equal(recipientMatches(base, DEFAULT_MAILING_FILTERS), true);
    assert.equal(
      recipientMatches(base, { ...DEFAULT_MAILING_FILTERS, search: "ПЕТР" }),
      true,
      "search is case-insensitive and covers Cyrillic",
    );
    assert.equal(
      recipientMatches(base, { ...DEFAULT_MAILING_FILTERS, search: "nobody" }),
      false,
    );
    assert.equal(
      recipientMatches(base, { ...DEFAULT_MAILING_FILTERS, primary: "not-registered" }),
      false,
    );
    assert.equal(
      recipientMatches(base, { ...DEFAULT_MAILING_FILTERS, secondary: "incomplete" }),
      true,
    );
    assert.equal(
      recipientMatches(base, { ...DEFAULT_MAILING_FILTERS, secondary: "complete" }),
      false,
    );

    const adminGala: FilterableRecipient = {
      group: "TICKET",
      fullName: "Guest",
      email: "guest@example.com",
      registrationState: null,
      completionPercentage: null,
      ticket: { source: "ADMIN", type: null, galaOnly: true },
    };
    const paidTwoDay: FilterableRecipient = {
      ...adminGala,
      ticket: { source: "PAID", type: "TWO_DAYS", galaOnly: false },
    };
    const filters = (primary: string, secondary: string) => ({
      ...DEFAULT_MAILING_FILTERS,
      primary,
      secondary,
    });
    assert.equal(recipientMatches(adminGala, filters("ADMIN", "all")), true);
    assert.equal(recipientMatches(adminGala, filters("PAID", "all")), false);
    assert.equal(recipientMatches(adminGala, filters("all", "GALA")), true);
    assert.equal(recipientMatches(adminGala, filters("all", "TWO_DAYS")), false);
    assert.equal(recipientMatches(paidTwoDay, filters("PAID", "TWO_DAYS")), true);
    assert.equal(recipientMatches(paidTwoDay, filters("all", "GALA")), false);
    assert.equal(recipientMatches(paidTwoDay, filters("all", "ONE_DAY")), false);
  }

  console.log("Admin mailing runner validation passed.");
}

void main();
