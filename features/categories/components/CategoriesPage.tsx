import dynamic from "next/dynamic";
import type { CategoryOption } from "@/features/applications/types/application.types";
import type { PublicRegulations } from "@/features/regulations/types";
import type { PublicAwardResult } from "@/features/categories/server/public-results";
import CategoriesResultsExplorer from "@/features/categories/components/CategoriesResultsExplorer";
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

export default function CategoriesPagePremium({
  categories,
  regulations,
  results,
}: {
  categories: CategoryOption[];
  regulations: PublicRegulations;
  results: PublicAwardResult[];
}) {
  return (
    <LandingPageShell>
      <CategoriesHero />
      <CategoriesInfo />
      <CategoriesFeatures categories={categories} regulations={regulations} />
      <CategoriesWhyJoin />
      {/*<CategoriesAwardResults />*/}
      <CategoriesResultsExplorer categories={categories} results={results} />
      <CategoriesCTA />
      <CategoriesFAQ />
    </LandingPageShell>
  );
}
