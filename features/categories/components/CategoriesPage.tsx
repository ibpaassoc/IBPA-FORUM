import dynamic from "next/dynamic";
import type { CategoryOption } from "@/features/applications/types/application.types";
import {
  CategoriesHero,
  CategoriesInfo,
  CategoriesWhyJoin,
  CategoriesAwardResults,
  CategoriesCTA,
} from "@/features/categories/components";
import { LandingPageShell } from "@/shared/components/public";

const CategoriesFeatures = dynamic(
  () => import("@/features/categories/components/CategoriesFeatures")
);
const CategoriesFAQ = dynamic(
  () => import("@/features/categories/components/CategoriesFAQ")
);

export default function CategoriesPagePremium({ categories }: { categories: CategoryOption[] }) {
  return (
    <LandingPageShell>
      <CategoriesHero />
      <CategoriesInfo />
      <CategoriesFeatures categories={categories} />
      <CategoriesWhyJoin />
      <CategoriesAwardResults />
      <CategoriesCTA />
      <CategoriesFAQ />
    </LandingPageShell>
  );
}
