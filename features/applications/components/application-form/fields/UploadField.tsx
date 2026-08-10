"use client";

import { useMemo, useState } from "react";
import FormFieldShell from "@/features/applications/components/application-form/fields/FormFieldShell";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";
import type { ApplicationFileRef } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import FilePreviewGallery from "@/shared/components/files/FilePreviewGallery";
import { ImageIcon, FileText, Loader2, RefreshCw, Lock, UploadCloud } from "lucide-react";
import {
  getUploadThumbnail,
  processUploadImage,
} from "@/features/applications/client/image-processing";

/**
 * A file attached to an upload field: either a freshly selected browser File
 * (not yet uploaded) or a reference to a file already stored in Vercel Blob.
 */
export type UploadFieldItem = File | ApplicationFileRef;

function itemName(item: UploadFieldItem) {
  return item instanceof File ? item.name : item.fileName;
}

function itemSize(item: UploadFieldItem) {
  return item instanceof File ? item.size : item.fileSize;
}

function itemMimeType(item: UploadFieldItem) {
  return item instanceof File ? item.type : item.mimeType;
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
  const acceptsVideo = accept?.some((type) => type.startsWith("video/"));
  const acceptedFileHint = acceptsVideo ? "MP4, WebM, or MOV video" : copy.hint;
  const previewItems = useMemo(
    () =>
      items.map((item, index) => ({
        id: isApplicationFileRef(item)
          ? `stored-${item.fileUrl}-${index}`
          : `local-${item.name}-${item.size}-${item.lastModified}-${index}`,
        name: itemName(item),
        size: itemSize(item),
        mimeType: itemMimeType(item),
        source: isApplicationFileRef(item) ? item.previewUrl ?? item.fileUrl : item,
        thumbnailSource: isApplicationFileRef(item)
          ? item.thumbnailUrl ?? item.previewUrl ?? item.fileUrl
          : getUploadThumbnail(item) ?? item,
      })),
    [items],
  );

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = Array.from(event.target.files ?? []);
    if (!raw.length) return;
    setCompressing(true);
    // Decoding several full-resolution iPhone photos at once can exhaust
    // mobile Safari's memory. Compress one image at a time; the upload queue
    // will still transfer the resulting files with bounded concurrency.
    const processed: File[] = [];
    for (const file of raw) {
      processed.push(
        IMAGE_TYPES.includes(file.type) ? await processUploadImage(file) : file,
      );
    }
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

        <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
          <p className="text-[0.72rem] text-[var(--color-ink)]/40">{acceptedFileHint}</p>
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
        <FilePreviewGallery
          items={previewItems}
          onRemove={disabled ? undefined : (id) => removeItem(previewItems.findIndex((item) => item.id === id))}
          className="mt-3"
          groupLabel={label}
          // Before/after uploads are read as ordered couples, so preview them
          // the same way the jury will see them.
          pairing={name === "beforeAfterPhotos" ? "before-after" : undefined}
        />
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
