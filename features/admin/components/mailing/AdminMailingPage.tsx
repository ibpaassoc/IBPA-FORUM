"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowDown } from "lucide-react";
import {
  DEFAULT_MAILING_SUBJECT,
  DEFAULT_MAILING_TEXT,
  planMailingBatches,
  type MailingOutcome,
  type MailingRecipientGroup,
} from "@/features/admin/lib/mailing";
import type { MailingRecipient } from "@/features/admin/server/mailing";
import { StatusBadge } from "@/shared/components/admin/DashboardUI";
import MailingComposer, { type MailingTemplateKey } from "./MailingComposer";
import MailingRecipientPicker from "./MailingRecipientPicker";
import {
  GROUP_META,
  GROUP_ORDER,
  type RecipientSendStatuses,
} from "./mailing-recipient-meta";
import { applyOutcomes, useMailingSender } from "./use-mailing-sender";

const TEMPLATES: Record<MailingTemplateKey, { subject: string; body: string }> = {
  reminder: { subject: DEFAULT_MAILING_SUBJECT, body: DEFAULT_MAILING_TEXT },
  blank: { subject: "", body: "" },
};

export default function AdminMailingPage({
  applicants,
  jury,
  tickets,
}: {
  applicants: MailingRecipient[];
  jury: MailingRecipient[];
  tickets: MailingRecipient[];
}) {
  const groups = useMemo<Record<MailingRecipientGroup, MailingRecipient[]>>(
    () => ({ APPLICANT: applicants, JURY: jury, TICKET: tickets }),
    [applicants, jury, tickets],
  );
  const recipientsByRef = useMemo(() => {
    const map = new Map<string, MailingRecipient>();
    for (const group of GROUP_ORDER) {
      for (const recipient of groups[group]) map.set(recipient.ref, recipient);
    }
    return map;
  }, [groups]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [statuses, setStatuses] = useState<RecipientSendStatuses>({});
  const [template, setTemplate] = useState<MailingTemplateKey>("reminder");
  const [subject, setSubject] = useState(TEMPLATES.reminder.subject);
  const [body, setBody] = useState(TEMPLATES.reminder.body);
  const [confirmed, setConfirmed] = useState(false);

  const handleOutcomes = useCallback(
    (outcomes: MailingOutcome[], duplicates: string[]) => {
      setStatuses((current) => applyOutcomes(current, outcomes, duplicates));
      // Everything that was handled leaves the selection; failures stay so the
      // next press of "Send" retries exactly those recipients.
      setSelected((current) => {
        const next = new Set(current);
        for (const outcome of outcomes) {
          if (outcome.status !== "failed") next.delete(outcome.ref);
        }
        for (const ref of duplicates) next.delete(ref);
        return next;
      });
    },
    [],
  );

  const { progress, running, start, stop } = useMailingSender({
    onOutcomes: handleOutcomes,
  });

  const selectedRecipients = useMemo(
    () =>
      [...selected]
        .map((ref) => recipientsByRef.get(ref))
        .filter((recipient): recipient is MailingRecipient => Boolean(recipient)),
    [selected, recipientsByRef],
  );

  const selectedPerGroup = useMemo(() => {
    const counts: Record<MailingRecipientGroup, number> = {
      APPLICANT: 0,
      JURY: 0,
      TICKET: 0,
    };
    for (const recipient of selectedRecipients) counts[recipient.group] += 1;
    return counts;
  }, [selectedRecipients]);

  const plan = useMemo(
    () => planMailingBatches(selectedRecipients),
    [selectedRecipients],
  );

  const toggleRecipient = useCallback((ref: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  }, []);

  const selectMany = useCallback((refs: string[], checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const ref of refs) {
        if (checked) next.add(ref);
        else next.delete(ref);
      }
      return next;
    });
  }, []);

  function clearGroup(group: MailingRecipientGroup) {
    selectMany(
      groups[group].map((recipient) => recipient.ref),
      false,
    );
  }

  function changeTemplate(key: MailingTemplateKey) {
    setTemplate(key);
    setSubject(TEMPLATES[key].subject);
    setBody(TEMPLATES[key].body);
  }

  function send() {
    // Each run needs a fresh confirmation, including a retry of failures.
    setConfirmed(false);
    void start({
      subject,
      body,
      recipients: selectedRecipients.map((recipient) => ({
        ref: recipient.ref,
        email: recipient.email,
      })),
    });
  }

  const registeredCount = [...applicants, ...jury].filter(
    (recipient) => recipient.registrationState?.key === "registered",
  ).length;

  return (
    <div className="flex flex-col gap-5 pb-20 xl:pb-0">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="font-[var(--font-accent-family)] text-[clamp(0.95rem,1.6vw,1.15rem)] italic tracking-[0.03em] text-[var(--color-blue)]">
            Коммуникации
          </p>
          <h1 className="font-[var(--font-title-family)] text-[clamp(2rem,4.4vw,3.2rem)] font-light leading-none tracking-[-0.025em] text-[var(--color-ink)]">
            Рассылка
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)]">
            Выберите получателей — заявителей, жюри или владельцев билетов — и напишите
            письмо. Отправка идёт небольшими партиями с прогрессом, поэтому большой
            список не зависает.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {GROUP_ORDER.map((group) => (
            <StatusBadge key={group} tone={group === "TICKET" ? "green" : "blue"}>
              {GROUP_META[group].label}: {groups[group].length}
            </StatusBadge>
          ))}
          <StatusBadge tone="green">Зарегистрировано: {registeredCount}</StatusBadge>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.9fr)] xl:items-start">
        <MailingRecipientPicker
          groups={groups}
          selected={selected}
          statuses={statuses}
          locked={running}
          onToggle={toggleRecipient}
          onSelectMany={selectMany}
        />
        <div
          id="mailing-composer"
          className="scroll-mt-4 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:rounded-[28px]"
        >
          <MailingComposer
            subject={subject}
            body={body}
            template={template}
            onSubjectChange={setSubject}
            onBodyChange={setBody}
            onTemplateChange={changeTemplate}
            selectedPerGroup={selectedPerGroup}
            uniqueCount={plan.uniqueCount}
            duplicateCount={plan.duplicateCount}
            confirmed={confirmed}
            onConfirmedChange={setConfirmed}
            progress={progress}
            running={running}
            onSend={send}
            onStop={stop}
            onClearGroup={clearGroup}
            onClearAll={() => setSelected(new Set())}
          />
        </div>
      </div>

      <a
        href="#mailing-composer"
        className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-full border border-[rgba(114,160,193,0.32)] bg-white/94 px-5 py-3 text-sm font-semibold shadow-[0_18px_50px_rgba(37,42,45,0.18)] backdrop-blur-xl xl:hidden"
      >
        <span>Выбрано: {selected.size}</span>
        <span className="inline-flex items-center gap-1.5 text-[var(--color-blue)]">
          К письму <ArrowDown size={15} />
        </span>
      </a>
    </div>
  );
}
