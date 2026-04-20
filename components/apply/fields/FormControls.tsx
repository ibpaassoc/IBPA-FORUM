"use client";

import FormFieldShell from "@/components/apply/fields/FormFieldShell";
import type { FieldOption } from "@/lib/apply/types";

const inputClassName =
  "w-full rounded-2xl border border-white/12 bg-[#17181b]/90 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#d8c27a] focus:bg-[#1a1b1e]";

const errorClassName = "border-[#8a3f3f] bg-[#2a1717]/80 focus:border-[#c46f6f]";

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
          readOnly ? "cursor-not-allowed bg-white/[0.08] text-[#f1df9a]" : ""
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
        className={`min-h-36 w-full rounded-2xl border border-white/12 bg-[#17181b]/90 px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-[#d8c27a] focus:bg-[#1a1b1e] ${
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
          <option value="" className="bg-[#101010] text-white">
            {placeholder ?? "Select an option"}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#101010] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/40">
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
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                checked
                  ? "border-[#d8c27a]/45 bg-[#d8c27a]/10 text-white"
                  : "border-white/10 bg-white/5 text-[#efe6d0] hover:border-[#d8c27a]/25 hover:bg-white/7"
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
                className="h-4 w-4 accent-[#d8c27a]"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </FormFieldShell>
  );
}
