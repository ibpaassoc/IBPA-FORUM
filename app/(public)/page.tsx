import CategoriesPreview from "@/features/home/components/CategoriesPreview";
import CTASection from "@/features/home/components/CTASection";
import FAQ from "@/features/home/components/FAQ";
import HomeCinematicSection from "@/features/home/components/HomeCinematicSection";
import HomeEventGallery from "@/features/home/components/HomeEventGallery";
import GrandPrixSection from "@/features/home/components/GrandPrixSection";
import HomeHero from "@/features/home/components/HomeHero";
import JurySection from "@/features/home/components/JurySection";
import Process from "@/features/home/components/Process";

export default function Home() {
  return (
    <main className="bg-(--color-off-white) text-(--color-ink)">
      <HomeHero />
      <HomeEventGallery />
      <CategoriesPreview />
      <Process />
      <HomeCinematicSection />
      <GrandPrixSection />
      <JurySection />
      <FAQ />
      <CTASection />
    </main>
  );
}
