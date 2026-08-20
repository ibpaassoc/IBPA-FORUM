"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { BellRing, X } from "lucide-react";
import { markNotificationViewedAction } from "@/features/notifications/actions/account.actions";
import type { AccountNotificationView } from "@/features/notifications/lib/content";
import NotificationCard from "@/features/notifications/components/NotificationCard";

export default function NotificationPopup({
  notification,
  allNotificationsHref,
}: {
  notification: AccountNotificationView | null;
  allNotificationsHref: string;
}) {
  const [open, setOpen] = useState(Boolean(notification));
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!notification || !open) return null;

  function close() {
    if (!dontShowAgain) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await markNotificationViewedAction(notification!.id);
      setOpen(false);
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(3,2,19,0.3)] p-3 backdrop-blur-sm sm:items-center sm:p-5">
      <button type="button" aria-label="Close notification" className="absolute inset-0" onClick={close} />
      <section role="dialog" aria-modal="true" aria-labelledby="new-notification-title" className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-[rgba(114,160,193,0.24)] bg-[#f6fafc] p-3 shadow-[0_30px_100px_rgba(3,2,19,0.24)] sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-[var(--color-blue)]">
            <BellRing size={17} />
            <h1 id="new-notification-title" className="text-xs font-semibold uppercase tracking-[0.15em]">New notification</h1>
          </div>
          <button type="button" onClick={close} disabled={pending} aria-label="Close" className="flex size-10 items-center justify-center rounded-full bg-white text-[var(--color-ink-soft)] shadow-sm transition hover:bg-[var(--color-blue-wash)]">
            <X size={17} />
          </button>
        </div>
        <NotificationCard notification={notification} compact />
        <div className="mt-3 flex flex-col gap-3 rounded-[20px] bg-white/74 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <input type="checkbox" checked={dontShowAgain} onChange={(event) => setDontShowAgain(event.target.checked)} className="size-4 accent-[var(--color-blue)]" />
            Don&apos;t show this notification again
          </label>
          <Link href={allNotificationsHref} onClick={() => setOpen(false)} className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] hover:underline">
            View all notifications
          </Link>
        </div>
      </section>
    </div>
  );
}
