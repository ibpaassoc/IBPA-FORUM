"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  FullBleedPhotoBreak,
} from "@/shared/components/public";


export default function GrandPrixPagePremium() {
  const { t } = useLanguage();
  
  return (
    <FullBleedPhotoBreak
      src="/images/events/badges.jpg"
      alt="Grand Prix full-width event moment"
      objectPosition="center 30%"
      mobileObjectPosition="center 24%"
    />
  );
}
