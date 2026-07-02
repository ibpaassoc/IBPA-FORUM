import { requireAdmin } from "@/shared/lib/admin-auth";
import { adminT } from "@/lib/i18n/admin";
import { DashboardCard, DashboardPageHeader } from "@/shared/components/admin/DashboardUI";
import UnifiedScanner from "@/features/check-in/components/UnifiedScanner";

export default async function AdminScannerPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={adminT.scanner.label}
        title={adminT.scanner.title}
      />
      <DashboardCard className="p-5 md:p-7">
        <UnifiedScanner />
      </DashboardCard>
    </div>
  );
}
