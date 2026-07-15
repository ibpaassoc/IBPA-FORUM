import PurchaseApplicationForm from "@/features/applications/components/application-form/PurchaseApplicationForm";
import { getApplicationCategories } from "@/features/applications/server/queries";

export default async function ApplyFormServer() {
  const categories = await getApplicationCategories();

  return <PurchaseApplicationForm categories={categories} />;
}
