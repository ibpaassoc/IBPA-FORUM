import CategoriesPagePremium from "@/features/categories/components/CategoriesPage";
import { getApplicationCategories } from "@/features/applications/server/queries";
import { getPublicRegulations } from "@/features/regulations/server/queries";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categories, regulations] = await Promise.all([
    getApplicationCategories(),
    getPublicRegulations(),
  ]);

  return <CategoriesPagePremium categories={categories} regulations={regulations} />;
}
