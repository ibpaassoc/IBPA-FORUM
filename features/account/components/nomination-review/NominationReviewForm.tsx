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
import { getUploadThumbnail } from "@/features/applications/client/image-processing";
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
const UPLOAD_CONCURRENCY = 2;
const AUTOSAVE_DELAY_MS = 650;

/**
 * Drop `previewUrl` before persisting. It is a browser-only concern — either an
 * authenticated API path or an object URL for a file uploaded in this session —
 * and the endpoint derives its own preview links from the stored Blob pathname.
 */
function toStoredRef(ref: ApplicationFileRef): ApplicationFileRef {
  return {
    fieldKey: ref.fieldKey,
    fileName: ref.fileName,
    fileUrl: ref.fileUrl,
    mimeType: ref.mimeType,
    fileSize: ref.fileSize,
  };
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
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [uploadItems, setUploadItems] = useState<UploadProgressItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const pendingFocusKey = useRef<string | null>(null);
  const fileIds = useRef(new WeakMap<File, string>());
  const nextFileId = useRef(0);
  const valuesRef = useRef(values);
  const saveInFlight = useRef(false);
  const activeSavePromise = useRef<Promise<boolean> | null>(null);
  const saveQueued = useRef(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Object URLs minted for files uploaded in this session — see createLocalPreview.
  const localPreviews = useRef(new Set<string>());

  const submitted = status === "SUBMITTED";
  const disabled = locked || submitting;
  const hasFailedUploads = uploadItems.some((item) => item.status === "failed");
  const hasActiveUploads = uploadItems.some((item) => item.status === "pending" || item.status === "retrying" || item.status === "uploading");
  const hasPendingFiles = Object.values(values).some((value) => getFileValues(value).some((item) => item instanceof File));
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

  /**
   * A just-uploaded file is not in the persisted nomination JSON yet, so the ref that
   * replaces the picked `File` carries no authenticated `previewUrl`. Without
   * one the gallery falls back to `fileUrl` — the private Blob *pathname* — and
   * the browser resolves that relative to the current page, so every thumbnail
   * reads as "preview unavailable" until a reload re-renders the field from the
   * database. Preview the bytes the browser already holds instead.
   */
  function createLocalPreviews(file: File) {
    const previewUrl = URL.createObjectURL(file);
    const thumbnail = getUploadThumbnail(file);
    const thumbnailUrl = thumbnail
      ? URL.createObjectURL(thumbnail)
      : previewUrl;
    localPreviews.current.add(previewUrl);
    localPreviews.current.add(thumbnailUrl);
    return { previewUrl, thumbnailUrl };
  }

  function releaseLocalPreview(url: string | undefined) {
    if (!url || !localPreviews.current.has(url)) return;
    URL.revokeObjectURL(url);
    localPreviews.current.delete(url);
  }

  function setField(key: string, value: EditorValue) {
    const previous = valuesRef.current;
    const next = { ...previous, [key]: value };
    valuesRef.current = next;
    setValues(next);
    setFieldErrors((current) => ({ ...current, [key]: "" }));

    const field = fields.find((item) => item.key === key);
    let uploadStarted = false;
    if (field?.type === "file") {
      const kept = getFileValues(value);
      for (const item of getFileValues(previous[key])) {
        if (isApplicationFileRef(item) && !kept.includes(item)) {
          releaseLocalPreview(item.previewUrl);
          releaseLocalPreview(item.thumbnailUrl);
        }
      }
      const previousFiles = new Set(getFileValues(previous[key]).filter((item): item is File => item instanceof File));
      const newFiles = kept.filter((item): item is File => item instanceof File && !previousFiles.has(item));
      if (newFiles.length > 0) {
        uploadStarted = true;
        void uploadFiles(field, newFiles, false);
      }
    }
    // A selected batch is persisted once its uploads settle. Saving here as
    // well would send an empty file-field patch and doubles the request burst.
    if (!uploadStarted) scheduleDraftSave();
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

  function buildDraftPayload(snapshot: EditorValues) {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const value = snapshot[field.key];
      if (field.type !== "file") {
        payload[field.key] = value ?? "";
        continue;
      }
      const fileValues = getFileValues(value);
      // Do not turn a still-uploading replacement into a deletion of the
      // previous saved file. The field is persisted only once it contains refs.
      if (!fileValues.some((item) => item instanceof File)) {
        payload[field.key] = fileValues.filter(isApplicationFileRef).map(toStoredRef);
      }
    }
    return payload;
  }

  async function readResponse(response: Response) {
    const text = await response.text();
    try {
      return JSON.parse(text) as { message?: string; errorCode?: string; status?: string; fieldErrors?: Record<string, string> };
    } catch {
      return {};
    }
  }

  function errorMessage(code?: string) {
    if (code === "AUTHENTICATION") return editor.saveErrors.authentication;
    if (code === "TIMEOUT") return editor.saveErrors.timeout;
    if (code === "UPLOAD") return editor.uploadProgress.failureSummary;
    if (code === "VALIDATION") return editor.saveErrors.validation;
    return editor.saveError;
  }

  async function persist(action: "draft" | "submit", snapshot: EditorValues) {
    const response = await fetch(`/api/applicant/nominations/${nominationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Request-Id": crypto.randomUUID() },
      body: JSON.stringify({ action, values: buildDraftPayload(snapshot) }),
    });
    const body = await readResponse(response);
    if (!response.ok) {
      setFieldErrors(body.fieldErrors ?? {});
      setError(errorMessage(body.errorCode));
      setSaveState("error");
      return false;
    }
    if (body.status) setStatus(body.status);
    setSavedJustNow(true);
    setSaveState("saved");
    return true;
  }

  async function saveDraft({ manual = false, allowDuringSubmit = false } = {}) {
    if (locked || (submitting && !allowDuringSubmit)) return false;
    if (saveInFlight.current) {
      saveQueued.current = true;
      return true;
    }
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    saveInFlight.current = true;
    setSaveState("saving");
    if (manual) {
      setError("");
      setNotice("");
    }
    const request = (async () => {
      const snapshot = valuesRef.current;
      try {
        const saved = await persist("draft", snapshot);
        if (saved && manual) setNotice(editor.draftSaved);
        return saved;
      } catch {
        setError(editor.saveError);
        setSaveState("error");
        return false;
      } finally {
        saveInFlight.current = false;
        if (saveQueued.current) {
          saveQueued.current = false;
          void saveDraft();
        }
      }
    })();
    activeSavePromise.current = request;
    const saved = await request;
    if (activeSavePromise.current === request) {
      activeSavePromise.current = null;
    }
    return saved;
  }

  async function waitForDraftSaves() {
    let saved = true;
    while (activeSavePromise.current) {
      const active = activeSavePromise.current;
      saved = (await active) && saved;
    }
    return saved;
  }

  function scheduleDraftSave() {
    if (locked || submitting) return;
    if (saveInFlight.current) {
      saveQueued.current = true;
      return;
    }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setSaveState("saving");
    autosaveTimer.current = setTimeout(() => {
      autosaveTimer.current = null;
      void saveDraft();
    }, AUTOSAVE_DELAY_MS);
  }

  async function uploadFiles(field: ApplyFieldConfig, files: File[], retrying: boolean) {
    const tasks = files.flatMap((file) => {
      const validationMessage = validateUploadFile(file, field.accept);
      const id = getFileId(file);
      if (validationMessage) {
        setUploadItems((current) => [...current.filter((item) => item.id !== id), { id, fieldKey: field.key, fileName: file.name, loaded: 0, total: file.size, status: "failed", error: validationMessage, retryable: false }]);
        return [];
      }
      return [{ id, fieldKey: field.key, file, pathname: `applications/${nominationId}/${field.key}/${Date.now()}-${id}-${sanitizeBlobName(file.name)}` }];
    });
    if (!tasks.length) return;
    setUploadItems((current) => [
      ...current.filter((item) => !tasks.some((task) => task.id === item.id)),
      ...tasks.map((task) => ({ id: task.id, fieldKey: task.fieldKey, fileName: task.file.name, loaded: 0, total: task.file.size, status: retrying ? "retrying" as const : "pending" as const, retryable: true })),
    ]);
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const uploadResult = await runUploadQueue<ApplicationFileRef>(tasks.map((task) => ({
      id: task.id,
      upload: (onProgress) => uploadApplicationBlob(task.file, task.pathname, task.fieldKey, nominationId, onProgress),
    })), {
      concurrency: UPLOAD_CONCURRENCY,
      onStart: (id) => updateUploadItem(id, (item) => ({ ...item, status: "uploading", error: undefined })),
      onProgress: (id, progressValue) => updateUploadItem(id, (item) => ({ ...item, loaded: progressValue.loaded, total: progressValue.total || item.total })),
      onComplete: (id, ref) => {
        const task = byId.get(id);
        if (!task) return;
        updateUploadItem(id, (item) => ({ ...item, loaded: item.total, status: "success", error: undefined }));
        const listed = getFileValues(valuesRef.current[task.fieldKey]);
        // Only mint a preview URL while the file is still in the field; one
        // removed mid-upload would leak it.
        const stored = listed.includes(task.file)
          ? { ...ref, ...createLocalPreviews(task.file) }
          : ref;
        const next = {
          ...valuesRef.current,
          [task.fieldKey]: listed.map((item) => (item === task.file ? stored : item)),
        };
        valuesRef.current = next;
        setValues(next);
      },
      onError: (id, uploadError) => updateUploadItem(id, (item) => ({ ...item, status: "failed", error: uploadError.message || editor.uploadProgress.unknownError, retryable: true })),
    });
    // Persist all successful refs from this selection in one revision-checked
    // request instead of one autosave per file.
    if (uploadResult.completed.size > 0) await saveDraft();
  }

  function retryUpload(id: string) {
    for (const field of fields.filter((item) => item.type === "file")) {
      const file = getFileValues(valuesRef.current[field.key]).find((item): item is File => item instanceof File && getFileId(item) === id);
      if (file) {
        void uploadFiles(field, [file], true);
        return;
      }
    }
  }

  async function submit() {
    if (submitting) return;
    if (hasActiveUploads || hasFailedUploads || hasPendingFiles) {
      setError(hasFailedUploads ? editor.uploadProgress.failureSummary : editor.waitForUploads);
      return;
    }
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    setSubmitting(true);
    setBusyLabel(editor.submitting);
    setError("");
    setNotice("");
    try {
      // Upload completion can start an autosave immediately before the user
      // submits. Drain that save (and any coalesced follow-up) before issuing
      // another revision-checked write, otherwise one request loses with 409.
      if (!(await waitForDraftSaves())) return;
      if (!(await saveDraft({ allowDuringSubmit: true }))) return;
      if (!(await waitForDraftSaves())) return;
      const submittedNow = await persist("submit", valuesRef.current);
      if (submittedNow) {
        setNotice(editor.submittedNotice);
        startTransition(() => router.refresh());
      }
    } catch {
      setError(editor.saveError);
    } finally {
      setSubmitting(false);
      setBusyLabel(null);
    }
  }

  useEffect(() => () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    for (const url of localPreviews.current) URL.revokeObjectURL(url);
    localPreviews.current.clear();
  }, []);

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
      (hasActiveUploads || hasFailedUploads) ? (
        <UploadProgressPanel
          items={uploadItems}
          busy={submitting}
          onRetryItem={retryUpload}
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
                          uploadsInProgress={hasActiveUploads}
                          onChange={setField}
                          onBlur={() => void saveDraft()}
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
            submitDisabled={hasActiveUploads || hasFailedUploads || hasPendingFiles}
            saveState={saveState}
            notice={notice}
            error={error}
            onMissingItem={jumpToField}
            onSaveDraft={() => void saveDraft({ manual: true })}
            onSubmit={() => void submit()}
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
                disabled={submitting}
                onClick={() => {
                  close();
                  void saveDraft({ manual: true });
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/82 px-5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyLabel ? <Loader2 aria-hidden size={15} className="animate-spin" /> : <Save aria-hidden size={15} />}
                {editor.saveDraft}
              </button>
              <button
                type="button"
                disabled={submitting || hasActiveUploads || hasFailedUploads || hasPendingFiles}
                onClick={() => {
                  close();
                  void submit();
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
