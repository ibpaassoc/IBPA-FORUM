import type { ReactNode } from "react";
import JuryAccountSidebar from "@/features/account/components/jury/JuryAccountSidebar";
import { getAuthenticatedJuryContext } from "@/features/jury/server/reviews";
import { findSiblingAccount } from "@/features/account/server/accounts";
import { DashboardShell } from "@/shared/components/admin/DashboardUI";
import { TestActorBanner } from "@/features/test/components/TestActorBanner";
import NotificationPopup from "@/features/notifications/components/NotificationPopup";
import { getNextUnviewedNotification } from "@/features/notifications/server/notifications";

export default async function JuryAccountLayout({ children }: { children: ReactNode }) {
  const jury = await getAuthenticatedJuryContext();
  const [applicantAccount, nextNotification] = await Promise.all([
    findSiblingAccount({ email: jury.email, role: "APPLICANT", dataScope: jury.dataScope }),
    getNextUnviewedNotification(jury.accountId),
  ]);

  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <TestActorBanner />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 size-[24rem] rounded-full bg-[rgba(185,217,235,0.28)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[-7rem] size-[28rem] rounded-full bg-[rgba(114,160,193,0.15)] blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1520px] items-start gap-5 px-3 pb-28 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
        <JuryAccountSidebar juryName={jury.fullName} email={jury.email} approvedCategories={jury.approvedCategories} canSwitchAccount={Boolean(applicantAccount)} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <NotificationPopup
        notification={nextNotification}
        allNotificationsHref="/account/jury/notifications"
      />
    </DashboardShell>
  );
}
