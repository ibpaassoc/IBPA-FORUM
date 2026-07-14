"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Briefcase, ClipboardCheck, PenLine, UploadCloud } from "lucide-react";
import { nominationTone, type NominationTone } from "@/features/account/components/nomination-presentation";
import { computeNominationProgress } from "@/features/account/lib/nomination-progress";
import {
  sanitizeBlobName,
  uploadApplicationBlob,
  validateUploadFile,
} from "@/features/applications/client/upload-files";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import { getFieldVisibility } from "@/features/applications/schemas/category-field-validation";
import type {
  ApplicationFileRef,
  ApplicationValues,
  ApplyFieldConfig,
} from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SectionNav, type SectionNavItem } from "@/shared/components/account/AccountUI";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import NominationFieldControl from "./NominationFieldControl";
import NominationFormSection from "./NominationFormSection";
import NominationRequirementsSidebar from "./NominationRequirementsSidebar";
import NominationReviewHeader from "./NominationReviewHeader";
import NominationReviewSummary, { type ReviewSectionGroup } from "./NominationReviewSummary";
import ReadOnlyField from "./ReadOnlyField";
import {
  buildInitialValues,
  getFileValues,
  type EditorValue,
  type EditorValues,
  type InitialAnswer,
  type InitialFile,
} from "./editor-values";

type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red";

const toneToBadge: Record<NominationTone, BadgeTone> = {
  blue: "blue",
  orange: "amber",
  green: "green",
  gray: "neutral",
};

const REVIEW_SECTION_ID = "review";

/**
 * Continue Application workspace: the nomination name is the page context,
 * the form is split into Work Details / Description / File Uploads / Review
 * behind a horizontal section navigation, and a sticky requirements panel
 * summarizes what is still missing. Unsaved values survive section changes
 * because all state lives here.
 */
export default function NominationReviewForm({
  nominationId,
  fields,
  initialAnswers,
  initialFiles,
  locked,
  paymentPaid,
  initialStatus,
  categoryName,
  awardName,
  updatedAtIso,
  scoreVisible,
  averageScore,
}: {
  nominationId: string;
  fields: ApplyFieldConfig[];
  initialAnswers: InitialAnswer[];
  initialFiles: InitialFile[];
  locked: boolean;
  paymentPaid: boolean;
  initialStatus: string;
  categoryName: string;
  awardName: string;
  updatedAtIso: string | null;
  scoreVisible: boolean;
  averageScore: number | null;
}) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { language, t } = useLanguage();
  const editor = t.account.editor;
  const [, startTransition] = useTransition();
  const [values, setValues] = useState<EditorValues>(() =>
    buildInitialValues(initialAnswers, initialFiles),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const pendingFocusKey = useRef<string | null>(null);

  const submitted = status === "SUBMITTED";
  const disabled = locked || busyLabel !== null;
  const progress = useMemo(
    () => computeNominationProgress(fields, values as unknown as ApplicationValues),
    [fields, values],
  );

  const sections = useMemo(() => {
    const visible = fields.filter((field) =>
      getFieldVisibility(field, values as unknown as ApplicationValues),
    );
    return [
      {
        id: "details",
        icon: Briefcase,
        title: editor.sections.details,
        description: editor.sections.detailsDescription,
        fields: visible.filter((field) => field.type !== "textarea" && field.type !== "file"),
      },
      {
        id: "story",
        icon: PenLine,
        title: editor.sections.description,
        description: editor.sections.descriptionDescription,
        fields: visible.filter((field) => field.type === "textarea"),
      },
      {
        id: "uploads",
        icon: UploadCloud,
        title: editor.sections.uploads,
        description: editor.sections.uploadsDescription,
        fields: visible.filter((field) => field.type === "file"),
      },
    ].filter((section) => section.fields.length > 0);
  }, [fields, values, editor]);

  const currentSection =
    activeSection || (sections[0]?.id ?? REVIEW_SECTION_ID);

  const missingKeys = useMemo(
    () => new Set(progress.missingRequired.map((field) => field.key)),
    [progress],
  );

  const navItems: SectionNavItem[] = useMemo(() => {
    const items: SectionNavItem[] = sections.map((section) => {
      const required = section.fields.filter((field) => field.required);
      const missing = required.some((field) => missingKeys.has(field.key));
      return {
        id: section.id,
        label: section.title,
        state: missing ? "missing" : required.length > 0 ? "complete" : "none",
      };
    });
    items.push({
      id: REVIEW_SECTION_ID,
      label: editor.sections.review,
      state: progress.missingRequired.length === 0 ? "complete" : "none",
    });
    return items;
  }, [sections, missingKeys, progress, editor]);

  const reviewGroups: ReviewSectionGroup[] = useMemo(
    () =>
      sections.map((section) => ({
        id: section.id,
        title: section.title,
        icon: section.icon,
        fields: section.fields,
      })),
    [sections],
  );

  // After a missing-item jump, focus the field's first control once the
  // target section is rendered.
  useEffect(() => {
    const key = pendingFocusKey.current;
    if (!key) return;
    pendingFocusKey.current = null;
    const host = document.getElementById(`nomination-field-${key}`);
    if (!host) return;
    host.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "center" });
    const control = host.querySelector<HTMLElement>("input, textarea, select, button, a");
    control?.focus({ preventScroll: true });
  }, [currentSection, shouldReduceMotion]);

  function goToSection(id: string) {
    setActiveSection(id);
  }

  function jumpToField(field: ApplyFieldConfig) {
    const target = sections.find((section) =>
      section.fields.some((item) => item.key === field.key),
    );
    if (!target) return;
    pendingFocusKey.current = field.key;
    setActiveSection(target.id);
    // If the section is already active the effect will not re-run; trigger
    // the focus manually on the next frame.
    if (target.id === currentSection) {
      requestAnimationFrame(() => {
        const host = document.getElementById(`nomination-field-${field.key}`);
        host?.scrollIntoView({
          behavior: shouldReduceMotion ? "auto" : "smooth",
          block: "center",
        });
        host?.querySelector<HTMLElement>("input, textarea, select, button, a")?.focus({
          preventScroll: true,
        });
        pendingFocusKey.current = null;
      });
    }
  }

  function setField(key: string, value: EditorValue) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  // Uploads any freshly selected Files to Blob, swaps them for refs in local
  // state (so a retry or second save never re-uploads the same file), and
  // returns the JSON-safe payload for the save endpoint.
  async function preparePayload() {
    const prepared: Record<string, unknown> = {};
    const uploadedByField: Record<string, ApplicationFileRef[]> = {};

    for (const field of fields) {
      const value = values[field.key];
      if (field.type !== "file") {
        prepared[field.key] = value ?? "";
        continue;
      }

      const refs: ApplicationFileRef[] = [];
      for (const item of getFileValues(value)) {
        if (isApplicationFileRef(item)) {
          refs.push(item);
          continue;
        }

        const validationMessage = validateUploadFile(item);
        if (validationMessage) {
          throw new Error(validationMessage);
        }

        const pathname = `applications/${nominationId}/${field.key}-${Date.now()}-${sanitizeBlobName(item.name)}`;
        refs.push(await uploadApplicationBlob(item, pathname, field.key));
      }
      prepared[field.key] = refs;
      uploadedByField[field.key] = refs;
    }

    setValues((current) => {
      const next = { ...current };
      for (const [key, refs] of Object.entries(uploadedByField)) {
        next[key] = refs;
      }
      return next;
    });

    return prepared;
  }

  async function save(action: "draft" | "submit") {
    if (busyLabel !== null) return;
    setError("");
    setNotice("");
    setFieldErrors({});

    try {
      setBusyLabel(editor.uploadingFiles);
      const payload = await preparePayload();
      setBusyLabel(action === "submit" ? editor.submitting : editor.saving);

      const response = await fetch(`/api/applicant/nominations/${nominationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, values: payload }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        status?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok) {
        setFieldErrors(body.fieldErrors ?? {});
        setError(body.message ?? editor.saveError);
        return;
      }

      if (body.status) setStatus(body.status);
      setSavedJustNow(true);
      setNotice(action === "submit" ? editor.submittedNotice : editor.draftSaved);
      startTransition(() => router.refresh());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : editor.saveError);
    } finally {
      setBusyLabel(null);
    }
  }

  const statusLabel = locked
    ? t.account.badges.locked
    : t.account.statuses[status] ?? status.toLowerCase().replaceAll("_", " ");
  const statusToneValue = toneToBadge[nominationTone({ status, locked })];
  const headerDescription = locked
    ? editor.lockedDescription
    : submitted
      ? editor.submittedDescription
      : editor.draftDescription;
  const scoreText =
    scoreVisible && averageScore !== null
      ? `${editor.finalScore}: ${averageScore.toFixed(1)}`
      : editor.scoresPending;
  const lastSavedLabel = savedJustNow
    ? editor.justNow
    : updatedAtIso
      ? new Intl.DateTimeFormat(language === "ua" ? "uk" : language, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(updatedAtIso))
      : null;

  const sectionMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0.22, ease: PUBLIC_MOTION_EASE },
      };

  const active = sections.find((section) => section.id === currentSection);

  return (
    <div className="flex flex-col gap-5">
      <NominationReviewHeader
        categoryName={categoryName}
        awardName={awardName}
        statusLabel={statusLabel}
        statusTone={statusToneValue}
        paidLabel={paymentPaid ? t.account.badges.paid : t.account.badges.paymentPending}
        paidTone={paymentPaid ? "green" : "amber"}
        backHref="/account/applicant/nominations"
        backLabel={editor.backToNominations}
        description={headerDescription}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="sticky top-2 z-20">
            <SectionNav
              items={navItems}
              activeId={currentSection}
              onSelect={goToSection}
              ariaLabel={editor.sectionNavLabel}
            />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {currentSection === REVIEW_SECTION_ID ? (
              <motion.div key="review" {...sectionMotion}>
                <NominationReviewSummary
                  groups={reviewGroups}
                  values={values}
                  missingCount={progress.missingRequired.length}
                  locked={locked}
                  onEditSection={goToSection}
                />
              </motion.div>
            ) : active ? (
              <motion.div key={active.id} {...sectionMotion}>
                <NominationFormSection
                  icon={active.icon}
                  title={active.title}
                  description={active.description}
                  meta={
                    <span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] px-3 py-1 text-[0.62rem] font-semibold uppercase leading-none tracking-[0.1em] text-[#356f98]">
                      {active.fields.filter((field) => field.required).length}{" "}
                      {t.account.common.required}
                    </span>
                  }
                >
                  {locked
                    ? active.fields.map((field) => (
                        <div
                          key={field.key}
                          id={`nomination-field-${field.key}`}
                          className={
                            field.type === "textarea" || field.type === "file"
                              ? "md:col-span-2"
                              : undefined
                          }
                        >
                          <ReadOnlyField field={field} value={values[field.key]} />
                        </div>
                      ))
                    : active.fields.map((field) => (
                        <NominationFieldControl
                          key={field.key}
                          field={field}
                          value={values[field.key]}
                          error={fieldErrors[field.key] || undefined}
                          disabled={disabled}
                          onChange={setField}
                        />
                      ))}
                </NominationFormSection>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <aside className="order-first min-w-0 lg:order-none lg:sticky lg:top-6">
          <NominationRequirementsSidebar
            progress={progress}
            locked={locked}
            paymentPaid={paymentPaid}
            submitted={submitted}
            lastSavedLabel={lastSavedLabel}
            scoreText={scoreText}
            busyLabel={busyLabel}
            notice={notice}
            error={error}
            onMissingItem={jumpToField}
            onSaveDraft={() => void save("draft")}
            onSubmit={() => void save("submit")}
          />
        </aside>
      </div>
    </div>
  );
}
