import { PageShell } from "@/shared/components/layout/PageShell";
import {
  AssociationHero,
  AssociationWhoCanJoin,
  AssociationAdvantages,
  AssociationProcess,
  AssociationCTA,
} from "@/features/association/components"

export default function AssociationPage() {
  return (
    <PageShell>
      <AssociationHero />
      <AssociationWhoCanJoin />
      <AssociationAdvantages />
      <AssociationProcess />
      <AssociationCTA />
    </PageShell>
  )
}
