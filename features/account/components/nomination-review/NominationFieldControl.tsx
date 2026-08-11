"use client";

import { useId } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ApplicantUploadField } from "@/features/applications/components/application-form/fields/UploadField";
import type { ApplyFieldConfig } from "@/features/applications/types/application.types";
import {
  dashboardInputClass,
  dashboardSelectClass,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";
import { getFileValues, getStringArray, type EditorValue } from "./editor-values";

function getWordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Renders a single nomination form field with label, description, control,
 * and inline validation error. File fields reuse the shared applicant upload
 * component so nominations get the same upload experience as the apply form.
 */
export default function NominationFieldControl({
  field,
  value,
  error,
  disabled,
  uploadsInProgress,
  onChange,
  onBlur,
}: {
  field: ApplyFieldConfig;
  value: EditorValue;
  error?: string;
  disabled: boolean;
  uploadsInProgress: boolean;
  onChange: (key: string, value: EditorValue) => void;
  onBlur: () => void;
}) {
  const { t } = useLanguage();
  const controlId = useId();
  const errorId = `${controlId}-error`;
  const hostId = `nomination-field-${field.key}`;
  const wide =
    field.type === "textarea" || field.type === "file" || field.type === "checkbox-group";

  if (field.type === "file") {
    return (
      <div id={hostId} className={wide ? "md:col-span-2" : undefined}>
        <ApplicantUploadField
          label={field.label}
          name={field.key}
          items={getFileValues(value)}
          required={field.required}
          description={field.description}
          error={error}
          multiple={(field.maxFiles ?? 1) > 1}
          maxFiles={field.maxFiles}
          accept={field.accept}
          disabled={disabled || uploadsInProgress}
          tone="glass"
          onChange={(name, items) => onChange(name, items)}
        />
      </div>
    );
  }

  const describedBy = error ? errorId : undefined;
  const label = (
    <label
      htmlFor={field.type === "checkbox-group" ? undefined : controlId}
      className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink)]/70"
    >
      {field.label}
      {field.required ? (
        <span aria-hidden className="ml-1 text-[var(--color-blue)]">
          *
        </span>
      ) : null}
    </label>
  );

  let control: React.ReactNode;

  if (field.type === "textarea") {
    const text = String(value ?? "");
    const words = field.maxWords ? getWordCount(text) : 0;
    control = (
      <>
        <textarea
          id={controlId}
          rows={field.rows ?? 5}
          disabled={disabled}
          required={field.required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          placeholder={field.placeholder}
          value={text}
          onChange={(event) => onChange(field.key, event.target.value)}
          onBlur={onBlur}
          className={`${dashboardTextareaClass} min-h-36 resize-y`}
        />
        {field.maxWords ? (
          <p
            className={`mt-1.5 text-right text-[0.7rem] ${
              words > field.maxWords ? "font-semibold text-red-600" : "text-[var(--color-ink-muted)]"
            }`}
          >
            {words} / {field.maxWords} {t.account.editor.wordsLabel}
          </p>
        ) : null}
      </>
    );
  } else if (field.type === "checkbox-group") {
    const selectedValues = getStringArray(value);
    control = (
      <fieldset
        aria-describedby={describedBy}
        className="grid gap-2 border-0 p-0 sm:grid-cols-2"
      >
        <legend className="sr-only">{field.label}</legend>
        {(field.options ?? []).map((option) => {
          const checked = selectedValues.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-[18px] border px-3.5 py-2 text-sm backdrop-blur-xl transition ${
                checked
                  ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] text-[var(--color-ink)] shadow-[0_10px_26px_rgba(114,160,193,0.14)]"
                  : "border-[rgba(114,160,193,0.2)] bg-white/70 text-[var(--color-ink-soft)] hover:border-[var(--color-blue)]/50 hover:bg-[var(--color-blue-wash)]/60"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={checked}
                onChange={(event) => {
                  onChange(
                    field.key,
                    event.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((item) => item !== option.value),
                  );
                }}
                onBlur={onBlur}
                className="size-4 accent-[var(--color-blue)]"
              />
              {option.label}
            </label>
          );
        })}
      </fieldset>
    );
  } else if (field.type === "radio" || field.type === "select") {
    control = (
      <select
        id={controlId}
        disabled={disabled}
        required={field.required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        value={String(value ?? "")}
        onChange={(event) => onChange(field.key, event.target.value)}
        onBlur={onBlur}
        className={dashboardSelectClass}
      >
        <option value="">{t.account.editor.select}</option>
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else {
    control = (
      <input
        id={controlId}
        type={field.type === "number" ? "number" : field.type}
        disabled={disabled}
        required={field.required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        min={field.min}
        max={field.max}
        step={field.type === "number" ? field.step ?? undefined : undefined}
        placeholder={field.placeholder}
        value={String(value ?? "")}
        onChange={(event) => onChange(field.key, event.target.value)}
        onBlur={onBlur}
        className={dashboardInputClass}
      />
    );
  }

  return (
    <div id={hostId} className={wide ? "md:col-span-2" : undefined}>
      {label}
      {field.description ? (
        <p className="mt-1 text-xs leading-[1.55] text-[var(--color-ink-soft)]">
          {field.description}
        </p>
      ) : null}
      <div className="mt-2">{control}</div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
