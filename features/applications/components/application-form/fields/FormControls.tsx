"use client";

import FormFieldShell from "@/features/applications/components/application-form/fields/FormFieldShell";
import type { FieldOption } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const base =
  "w-full rounded-[14px] border-2 border-transparent bg-[var(--surface-muted)] px-5 py-[1.05rem] text-[1rem] text-[var(--color-ink)] outline-none transition-all duration-200 placeholder:text-[var(--color-ink)]/30 focus:border-[var(--color-hover-accent)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(114,160,193,0.14)]";

const errorCls = "!border-red-300 !bg-red-50/60 focus:!border-red-400 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.1)]";

export function TextField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required,
  description,
  error,
  disabled,
  min,
  max,
  onChange,
  onBlur,
  readOnly,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "url" | "number";
  value: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  error?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  onChange: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  readOnly?: boolean;
}) {
  return (
    <FormFieldShell label={label} required={required} description={description} error={error}>
      <input
        name={name}
        type={type}
        value={value}
        min={min}
        max={max}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        onBlur={() => onBlur?.(name)}
        onChange={(e) => onChange(name, e.target.value)}
        className={`${base} ${error ? errorCls : ""} ${readOnly ? "cursor-not-allowed bg-[var(--surface-muted)] text-[var(--color-ink-soft)]" : ""} ${disabled ? "cursor-not-allowed opacity-55" : ""}`}
      />
    </FormFieldShell>
  );
}

export function TextareaField({
  label,
  name,
  value,
  rows = 5,
  placeholder,
  required,
  description,
  error,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  description?: string;
  error?: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <FormFieldShell label={label} required={required} description={description} error={error}>
      <textarea
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        className={`min-h-32 resize-y ${base} ${error ? errorCls : ""}`}
      />
    </FormFieldShell>
  );
}

export function SelectField({
  label,
  name,
  value,
  options,
  placeholder,
  required,
  description,
  error,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: FieldOption[];
  placeholder?: string;
  required?: boolean;
  description?: string;
  error?: string;
  disabled?: boolean;
  onChange: (name: string, value: string) => void;
}) {
  const { language } = useLanguage();
  const fallback =
    language === "ru" ? "Выберите вариант" : language === "ua" ? "Оберіть варіант" : "Select an option";

  return (
    <FormFieldShell label={label} required={required} description={description} error={error}>
      <div className="relative">
        <select
          name={name}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${base} appearance-none pr-10 ${error ? errorCls : ""} ${disabled ? "cursor-not-allowed opacity-55" : ""}`}
        >
          <option value="">{placeholder ?? fallback}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--color-ink)]/40 text-xs">
          ▾
        </span>
      </div>
    </FormFieldShell>
  );
}

export function ChoiceGroupField({
  label,
  name,
  value,
  options,
  required,
  description,
  error,
  multiple = false,
  onChange,
}: {
  label: string;
  name: string;
  value: string | string[];
  options: FieldOption[];
  required?: boolean;
  description?: string;
  error?: string;
  multiple?: boolean;
  onChange: (name: string, value: string | string[]) => void;
}) {
  const selected = Array.isArray(value) ? value : [value];

  return (
    <FormFieldShell label={label} required={required} description={description} error={error}>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-[14px] border-2 px-5 py-4 text-[0.93rem] transition-all duration-200 ${
                checked
                  ? "border-[var(--color-hover-accent)] bg-[rgba(114,160,193,0.08)] text-[var(--color-ink)]"
                  : "border-transparent bg-[var(--surface-muted)] text-[var(--color-ink)] hover:border-[var(--color-hover-accent)]/30 hover:bg-white"
              }`}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                checked={checked}
                value={option.value}
                onChange={() => {
                  if (multiple) {
                    onChange(name, checked ? selected.filter((v) => v !== option.value) : [...selected.filter(Boolean), option.value]);
                  } else {
                    onChange(name, option.value);
                  }
                }}
                className="h-4 w-4 accent-[var(--color-hover-accent)]"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </FormFieldShell>
  );
}
