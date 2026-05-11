"use client";

import FormFieldShell from "@/features/applications/components/application-form/fields/FormFieldShell";

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
            ? "border-[var(--color-hover)] bg-[rgba(185,217,235,0.26)]"
            : "border-[var(--border-default)] bg-[var(--color-white)] hover:border-[var(--color-hover)] hover:bg-[var(--color-mist)]"
        }`}
      >
        <span className="text-sm font-medium text-[var(--color-navy)]">
          {files.length > 0
            ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
            : "Select files"}
        </span>
        <span className="mt-[var(--space-xs)] text-xs leading-6 text-[var(--color-steel)]">
          JPG, PNG, and PDF supported where applicable. Max 5MB per file.
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
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-off-white)] px-[var(--space-sm)] py-[var(--space-xs)] text-sm text-[var(--color-navy)]"
            >
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-[var(--color-steel)]">
                {formatFileSize(file.size)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </FormFieldShell>
  );
}
