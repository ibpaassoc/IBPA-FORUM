"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileUp, Save, Send } from "lucide-react";
import {
  sanitizeBlobName,
  uploadApplicationBlob,
  validateUploadFile,
} from "@/features/applications/client/upload-files";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type {
  ApplicationFileRef,
  ApplyFieldConfig,
} from "@/features/applications/types/application.types";

type EditorValue =
  | string
  | string[]
  | File[]
  | ApplicationFileRef[]
  | Array<File | ApplicationFileRef>
  | null
  | undefined;
type EditorValues = Record<string, EditorValue>;

type InitialAnswer = {
  fieldKey: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
};

type InitialFile = {
  id: string;
  fieldKey: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
};

function answerToValue(answer: InitialAnswer): EditorValue {
  if (Array.isArray(answer.valueJson)) {
    return answer.valueJson.filter((item): item is string => typeof item === "string");
  }
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? "yes" : "no";
  return answer.valueText ?? "";
}

function existingFileToRef(file: InitialFile): ApplicationFileRef {
  return {
    fieldKey: file.fieldKey,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    mimeType: file.mimeType,
    fileSize: file.fileSize,
  };
}

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getStringArray(value: EditorValue) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getFileValues(value: EditorValue): Array<File | ApplicationFileRef> {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is File | ApplicationFileRef => item instanceof File || isApplicationFileRef(item));
}

export default function NominationEditorForm({
  nominationId,
  fields,
  initialAnswers,
  initialFiles,
  locked,
  initialStatus,
}: {
  nominationId: string;
  fields: ApplyFieldConfig[];
  initialAnswers: InitialAnswer[];
  initialFiles: InitialFile[];
  locked: boolean;
  initialStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<EditorValues>(() => {
    const next: EditorValues = {};
    for (const answer of initialAnswers) {
      next[answer.fieldKey] = answerToValue(answer);
    }
    for (const file of initialFiles) {
      const current = next[file.fieldKey];
      const refs = getFileValues(current).filter(isApplicationFileRef);
      next[file.fieldKey] = [...refs, existingFileToRef(file)];
    }
    return next;
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const missingRequired = useMemo(
    () =>
      fields.filter((field) => {
        if (!field.required) return false;
        const value = values[field.key];
        if (field.type === "file") return getFileValues(value).length === 0;
        if (Array.isArray(value)) return value.length === 0;
        return !String(value ?? "").trim();
      }),
    [fields, values]
  );

  function setField(key: string, value: EditorValue) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  async function preparePayload() {
    const prepared: Record<string, unknown> = {};
    setUploading(true);
    try {
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
      }
      return prepared;
    } finally {
      setUploading(false);
    }
  }

  async function save(action: "draft" | "submit") {
    setError("");
    setNotice("");
    setFieldErrors({});

    try {
      const payload = await preparePayload();
      const response = await fetch(`/api/applicant/nominations/${nominationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, values: payload }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok) {
        setFieldErrors(body.fieldErrors ?? {});
        setError(body.message ?? "Could not save this nomination.");
        return;
      }

      setNotice(action === "submit" ? "Nomination submitted to jury." : "Draft saved.");
      startTransition(() => router.refresh());
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this nomination.");
    }
  }

  function renderField(field: ApplyFieldConfig) {
    const value = values[field.key];
    const errorMessage = fieldErrors[field.key];
    const label = (
      <label className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]">
        {field.label}
        {field.required ? <span className="text-[var(--color-blue)]"> *</span> : null}
      </label>
    );
    const shell = (children: React.ReactNode) => (
      <div key={field.key} className={field.type === "textarea" || field.type === "file" || field.type === "checkbox-group" ? "md:col-span-2" : ""}>
        {label}
        {field.description ? <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{field.description}</p> : null}
        <div className="mt-2">{children}</div>
        {errorMessage ? <p className="mt-2 text-sm text-red-700">{errorMessage}</p> : null}
      </div>
    );
    const inputClass =
      "w-full rounded-[20px] border border-[var(--border-default)] bg-white/92 px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-blue)] focus:shadow-[0_0_0_4px_rgba(185,217,235,0.32)]";

    if (field.type === "textarea") {
      return shell(
        <textarea
          rows={field.rows ?? 5}
          disabled={locked}
          value={String(value ?? "")}
          onChange={(event) => setField(field.key, event.target.value)}
          className={`${inputClass} min-h-36 resize-y`}
        />
      );
    }

    if (field.type === "checkbox-group") {
      const selectedValues = getStringArray(value);
      return shell(
        <div className="grid gap-2 sm:grid-cols-2">
          {(field.options ?? []).map((option) => (
            <label key={option.value} className="flex items-center gap-2 rounded-[18px] border border-[var(--border-default)] bg-white/80 px-3 py-2 text-sm">
              <input
                type="checkbox"
                disabled={locked}
                checked={selectedValues.includes(option.value)}
                onChange={(event) => {
                  setField(
                    field.key,
                    event.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((item) => item !== option.value)
                  );
                }}
                className="accent-[var(--color-blue)]"
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "radio" || field.type === "select") {
      return shell(
        <select
          disabled={locked}
          value={String(value ?? "")}
          onChange={(event) => setField(field.key, event.target.value)}
          className={inputClass}
        >
          <option value="">Select</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "file") {
      const files = getFileValues(value);
      return shell(
        <div className="rounded-[20px] border border-dashed border-[var(--border-default)] bg-white/72 p-4">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white">
            <FileUp size={16} />
            Choose files
            <input
              type="file"
              hidden
              disabled={locked}
              multiple={(field.maxFiles ?? 1) > 1}
              accept={field.accept?.join(",")}
              onChange={(event) => setField(field.key, Array.from(event.target.files ?? []))}
            />
          </label>
          <div className="mt-3 grid gap-2">
            {files.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-soft)]">No files selected.</p>
            ) : (
              files.map((file, index) => (
                <div key={`${field.key}-${index}`} className="rounded-[16px] bg-[var(--surface-tint)] px-3 py-2 text-sm text-[var(--color-ink)]">
                  {"name" in file ? file.name : file.fileName}
                  <span className="ml-2 text-xs text-[var(--color-ink-soft)]">
                    {formatFileSize("size" in file ? file.size : file.fileSize)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return shell(
      <input
        type={field.type === "number" ? "number" : field.type}
        disabled={locked}
        min={field.min}
        max={field.max}
        value={String(value ?? "")}
        onChange={(event) => setField(field.key, event.target.value)}
        className={inputClass}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[26px] border border-[var(--border-default)] bg-white/78 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
              Completion
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              {missingRequired.length === 0
                ? "All required fields look complete."
                : `${missingRequired.length} required item(s) still missing.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={locked || uploading || isPending}
              onClick={() => void save("draft")}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--border-default)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] disabled:opacity-50"
            >
              <Save size={16} /> Save Draft
            </button>
            <button
              type="button"
              disabled={locked || uploading || isPending}
              onClick={() => void save("submit")}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send size={16} /> Submit to Jury
            </button>
          </div>
        </div>
        {notice ? (
          <p className="mt-3 flex items-center gap-2 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={16} /> {notice}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {initialStatus === "SUBMITTED" ? (
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            This nomination is submitted and remains editable until applications close.
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">{fields.map(renderField)}</div>
    </div>
  );
}
