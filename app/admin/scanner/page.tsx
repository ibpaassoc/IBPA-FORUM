import { requireAdmin } from "@/shared/lib/admin-auth";
import { DashboardCard, DashboardPageHeader } from "@/shared/components/admin/DashboardUI";
import UnifiedScanner from "@/features/check-in/components/UnifiedScanner";

export default async function AdminScannerPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Check-in"
        title="Ticket scanner"
        description="One scanner for every IBPA ticket — forum, gala dinner, participant, and jury. Scan a QR code and the ticket type is detected automatically."
      />
      <DashboardCard className="p-5 md:p-7">
        <UnifiedScanner />
      </DashboardCard>
    </div>
  );
}
