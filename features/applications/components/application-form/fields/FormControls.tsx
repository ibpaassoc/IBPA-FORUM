"use client";

import FormFieldShell from "@/features/applications/components/application-form/fields/FormFieldShell";
import type { FieldOption } from "@/features/applications/types/application.types";

const inputClassName =
  "w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] text-[var(--color-navy)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)]";

const errorClassName = "border-[var(--color-hover)] focus:border-[var(--color-hover)]";

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
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
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
        onChange={(event) => onChange(name, event.target.value)}
        className={`${inputClassName} ${error ? errorClassName : ""} ${
          readOnly ? "cursor-not-allowed bg-[var(--color-mist)] text-[var(--color-steel)]" : ""
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
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
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <textarea
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
        className={`min-h-36 w-full rounded-[var(--radius-sm)] border-[1.5px] border-[var(--border-default)] bg-[var(--color-white)] px-[clamp(0.75rem,1.5vw,1rem)] py-[clamp(0.6rem,1.2vw,0.85rem)] text-[clamp(0.82rem,1.2vw,0.95rem)] leading-6 text-[var(--color-navy)] outline-none transition placeholder:text-[rgba(74,96,128,0.4)] focus:border-[var(--color-hover)] focus:shadow-[0_0_0_3px_rgba(114,160,193,0.16)] ${
          error ? errorClassName : ""
        }`}
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
  return (
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <div className="relative">
        <select
          name={name}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(name, event.target.value)}
          className={`${inputClassName} appearance-none pr-10 ${
            error ? errorClassName : ""
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <option value="" className="bg-[var(--color-white)] text-[var(--color-navy)]">
            {placeholder ?? "Select an option"}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[var(--color-white)] text-[var(--color-navy)]"
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-[var(--space-sm)] flex items-center text-[var(--color-steel)]">
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
  const selectedValues = Array.isArray(value) ? value : [value];

  return (
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selectedValues.includes(option.value);

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border px-[var(--space-sm)] py-[var(--space-sm)] text-sm transition ${
                checked
                  ? "border-[var(--color-hover)] bg-[rgba(185,217,235,0.26)] text-[var(--color-navy)]"
                  : "border-[var(--border-default)] bg-[var(--color-white)] text-[var(--color-navy)] hover:border-[var(--color-hover)] hover:bg-[var(--color-mist)]"
              }`}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                checked={checked}
                value={option.value}
                onChange={() => {
                  if (multiple) {
                    const next = checked
                      ? selectedValues.filter((item) => item !== option.value)
                      : [...selectedValues.filter(Boolean), option.value];
                    onChange(name, next);
                    return;
                  }

                  onChange(name, option.value);
                }}
                className="h-4 w-4 accent-[var(--color-hover)]"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </FormFieldShell>
  );
}
