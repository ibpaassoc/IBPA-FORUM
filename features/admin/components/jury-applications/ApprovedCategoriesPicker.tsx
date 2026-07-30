"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { updateJuryApprovedCategoriesAction } from "@/features/admin/actions/jury.actions";

export default function ApprovedCategoriesPicker({
  applicationId,
  expertiseAreas,
  approvedCategories,
  className = "",
}: {
  applicationId: string;
  expertiseAreas: string[];
  approvedCategories: string[];
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [savedCategories, setSavedCategories] = useState(approvedCategories);
  const [draftCategories, setDraftCategories] = useState(approvedCategories);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setDraftCategories(savedCategories);
        setError(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setDraftCategories(savedCategories);
        setError(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, savedCategories]);

  function toggleCategory(category: string) {
    setError(null);
    setDraftCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function save() {
    if (draftCategories.length === 0) {
      setError("Select at least one approved category.");
      return;
    }

    startTransition(async () => {
      const result = await updateJuryApprovedCategoriesAction(
        applicationId,
        draftCategories,
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSavedCategories(result.approvedCategories);
      setDraftCategories(result.approvedCategories);
      setError(null);
      setOpen(false);
    });
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setDraftCategories(savedCategories);
          setError(null);
          setOpen((current) => !current);
        }}
        className="group/categories w-full rounded-[20px] border border-[rgba(114,160,193,0.18)] bg-white/62 p-3 text-left transition hover:border-[rgba(114,160,193,0.42)] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
            Approved categories
          </span>
          <ChevronDown
            aria-hidden
            size={15}
            className={`shrink-0 text-[var(--color-blue)] transition ${open ? "rotate-180" : ""}`}
          />
        </span>
        <span className="mt-2 flex flex-wrap gap-1.5">
          {expertiseAreas.map((category) => {
            const checked = savedCategories.includes(category);
            return (
              <span
                key={category}
                className={`inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase leading-none tracking-[0.08em] transition ${
                  checked
                    ? "border-[rgba(114,160,193,0.38)] bg-[var(--color-blue-wash)] text-[#356f98]"
                    : "border-[rgba(37,42,45,0.1)] bg-white/72 text-[var(--color-ink-muted)] opacity-60"
                }`}
              >
                {checked ? <Check aria-hidden size={11} strokeWidth={2.5} /> : null}
                {category}
              </span>
            );
          })}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose approved judge categories"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(25rem,calc(100vw-2.5rem))] rounded-[24px] border border-[rgba(114,160,193,0.24)] bg-white/96 p-4 shadow-[0_24px_70px_rgba(37,42,45,0.18)] backdrop-blur-2xl"
        >
          <p className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">
            Judge category access
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">
            Checked categories will be visible in this judge&apos;s account. Keep at least one checked.
          </p>

          <div className="mt-4 grid gap-2">
            {expertiseAreas.map((category) => {
              const checked = draftCategories.includes(category);
              return (
                <label
                  key={category}
                  className={`flex cursor-pointer items-center gap-3 rounded-[16px] border px-3 py-2.5 text-sm transition ${
                    checked
                      ? "border-[rgba(114,160,193,0.36)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
                      : "border-[rgba(37,42,45,0.08)] bg-white text-[var(--color-ink-soft)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(category)}
                    className="size-4 accent-[var(--color-blue)]"
                  />
                  <span className="flex-1">{category}</span>
                  {checked ? <Check aria-hidden size={15} className="text-[var(--color-blue)]" /> : null}
                </label>
              );
            })}
          </div>

          {error ? (
            <p role="alert" className="mt-3 text-xs font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                setDraftCategories(savedCategories);
                setError(null);
              }}
              className="min-h-10 rounded-full border border-[rgba(114,160,193,0.22)] bg-white px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)] transition hover:bg-[var(--color-blue-wash)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#4d86ad] disabled:opacity-50"
            >
              {pending ? <Loader2 aria-hidden size={14} className="animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
