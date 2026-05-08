import CategoriesPreview from "@/features/home/components/CategoriesPreview";
import CTASection from "@/features/home/components/CTASection";
import FAQ from "@/features/home/components/FAQ";
import GrandPrixSection from "@/features/home/components/GrandPrixSection";
import HomeHero from "@/features/home/components/HomeHero";
import JurySection from "@/features/home/components/JurySection";
import Process from "@/features/home/components/Process";
import Stats from "@/features/home/components/Stats";

export default function Home() {
  return (
    <main className="bg-(--color-off-white) text-(--color-navy)">
      <HomeHero />
      <Stats />
      <CategoriesPreview />
      <Process />
      <GrandPrixSection />
      <JurySection />
      <FAQ />
      <CTASection />
    </main>
  );
}
