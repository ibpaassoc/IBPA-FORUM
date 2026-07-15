"use client";

import { PenLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ApplyFieldConfig } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { NoticePanel } from "@/shared/components/account/AccountUI";
import ReadOnlyField from "./ReadOnlyField";
import type { EditorValues } from "./editor-values";

export type ReviewSectionGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  fields: ApplyFieldConfig[];
};

/**
 * Final "Review" section of the nomination workspace: one read-only card per
 * content section with an Edit action, plus a single concise readiness
 * summary. Missing details are not repeated here — the requirements sidebar
 * owns the itemized list.
 */
export default function NominationReviewSummary({
  groups,
  values,
  missingCount,
  locked,
  onEditSection,
}: {
  groups: ReviewSectionGroup[];
  values: EditorValues;
  missingCount: number;
  locked: boolean;
  onEditSection: (sectionId: string) => void;
}) {
  const { t } = useLanguage();
  const editor = t.account.editor;

  return (
    <div className="flex flex-col gap-4">
      {!locked ? (
        missingCount === 0 ? (
          <NoticePanel tone="success" title={editor.reviewReadiness}>
            {editor.readyToSubmit}
          </NoticePanel>
        ) : (
          <NoticePanel tone="warning" title={editor.reviewReadiness}>
            {editor.missingBeforeSubmit}
          </NoticePanel>
        )
      ) : null}

      {groups.map((group) => (
        <section
          key={group.id}
          className="rounded-[26px] border border-[rgba(114,160,193,0.2)] bg-white/74 p-4 shadow-[0_18px_54px_rgba(37,42,45,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl md:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(114,160,193,0.16)] pb-3.5">
            <h3 className="flex items-center gap-2.5 font-[var(--font-title-family)] text-[1.2rem] font-light text-[var(--color-ink)]">
              <span className="flex size-8 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
                <group.icon aria-hidden size={15} strokeWidth={1.8} />
              </span>
              {group.title}
            </h3>
            {!locked ? (
              <button
                type="button"
                onClick={() => onEditSection(group.id)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/78 px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]"
              >
                <PenLine aria-hidden size={12} /> {editor.editSection}
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {group.fields.map((field) => (
              <div
                key={field.key}
                className={
                  field.type === "textarea" || field.type === "file" ? "md:col-span-2" : undefined
                }
              >
                <ReadOnlyField field={field} value={values[field.key]} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
