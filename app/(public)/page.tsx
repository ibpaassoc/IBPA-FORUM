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
      <HomeSlidingGallery />
      <HomeWhy />
      <HomeCategoriesRow />
      <HomeJuryStandards />
      <HomeTimeline />
      <HomeCta />
    </main>
  );
}
