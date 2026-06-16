"use client";

import { useState } from "react";
import FormFieldShell from "@/features/applications/components/application-form/fields/FormFieldShell";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ImageIcon, FileText, X, Loader2 } from "lucide-react";

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const COMPRESS_QUALITY = 0.78;
const COMPRESS_MAX_DIM = 2400;

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > COMPRESS_MAX_DIM || height > COMPRESS_MAX_DIM) {
        if (width > height) {
          height = Math.round((height * COMPRESS_MAX_DIM) / width);
          width = COMPRESS_MAX_DIM;
        } else {
          width = Math.round((width * COMPRESS_MAX_DIM) / height);
          height = COMPRESS_MAX_DIM;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        COMPRESS_QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

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
  const [compressing, setCompressing] = useState(false);

  const copy = {
    en: {
      selectedSingular: "file selected",
      selectedPlural: "files selected",
      select: "Click to select files",
      drag: "or drag and drop",
      hint: "JPG, PNG, PDF supported · Large images are auto-compressed",
      compressing: "Compressing…",
      remove: "Remove",
    },
    ru: {
      selectedSingular: "файл выбран",
      selectedPlural: "файлов выбрано",
      select: "Нажмите для выбора файлов",
      drag: "или перетащите сюда",
      hint: "JPG, PNG, PDF · Большие изображения сжимаются автоматически",
      compressing: "Сжатие…",
      remove: "Удалить",
    },
    ua: {
      selectedSingular: "файл обрано",
      selectedPlural: "файлів обрано",
      select: "Натисніть для вибору файлів",
      drag: "або перетягніть сюди",
      hint: "JPG, PNG, PDF · Великі зображення стискаються автоматично",
      compressing: "Стиснення…",
      remove: "Видалити",
    },
  }[language];

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = Array.from(event.target.files ?? []);
    if (!raw.length) return;
    setCompressing(true);
    const processed = await Promise.all(
      raw.map(async (file) => {
        if (IMAGE_TYPES.includes(file.type) && file.size > MAX_BYTES) {
          return compressImage(file);
        }
        return file;
      })
    );
    setCompressing(false);
    onChange(name, [...files, ...processed]);
    // reset input so the same file can be re-selected if removed
    event.target.value = "";
  }

  function removeFile(index: number) {
    onChange(name, files.filter((_, i) => i !== index));
  }

  const hasFiles = files.length > 0;

  return (
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <label
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-sm)] border-[1.5px] border-dashed px-[var(--space-md)] py-[var(--space-lg)] text-center transition ${
          error
            ? "border-red-300 bg-red-50"
            : "border-[var(--border-default)] bg-[var(--color-white)] hover:border-[var(--color-hover-accent)] hover:bg-[var(--color-mist)]"
        }`}
      >
        {compressing ? (
          <Loader2 size={22} className="animate-spin text-[var(--color-hover-accent)]" />
        ) : hasFiles ? (
          <FileText size={22} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />
        ) : (
          <ImageIcon size={22} className="text-[var(--color-ink)]/30" strokeWidth={1.5} />
        )}

        <div>
          <p className="text-[0.88rem] font-medium text-[var(--color-ink)]">
            {compressing
              ? copy.compressing
              : hasFiles
                ? `${files.length} ${files.length === 1 ? copy.selectedSingular : copy.selectedPlural}`
                : copy.select}
          </p>
          {!compressing && !hasFiles ? (
            <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{copy.drag}</p>
          ) : null}
        </div>

        <p className="text-[0.72rem] text-[var(--color-ink)]/40">{copy.hint}</p>

        <input
          type="file"
          name={name}
          multiple={multiple}
          accept={accept?.join(",")}
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      {hasFiles ? (
        <ul className="mt-2 space-y-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-off-white)] px-[var(--space-sm)] py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                {IMAGE_TYPES.includes(file.type) ? (
                  <ImageIcon size={14} className="shrink-0 text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                ) : (
                  <FileText size={14} className="shrink-0 text-[var(--color-ink-soft)]" strokeWidth={1.5} />
                )}
                <span className="truncate text-[var(--color-ink)]">{file.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-[var(--color-ink-soft)]">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`${copy.remove} ${file.name}`}
                  className="rounded p-0.5 text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
                >
                  <X size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </FormFieldShell>
  );
}
