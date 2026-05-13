"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  EditorialPhotoCard,
  FeaturedStorySection,
} from "@/shared/components/public";

export default function CategoriesPagePremium() {
  const { t } = useLanguage();

  return (
    <FeaturedStorySection
        eyebrow={t.categoriesPage.copy.association}
        title={t.categoriesPage.copy.associationTitle}
        description={t.categoriesPage.copy.associationText}
        quote={t.categoriesPage.copy.associationQuote}
        media={
          <EditorialPhotoCard
            src="/images/events/DSC09821.jpg"
            alt="Editorial direction story from the event floor"
            aspect="landscape"
            overlay="soft"
            objectPosition="center 30%"
            mobileObjectPosition="center 24%"
            className="h-full"
          />
        }
        actions={
          <a
            href="https://ibpassociations.org/about"
            target="_blank"
            rel="noreferrer"
            className="ibpa-button ibpa-button-ghost"
          >
            {t.categoriesPage.copy.associationButton}
          </a>
        }
      />
  );
}
