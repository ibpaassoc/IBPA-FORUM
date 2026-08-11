"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import clsx from "clsx";
import { adminT } from "@/lib/i18n/admin";

/**
 * Компактный превью-блок комментария судьи.
 * Длинный текст сворачивается в две строки; «Показать полностью» раскрывает
 * его на месте, «Открыть отзыв» — отдаёт управление родителю (окно с полным
 * отзывом и всеми критериями).
 */
export default function JudgeCommentPreview({
  comment,
  onOpenReview,
  className,
}: {
  comment: string;
  onOpenReview?: () => void;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={clsx(
        "rounded-[18px] border border-[rgba(37,42,45,0.07)] bg-white/62 p-3",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <MessageSquareText
          aria-hidden
          size={14}
          className="mt-0.5 shrink-0 text-[var(--color-blue)]"
        />
        <p
          className={clsx(
            "min-w-0 break-words text-[0.82rem] leading-[1.55] text-[var(--color-ink-soft)]",
            expanded ? null : "line-clamp-2",
          )}
        >
          {comment}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 pl-6">
        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          className="text-[0.72rem] font-semibold text-[var(--color-blue)] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
        >
          {expanded ? adminT.scoring.hideFullComment : adminT.scoring.showFullComment}
        </button>
        {onOpenReview ? (
          <button
            type="button"
            onClick={onOpenReview}
            className="text-[0.72rem] font-semibold text-[var(--color-ink-soft)] underline-offset-4 transition hover:text-[var(--color-ink)] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
          >
            {adminT.scoring.openReview}
          </button>
        ) : null}
      </div>
    </div>
  );
}
