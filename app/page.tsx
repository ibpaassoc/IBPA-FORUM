import HomeHero from "@/components/home/HomeHero";
import Stats from "@/components/home/Stats";
import CategoriesPreview from "@/components/home/CategoriesPreview";
import Process from "@/components/home/Process";
import GrandPrixSection from "@/components/home/GrandPrixSection";
import JurySection from "@/components/home/JurySection";
import FAQ from "@/components/home/FAQ";
import CTASection from "@/components/home/CTASection";
import { PageShell } from "@/components/layout/PageShell";

export default function Home() {
  return (
    <PageShell>
      <HomeHero />
      <Stats />
      <CategoriesPreview />
      <Process />
      <GrandPrixSection />
      <JurySection />
      <FAQ />
      <CTASection />
    </PageShell>
  );
}
