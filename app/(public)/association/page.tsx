import {
  AssociationHero,
  AssociationWhoCanJoin,
  AssociationAdvantages,
  AssociationProcess,
  AssociationCTA,
} from "@/features/association/components"
import { LandingPageShell } from "@/shared/components/public";

export default function AssociationPage() {
  return (
    <LandingPageShell>
      <AssociationHero />
      <AssociationWhoCanJoin />
      <AssociationAdvantages />
      <AssociationProcess />
      <AssociationCTA />
    </LandingPageShell>
  )
}
