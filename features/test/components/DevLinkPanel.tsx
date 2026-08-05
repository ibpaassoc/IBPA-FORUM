"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export function DevLinkPanel({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-[20px] border border-sky-300/20 bg-sky-300/10 p-4 text-sky-100">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
        Secure account link
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Generated account link"
          readOnly
          value={link}
          className="h-11 min-w-0 flex-1 rounded-[14px] border border-sky-200/15 bg-black/25 px-3 text-xs text-sky-50 outline-none"
        />
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sky-200/20 px-4 text-xs font-semibold hover:bg-white/10"
        >
          {copied ? <Check aria-hidden size={14} /> : <Copy aria-hidden size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
        <a
          href={link}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sky-100 px-4 text-xs font-semibold text-sky-950 hover:bg-white"
        >
          <ExternalLink aria-hidden size={14} /> Open
        </a>
      </div>
    </div>
  );
}
