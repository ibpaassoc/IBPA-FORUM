"use client";

import { Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LandingCtaBlock } from "@/shared/components/public";
import { PRICING } from "@/data/pricing";

export default function GrandPrixCTA() {
  const { t } = useLanguage();
  const c = t.grandPrixPage.participationCta;
  const ps = t.home.pricingSection;

  return (
    <LandingCtaBlock
      eyebrow={c.eyebrow}
      title={c.title}
      description={c.description}
      primaryButton={{ href: "/apply", label: t.common.applyNow }}
      secondaryButton={{
        href: "/grand-prix",
        label: (
          <>
            <Trophy size={14} strokeWidth={1.7} />
            {t.home.grandPrixSpotlight.learnMore}
          </>
        ),
      }}
      feesLabel={c.nominationFees}
      pricingItems={[
        {
          label: c.members,
          price: PRICING.awardParticipation.ibpaMembers.oneNomination,
          detail: c.perNomSubmission,
        },
        {
          label: ps.nonMembers,
          price: PRICING.awardParticipation.nonMembers.oneNomination,
          detail: c.perNomSubmission,
        },
        {
          label: t.common.grandPrix,
          price: "5+",
          detail: c.nominationsActivate,
        },
      ]}
    />
  );
}
