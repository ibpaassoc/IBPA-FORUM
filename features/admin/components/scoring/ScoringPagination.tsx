"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { adminT } from "@/lib/i18n/admin";
import IbpaDropdown from "@/shared/components/admin/IbpaDropdown";

const SCORING_BASE_PATH = "/admin/scoring";

/** Номера страниц с многоточиями: 1 … n-1 n n+1 … last. */
function getPageItems(page: number, totalPages: number): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set<number>([1, totalPages, page]);
  if (page - 1 > 1) items.add(page - 1);
  if (page + 1 < totalPages) items.add(page + 1);

  const sorted = [...items].sort((left, right) => left - right);
  const result: Array<number | "gap"> = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) {
      result.push("gap");
    }
    result.push(value);
  });

  return result;
}

/**
 * Пагинация списка номинаций: страницы и размер страницы.
 * Фильтры лежат в query-параметрах, поэтому переключение страницы сохраняет
 * текущие фильтры и меняет только `page`/`perPage`.
 */
export default function ScoringPagination({
  page,
  perPage,
  totalPages,
  totalCount,
  pageSizes,
  query,
}: {
  page: number;
  perPage: number;
  totalPages: number;
  totalCount: number;
  pageSizes: number[];
  /** Текущие фильтры в виде query-строки, без page/perPage. */
  query: string;
}) {
  const router = useRouter();

  function hrefFor(nextPage: number, nextPerPage = perPage) {
    const params = new URLSearchParams(query);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextPerPage !== 10) params.set("perPage", String(nextPerPage));
    const search = params.toString();
    return search ? `${SCORING_BASE_PATH}?${search}` : SCORING_BASE_PATH;
  }

  const pageItems = getPageItems(page, totalPages);
  const buttonBase =
    "inline-flex size-10 items-center justify-center rounded-full border text-[0.8rem] font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]";
  const inactive =
    "border-[rgba(114,160,193,0.2)] bg-white/76 text-[var(--color-ink-soft)] hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[0.8rem] text-[var(--color-ink-soft)]">
        {adminT.scoring.totalNominations(totalCount)}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex items-center gap-1.5" aria-label={adminT.scoring.pageNumber(page)}>
          <button
            type="button"
            disabled={page <= 1}
            aria-label={adminT.scoring.previousPage}
            onClick={() => router.push(hrefFor(page - 1))}
            className={clsx(buttonBase, inactive, "disabled:cursor-not-allowed disabled:opacity-40")}
          >
            <ChevronLeft aria-hidden size={16} />
          </button>

          {pageItems.map((item, index) =>
            item === "gap" ? (
              <span
                key={`gap-${index}`}
                aria-hidden
                className="px-1 text-[var(--color-ink-muted)]"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === page ? "page" : undefined}
                aria-label={adminT.scoring.pageNumber(item)}
                onClick={() => router.push(hrefFor(item))}
                className={clsx(
                  buttonBase,
                  item === page
                    ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white shadow-[0_12px_24px_rgba(114,160,193,0.26)]"
                    : inactive,
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={page >= totalPages}
            aria-label={adminT.scoring.nextPage}
            onClick={() => router.push(hrefFor(page + 1))}
            className={clsx(buttonBase, inactive, "disabled:cursor-not-allowed disabled:opacity-40")}
          >
            <ChevronRight aria-hidden size={16} />
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            {adminT.scoring.perPage}
          </span>
          <IbpaDropdown
            value={String(perPage)}
            ariaLabel={adminT.scoring.perPage}
            className="w-24"
            options={pageSizes.map((size) => ({ value: String(size), label: String(size) }))}
            onChange={(value) => router.push(hrefFor(1, Number(value)))}
          />
        </div>
      </div>
    </div>
  );
}
