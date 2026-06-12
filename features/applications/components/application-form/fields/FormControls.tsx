"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import FormFieldShell from "@/features/applications/components/application-form/fields/FormFieldShell";
import type { FieldOption } from "@/features/applications/types/application.types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const baseField =
  "w-full rounded-[24px] border border-black/10 bg-white px-5 py-4 text-[0.96rem] text-[var(--color-ink)] shadow-[0_12px_30px_rgba(3,2,19,0.04)] outline-none transition-[border-color,box-shadow,background-color,transform] duration-300 placeholder:text-[var(--color-ink)]/34 hover:border-black/22 focus:border-[var(--color-ink)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(3,2,19,0.06)]";

const disabledField =
  "cursor-not-allowed bg-black/[0.03] text-[var(--color-ink-soft)] opacity-70";

const errorField =
  "!border-red-300 !bg-red-50/70 focus:!border-red-400 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.1)]";

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
        inputMode={type === "number" ? "numeric" : undefined}
        onBlur={() => onBlur?.(name)}
        onChange={(event) => onChange(name, event.target.value)}
        className={`${baseField} ${error ? errorField : ""} ${readOnly ? disabledField : ""} ${disabled ? disabledField : ""}`}
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
        className={`min-h-32 resize-y ${baseField} ${error ? errorField : ""}`}
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value);
  const fallback =
    language === "ru"
      ? "Select an option"
      : language === "ua"
        ? "Select an option"
        : "Select an option";

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <div ref={containerRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setOpen((current) => !current);
            }
          }}
          className={`${baseField} flex items-center justify-between gap-3 text-left ${error ? errorField : ""} ${disabled ? disabledField : ""}`}
        >
          <span
            className={
              selectedOption ? "text-[var(--color-ink)]" : "text-[var(--color-ink)]/38"
            }
          >
            {selectedOption?.label ?? placeholder ?? fallback}
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-[var(--color-ink)]/48 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className={`absolute left-0 right-0 top-[calc(100%+0.6rem)] z-30 overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(3,2,19,0.12)] transition-all duration-300 ${open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"}`}
        >
          <div className="max-h-64 overflow-y-auto p-2">
            <button
              type="button"
              onClick={() => {
                onChange(name, "");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-sm transition ${!value ? "bg-black text-white" : "text-[var(--color-ink-soft)] hover:bg-black/[0.04] hover:text-[var(--color-ink)]"}`}
            >
              <span>{placeholder ?? fallback}</span>
              {!value ? <Check size={16} /> : null}
            </button>

            {options.map((option) => {
              const checked = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={checked}
                  onClick={() => {
                    onChange(name, option.value);
                    setOpen(false);
                  }}
                  className={`mt-1 flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-sm transition ${checked ? "bg-black text-white" : "text-[var(--color-ink)] hover:bg-black/[0.04]"}`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition ${checked ? "border-white/30 bg-white/10" : "border-black/10 bg-black/[0.03]"}`}
                  >
                    {checked ? <Check size={13} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
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
    <FormFieldShell
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option.value);

          return (
            <label
              key={option.value}
              className={`group flex cursor-pointer items-center gap-3 rounded-[22px] border px-5 py-4 text-[0.93rem] transition-all duration-300 ${checked ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white shadow-[0_18px_40px_rgba(3,2,19,0.12)]" : "border-black/10 bg-white text-[var(--color-ink)] shadow-[0_12px_30px_rgba(3,2,19,0.04)] hover:border-black/24"}`}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                checked={checked}
                value={option.value}
                onChange={() => {
                  if (multiple) {
                    onChange(
                      name,
                      checked
                        ? selected.filter((item) => item !== option.value)
                        : [...selected.filter(Boolean), option.value]
                    );
                  } else {
                    onChange(name, option.value);
                  }
                }}
                className="sr-only"
              />
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${checked ? "border-white/40 bg-white/10 text-white" : "border-black/16 bg-black/[0.03] text-transparent group-hover:border-black/28"}`}
              >
                {multiple ? (
                  <Check size={13} />
                ) : (
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition ${checked ? "bg-white" : "bg-transparent"}`}
                  />
                )}
              </span>
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </FormFieldShell>
  );
}
