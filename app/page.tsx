import HomeHero from "@/components/home/HomeHero";
import Stats from "@/components/home/Stats";
import CategoriesPreview from "@/components/home/CategoriesPreview";
import Process from "@/components/home/Process";
import GrandPrixSection from "@/components/home/GrandPrixSection";
import JurySection from "@/components/home/JurySection";
import FAQ from "@/components/home/FAQ";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <main className="bg-[#0f0f10] text-[#f5f1e8]">
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
