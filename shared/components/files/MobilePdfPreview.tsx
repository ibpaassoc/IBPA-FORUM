"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

// The legacy worker supports the same Safari baseline as this Next.js app.
// Keep this assignment beside <Document>/<Page>; react-pdf may otherwise
// overwrite a worker configured from another module during import evaluation.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function LoadingPage({ label }: { label: string }) {
  return (
    <div className="flex min-h-64 w-full animate-pulse items-center justify-center rounded-xl bg-white/82 text-sm text-[var(--color-ink-soft)]">
      {label}
    </div>
  );
}

export default function MobilePdfPreview({
  url,
  title,
  loadingLabel,
  failedLabel,
  retryLabel,
}: {
  url: string;
  title: string;
  loadingLabel: string;
  failedLabel: string;
  retryLabel: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateWidth = () => setPageWidth(Math.max(0, Math.floor(viewport.clientWidth - 16)));
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  function retry() {
    setFailed(false);
    setNumPages(0);
    setReloadKey((current) => current + 1);
  }

  return (
    <div
      ref={viewportRef}
      aria-label={title}
      className="h-[min(66dvh,760px)] w-full touch-pan-y overflow-y-auto overscroll-contain rounded-[18px] border border-[rgba(114,160,193,0.18)] bg-[#d8d8d8] shadow-[0_18px_55px_rgba(56,91,116,0.1)]"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {failed ? (
        <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-[var(--color-ink-soft)]">{failedLabel}</p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-[var(--color-blue)] shadow-sm"
          >
            <RotateCw aria-hidden size={14} />
            {retryLabel}
          </button>
        </div>
      ) : (
        <Document
          key={`${reloadKey}-${url}`}
          file={url}
          loading={<LoadingPage label={loadingLabel} />}
          onLoadSuccess={({ numPages: loadedPages }) => setNumPages(loadedPages)}
          onLoadError={() => setFailed(true)}
          className="flex min-h-full flex-col gap-3 p-2"
        >
          {pageWidth > 0 && numPages > 0
            ? Array.from({ length: numPages }, (_, pageIndex) => {
                const pageNumber = pageIndex + 1;
                return (
                  <div key={pageNumber} className="relative mx-auto max-w-full bg-white shadow-md">
                    <Page
                      pageNumber={pageNumber}
                      width={pageWidth}
                      devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      loading={<LoadingPage label={`${loadingLabel} ${pageNumber} / ${numPages}`} />}
                    />
                    <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[0.65rem] font-semibold text-white">
                      {pageNumber} / {numPages}
                    </span>
                  </div>
                );
              })
            : null}
        </Document>
      )}
    </div>
  );
}
