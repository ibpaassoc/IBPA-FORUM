"use client";

import Link from "next/link";
import { FeaturedStorySection, EditorialPhotoCard } from "@/shared/components/public";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function HomeJuryStandards() {
    const { t } = useLanguage();

    return (
        <FeaturedStorySection
        eyebrow={t.home.copy.juryStandards}
        title={t.home.copy.juryStandardsTitle}
        description={t.home.juryCta.text2}
        quote={t.home.juryCta.text3}
        media={
          <EditorialPhotoCard
            src="/images/curated/jury_standards.jpg"
            alt="Professional jury leadership and community moment"
            aspect="landscape"
            overlay="soft"
            objectPosition="center 30%"
            mobileObjectPosition="center 24%"
          />
        }
        actions={
          <Link href="/jury" className="ibpa-button ibpa-button-ghost">
            {t.home.juryCta.button}
          </Link>
        }
      />
    );
}
