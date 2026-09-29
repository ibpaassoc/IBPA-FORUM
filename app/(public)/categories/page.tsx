import CategoriesPagePremium from "@/features/categories/components/CategoriesPage";
import { getApplicationCategories } from "@/features/applications/server/queries";
import { getPublicRegulations } from "@/features/regulations/server/queries";
import { getPublicAwardResults } from "@/features/categories/server/public-results";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [categories, regulations, results] = await Promise.all([
    getApplicationCategories(),
    getPublicRegulations(),
    getPublicAwardResults(),
  ]);

  return <CategoriesPagePremium categories={categories} regulations={regulations} results={results} />;
}
