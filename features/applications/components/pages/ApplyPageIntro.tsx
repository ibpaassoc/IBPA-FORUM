"use client";

import { ClipboardCheck, CreditCard, FileText, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { FeatureCard, IconBadge, SectionHeading } from "@/shared/components/public";

export default function ApplyPageIntro() {
  const { t } = useLanguage();

  return (
    <div className="space-y-(--space-lg)">
      <SectionHeading
        eyebrow={t.applyPage.intro.eyebrow}
        title={t.applyPage.intro.title}
        description={t.applyPage.intro.text}
      />

      <div className="grid gap-(--space-md) md:grid-cols-2 xl:grid-cols-4">
        <FeatureCard
          icon={<IconBadge icon={FileText} />}
          title="Choose category"
          description="Select your category and award track before uploading materials."
        />
        <FeatureCard
          icon={<IconBadge icon={Search} />}
          title="Prepare portfolio"
          description="Upload category-relevant media and supporting documents."
        />
        <FeatureCard
          icon={<IconBadge icon={ClipboardCheck} />}
          title="Review details"
          description="Confirm all fields and files before final submission."
        />
        <FeatureCard
          icon={<IconBadge icon={CreditCard} />}
          title="Complete fee"
          description="Finalize participation through secure Stripe checkout."
        />
      </div>
    </div>
  );
}
