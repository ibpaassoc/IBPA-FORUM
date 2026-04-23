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
        className={`flex cursor-pointer flex-col rounded-[1.6rem] border border-dashed px-4 py-5 transition ${
          error
            ? "border-[#8a3f3f] bg-[#2a1717]/50"
            : "border-[#d8c27a]/22 bg-[linear-gradient(135deg,rgba(216,194,122,0.09),rgba(255,255,255,0.03))] hover:border-[#d8c27a]/42 hover:bg-[linear-gradient(135deg,rgba(216,194,122,0.12),rgba(255,255,255,0.05))]"
        }`}
      >
        <span className="text-sm font-medium text-white">
          {files.length > 0
            ? `${files.length} file${files.length === 1 ? "" : "s"} selected`
            : "Select files"}
        </span>
        <span className="mt-2 text-xs leading-6 text-[#d9d4ca]/72">
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
        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-[#efe6d0]"
            >
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-xs text-white/45">
                {formatFileSize(file.size)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </FormFieldShell>
  );
}
