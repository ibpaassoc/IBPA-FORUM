import GoogleSheetsSyncPanel from "@/features/admin/components/google-sheets/GoogleSheetsSyncPanel";
import { isGoogleSheetsConfigured } from "@/features/google-sheets";
import { DashboardHeader } from "@/shared/components/admin/DashboardUI";
import { requireAdmin } from "@/shared/lib/admin-auth";

export default async function AdminGoogleSheetsPage() {
  await requireAdmin();

  const configured = isGoogleSheetsConfigured();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader label="Integrations" title="Google Sheets" />
      <div className="max-w-2xl">
        <GoogleSheetsSyncPanel configured={configured} />
      </div>
    </div>
  );
}
