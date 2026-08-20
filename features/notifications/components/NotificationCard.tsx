"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CheckCircle2, ExternalLink, Loader2, MailWarning, QrCode, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  claimJuryGalaAction,
  startSpecialOfferCheckoutAction,
} from "@/features/notifications/actions/account.actions";
import {
  notificationCopy,
  type AccountNotificationView,
} from "@/features/notifications/lib/content";
import { GlassCard, StatusBadge } from "@/shared/components/admin/DashboardUI";

const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.11em] text-white shadow-[0_14px_34px_rgba(114,160,193,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4d86ad] disabled:cursor-not-allowed disabled:opacity-55";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.25)] bg-white/82 px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)] disabled:opacity-55";

export default function NotificationCard({
  notification,
  compact = false,
}: {
  notification: AccountNotificationView;
  compact?: boolean;
}) {
  const { language } = useLanguage();
  const copy = notificationCopy(notification.content, language);
  const [consent, setConsent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const content = notification.content;
  const accepted = content.kind === "JURY_GALA" && content.state.status === "ACCEPTED";
  const purchased =
    content.kind === "SPECIAL_OFFER_2_DAYS" && content.state.status === "PURCHASED";

  function claimGala() {
    startTransition(async () => {
      const result = await claimJuryGalaAction(notification.id, consent || accepted);
      setError(!result.ok);
      setMessage(result.message ?? null);
    });
  }

  function buyOffer() {
    startTransition(async () => {
      const result = await startSpecialOfferCheckoutAction(notification.id);
      if (result.ok && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      setError(!result.ok);
      setMessage(result.message ?? null);
    });
  }

  return (
    <GlassCard className={compact ? "p-4 sm:p-5" : "p-5 sm:p-6"}>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          {content.kind === "JURY_GALA" ? <Sparkles size={19} /> : <QrCode size={19} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
                {content.kind === "JURY_GALA" ? "IBPA Gala Dinner" : "IBPA Forum"}
              </p>
              <h2 className="mt-1 font-[var(--font-title-family)] text-[1.45rem] font-light leading-tight text-[var(--color-ink)]">
                {copy.title}
              </h2>
            </div>
            <StatusBadge tone={notification.isViewed ? "neutral" : "blue"}>
              {notification.isViewed ? "Viewed" : "New"}
            </StatusBadge>
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-ink)]">{copy.summary}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{copy.description}</p>

          {content.kind === "JURY_GALA" ? (
            accepted ? (
              <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50/72 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 size={16} /> Gala Dinner ticket confirmed
                </p>
                {content.state.emailDelivery === "FAILED" ? (
                  <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-amber-800">
                    <MailWarning className="mt-0.5 shrink-0" size={14} />
                    Email delivery failed. Download the QR below or retry the email.
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-emerald-800">
                    This QR is valid for the Gala Dinner only. It cannot be used for Forum entry.
                  </p>
                )}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  {content.state.ticketId ? (
                    <Link
                      href={`/api/account/tickets/${content.state.ticketId}/qr`}
                      className={secondaryButtonClass}
                    >
                      <QrCode size={15} /> Download QR
                    </Link>
                  ) : null}
                  <button type="button" onClick={claimGala} disabled={pending} className={secondaryButtonClass}>
                    {pending ? <Loader2 className="animate-spin" size={15} /> : <ExternalLink size={15} />}
                    Resend email
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)]/55 p-3.5 text-sm leading-5 text-[var(--color-ink)]">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--color-blue)]"
                  />
                  <span>{copy.consentLabel}</span>
                </label>
                <button type="button" onClick={claimGala} disabled={!consent || pending} className={`${buttonClass} mt-3 w-full sm:w-auto`}>
                  {pending ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {copy.actionLabel}
                </button>
              </div>
            )
          ) : purchased ? (
            <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50/72 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 size={16} /> Your 2-Day Forum pass is confirmed
              </p>
              <Link href="/account/applicant/tickets" className={`${secondaryButtonClass} mt-3`}>
                <QrCode size={15} /> View ticket
              </Link>
            </div>
          ) : (
            <button type="button" onClick={buyOffer} disabled={pending} className={`${buttonClass} mt-4 w-full sm:w-auto`}>
              {pending ? <Loader2 className="animate-spin" size={16} /> : <ExternalLink size={16} />}
              {copy.actionLabel}
            </button>
          )}

          {message ? (
            <p role={error ? "alert" : "status"} className={`mt-3 text-sm ${error ? "text-red-700" : "text-emerald-700"}`}>
              {message}
            </p>
          ) : null}
          <p className="mt-4 text-xs text-[var(--color-ink-soft)]">
            {new Intl.DateTimeFormat(language === "ua" ? "uk" : language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.dateCreated))}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
