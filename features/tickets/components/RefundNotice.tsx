import { AlertTriangle } from "lucide-react";

/**
 * Elegant, glassmorphic warning/info card for the ticket refund policy.
 *
 * Deliberately understated (amber, not error-red) to match the IBPA look. The
 * AlertTriangle icon carries the "warning" cue, so the copy itself is plain
 * prose. Server-component friendly — no client hooks.
 */
export function RefundNotice({ text }: { text: string }) {
  return (
    <div
      role="note"
      className="mt-6 flex items-start gap-3 rounded-[14px] border border-amber-300/70 bg-amber-50/70 px-4 py-3.5 text-left"
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
        strokeWidth={1.75}
        aria-hidden
      />
      <p className="text-[0.82rem] leading-relaxed text-amber-900">{text}</p>
    </div>
  );
}
