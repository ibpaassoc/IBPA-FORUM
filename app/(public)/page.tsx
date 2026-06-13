"use client";

import {
  HomeHero,
  HomeForumOverview,
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
      <HomeForumOverview />
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
