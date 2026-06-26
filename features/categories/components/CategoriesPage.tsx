import {
  CategoriesHero,
  CategoriesInfo,
  CategoriesFeatures,
  CategoriesWhyJoin,
  CategoriesAwardResults,
  CategoriesCTA,
  CategoriesFAQ,
} from "@/features/categories/components";
import { LandingPageShell } from "@/shared/components/public";

export default function CategoriesPagePremium() {
  return (
    <LandingPageShell>
      <CategoriesHero />
      <CategoriesInfo />
      <CategoriesFeatures />
      <CategoriesWhyJoin />
      <CategoriesAwardResults />
      <CategoriesCTA />
      <CategoriesFAQ />
    </LandingPageShell>
  );
}
