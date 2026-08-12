import PurchaseApplicationForm from "@/features/applications/components/application-form/PurchaseApplicationForm";
import { getApplicationCategories } from "@/features/applications/server/queries";
import { getPublicRegulations } from "@/features/regulations/server/queries";

export default async function ApplyFormServer({ accessToken }: { accessToken: string }) {
  const [categories, regulations] = await Promise.all([
    getApplicationCategories(),
    getPublicRegulations(),
  ]);

  return (
    <PurchaseApplicationForm
      accessToken={accessToken}
      categories={categories}
      regulations={regulations}
    />
  );
}
