"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  FeaturedStorySection,
  EditorialPhotoCard,
} from "@/shared/components/public";


export default function JuryBenefits() {
  const { t } = useLanguage();

  return (    
    <FeaturedStorySection
      eyebrow={t.juryPage.copy.statementEyebrow}
      title={t.juryPage.copy.statementTitle}
      description={t.juryPage.copy.statementText}
      quote={t.juryPage.copy.statementQuote}
      media={
        <EditorialPhotoCard
          src="/images/community/DSC00365.jpg"
          alt="Jury leadership and community photo"
          aspect="landscape"
          overlay="soft"
          objectPosition="center 30%"
          mobileObjectPosition="center 24%"
        />
      }
    />
  );
}
