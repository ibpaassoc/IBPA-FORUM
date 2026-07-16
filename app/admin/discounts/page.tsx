import { requireAdmin } from "@/shared/lib/admin-auth";
import DiscountManagementPage from "@/features/admin/components/discounts/DiscountManagementPage";
import { getPromoCodesForAdmin } from "@/features/promos/server/promo-service";

export default async function AdminDiscountsPage() {
  await requireAdmin();
  const promos = await getPromoCodesForAdmin();

  return <DiscountManagementPage promos={promos} />;
}
