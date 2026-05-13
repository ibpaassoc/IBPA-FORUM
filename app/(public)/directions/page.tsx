"use client";

import { 
  DirectionsHero,
  DirectionsFeatures,
  DirectionsAbout,
  DirectionsCTA,
} from "@/features/directions/components";

export default function CategoriesPagePremium() {
  return (
    <main className="page-shell">
      <DirectionsHero />
      <DirectionsFeatures />
      <DirectionsAbout />
      <DirectionsCTA />
    </main>
  );
}
