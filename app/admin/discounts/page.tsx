import { requireAdmin } from "@/shared/lib/admin-auth";
import DiscountManagementPage from "@/features/admin/components/discounts/DiscountManagementPage";
import {
  getPromoCodesForAdmin,
  PromoCodeSetupError,
} from "@/features/promos/server/promo-service";
import {
  DashboardCard,
  DashboardPageHeader,
} from "@/shared/components/admin/DashboardUI";
import { adminT } from "@/lib/i18n/admin";

export default async function AdminDiscountsPage() {
  await requireAdmin();
  let promos;

  try {
    promos = await getPromoCodesForAdmin();
  } catch (error) {
    if (error instanceof PromoCodeSetupError) {
      return (
        <div className="space-y-7">
          <DashboardPageHeader
            label={adminT.discounts.label}
            title={adminT.discounts.title}
            description={adminT.discounts.description}
          />
          <DashboardCard>
            <p className="text-sm leading-6 text-red-700">{error.message}</p>
          </DashboardCard>
        </div>
      );
    }
    throw error;
  }

  return <DiscountManagementPage promos={promos} />;
}
