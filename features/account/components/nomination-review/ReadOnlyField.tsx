"use client";

import { FileText, ImageIcon } from "lucide-react";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type { ApplyFieldConfig } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { getFileValues, getStringArray, type EditorValue } from "./editor-values";

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function optionLabel(field: ApplyFieldConfig, value: string) {
  return field.options?.find((option) => option.value === value)?.label ?? value;
}

/**
 * Read-only presentation of one nomination field: clean value blocks for
 * text, resolved option labels for selects, and download cards for files.
 * Used by the Review section and by locked (finalized) nominations.
 */
export default function ReadOnlyField({
  field,
  value,
}: {
  field: ApplyFieldConfig;
  value: EditorValue;
}) {
  const { t } = useLanguage();
  const editor = t.account.editor;

  let content: React.ReactNode;

  if (field.type === "file") {
    const files = getFileValues(value);
    content =
      files.length === 0 ? (
        <p className="text-sm italic text-[var(--color-ink-muted)]">{editor.noFilesUploaded}</p>
      ) : (
        <ul className="grid gap-1.5">
          {files.map((item, index) => {
            const ref = isApplicationFileRef(item) ? item : null;
            const name = ref ? ref.fileName : (item as File).name;
            const size = ref ? ref.fileSize : (item as File).size;
            const mime = ref ? ref.mimeType : (item as File).type;
            const row = (
              <span className="flex min-w-0 items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  {mime.startsWith("image/") ? (
                    <ImageIcon aria-hidden size={14} className="shrink-0 text-[var(--color-blue)]" />
                  ) : (
                    <FileText aria-hidden size={14} className="shrink-0 text-[var(--color-ink-soft)]" />
                  )}
                  <span className="truncate text-sm text-[var(--color-ink)]">{name}</span>
                </span>
                <span className="shrink-0 text-xs text-[var(--color-ink-soft)]">
                  {formatFileSize(size)}
                </span>
              </span>
            );
            const rowClass =
              "block rounded-[16px] border border-[rgba(114,160,193,0.16)] bg-white/78 px-3.5 py-2.5 backdrop-blur-xl";
            return (
              <li key={`${name}-${index}`}>
                {ref ? (
                  <a
                    href={ref.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${rowClass} transition hover:border-[var(--color-blue)]/45 hover:bg-[var(--color-blue-wash)]/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.25)]`}
                  >
                    {row}
                  </a>
                ) : (
                  <span className={rowClass}>{row}</span>
                )}
              </li>
            );
          })}
        </ul>
      );
  } else if (field.type === "checkbox-group") {
    const selected = getStringArray(value);
    content =
      selected.length === 0 ? (
        <p className="text-sm italic text-[var(--color-ink-muted)]">{editor.notFilled}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="inline-flex min-h-7 items-center rounded-full border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)] px-3 py-1 text-[0.72rem] font-medium text-[#356f98]"
            >
              {optionLabel(field, item)}
            </span>
          ))}
        </div>
      );
  } else {
    const text = String(value ?? "").trim();
    const display =
      field.type === "select" || field.type === "radio" ? optionLabel(field, text) : text;
    content = display ? (
      <p className="whitespace-pre-wrap break-words text-sm leading-[1.7] text-[var(--color-ink)]">
        {display}
      </p>
    ) : (
      <p className="text-sm italic text-[var(--color-ink-muted)]">{editor.notFilled}</p>
    );
  }

  return (
    <div className="min-w-0 rounded-[20px] border border-[rgba(37,42,45,0.07)] bg-white/62 p-3.5 backdrop-blur-xl">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
        {field.label}
        {field.required ? (
          <span aria-hidden className="ml-1 text-[var(--color-blue)]">
            *
          </span>
        ) : null}
      </p>
      <div className="mt-2">{content}</div>
    </div>
  );
}
