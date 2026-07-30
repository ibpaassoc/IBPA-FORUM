"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { updateJuryApprovedCategoriesAction } from "@/features/admin/actions/jury.actions";

type PopupPosition = {
  top: number;
  left: number;
  width: number;
};

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
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [savedCategories, setSavedCategories] = useState(approvedCategories);
  const [draftCategories, setDraftCategories] = useState(approvedCategories);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    function updatePopupPosition() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewportPadding = 12;
      const width = Math.min(400, window.innerWidth - viewportPadding * 2);
      const left = Math.min(
        Math.max(rect.left, viewportPadding),
        window.innerWidth - width - viewportPadding,
      );

      setPopupPosition({
        top: rect.bottom + 8,
        left,
        width,
      });
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !popupRef.current?.contains(target)
      ) {
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

    updatePopupPosition();
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
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
      setError("Выберите хотя бы одну одобренную категорию.");
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
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
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
            Одобренные категории
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
                {checked ? (
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-[var(--color-blue)] bg-white text-[var(--color-blue)]">
                    <Check aria-hidden size={10} strokeWidth={2} />
                  </span>
                ) : null}
                {category}
              </span>
            );
          })}
        </span>
      </button>

      {open && popupPosition && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popupRef}
              role="dialog"
              aria-label="Выберите одобренные категории судьи"
              className="fixed z-[250] rounded-[24px] border border-[rgba(114,160,193,0.24)] bg-white/96 p-4 shadow-[0_24px_70px_rgba(37,42,45,0.18)] backdrop-blur-2xl"
              style={popupPosition}
            >
              <p className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">
                Категории для судейства
              </p>

              <div className="mt-4 grid gap-2">
                {expertiseAreas.map((category) => {
                  const checked = draftCategories.includes(category);
                  return (
                    <label
                      key={category}
                      className={`group flex cursor-pointer items-center gap-3 rounded-[16px] border px-3 py-2.5 text-sm transition ${
                        checked
                          ? "border-[rgba(114,160,193,0.36)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
                          : "border-[rgba(37,42,45,0.08)] bg-white text-[var(--color-ink-soft)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(category)}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                          checked
                            ? "border-[var(--color-blue)] bg-white text-[var(--color-blue)]"
                            : "border-[var(--border-soft)] bg-[var(--surface-tint)] text-transparent group-hover:border-[var(--color-blue)]/40"
                        }`}
                      >
                        <Check aria-hidden size={13} strokeWidth={2} />
                      </span>
                      <span className="flex-1">{category}</span>
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
                  Отмена
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={save}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#4d86ad] disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 aria-hidden size={14} className="animate-spin" />
                  ) : null}
                  Сохранить
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
