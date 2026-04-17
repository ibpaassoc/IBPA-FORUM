import type { Metadata } from "next"
import JuryRequirements from "@/components/jury/JuryRequirements"
import JuryProcess from "@/components/jury/JuryProcess"
import JuryFaq from "@/components/jury/JuryFaq"
import JuryApplyHero from "@/components/jury/JuryApplyHero"
import JuryApplicationForm from "@/components/jury/JuryApplicationForm"
import { PageShell } from "@/components/layout/PageShell"

export const metadata: Metadata = {
  title: "Apply as Jury | IBPA Beauty Championship",
  description:
    "Submit your application to join the official IBPA Beauty Championship jury panel.",
}

export default function ApplyJuryPage() {
  return (
    <PageShell>
      <JuryApplyHero />
      <JuryRequirements />
      <JuryProcess />
      <JuryApplicationForm />
      <JuryFaq />
    </PageShell>
  )
}
