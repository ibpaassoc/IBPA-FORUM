"use client";

import { useState } from "react";
import FormFieldShell from "@/features/applications/components/application-form/fields/FormFieldShell";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type { ApplicationFileRef } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { ImageIcon, FileText, X, Loader2, RefreshCw, Lock, UploadCloud } from "lucide-react";

const COMPRESS_QUALITY = 0.78;
const COMPRESS_MAX_DIM = 2400;

/**
 * A file attached to an upload field: either a freshly selected browser File
 * (not yet uploaded) or a reference to a file already stored in Vercel Blob.
 */
export type UploadFieldItem = File | ApplicationFileRef;

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function itemName(item: UploadFieldItem) {
  return item instanceof File ? item.name : item.fileName;
}

function itemSize(item: UploadFieldItem) {
  return item instanceof File ? item.size : item.fileSize;
}

function itemMimeType(item: UploadFieldItem) {
  return item instanceof File ? item.type : item.mimeType;
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

/**
 * Shared applicant upload control. Handles freshly selected Files (with
 * client-side image compression) and already-uploaded Blob references in the
 * same list, so the public application form and the account nomination editor
 * share one upload experience.
 */
export function ApplicantUploadField({
  label,
  name,
  items,
  required,
  description,
  error,
  multiple = false,
  maxFiles,
  accept,
  disabled = false,
  tone = "plain",
  onChange,
}: {
  label: string;
  name: string;
  items: UploadFieldItem[];
  required?: boolean;
  description?: string;
  error?: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string[];
  disabled?: boolean;
  tone?: "plain" | "glass";
  onChange: (name: string, items: UploadFieldItem[]) => void;
}) {
  const { language } = useLanguage();
  const [compressing, setCompressing] = useState(false);

  const copy = {
    en: {
      selectedSingular: "file selected",
      selectedPlural: "files selected",
      select: "Click to select files",
      selectOne: "Click to select a file",
      drag: "or drag and drop",
      hint: "JPG, PNG, PDF supported · Images are auto-compressed",
      compressing: "Compressing…",
      remove: "Remove",
      replace: "Click to replace",
      addMore: "Click to add more",
      limitReached: "Maximum reached",
      locked: "Uploads are locked",
      uploaded: "Uploaded",
      of: "of",
    },
    ru: {
      selectedSingular: "файл выбран",
      selectedPlural: "файлов выбрано",
      select: "Нажмите для выбора файлов",
      selectOne: "Нажмите для выбора файла",
      drag: "или перетащите сюда",
      hint: "JPG, PNG, PDF · Изображения сжимаются автоматически",
      compressing: "Сжатие…",
      remove: "Удалить",
      replace: "Нажмите для замены",
      addMore: "Нажмите, чтобы добавить ещё",
      limitReached: "Максимум достигнут",
      locked: "Загрузка заблокирована",
      uploaded: "Загружено",
      of: "из",
    },
    ua: {
      selectedSingular: "файл обрано",
      selectedPlural: "файлів обрано",
      select: "Натисніть для вибору файлів",
      selectOne: "Натисніть для вибору файлу",
      drag: "або перетягніть сюди",
      hint: "JPG, PNG, PDF · Зображення стискаються автоматично",
      compressing: "Стиснення…",
      remove: "Видалити",
      replace: "Натисніть для заміни",
      addMore: "Натисніть, щоб додати ще",
      limitReached: "Максимум досягнуто",
      locked: "Завантаження заблоковано",
      uploaded: "Завантажено",
      of: "з",
    },
  }[language];

  const atLimit = multiple && maxFiles !== undefined && items.length >= maxFiles;
  const hasFiles = items.length > 0;
  const zoneDisabled = disabled || atLimit;

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = Array.from(event.target.files ?? []);
    if (!raw.length) return;
    setCompressing(true);
    const processed = await Promise.all(
      raw.map(async (file) => {
        if (IMAGE_TYPES.includes(file.type)) {
          return compressImage(file);
        }
        return file;
      })
    );
    setCompressing(false);

    if (!multiple) {
      // Single-file mode: always replace
      onChange(name, processed.slice(0, 1));
    } else {
      // Multi-file mode: append up to maxFiles
      const remaining = maxFiles !== undefined ? maxFiles - items.length : Infinity;
      const toAdd = processed.slice(0, remaining > 0 ? remaining : 0);
      onChange(name, [...items, ...toAdd]);
    }
    event.target.value = "";
  }

  function removeItem(index: number) {
    onChange(name, items.filter((_, i) => i !== index));
  }

  function getZoneLabel() {
    if (disabled) return copy.locked;
    if (compressing) return copy.compressing;
    if (atLimit) return copy.limitReached;
    if (!hasFiles) return multiple ? copy.select : copy.selectOne;
    if (!multiple) return copy.replace;
    return copy.addMore;
  }

  function getZoneIcon() {
    if (disabled) return <Lock size={22} className="text-[var(--color-ink)]/25" strokeWidth={1.5} />;
    if (compressing) return <Loader2 size={22} className="animate-spin text-[var(--color-hover-accent)]" />;
    if (atLimit) return <Lock size={22} className="text-[var(--color-ink)]/25" strokeWidth={1.5} />;
    if (!hasFiles) {
      return tone === "glass" ? (
        <UploadCloud size={22} className="text-[var(--color-blue)]" strokeWidth={1.5} />
      ) : (
        <ImageIcon size={22} className="text-[var(--color-ink)]/30" strokeWidth={1.5} />
      );
    }
    if (!multiple) return <RefreshCw size={22} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />;
    return <FileText size={22} className="text-[var(--color-hover-accent)]" strokeWidth={1.5} />;
  }

  const zoneBase =
    tone === "glass"
      ? "flex flex-col items-center gap-2 rounded-[20px] border-[1.5px] border-dashed px-4 py-6 text-center backdrop-blur-xl transition"
      : "flex flex-col items-center gap-2 rounded-[var(--radius-sm)] border-[1.5px] border-dashed px-[var(--space-md)] py-[var(--space-lg)] text-center transition";
  const zoneStyle = zoneDisabled
    ? `${zoneBase} cursor-not-allowed border-[var(--border-default)] ${tone === "glass" ? "bg-white/45" : "bg-[var(--color-off-white)]"} opacity-50`
    : error
      ? `${zoneBase} cursor-pointer border-red-300 bg-red-50`
      : tone === "glass"
        ? `${zoneBase}
            cursor-pointer
            border-[rgba(114,160,193,0.42)]
            bg-[rgba(185,217,235,0.14)]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]
            hover:border-[var(--color-blue)]
            hover:bg-[rgba(185,217,235,0.28)]`
        : `${zoneBase}
            cursor-pointer
            border-[var(--border-default)]
            bg-[var(--color-white)]
            hover:border-[var(--color-blue)]/40
            hover:bg-[rgba(185,217,235,0.22)]`;
  return (
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <label className={zoneStyle}>
        {getZoneIcon()}

        <div>
          <p className="text-[0.88rem] font-medium text-[var(--color-ink)]">
            {getZoneLabel()}
          </p>
          {!compressing && !hasFiles && !zoneDisabled ? (
            <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{copy.drag}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <p className="text-[0.72rem] text-[var(--color-ink)]/40">{copy.hint}</p>
          {multiple && maxFiles !== undefined && hasFiles ? (
            <p className="text-[0.72rem] font-medium text-[var(--color-ink)]/50">
              {items.length} {copy.of} {maxFiles}
            </p>
          ) : null}
        </div>

        <input
          type="file"
          name={name}
          multiple={multiple}
          accept={accept?.join(",")}
          disabled={zoneDisabled}
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      {hasFiles ? (
        <ul className="mt-2 space-y-1.5">
          {items.map((item, index) => (
            <li
              key={`${itemName(item)}-${itemSize(item)}-${index}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-blue)]/12 bg-white/80 px-4 py-3 text-sm shadow-[0_10px_30px_rgba(42,66,82,0.04)] backdrop-blur-xl transition hover:border-[var(--color-blue)]/30 hover:bg-[var(--color-blue-wash)]/30"
            >
              <div className="flex min-w-0 items-center gap-2">
                {IMAGE_TYPES.includes(itemMimeType(item)) ? (
                  <ImageIcon size={14} className="shrink-0 text-[var(--color-hover-accent)]" strokeWidth={1.5} />
                ) : (
                  <FileText size={14} className="shrink-0 text-[var(--color-ink-soft)]" strokeWidth={1.5} />
                )}
                <span className="truncate text-[var(--color-ink)]">{itemName(item)}</span>
                {isApplicationFileRef(item) ? (
                  <span className="shrink-0 rounded-full border border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#356f98]">
                    {copy.uploaded}
                  </span>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-[var(--color-ink-soft)]">{formatFileSize(itemSize(item))}</span>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    aria-label={`${copy.remove} ${itemName(item)}`}
                    className="rounded p-0.5 text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </FormFieldShell>
  );
}

/**
 * Original File[]-only API used by the public application and jury forms.
 * Thin wrapper over ApplicantUploadField so both flows share one component.
 */
export default function UploadField({
  label,
  name,
  files,
  required,
  description,
  error,
  multiple = false,
  maxFiles,
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
  maxFiles?: number;
  accept?: string[];
  onChange: (name: string, files: File[]) => void;
}) {
  return (
    <ApplicantUploadField
      label={label}
      name={name}
      items={files}
      required={required}
      description={description}
      error={error}
      multiple={multiple}
      maxFiles={maxFiles}
      accept={accept}
      onChange={(fieldName, items) =>
        onChange(fieldName, items.filter((item): item is File => item instanceof File))
      }
    />
  );
}
