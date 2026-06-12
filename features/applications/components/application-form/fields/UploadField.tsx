"use client";

import FormFieldShell from "@/features/applications/components/application-form/fields/FormFieldShell";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default function UploadField({
  label,
  name,
  files,
  required,
  description,
  error,
  multiple = false,
  accept,
  onChange,
}: {
  label: string;
  name: string;
  files: File[];
  required?: boolean;
  description?: string;
  error?: string;
  multiple?: boolean;
  accept?: string[];
  onChange: (name: string, files: File[]) => void;
}) {
  const { language } = useLanguage();
  const copy = {
    en: {
      selectedSingular: "file selected",
      selectedPlural: "files selected",
      select: "Select files",
      hint: "JPG, PNG, and PDF supported where applicable. Max 5MB per file.",
    },
    ru: {
      selectedSingular: "файл выбран",
      selectedPlural: "файлов выбрано",
      select: "Выберите файлы",
      hint: "Поддерживаются JPG, PNG и PDF, где это применимо. Максимум 5MB на файл.",
    },
    ua: {
      selectedSingular: "файл обрано",
      selectedPlural: "файлів обрано",
      select: "Оберіть файли",
      hint: "Підтримуються JPG, PNG і PDF, де це застосовно. Максимум 5MB на файл.",
    },
  }[language];

  return (
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <label
        className={`flex cursor-pointer flex-col rounded-[var(--radius-sm)] border-[1.5px] border-dashed p-[var(--space-lg)] text-center transition ${
          error
            ? "border-[var(--color-hover-accent)] bg-[rgba(185,217,235,0.26)]"
            : "border-[var(--border-default)] bg-[var(--color-white)] hover:border-[var(--color-hover-accent)] hover:bg-[var(--color-mist)]"
        }`}
      >
        <span className="text-sm font-medium text-[var(--color-ink)]">
          {files.length > 0
            ? `${files.length} ${
                files.length === 1 ? copy.selectedSingular : copy.selectedPlural
              }`
            : copy.select}
        </span>
        <span className="mt-[var(--space-xs)] text-xs leading-6 text-[var(--color-ink-soft)]">
          {copy.hint}
        </span>

        <input
          type="file"
          name={name}
          multiple={multiple}
          accept={accept?.join(",")}
          onChange={(event) =>
            onChange(name, Array.from(event.target.files ?? []))
          }
          className="sr-only"
        />
      </label>

      {files.length > 0 ? (
        <div className="space-y-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-white)] p-[var(--space-sm)]">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-off-white)] px-[var(--space-sm)] py-[var(--space-xs)] text-sm text-[var(--color-ink)]"
            >
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-[var(--color-ink-soft)]">
                {formatFileSize(file.size)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </FormFieldShell>
  );
}
