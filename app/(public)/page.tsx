"use client";

import { 
    HomeCategoriesRow, 
    HomeHero,
    HomeSlidingGallery,
    HomeWelcome,
    HomeWhy,
    HomeJuryStandards,
    HomeTimeline,
    HomeEvent,
    HomeFullBleed,
    HomeCta,
} from "@/features/home/components";

export default function HomePagePremium() {
  return (
    <main className="page-shell">
      <HomeHero />
      <HomeWelcome />
      <HomeWhy />
      <HomeCategoriesRow />
      <HomeJuryStandards />
      <HomeTimeline />
      <HomeSlidingGallery />
      <HomeCta />
    </main>
  );
}
