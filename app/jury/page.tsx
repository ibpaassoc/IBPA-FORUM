import JuryHero from "@/components/jury/JuryHero"
import JuryRequirements from "@/components/jury/JuryRequirements"
import JuryResponsibilities from "@/components/jury/JuryResponsibilities"
import JuryProcess from "@/components/jury/JuryProcess"
import JuryBenefits from "@/components/jury/JuryBenefits"
import JuryFaq from "@/components/jury/JuryFaq"
import JuryCta from "@/components/jury/JuryCta"

export default function JuryPage() {
  return (
    <main className="bg-[#050505] text-white">
      <JuryHero />
      <JuryRequirements />
      <JuryResponsibilities />
      <JuryProcess />
      <JuryBenefits />
      <JuryFaq />
      <JuryCta />
    </main>
  )
}
