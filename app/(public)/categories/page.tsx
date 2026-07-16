import CategoriesPagePremium from "@/features/categories/components/CategoriesPage";
import { getApplicationCategories } from "@/features/applications/server/queries";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getApplicationCategories();

  return <CategoriesPagePremium categories={categories} />;
}
