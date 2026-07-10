"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LandingCtaBlock } from "@/shared/components/public";
import { PRICING } from "@/data/pricing";

export default function JuryCta() {
  const { t } = useLanguage();
  const c = t.juryPage.juryCta;
  const ps = t.home.pricingSection;

  return (
    <LandingCtaBlock
      eyebrow={c.eyebrow}
      title={c.title}
      description={c.description}
      secondaryButton={{ href: "/jury/login", label: t.common.juryAccount }}
      feesLabel={c.registrationFee}
      pricingItems={[
        {
          label: ps.standard,
          price: PRICING.judgeRegistration.standard,
        },
        {
          label: ps.ibpaMembers,
          price: PRICING.judgeRegistration.ibpaMembers,
        },
      ]}
      pricingNote={c.registrationNote}
    />
  );
}
