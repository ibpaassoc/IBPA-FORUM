import { PageShell } from "@/components/layout/PageShell";
import CategoriesHero from "@/components/categories/CategoriesHero";
import CategoriesGrid from "@/components/categories/CategoriesGrid";

export default function CategoriesPage() {
  return (
    <PageShell>
      <CategoriesHero />
      <CategoriesGrid />
    </PageShell>
  );
}
