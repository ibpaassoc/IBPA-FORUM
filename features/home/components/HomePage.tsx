"use client";
import { 
    HomeCategoriesRow, 
    HomeHero,
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
      <HomeEvent />
      <HomeFullBleed />
      <HomeCta />
    </main>
  );
}
