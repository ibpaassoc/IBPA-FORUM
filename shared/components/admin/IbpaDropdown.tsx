"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

export type IbpaDropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

/**
 * Reusable IBPA dashboard dropdown.
 *
 * A fully custom listbox (not a native `<select>`): a glassmorphic pill trigger
 * and a portaled, rounded menu with styled option rows and a check on the
 * selected item — matching the public application form's country selector so
 * the whole product feels consistent.
 *
 * Works both as a controlled input (`value` + `onChange`) and inside native
 * forms: pass `name` and a hidden input is kept in sync so the value still
 * submits with the surrounding `<form>`.
 *
 * Reuse anywhere a dashboard filter or inline select is needed — applications,
 * jury applications, tickets, users, scores, etc.
 */
export default function IbpaDropdown({
  options,
  value,
  defaultValue,
  onChange,
  name,
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
  /** Enables native form submission via a synced hidden input. */
  name?: string;
  /** Shown on the trigger when nothing is selected. */
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const current = isControlled ? value : internalValue;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const listboxId = useId();

  const selectedOption = options.find((option) => option.value === current);
  const triggerLabel = selectedOption?.label ?? placeholder ?? "";

  useEffect(() => {
    if (!open) {
      return;
    }

    function updateMenuPosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setMenuStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);
      if (!clickedTrigger && !clickedMenu) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    updateMenuPosition();
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  function select(next: string) {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      {name ? <input type="hidden" name={name} value={current} /> : null}

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        className={clsx(
          "flex h-11 w-full items-center justify-between gap-2 rounded-full border bg-white/74 pl-4 pr-3.5 text-left text-[0.86rem] leading-none text-[var(--color-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_10px_26px_rgba(37,42,45,0.045)] outline-none backdrop-blur-xl transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]/60 focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.16)] disabled:cursor-not-allowed disabled:opacity-65",
          open
            ? "border-[var(--color-blue)] ring-4 ring-[rgba(114,160,193,0.16)]"
            : "border-[rgba(114,160,193,0.22)]",
        )}
      >
        <span
          className={clsx(
            "truncate",
            selectedOption ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]",
          )}
        >
          {triggerLabel}
        </span>
        <ChevronDown
          aria-hidden
          size={16}
          className={clsx(
            "shrink-0 text-[var(--color-ink-muted)] transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      {typeof document !== "undefined" && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              aria-label={ariaLabel}
              className={clsx(
                "fixed z-[250] overflow-hidden rounded-[22px] border border-[rgba(114,160,193,0.2)] bg-white/95 shadow-[0_24px_60px_rgba(114,160,193,0.2)] backdrop-blur-2xl transition-all duration-200",
                open
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0",
              )}
              style={{
                top: menuStyle.top,
                left: menuStyle.left,
                minWidth: menuStyle.width,
              }}
            >
              <div className="max-h-72 overflow-y-auto p-1.5">
                {options.map((option) => {
                  const checked = option.value === current;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      disabled={option.disabled}
                      onClick={() => select(option.value)}
                      className={clsx(
                        "flex w-full items-center justify-between gap-3 rounded-[16px] px-3.5 py-2.5 text-left text-[0.85rem] leading-snug transition disabled:cursor-not-allowed disabled:opacity-50",
                        checked
                          ? "bg-[var(--color-blue-wash)] font-medium text-[var(--color-ink)]"
                          : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]",
                      )}
                    >
                      <span>{option.label}</span>
                      <span
                        className={clsx(
                          "inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition",
                          checked
                            ? "border-[var(--color-blue)] bg-white text-[var(--color-blue)]"
                            : "border-transparent",
                        )}
                      >
                        {checked ? <Check size={13} strokeWidth={2.4} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
