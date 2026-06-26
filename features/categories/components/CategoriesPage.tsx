import dynamic from "next/dynamic";
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
