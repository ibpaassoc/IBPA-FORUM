"use client";

import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export type UploadProgressItem = {
  id: string;
  fileName: string;
  fieldKey: string;
  loaded: number;
  total: number;
  status: "pending" | "retrying" | "uploading" | "success" | "failed";
  error?: string;
  retryable?: boolean;
};

export default function UploadProgressPanel({
  items,
  busy,
  onRetryItem,
}: {
  items: UploadProgressItem[];
  busy: boolean;
  onRetryItem: (id: string) => void;
}) {
  const { t } = useLanguage();
  const copy = t.account.editor.uploadProgress;
  const totalBytes = items.reduce((sum, item) => sum + item.total, 0);
  const loadedBytes = items.reduce(
    (sum, item) =>
      sum + (item.status === "success" ? item.total : Math.min(item.loaded, item.total)),
    0,
  );
  const percentage =
    totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 0;
  const completed = items.filter((item) => item.status === "success").length;
  const uploading = items.filter((item) => item.status === "pending" || item.status === "retrying" || item.status === "uploading");
  const uploaded = items.filter((item) => item.status === "success");
  const failed = items.filter((item) => item.status === "failed");
  const canRetry = failed.some((item) => item.retryable !== false);

  return (
    <section
      aria-live="polite"
      className="rounded-[24px] border border-[rgba(114,160,193,0.24)] bg-white/82 p-4 shadow-[0_14px_38px_rgba(37,42,45,0.07)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {copy.title}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
            {copy.completed
              .replace("{completed}", String(completed))
              .replace("{total}", String(items.length))}
          </p>
        </div>
        <span className="text-sm font-semibold tabular-nums text-[var(--color-blue)]">
          {percentage}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={copy.overall}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-blue-wash)]"
      >
        <div
          className="h-full rounded-full bg-[var(--color-blue)] transition-[width] duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {uploading.length > 0 ? (
        <div className="mt-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            {copy.uploadingNow}
          </p>
          <ul className="mt-1.5 grid gap-1">
            {uploading.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 text-xs text-[var(--color-ink-soft)]"
              >
                <Loader2
                  aria-hidden
                  size={13}
                  className="shrink-0 animate-spin text-[var(--color-blue)]"
                />
                <span className="min-w-0 truncate">{item.fileName}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {failed.length > 0 ? (
        <div className="mt-3 rounded-[18px] border border-red-200/80 bg-red-50/80 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-red-800">
            <AlertCircle aria-hidden size={14} />
            {copy.failed}
          </p>
          <ul className="mt-2 grid gap-2">
            {failed.map((item) => (
              <li key={item.id} className="text-xs leading-relaxed text-red-800">
                <span className="font-semibold">{item.fileName}:</span>{" "}
                {item.error}
              </li>
            ))}
          </ul>
          {canRetry ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {failed.filter((item) => item.retryable !== false).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={busy}
                  onClick={() => onRetryItem(item.id)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-4 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-red-800 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw aria-hidden size={13} />
                  {copy.retry}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : completed === items.length && items.length > 0 ? (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
          <CheckCircle2 aria-hidden size={14} />
          {copy.complete}
        </p>
      ) : null}

      {uploaded.length > 0 ? (
        <p className="mt-3 text-xs text-emerald-700">
          {uploaded.length} {copy.uploaded}
        </p>
      ) : null}
    </section>
  );
}
