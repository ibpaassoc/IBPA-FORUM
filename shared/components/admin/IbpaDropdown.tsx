"use client";

import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export type IbpaDropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

/**
 * Reusable IBPA dashboard dropdown.
 *
 * A styled native `<select>` with a glassmorphic pill shell and a clean chevron
 * overlay so it matches the search inputs, status tabs and buttons across the
 * admin and jury dashboards. Because it renders a real `<select>`, it works both
 * as a controlled input (`value` + `onChange`) and inside native forms
 * (`name` + `defaultValue`), and gets the native mobile picker for free.
 *
 * Reuse anywhere a dashboard filter or inline select is needed — applications,
 * jury applications, tickets, users, scores, etc.
 */
export const ibpaDropdownClass =
  "h-11 w-full cursor-pointer appearance-none rounded-full border border-[rgba(114,160,193,0.22)] bg-white/74 pl-4 pr-10 text-[0.86rem] leading-none text-[var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_26px_rgba(37,42,45,0.045)] outline-none backdrop-blur-xl transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]/60 focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)] disabled:cursor-not-allowed disabled:opacity-65";

export default function IbpaDropdown({
  options,
  value,
  defaultValue,
  onChange,
  name,
  id,
  placeholder,
  disabled,
  ariaLabel,
  className,
}: {
  options: IbpaDropdownOption[];
  /** Selected value for controlled usage. */
  value?: string;
  /** Initial value for uncontrolled / native-form usage. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Enables native form submission. */
  name?: string;
  id?: string;
  /** Rendered as a leading option when the list has no empty-value option. */
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <label className={clsx("relative block", className)}>
      <select
        name={name}
        id={id}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className={ibpaDropdownClass}
      >
        {placeholder ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
      />
    </label>
  );
}
