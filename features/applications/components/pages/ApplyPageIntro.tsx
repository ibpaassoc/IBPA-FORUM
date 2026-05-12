"use client";

import { ClipboardCheck, CreditCard, FileText, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialPhotoCard,
  FeatureCard,
  IconBadge,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";

export default function ApplyPageIntro() {
  const { t } = useLanguage();

  return (
    <div className="space-y-(--space-lg)">
      <SectionHeading
        eyebrow={t.applyPage.intro.eyebrow}
        title={t.applyPage.intro.title}
        description={t.applyPage.intro.text}
      />

      <div className="grid gap-(--space-md) xl:grid-cols-[0.95fr_1.05fr]">
        <EditorialPhotoCard
          src="/images/curated/apply_editorial.jpg"
          alt="Apply page onboarding editorial photo"
          aspect="portrait"
          overlay="soft"
          title="Enter with confidence"
          description="A guided form designed for high-quality professional submissions."
          priority
        />
        <StaggerContainer className="grid gap-(--space-md) md:grid-cols-2" stagger={0.1}>
          <FeatureCard
            icon={<IconBadge icon={FileText} />}
            title="Choose direction"
            description="Select your direction and nomination before uploading materials."
          />
          <FeatureCard
            icon={<IconBadge icon={Search} />}
            title="Prepare portfolio"
            description="Upload direction-relevant media and supporting documents."
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
        </StaggerContainer>
      </div>
    </div>
  );
}
