"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

type RegulationPdfFrameProps = {
  src: string;
  title: string;
  loadingText: string;
  errorText: string;
  className?: string;
};

type FrameState = "loading" | "ready" | "error";

export default function RegulationPdfFrame({
  src,
  title,
  loadingText,
  errorText,
  className = "h-full",
}: RegulationPdfFrameProps) {
  const [state, setState] = useState<FrameState>("loading");

  useEffect(() => {
    const controller = new AbortController();

    void fetch(src, { method: "HEAD", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("PDF unavailable");
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
      });

    return () => controller.abort();
  }, [src]);

  return (
    <div className={`relative w-full bg-[#e9eef1] ${className}`}>
      {state === "loading" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/82 text-[var(--color-ink-soft)]">
          <LoaderCircle aria-hidden size={28} className="animate-spin text-[var(--color-blue)]" />
          <p className="text-sm">{loadingText}</p>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/86 px-6 text-center">
          <AlertCircle aria-hidden size={30} className="text-red-500" />
          <p className="max-w-md text-sm leading-6 text-red-700">{errorText}</p>
        </div>
      ) : null}

      {state === "ready" ? (
        <iframe
          src={src}
          title={title}
          className="h-full w-full border-0 bg-white"
          onError={() => setState("error")}
        />
      ) : null}
    </div>
  );
}
