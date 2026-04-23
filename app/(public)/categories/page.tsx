import CategoriesGrid from "@/features/categories/components/CategoriesGrid";
import CategoriesHero from "@/features/categories/components/CategoriesHero";
import { PageShell } from "@/shared/components/layout/PageShell";

export default function CategoriesPage() {
  return (
    <PageShell>
      <CategoriesHero />
      <CategoriesGrid />
    </PageShell>
  );
}
