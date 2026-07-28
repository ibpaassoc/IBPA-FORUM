"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Briefcase, Loader2, PenLine, Save, Send, UploadCloud } from "lucide-react";
import { nominationTone, type NominationTone } from "@/features/account/components/nomination-presentation";
import { computeNominationProgress } from "@/features/account/lib/nomination-progress";
import {
  sanitizeBlobName,
  uploadApplicationBlob,
  validateUploadFile,
} from "@/features/applications/client/upload-files";
import { runUploadQueue } from "@/features/applications/client/upload-queue";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import { getFieldVisibility } from "@/features/applications/schemas/category-field-validation";
import type {
  ApplicationFileRef,
  ApplicationValues,
  ApplyFieldConfig,
} from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  NoticePanel,
  SectionNav,
  type SectionNavItem,
} from "@/shared/components/account/AccountUI";
import { PUBLIC_MOTION_EASE } from "@/shared/components/public/motion-tokens";
import {
  MobileActionDock,
  MobileLayeredNominationNavigation,
  type MobileNominationItem,
} from "@/features/account/components/mobile/MobileLayeredNominationNavigation";
import NominationFieldControl from "./NominationFieldControl";
import NominationFormSection from "./NominationFormSection";
import NominationRequirementsSidebar from "./NominationRequirementsSidebar";
import NominationReviewHeader from "./NominationReviewHeader";
import NominationReviewSummary, { type ReviewSectionGroup } from "./NominationReviewSummary";
import ReadOnlyField from "./ReadOnlyField";
import UploadProgressPanel, {
  type UploadProgressItem,
} from "./UploadProgressPanel";
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
const UPLOAD_CONCURRENCY = 3;

class UploadBatchError extends Error {
  constructor() {
    super("One or more files could not be uploaded.");
    this.name = "UploadBatchError";
  }
}

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
  nominations,
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
  nominations: Array<{
    id: string;
    status: string;
    locked: boolean;
    categoryName: string;
    awardName: string;
    completionPercentage: number;
    missingRequiredCount: number;
  }>;
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
  const [uploadItems, setUploadItems] = useState<UploadProgressItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const pendingFocusKey = useRef<string | null>(null);
  const fileIds = useRef(new WeakMap<File, string>());
  const nextFileId = useRef(0);
  const saveInFlight = useRef(false);
  const lastAction = useRef<"draft" | "submit">("draft");

  const submitted = status === "SUBMITTED";
  const disabled = locked || busyLabel !== null;
  const hasFailedUploads = uploadItems.some((item) => item.status === "failed");
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

  function goToMobileSection(id: string) {
    setActiveSection(id);
    requestAnimationFrame(() => {
      document.getElementById("applicant-nomination-section")?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
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
    if (fields.some((field) => field.key === key && field.type === "file")) {
      setUploadItems([]);
    }
  }

  function getFileId(file: File) {
    const existing = fileIds.current.get(file);
    if (existing) return existing;
    nextFileId.current += 1;
    const id = `upload-${nextFileId.current}`;
    fileIds.current.set(file, id);
    return id;
  }

  function updateUploadItem(
    id: string,
    update: (item: UploadProgressItem) => UploadProgressItem,
  ) {
    setUploadItems((current) =>
      current.map((item) => (item.id === id ? update(item) : item)),
    );
  }

  // Uploads freshly selected Files directly to Blob through a three-worker
  // queue. Successful files are swapped into local state immediately so a
  // failed batch can retry only the remaining File objects.
  async function preparePayload() {
    const prepared: Record<string, unknown> = {};
    const pending: Array<{
      id: string;
      fieldKey: string;
      file: File;
      pathname: string;
    }> = [];
    const validationFailures: UploadProgressItem[] = [];

    for (const field of fields) {
      const value = values[field.key];
      if (field.type !== "file") {
        prepared[field.key] = value ?? "";
        continue;
      }

      for (const item of getFileValues(value)) {
        if (isApplicationFileRef(item)) {
          continue;
        }

        const validationMessage = validateUploadFile(
          item,
          field.accept,
          field.maxFileSizeMb ?? 5,
        );
        if (validationMessage) {
          validationFailures.push({
            id: getFileId(item),
            fieldKey: field.key,
            fileName: item.name,
            loaded: 0,
            total: item.size,
            status: "failed",
            error: validationMessage,
            retryable: false,
          });
          continue;
        }

        const id = getFileId(item);
        pending.push({
          id,
          fieldKey: field.key,
          file: item,
          pathname: `applications/${nominationId}/${field.key}/${Date.now()}-${id}-${sanitizeBlobName(item.name)}`,
        });
      }
    }

    if (validationFailures.length > 0) {
      setUploadItems(validationFailures);
      throw new UploadBatchError();
    }

    if (pending.length === 0) {
      for (const field of fields) {
        if (field.type === "file") {
          prepared[field.key] = getFileValues(values[field.key]).filter(
            isApplicationFileRef,
          );
        }
      }
      setUploadItems([]);
      return prepared;
    }

    setUploadItems((current) => {
      const retrying = current.some((item) => item.status === "failed");
      const retained = retrying
        ? current.filter((item) => item.status === "success")
        : [];
      return [
        ...retained,
        ...pending.map(({ id, fieldKey, file }) => ({
          id,
          fieldKey,
          fileName: file.name,
          loaded: 0,
          total: file.size,
          status: "pending" as const,
          retryable: true,
        })),
      ];
    });

    const pendingById = new Map(pending.map((item) => [item.id, item]));
    const result = await runUploadQueue<ApplicationFileRef>(
      pending.map((item) => ({
        id: item.id,
        upload: (onProgress) =>
          uploadApplicationBlob(
            item.file,
            item.pathname,
            item.fieldKey,
            nominationId,
            onProgress,
          ),
      })),
      {
        concurrency: UPLOAD_CONCURRENCY,
        onStart: (id) => {
          updateUploadItem(id, (item) => ({
            ...item,
            status: "uploading",
            error: undefined,
          }));
        },
        onProgress: (id, progressValue) => {
          updateUploadItem(id, (item) => ({
            ...item,
            loaded: progressValue.loaded,
            total: progressValue.total || item.total,
          }));
        },
        onComplete: (id, ref) => {
          const pendingItem = pendingById.get(id);
          if (!pendingItem) return;
          updateUploadItem(id, (item) => ({
            ...item,
            loaded: item.total,
            status: "success",
            error: undefined,
          }));
          setValues((current) => ({
            ...current,
            [pendingItem.fieldKey]: getFileValues(
              current[pendingItem.fieldKey],
            ).map((item) => (item === pendingItem.file ? ref : item)),
          }));
        },
        onError: (id, uploadError) => {
          updateUploadItem(id, (item) => ({
            ...item,
            status: "failed",
            error: uploadError.message || editor.uploadProgress.unknownError,
            retryable: true,
          }));
        },
      },
    );

    if (result.failed.length > 0) {
      throw new UploadBatchError();
    }

    for (const field of fields) {
      if (field.type !== "file") continue;
      prepared[field.key] = getFileValues(values[field.key]).map((item) => {
        if (isApplicationFileRef(item)) return item;
        const uploaded = result.completed.get(getFileId(item));
        if (!uploaded) throw new UploadBatchError();
        return uploaded;
      });
    }

    return prepared;
  }

  async function save(action: "draft" | "submit") {
    if (saveInFlight.current || busyLabel !== null) return;
    saveInFlight.current = true;
    lastAction.current = action;
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
      setError(
        saveError instanceof UploadBatchError
          ? editor.uploadProgress.failureSummary
          : saveError instanceof Error
            ? saveError.message
            : editor.saveError,
      );
    } finally {
      saveInFlight.current = false;
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
  const mobileNavigation = editor.mobileNavigation;
  const mobileNominations: MobileNominationItem[] = nominations.map((item) => {
    const isCurrent = item.id === nominationId;
    const itemStatus = isCurrent ? status : item.status;
    const itemLocked = isCurrent ? locked : item.locked;
    const itemProgress = isCurrent ? progress.percentage : item.completionPercentage;
    const itemMissing = isCurrent
      ? progress.missingRequired.length
      : item.missingRequiredCount;
    return {
      id: item.id,
      href: `/account/applicant/nominations/${item.id}`,
      title: item.awardName,
      eyebrow: item.categoryName,
      statusLabel: itemLocked
        ? t.account.badges.locked
        : t.account.statuses[itemStatus] ?? itemStatus.toLowerCase().replaceAll("_", " "),
      statusTone: toneToBadge[nominationTone({ status: itemStatus, locked: itemLocked })],
      progress: itemProgress,
      progressLabel: editor.completion,
      missingCount: itemMissing,
      missingLabel: mobileNavigation.missing,
    };
  });

  return (
    <div className="flex flex-col gap-5">
      <MobileLayeredNominationNavigation
        nominations={mobileNominations}
        activeNominationId={nominationId}
        sections={navItems}
        activeSectionId={currentSection}
        onSectionSelect={goToMobileSection}
        labels={{
          backLabel: editor.backToNominations,
          backHref: "/account/applicant/nominations",
          selectorLabel: mobileNavigation.selectorLabel,
          drawerTitle: mobileNavigation.drawerTitle,
          drawerDescription: mobileNavigation.drawerDescription,
          sectionLabel: editor.sectionNavLabel,
          closeLabel: mobileNavigation.close,
          selectedLabel: mobileNavigation.selected,
        }}
      />

      <div className="hidden lg:block">
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
      </div>

      <div className="grid gap-2 lg:hidden">
        {notice ? <NoticePanel tone="success" role="status">{notice}</NoticePanel> : null}
        {error ? <NoticePanel tone="error" role="alert">{error}</NoticePanel> : null}
        {locked ? <NoticePanel tone="info">{editor.lockedNotice}</NoticePanel> : null}
        {!locked && !paymentPaid ? <NoticePanel tone="warning">{editor.paymentPendingNotice}</NoticePanel> : null}
      </div>

      {uploadItems.length > 0 &&
      (busyLabel !== null || hasFailedUploads) ? (
        <UploadProgressPanel
          items={uploadItems}
          busy={busyLabel !== null}
          onRetry={() => void save(lastAction.current)}
        />
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div id="applicant-nomination-section" className="flex min-w-0 scroll-mt-3 flex-col gap-4">
          <div className="sticky top-2 z-20 hidden lg:block">
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

        <aside className="hidden min-w-0 lg:order-none lg:sticky lg:top-6 lg:block">
          <NominationRequirementsSidebar
            progress={progress}
            locked={locked}
            paymentPaid={paymentPaid}
            submitted={submitted}
            lastSavedLabel={lastSavedLabel}
            scoreText={scoreText}
            busyLabel={busyLabel}
            submitDisabled={hasFailedUploads}
            notice={notice}
            error={error}
            onMissingItem={jumpToField}
            onSaveDraft={() => void save("draft")}
            onSubmit={() => void save("submit")}
          />
        </aside>
      </div>

      {!locked && paymentPaid ? (
        <MobileActionDock
          label={mobileNavigation.actions}
          title={mobileNavigation.quickActions}
          badgeCount={progress.missingRequired.length}
        >
          {(close) => (
            <>
              {progress.missingRequired.length > 0 ? (
                <div className="rounded-[20px] border border-amber-200/80 bg-amber-50/82 p-2">
                  <p className="px-2 pb-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-amber-800">
                    {mobileNavigation.viewMissing} ({progress.missingRequired.length})
                  </p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {progress.missingRequired.slice(0, 8).map((field) => (
                      <button
                        key={field.key}
                        type="button"
                        onClick={() => {
                          close();
                          jumpToField(field);
                        }}
                        className="flex min-h-11 w-full items-center gap-2 rounded-[14px] px-2 text-left text-xs leading-snug text-amber-900 transition hover:bg-amber-100/75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50"
                      >
                        <AlertTriangle aria-hidden size={14} className="shrink-0" />
                        <span>{field.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                disabled={busyLabel !== null}
                onClick={() => {
                  close();
                  void save("draft");
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/82 px-5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyLabel ? <Loader2 aria-hidden size={15} className="animate-spin" /> : <Save aria-hidden size={15} />}
                {editor.saveDraft}
              </button>
              <button
                type="button"
                disabled={busyLabel !== null || hasFailedUploads}
                onClick={() => {
                  close();
                  void save("submit");
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_14px_30px_rgba(114,160,193,0.24)] transition hover:bg-[#5f91b6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyLabel ? <Loader2 aria-hidden size={15} className="animate-spin" /> : <Send aria-hidden size={15} />}
                {busyLabel ?? (submitted ? editor.updateSubmission : editor.submit)}
              </button>
            </>
          )}
        </MobileActionDock>
      ) : null}
    </div>
  );
}
