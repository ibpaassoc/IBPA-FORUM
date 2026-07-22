"use client";

import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type { ApplyFieldConfig } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import FilePreviewGallery from "@/shared/components/files/FilePreviewGallery";
import { getFileValues, getStringArray, type EditorValue } from "./editor-values";

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
        <FilePreviewGallery
          items={files.map((item, index) => {
            const ref = isApplicationFileRef(item) ? item : null;
            const file = item as File;
            return {
              id: ref ? `stored-${ref.fileUrl}-${index}` : `local-${file.name}-${file.size}-${file.lastModified}-${index}`,
              name: ref ? ref.fileName : file.name,
              size: ref ? ref.fileSize : file.size,
              mimeType: ref ? ref.mimeType : file.type,
              source: ref ? ref.fileUrl : file,
            };
          })}
        />
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
