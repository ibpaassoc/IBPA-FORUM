"use client";

import {
  HomeHero,
  HomeParticipation,
  HomePricing,
  HomeGrandPrix,
  HomeWhyAttend,
  HomeCategoriesRow,
  HomeSlidingGallery,
  HomeCta,
} from "@/features/home/components";

export default function HomePagePremium() {
  return (
    <main className="page-shell">
      <HomeHero />
      <HomeParticipation />
      <HomePricing />
      <HomeGrandPrix />
      <HomeWhyAttend />
      <HomeCategoriesRow />
      <HomeSlidingGallery />
      <HomeCta />
    </main>
  );
}
