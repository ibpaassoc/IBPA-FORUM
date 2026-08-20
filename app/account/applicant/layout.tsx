import type { ReactNode } from "react";
import ApplicantSidebar from "@/features/account/components/ApplicantSidebar";
import { findSiblingAccount, requireApplicantAccount } from "@/features/account/server/accounts";
import { DashboardShell } from "@/shared/components/admin/DashboardUI";
import { TestActorBanner } from "@/features/test/components/TestActorBanner";
import NotificationPopup from "@/features/notifications/components/NotificationPopup";
import { getNextUnviewedNotification } from "@/features/notifications/server/notifications";

export default async function ApplicantLayout({ children }: { children: ReactNode }) {
  const { account, applicantProfile } = await requireApplicantAccount();
  const [juryAccount, nextNotification] = await Promise.all([
    findSiblingAccount({ email: account.email, role: "JURY", dataScope: account.dataScope }),
    getNextUnviewedNotification(account.id),
  ]);

  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <TestActorBanner />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 size-[22rem] rounded-full bg-[rgba(185,217,235,0.28)] blur-3xl" />
        <div className="absolute right-[-8rem] top-[-6rem] size-[26rem] rounded-full bg-[rgba(114,160,193,0.16)] blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1520px] items-start gap-5 px-3 pb-28 pt-4 sm:px-5 md:px-6 lg:px-7 lg:py-6">
        <ApplicantSidebar
          applicantName={applicantProfile.fullName}
          email={account.email}
          canSwitchAccount={Boolean(juryAccount)}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <NotificationPopup
        notification={nextNotification}
        allNotificationsHref="/account/applicant/notifications"
      />
    </DashboardShell>
  );
}
